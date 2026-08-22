#!/usr/bin/env bash
# Dayflow demo seeder — full fresh dataset in order.
#   ./seed_all.sh           # seed only what's missing (idempotent)
#   ./seed_all.sh --reset   # wipe module data and reseed everything
set -e
MODE=""
[ "$1" == "--reset" ] && MODE="--reset"

python manage.py migrate
python manage.py seed_onboarding
python scripts/generate_test_data.py $MODE          # employees + profiles
python scripts/generate_attendance_data.py $MODE    # 3 months attendance + today's dots
python scripts/generate_leave_data.py $MODE         # leave requests + balances + leave rows
python scripts/generate_payroll_data.py $MODE       # salary structures + payslips (sent + drafts)
echo "✔ Demo data ready."