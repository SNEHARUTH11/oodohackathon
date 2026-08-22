from rest_framework import serializers

from apps.attendance.models import Attendance


class AdminAttendanceCreateSerializer(serializers.Serializer):
    employee_id = serializers.UUIDField()
    date = serializers.DateField()
    check_in = serializers.DateTimeField(required=False, allow_null=True, default=None)
    check_out = serializers.DateTimeField(required=False, allow_null=True, default=None)
    status = serializers.ChoiceField(choices=Attendance.Status.choices, required=False)


class AdminAttendanceUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Attendance.Status.choices, required=False)
    session_id = serializers.UUIDField(required=False)
    check_in = serializers.DateTimeField(required=False, allow_null=True)
    check_out = serializers.DateTimeField(required=False, allow_null=True)