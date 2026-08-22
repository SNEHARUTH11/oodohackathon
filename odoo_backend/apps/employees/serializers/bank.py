from rest_framework import serializers

from apps.employees.models import BankDetail


class BankDetailSerializer(serializers.ModelSerializer):
    account_number = serializers.CharField(max_length=50)
    bank_name = serializers.CharField(max_length=120)
    ifsc_code = serializers.CharField(max_length=11)
    pan_no = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")
    uan_no = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")

    class Meta:
        model = BankDetail
        fields = ("account_number", "bank_name", "ifsc_code", "pan_no", "uan_no")