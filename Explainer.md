# Playto Engineering Challenge – Explainer

---

## The Tree – Nested Comments

### Data Model

Nested comments are implemented using an adjacency-list model.

Each comment has a self-reference to its parent.

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        related_name="children",
        on_delete=models.CASCADE
    )
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()

```

Top-level comments have parent = NULL.

## Efficient Serialization (No N+1 Queries)
All comments for a post are fetched in a single query:

```python
comments = (
    Comment.objects
    .filter(post=post)
    .select_related("author")
    .prefetch_related("likes")
)
```

The nested structure is created in memory:

```python
def build_comment_tree(comments):
    lookup = {}
    roots = []

    for c in comments:
        c.children = []
        lookup[c.id] = c

    for c in comments:
        if c.parent_id:
            lookup[c.parent_id].children.append(c)
        else:
            roots.append(c)

    return roots

```

This approach ensures that loading a post with many nested comments does not trigger additional database queries for each level of nesting.

## The Math – Last 24 Hour Leaderboard
Each like action generates a karma transaction.

```python
class KarmaTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

```

Leaderboard query:

```python
since = timezone.now() - timedelta(hours=24)

qs = (
    KarmaTransaction.objects
    .filter(created_at__gte=since)
    .values("user__id", "user__username")
    .annotate(total_karma=Sum("points"))
    .order_by("-total_karma")[:5]
)
```
Only karma earned during the last 24 hours is counted.
No rolling or cached totals are stored on the User model.

## Concurrency – Preventing Double Likes
A database-level uniqueness constraint guarantees one like per user per object.

```python
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "content_type", "object_id"],
                name="unique_like_per_user"
            )
        ]

```
The API endpoint uses an atomic transaction:

```python
try:
    with transaction.atomic():
        Like.objects.create(
            user=request.user,
            content_type=ct,
            object_id=obj.id
        )

        KarmaTransaction.objects.create(
            user=obj.author,
            points=points
        )
except IntegrityError:
    return Response(
        {"detail": "already liked"},
        status=400
    )

```
This ensures:

- a user cannot like the same post or comment twice

- concurrent requests cannot inflate karma

## The AI Audit
- One concrete issue produced by AI was in the initial leaderboard implementation.

    - The AI suggested calculating and storing a rolling daily_karma integer directly on the User model and updating it whenever a like happened.

    - This violates the challenge constraint and also makes the leaderboard incorrect when time windows change.

    - I replaced this with a proper transaction-based model:

    ```python
    KarmaTransaction(user=..., points=..., created_at=...)
    ```

    - and recalculated the leaderboard dynamically using:

    ```python
    .filter(created_at__gte=since)
    .annotate(total_karma=Sum("points"))
    ```

    - This approach:

        - avoids stale aggregates
        - allows flexible time windows
        - respects the requirement not to store daily totals

- Another AI mistake was fetching comment children recursively from the database for each comment.
    - That approach caused an N+1 query pattern and was replaced by a single bulk query followed by in-memory tree construction.

## Summary
- Nested comments are stored using a parent reference

- The full comment tree is built in memory after a single database query

- Likes are protected using database constraints and atomic transactions

- The leaderboard is calculated dynamically from transaction history

- No denormalized or cached karma totals are stored