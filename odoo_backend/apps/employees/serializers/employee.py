from rest_framework import serializers

from apps.accounts.models import User


class EmployeeCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True, default="")
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.EMPLOYEE)
    department = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    job_position = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    location = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True, is_superuser=False),
        required=False, allow_null=True, default=None,
    )
    date_of_joining = serializers.DateField(required=False, default=None)


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    """Admin full edit. login_id is never editable."""
    manager = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True, is_superuser=False),
        required=False, allow_null=True,
    )

    class Meta:
        model = User
        fields = (
            "first_name", "last_name", "email", "phone", "role",
            "department", "job_position", "location", "manager",
            "date_of_joining", "date_of_birth", "gender", "marital_status",
            "nationality", "personal_email", "residing_address",
            "about", "what_i_love_about_job", "interests_hobbies",
        )