from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum

from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from .models import Post, Comment, Like, KarmaTransaction
from .serializers import PostSerializer
from .services import build_comment_tree


@api_view(["GET"])
def feed(request):
    posts = (
        Post.objects
        .select_related("author")
        .annotate(like_count=Count("likes"))
        .order_by("-created_at")
    )

    return Response(PostSerializer(posts, many=True).data)


@api_view(["GET"])
def post_detail(request, pk):
    post = (
        Post.objects
        .select_related("author")
        .annotate(like_count=Count("likes"))
        .get(pk=pk)
    )

    comments = (
        Comment.objects
        .filter(post=post)
        .select_related("author")
        .annotate(_like_count=Count("likes"))
    )


    tree = build_comment_tree(comments)

    return Response({
        "id": post.id,
        "body": post.body,
        "author": post.author.username,
        "like_count": post.like_count,
        "comments": tree
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_post(request):

    body = request.data.get("body", "").strip()

    if not body:
        return Response({"detail": "Post body is required"}, status=400)

    p = Post.objects.create(
        body=body,
        author=request.user
    )

    return Response({"id": p.id}, status=201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_comment(request):
    post_id = request.data["post"]
    parent_id = request.data.get("parent")
    body = request.data["body"]

    post = get_object_or_404(Post, id=post_id)

    parent = None
    if parent_id:
        parent = get_object_or_404(Comment, id=parent_id)

    c = Comment.objects.create(
        post=post,
        parent=parent,
        body=body,
        author=request.user
    )

    return Response({"id": c.id})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def like_object(request):

    model = request.data["model"]   # "post" or "comment"
    object_id = request.data["id"]

    Model = Post if model == "post" else Comment
    obj = get_object_or_404(Model, id=object_id)

    ct = ContentType.objects.get_for_model(Model)

    try:
        with transaction.atomic():

            Like.objects.create(
                user=request.user,
                content_type=ct,
                object_id=obj.id
            )

            if model == "post":
                points = 5
            else:
                points = 1

            KarmaTransaction.objects.create(
                user=obj.author,
                points=points,
                source_content_type=ct,
                source_object_id=obj.id
            )

    except IntegrityError:
        return Response(
            {"detail": "You have already liked this."},
            status=status.HTTP_409_CONFLICT
        )

    return Response({"status":"ok"})

@api_view(["GET"])
def leaderboard(request):

    since = timezone.now() - timedelta(hours=24)

    qs = (
        KarmaTransaction.objects
        .filter(created_at__gte=since)
        .values("user__id","user__username")
        .annotate(total_karma=Sum("points"))
        .order_by("-total_karma")[:5]
    )

    return Response(qs)
