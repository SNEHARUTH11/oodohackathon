from rest_framework import serializers

from apps.accounts.models import User


class SelfProfileUpdateSerializer(serializers.ModelSerializer):
    """Employee may edit ONLY these fields (PRD 3.3.2)."""

    class Meta:
        model = User
        fields = ("phone", "residing_address", "about", "what_i_love_about_job", "interests_hobbies")


class ProfilePictureUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

    def validate_image(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Profile picture must be under 5 MB.")
        return value