from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from feed.models import Post, Comment, Like, KarmaTransaction
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from faker import Faker
import random


class Command(BaseCommand):
    help = "Seed realistic demo data"

    def handle(self, *args, **kwargs):

        fake = Faker()

        self.stdout.write("Cleaning old data...")

        Like.objects.all().delete()
        Comment.objects.all().delete()
        Post.objects.all().delete()
        KarmaTransaction.objects.all().delete()

        users = []
        usernames = [
            "rahul", "neha", "arjun", "pooja", "ankit",
            "sneha", "rohit", "priya", "aman", "kiran"
        ]

        self.stdout.write("Creating users...")

        for u in usernames:
            user, _ = User.objects.get_or_create(
                username=u
            )
            user.set_password("demo1234")
            user.save()
            users.append(user)

        self.stdout.write("Creating posts...")

        posts = []

        for _ in range(10):
            author = random.choice(users)

            p = Post.objects.create(
                author=author,
                body=fake.paragraph(nb_sentences=4)
            )
            posts.append(p)

        self.stdout.write("Creating comments (nested)...")

        all_comments = []

        for post in posts:
            root_comments = []

            for _ in range(random.randint(2, 4)):
                c = Comment.objects.create(
                    post=post,
                    author=random.choice(users),
                    body=fake.sentence(nb_words=14)
                )
                root_comments.append(c)
                all_comments.append(c)

            # nested replies
            for parent in root_comments:
                for _ in range(random.randint(0, 2)):
                    child = Comment.objects.create(
                        post=post,
                        parent=parent,
                        author=random.choice(users),
                        body=fake.sentence(nb_words=10)
                    )
                    all_comments.append(child)

        self.stdout.write("Creating likes & karma...")

        post_ct = ContentType.objects.get_for_model(Post)
        comment_ct = ContentType.objects.get_for_model(Comment)

        with transaction.atomic():

            for post in posts:
                likers = random.sample(users, random.randint(1, 4))
                for u in likers:
                    Like.objects.get_or_create(
                        user=u,
                        content_type=post_ct,
                        object_id=post.id
                    )

                    KarmaTransaction.objects.create(
                        user=post.author,
                        points=5,
                        source_content_type=post_ct,
                        source_object_id=post.id
                    )

            for c in random.sample(all_comments, min(len(all_comments), 15)):
                liker = random.choice(users)

                Like.objects.get_or_create(
                    user=liker,
                    content_type=comment_ct,
                    object_id=c.id
                )

                KarmaTransaction.objects.create(
                    user=c.author,
                    points=1,
                    source_content_type=comment_ct,
                    source_object_id=c.id
                )

        self.stdout.write(self.style.SUCCESS("Realistic demo data generated."))
