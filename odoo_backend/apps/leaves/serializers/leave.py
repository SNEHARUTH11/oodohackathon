from rest_framework import serializers

from apps.leaves.models import TimeOffRequest


class ApplyLeaveSerializer(serializers.Serializer):
    leave_type = serializers.ChoiceField(choices=TimeOffRequest.LeaveType.choices)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    remarks = serializers.CharField(required=False, allow_blank=True, default="")
    attachment = serializers.FileField(required=False, allow_null=True, default=None)


class LeaveReviewSerializer(serializers.Serializer):
    comment = serializers.CharField(required=False, allow_blank=True, default="")


class AllocationUpdateSerializer(serializers.Serializer):
    year = serializers.IntegerField(required=False, min_value=2000, max_value=2100)
    paid_leave_total = serializers.IntegerField(required=False, min_value=0)
    sick_leave_total = serializers.IntegerField(required=False, min_value=0)