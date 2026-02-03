from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source="author.username")
    like_count = serializers.IntegerField()

    class Meta:
        model = Post
        fields = ["id","body","author","created_at","like_count"]
