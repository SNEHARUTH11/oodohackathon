from rest_framework import serializers


class SalaryStructureUpdateSerializer(serializers.Serializer):
    """Upsert — monthly_wage required when creating, optional when updating."""
    monthly_wage = serializers.DecimalField(max_digits=12, decimal_places=2,
                                            min_value=1, required=False, allow_null=True)
    working_days_per_week = serializers.IntegerField(min_value=1, max_value=7, required=False)
    break_time_hrs = serializers.DecimalField(max_digits=4, decimal_places=2,
                                              min_value=0, max_value=24, required=False)
    professional_tax = serializers.DecimalField(max_digits=10, decimal_places=2,
                                                min_value=0, required=False)


class PayslipGenerateSerializer(serializers.Serializer):
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2000, max_value=2100)


class PayslipSendSerializer(serializers.Serializer):
    payslip_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list)
    month = serializers.IntegerField(min_value=1, max_value=12, required=False)
    year = serializers.IntegerField(min_value=2000, max_value=2100, required=False)

    def validate(self, attrs):
        if not attrs.get("payslip_ids") and not (attrs.get("month") and attrs.get("year")):
            raise serializers.ValidationError(
                {"detail": "Provide payslip_ids, or month + year to send all drafts."})
        return attrs