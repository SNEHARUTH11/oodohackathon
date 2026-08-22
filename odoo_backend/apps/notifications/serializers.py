from rest_framework import serializers


class MarkReadSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)
    mark_all = serializers.BooleanField(default=False)

    def validate(self, attrs):
        if not attrs["ids"] and not attrs["mark_all"]:
            raise serializers.ValidationError(
                {"detail": "Provide ids or mark_all=true."})
        return attrs