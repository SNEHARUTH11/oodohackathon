from rest_framework import serializers

from apps.employees.models import Certification, Document


class SkillCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=80)


class CertificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ("name", "issuer", "issue_date", "expiry_date", "certificate_file")
        extra_kwargs = {
            "issuer": {"required": False, "allow_blank": True, "default": ""},
            "issue_date": {"required": False, "default": None, "allow_null": True},
            "expiry_date": {"required": False, "default": None, "allow_null": True},
            "certificate_file": {"required": False},
        }


class DocumentUploadSerializer(serializers.Serializer):
    doc_type = serializers.ChoiceField(choices=Document.DocType.choices)
    file = serializers.FileField()
    title = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")