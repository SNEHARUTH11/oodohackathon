from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField(help_text="Email or Login ID")
    password = serializers.CharField(write_only=True)