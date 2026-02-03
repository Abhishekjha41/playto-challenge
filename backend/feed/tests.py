from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.contrib.contenttypes.models import ContentType

from feed.models import KarmaTransaction, Post


class LeaderboardTest(TestCase):

    def test_leaderboard_last_24_hours_only(self):
        u1 = User.objects.create_user(username="a", password="x")
        u2 = User.objects.create_user(username="b", password="x")

        # create dummy posts to attach karma source
        p1 = Post.objects.create(author=u1, body="p1")
        p2 = Post.objects.create(author=u2, body="p2")

        post_ct = ContentType.objects.get_for_model(Post)

        # recent karma (should be counted)
        KarmaTransaction.objects.create(
            user=u1,
            points=5,
            source_content_type=post_ct,
            source_object_id=p1.id,
            created_at=timezone.now()
        )

        # old karma (should NOT be counted)
        old = KarmaTransaction.objects.create(
            user=u2,
            points=100,
            source_content_type=post_ct,
            source_object_id=p2.id
        )

        old.created_at = timezone.now() - timedelta(days=2)
        old.save(update_fields=["created_at"])

        since = timezone.now() - timedelta(hours=24)

        qs = (
            KarmaTransaction.objects
            .filter(created_at__gte=since)
            .values_list("user_id", flat=True)
        )

        self.assertIn(u1.id, list(qs))
        self.assertNotIn(u2.id, list(qs))
