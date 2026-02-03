from django.urls import path
from . import views

urlpatterns = [
    path("feed/", views.feed),
    path("posts/<int:pk>/", views.post_detail),
    path("posts/create/", views.create_post),
    path("comments/", views.create_comment),
    path("like/", views.like_object),
    path("leaderboard/", views.leaderboard),
]
