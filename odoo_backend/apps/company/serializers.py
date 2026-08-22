from rest_framework import serializers

from apps.company.models import PublicHoliday


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicHoliday
        fields = ("id", "name", "date")


class CompanyConfigUpdateSerializer(serializers.Serializer):
    working_weekdays = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=7), required=False)
    standard_hours_per_day = serializers.DecimalField(max_digits=4, decimal_places=2,
                                                      min_value=0, max_value=24, required=False)
    half_day_threshold_hours = serializers.DecimalField(max_digits=4, decimal_places=2,
                                                        min_value=0, max_value=24, required=False)
    break_time_hrs = serializers.DecimalField(max_digits=4, decimal_places=2,
                                              min_value=0, max_value=24, required=False)
    sick_leave_backdate_days = serializers.IntegerField(min_value=0, required=False)
    paid_leave_total = serializers.IntegerField(min_value=0, required=False)
    sick_leave_total = serializers.IntegerField(min_value=0, required=False)
    pf_rate_percent = serializers.DecimalField(max_digits=5, decimal_places=2,
                                               min_value=0, max_value=100, required=False)
    professional_tax = serializers.DecimalField(max_digits=10, decimal_places=2,
                                                min_value=0, required=False)

    def validate_working_weekdays(self, value):
        if not value or len(set(value)) != len(value):
            raise serializers.ValidationError("Provide 1–7 (Mon=1…Sun=7), no duplicates.")
        return value