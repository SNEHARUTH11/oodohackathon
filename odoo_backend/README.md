Dayflow HRMS — Backend
Every workday, perfectly aligned. — Django REST Framework backend for the DayflowHRMS (auth, profiles, attendance, leave, payroll, config-driven rules).

Modules
Module	Highlights
Auth	Login by email or Login ID · JWT + blacklist · forced first-login password change · policy (8+, upper/lower/digit/symbol)
Employees	Admin-created accounts (no self-signup) · auto Login ID [PREFIX][F2][F2][YEAR][####] · temp password emailed once · role-scoped profiles · bank/skills/certs/documents
Attendance	Check-in/out sessions (work hours = Σ sessions) · present/half-day from config · missed-checkout flags · admin corrections with audit
Leaves	Paid/sick/unpaid · weekend+holiday-aware day counting · overlap block · sick backdate ≤30d + certificate · balances · approve writes leave attendance rows · allocations
Payroll	Config-driven salary components (Σ components ≡ wage) · PF/PT · payable days from attendance · draft → review (flags) → send (PDF + email + lock)
Settings	Everything config-driven from config/onboarding/default.json → CompanyConfig · holidays · weekdays · quotas · PF/PT rates
Architecture (folder contract)
api/ — routing + views only (one file per endpoint, all inherit BaseAPIView, no business logic)
apps/ — Django apps: models, admins, serializers, migrations
services/ — one module = one file, ALL business logic
common/ — BaseAPIView, response envelope, permissions, validators, pagination, middleware
config/ — onboarding JSON (company, admin, rules, holidays)
scripts/ — demo data seeders (./seed_all.sh)
dayflow/ — settings (dev/prod, selected via DJANGO_SETTINGS_MODULE, see bootstrap.py)
Quick start
python -m venv venv && source venv/bin/activatepip install -r requirements.txtsudo apt install -y libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0   # WeasyPrint libscp .env.example .env        # set DATABASE_URL (EC2 Postgres), SECRET_KEY, CORS origins./scripts/seed_all.sh       # migrate + company + admin + full demo datapython manage.py runserver
The seed prints the admin temp password once — copy it, log in, change it.Demo data: ~15 employees, 3 months attendance (mixed statuses, missed checkouts),leave requests (approved/pending/rejected + balances), salary structures (₹50kwireframe case) and payslips (one month sent+locked, one in drafts).

Auth notes
Login: identifier = email or login ID. Response includes must_change_password.
While true, every endpoint except auth returns 403 → frontend routes tochange-password screen. Change-password returns fresh tokens (old sessions blacklisted).
All responses use one envelope: {success, code, message, data|errors};paginated lists → data: {items, meta: {page, page_size, total, filters}}.
Payroll math (single source of truth)
Components from CompanyConfig.salary_components — Basic 50% wage, HRA 50% basic,Std 8.33% wage, PB/LTA 8.33% basic, Fixed = remainder → total always = wage.
Proration: ratio = payable_days / working_days applied to every earning and PF;PT flat. Payable: present 1 · half 0.5 · paid/sick leave 1 · unpaid leave 0 · absent 0.
Workflow: generate (drafts + accuracy flags) → fix attendance/config → regenerate →send (PDF stored + emailed + locked, immutable).
Demo flow (hackathon)
Login — Admin → 2. Employees — Create (console shows temp password) →
Login — Employee with that password → forced change → 4. Dashboard Overview(cards + dots + balances) → 5. Check In → dot green → 6. Time Off — Apply →
back to Admin: Time Off — All Requests → Approve → 8. Payroll — Generate →Payslip — View (flags) → Send → 9. Employee: Payslips — List → Download PDF →
Admin Dashboard (counts, pending, missed checkouts, payroll status).
Production
DJANGO_SETTINGS_MODULE=dayflow.settings.prod gunicorn dayflow.wsgi:application --bind 0.0.0.0:8000python manage.py collectstatic    # serve /static/ + /media/ via nginx
Configure SMTP env vars; restrict the Postgres security group to app + dev IPs.

6. Run & final end-to-end verification
bash

python manage.py runserver
curl -H "Authorization: Bearer <EMP>" localhost:8000/api/v1/employee/dashboard/overview/ | python -m json.tool | head -50
curl -H "Authorization: Bearer <ADMIN>" localhost:8000/api/v1/admin/dashboard/overview/ | python -m json.tool | head -60
Final QA checklist (demo-day sanity):

 Auth — login by email and by login ID; wrong password → clean 400 envelope; new user blocked everywhere until password change; old refresh token dead after change/logout; throttled at 30/min
 Employees — Login ID serials increment per year; temp password returned once + emailed; employee PATCH ignores role/department; colleague profile shows only the 6 public fields; last admin can't be deactivated
 Attendance — double check-in rejected; 10:00→19:00 shows 09:00 worked / 01:00 extra; month view badges (present/leaves/working days); missed checkout appears in admin list and closes via session update; weekends/holidays rendered neutrally
 Leaves — sick without attachment rejected; paid leave in the past rejected; overlap rejected; balance insufficient rejected; approve → balance drops + attendance rows turn leave + email arrives; cancel only own+pending
 Payroll — ₹50,000 structure: components sum exactly to wage; PF 3,000/PT 200 at full month; unpaid leave/absence reduce payable days; regenerate blocked after send; employee sees sent-only; PDF downloads with ₹ formatting
 Dashboards — card grid dots match today's seed (green/airplane/yellow); admin counts + pending/missed-checkout/payroll chips correct; alerts populate
 Cross-cutting — employee token on /admin/* → 403 envelope; every list exposes filter meta; logs carry request-id/user; X-Request-ID header present; ./seed_all.sh --reset reproducible