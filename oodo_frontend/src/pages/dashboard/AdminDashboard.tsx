import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'

type AttendanceStatus = 'present' | 'away' | 'leave' | 'offline'

type Employee = {
  id: string
  name: string
  employeeId: string
  department: string
  role: string
  avatar: string
  status: AttendanceStatus
  email: string
  phone?: string
  joiningDate?: string
  employmentType?: string
}

const initialEmployees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Sneha Ruth',
    employeeId: 'EMP-001',
    department: 'Design',
    role: 'Employee',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85',
    status: 'offline',
    email: 'sneha.ruth@dayflow.com',
  },
  {
    id: 'EMP-002',
    name: 'Arjun Mehta',
    employeeId: 'EMP-002',
    department: 'Marketing',
    role: 'Employee',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    status: 'present',
    email: 'arjun.mehta@dayflow.com',
  },
  {
    id: 'EMP-003',
    name: 'Priya Shah',
    employeeId: 'EMP-003',
    department: 'Human Resources',
    role: 'HR Manager',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    status: 'present',
    email: 'priya.shah@dayflow.com',
  },
  {
    id: 'EMP-004',
    name: 'Daniel Kim',
    employeeId: 'EMP-004',
    department: 'Product',
    role: 'Product Designer',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    status: 'away',
    email: 'daniel.kim@dayflow.com',
  },
  {
    id: 'EMP-005',
    name: 'Neha Verma',
    employeeId: 'EMP-005',
    department: 'Finance',
    role: 'Finance Analyst',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85',
    status: 'leave',
    email: 'neha.verma@dayflow.com',
  },
  {
    id: 'EMP-006',
    name: 'Aisha Khan',
    employeeId: 'EMP-006',
    department: 'Marketing',
    role: 'Marketing Executive',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=85',
    status: 'offline',
    email: 'aisha.khan@dayflow.com',
  },
  {
    id: 'EMP-007',
    name: 'Rahul Sharma',
    employeeId: 'EMP-007',
    department: 'Engineering',
    role: 'Software Engineer',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85',
    status: 'present',
    email: 'rahul.sharma@dayflow.com',
  },
  {
    id: 'EMP-008',
    name: 'Ananya Rao',
    employeeId: 'EMP-008',
    department: 'Engineering',
    role: 'Frontend Developer',
    avatar:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=85',
    status: 'present',
    email: 'ananya.rao@dayflow.com',
  },
  {
    id: 'EMP-009',
    name: 'Vikram Singh',
    employeeId: 'EMP-009',
    department: 'Sales',
    role: 'Sales Executive',
    avatar:
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=85',
    status: 'away',
    email: 'vikram.singh@dayflow.com',
  },
]

const statusStyles: Record<
  AttendanceStatus,
  {
    dot: string
    bg: string
    text: string
    label: string
  }
> = {
  present: {
    dot: 'bg-[#18B978]',
    bg: 'bg-[#EAF9F3]',
    text: 'text-[#087B5A]',
    label: 'Present',
  },
  away: {
    dot: 'bg-[#F5B400]',
    bg: 'bg-[#FFF7DE]',
    text: 'text-[#B77900]',
    label: 'Away',
  },
  leave: {
    dot: 'bg-[#1687E8]',
    bg: 'bg-[#EAF4FF]',
    text: 'text-[#087BFF]',
    label: 'On Leave',
  },
  offline: {
    dot: 'bg-[#98A2B3]',
    bg: 'bg-[#F2F4F7]',
    text: 'text-[#667085]',
    label: 'Not Checked In',
  },
}

type EmployeeForm = {
  firstName: string
  lastName: string
  employeeId: string
  email: string
  phone: string
  department: string
  role: string
  joiningDate: string
  employmentType: string
  status: AttendanceStatus
  avatar: string
}

const emptyForm: EmployeeForm = {
  firstName: '',
  lastName: '',
  employeeId: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  joiningDate: '',
  employmentType: 'Full Time',
  status: 'offline',
  avatar: '',
}

export function AdminDashboard() {
  const [employees, setEmployees] =
    useState<Employee[]>(initialEmployees)

  const [searchTerm, setSearchTerm] = useState('')

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null)

  const [isAddEmployeeOpen, setIsAddEmployeeOpen] =
    useState(false)

  const [form, setForm] =
    useState<EmployeeForm>(emptyForm)

  const [formError, setFormError] = useState('')

  const filteredEmployees = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    if (!search) {
      return employees
    }

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(search) ||
        employee.department.toLowerCase().includes(search) ||
        employee.role.toLowerCase().includes(search) ||
        employee.employeeId.toLowerCase().includes(search)
      )
    })
  }, [searchTerm, employees])

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  const handleOpenAddEmployee = () => {
    setForm(emptyForm)
    setFormError('')
    setIsAddEmployeeOpen(true)
    setSelectedEmployee(null)
  }

  const handleCloseAddEmployee = () => {
    setIsAddEmployeeOpen(false)
    setForm(emptyForm)
    setFormError('')
  }

  const handleFormChange = (
    field: keyof EmployeeForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    if (formError) {
      setFormError('')
    }
  }

  const handleCreateEmployee = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.employeeId.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.role.trim()
    ) {
      setFormError(
        'Please fill in all required fields marked with *.',
      )
      return
    }

    const employee: Employee = {
      id: form.employeeId.trim(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      employeeId: form.employeeId.trim(),
      department: form.department.trim(),
      role: form.role.trim(),
      avatar:
        form.avatar.trim() ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=85',
      status: form.status,
      email: form.email.trim(),
      phone: form.phone.trim(),
      joiningDate: form.joiningDate,
      employmentType: form.employmentType,
    }

    setEmployees((previous) => [employee, ...previous])

    setSelectedEmployee(employee)
    setIsAddEmployeeOpen(false)
    setForm(emptyForm)
    setFormError('')
  }

  /*
   * ============================================================
   * ADD EMPLOYEE PAGE
   * ============================================================
   */

  if (isAddEmployeeOpen) {
    return (
      <AppLayout title="Add Employee">
        <div className="min-h-full bg-[#FCFDFE]">

          {/* Header */}

          <div className="mb-6 flex items-center gap-4">

            <button
              type="button"
              onClick={handleCloseAddEmployee}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-[#E4E7EC]
                bg-white
                text-[#475467]
                transition
                hover:bg-[#F8FAFC]
                hover:text-[#172033]
              "
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1
                className="
                  text-[30px]
                  font-bold
                  tracking-[-0.04em]
                  text-[#102044]
                "
              >
                Add Employee
              </h1>

              <p className="mt-1 text-[15px] text-[#667085]">
                Create a new employee profile
              </p>
            </div>

          </div>

          {/* Error */}

          {formError && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-[#FECACA]
                bg-[#FEF2F2]
                px-4
                py-3
                text-sm
                font-medium
                text-[#B42318]
              "
            >
              {formError}
            </div>
          )}

          <div className="space-y-5">

            {/* =================================================
                PERSONAL INFORMATION
            ================================================== */}

            <Card>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-[#EEF1F5]
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EAF9F3]
                    text-[#18B978]
                  "
                >
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="text-[16px] font-bold text-[#172033]">
                    Personal Information
                  </h2>

                  <p className="mt-0.5 text-xs text-[#667085]">
                    Basic information about the employee
                  </p>
                </div>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <FormField
                  label="First Name"
                  required
                >
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      handleFormChange(
                        'firstName',
                        event.target.value,
                      )
                    }
                    placeholder="Enter first name"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Last Name"
                  required
                >
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      handleFormChange(
                        'lastName',
                        event.target.value,
                      )
                    }
                    placeholder="Enter last name"
                    className={inputClass}
                  />
                </FormField>

                <FormField
                  label="Employee ID"
                  required
                >
                  <input
                    value={form.employeeId}
                    onChange={(event) =>
                      handleFormChange(
                        'employeeId',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. EMP-010"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Profile Image URL">
                  <input
                    value={form.avatar}
                    onChange={(event) =>
                      handleFormChange(
                        'avatar',
                        event.target.value,
                      )
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />
                </FormField>

              </div>

            </Card>

            {/* =================================================
                CONTACT INFORMATION
            ================================================== */}

            <Card>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-[#EEF1F5]
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EEF6FF]
                    text-[#1687E8]
                  "
                >
                  <Mail size={20} />
                </div>

                <div>
                  <h2 className="text-[16px] font-bold text-[#172033]">
                    Contact Information
                  </h2>

                  <p className="mt-0.5 text-xs text-[#667085]">
                    Employee contact details
                  </p>
                </div>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <FormField
                  label="Email Address"
                  required
                >
                  <div className="relative">
                    <Mail
                      size={17}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-[#98A2B3]
                      "
                    />

                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        handleFormChange(
                          'email',
                          event.target.value,
                        )
                      }
                      placeholder="employee@dayflow.com"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>

                <FormField label="Phone Number">
                  <div className="relative">
                    <Phone
                      size={17}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-[#98A2B3]
                      "
                    />

                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        handleFormChange(
                          'phone',
                          event.target.value,
                        )
                      }
                      placeholder="+91 98765 43210"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>

              </div>

            </Card>

            {/* =================================================
                WORK INFORMATION
            ================================================== */}

            <Card>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-[#EEF1F5]
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EAF9F3]
                    text-[#18B978]
                  "
                >
                  <UsersRound size={20} />
                </div>

                <div>
                  <h2 className="text-[16px] font-bold text-[#172033]">
                    Work Information
                  </h2>

                  <p className="mt-0.5 text-xs text-[#667085]">
                    Department and role information
                  </p>
                </div>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <FormField
                  label="Department"
                  required
                >
                  <select
                    value={form.department}
                    onChange={(event) =>
                      handleFormChange(
                        'department',
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select department
                    </option>
                    <option value="Design">
                      Design
                    </option>
                    <option value="Engineering">
                      Engineering
                    </option>
                    <option value="Finance">
                      Finance
                    </option>
                    <option value="Human Resources">
                      Human Resources
                    </option>
                    <option value="Marketing">
                      Marketing
                    </option>
                    <option value="Product">
                      Product
                    </option>
                    <option value="Sales">
                      Sales
                    </option>
                  </select>
                </FormField>

                <FormField
                  label="Role"
                  required
                >
                  <input
                    value={form.role}
                    onChange={(event) =>
                      handleFormChange(
                        'role',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Software Engineer"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Employment Type">
                  <select
                    value={form.employmentType}
                    onChange={(event) =>
                      handleFormChange(
                        'employmentType',
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="Full Time">
                      Full Time
                    </option>
                    <option value="Part Time">
                      Part Time
                    </option>
                    <option value="Contract">
                      Contract
                    </option>
                    <option value="Intern">
                      Intern
                    </option>
                  </select>
                </FormField>

                <FormField label="Joining Date">
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-[#98A2B3]
                      "
                    />

                    <input
                      type="date"
                      value={form.joiningDate}
                      onChange={(event) =>
                        handleFormChange(
                          'joiningDate',
                          event.target.value,
                        )
                      }
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </FormField>

              </div>

            </Card>

            {/* =================================================
                EMPLOYMENT STATUS
            ================================================== */}

            <Card>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-[#EEF1F5]
                  px-6
                  py-5
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#FFF7DE]
                    text-[#B77900]
                  "
                >
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h2 className="text-[16px] font-bold text-[#172033]">
                    Employment Status
                  </h2>

                  <p className="mt-0.5 text-xs text-[#667085]">
                    Set the employee's current attendance status
                  </p>
                </div>

              </div>

              <div className="p-6">

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  {(
                    [
                      'present',
                      'away',
                      'leave',
                      'offline',
                    ] as AttendanceStatus[]
                  ).map((status) => {
                    const style = statusStyles[status]

                    const active =
                      form.status === status

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          handleFormChange(
                            'status',
                            status,
                          )
                        }
                        className={`
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          px-4
                          py-3.5
                          text-left
                          transition
                          ${
                            active
                              ? 'border-[#18B978] bg-[#F0FBF6]'
                              : 'border-[#E4E7EC] bg-white hover:bg-[#F8FAFC]'
                          }
                        `}
                      >
                        <span
                          className={`
                            h-2.5
                            w-2.5
                            rounded-full
                            ${style.dot}
                          `}
                        />

                        <span
                          className={`
                            text-sm
                            font-semibold
                            ${
                              active
                                ? style.text
                                : 'text-[#475467]'
                            }
                          `}
                        >
                          {style.label}
                        </span>

                      </button>
                    )
                  })}

                </div>

              </div>

            </Card>

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                pb-8
                sm:flex-row
                sm:justify-end
              "
            >

              <button
                type="button"
                onClick={handleCloseAddEmployee}
                className="
                  h-11
                  rounded-xl
                  border
                  border-[#D0D5DD]
                  bg-white
                  px-6
                  text-sm
                  font-semibold
                  text-[#344054]
                  transition
                  hover:bg-[#F8FAFC]
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateEmployee}
                className="
                  flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#18B978]
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#119B65]
                  hover:shadow-md
                "
              >
                <Plus size={18} />
                Create Employee
              </button>

            </div>

          </div>
        </div>
      </AppLayout>
    )
  }

  /*
   * ============================================================
   * EMPLOYEE DIRECTORY PAGE
   * ============================================================
   */

  return (
    <AppLayout title="Employees">

      <div className="min-h-full bg-[#FCFDFE]">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <div
          className="
            mb-5
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <h1
              className="
                text-[30px]
                font-bold
                tracking-[-0.04em]
                text-[#102044]
              "
            >
              Employees
            </h1>

            <p className="mt-1 text-[15px] text-[#667085]">
              Manage employee profiles and attendance
            </p>

          </div>

          {/* Search + Add Employee */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative">

              <Search
                size={18}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[#98A2B3]
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search employees"
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-[#DDE3EA]
                  bg-white
                  pl-10
                  pr-4
                  text-sm
                  text-[#172033]
                  outline-none
                  transition
                  placeholder:text-[#98A2B3]
                  focus:border-[#18B978]
                  focus:ring-4
                  focus:ring-[#18B978]/10
                  sm:w-[250px]
                "
              />

            </div>

            <button
              type="button"
              onClick={handleOpenAddEmployee}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#18B978]
                px-5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#119B65]
                hover:shadow-md
              "
            >
              <Plus size={18} />
              Add Employee
            </button>

          </div>

        </div>

        {/* =====================================================
            EMPLOYEE DIRECTORY
        ====================================================== */}

        <Card className="overflow-hidden">

          {/* Directory header */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-[#EEF1F5]
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#EAF9F3]
                  text-[#18B978]
                "
              >
                <UsersRound size={20} />
              </div>

              <div>

                <h2 className="text-[16px] font-bold text-[#172033]">
                  Employee Directory
                </h2>

                <p className="mt-0.5 text-xs text-[#667085]">
                  {filteredEmployees.length} employees
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              EMPLOYEE GRID
          ================================================== */}

          <div className="p-5 sm:p-6">

            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >

              {filteredEmployees.map((employee) => {

                const status =
                  statusStyles[employee.status]

                const isSelected =
                  selectedEmployee?.id === employee.id

                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() =>
                      handleEmployeeClick(employee)
                    }
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      bg-white
                      text-left
                      transition-all
                      duration-200
                      ${
                        isSelected
                          ? 'border-[#18B978] bg-[#F5FCF8] shadow-[0_6px_20px_rgba(24,185,120,0.10)]'
                          : 'border-[#E4E7EC] hover:-translate-y-0.5 hover:border-[#B8E7D3] hover:shadow-[0_8px_24px_rgba(16,24,40,0.07)]'
                      }
                    `}
                  >

                    {/* Card body */}

                    <div className="p-5">

                      <div className="flex items-start justify-between">

                        <div className="relative">

                          <img
                            src={employee.avatar}
                            alt={employee.name}
                            className="
                              h-[72px]
                              w-[72px]
                              rounded-full
                              bg-[#F2F4F7]
                              object-cover
                              ring-4
                              ring-[#F8FAFC]
                            "
                          />

                          <span
                            className={`
                              absolute
                              right-0.5
                              top-0.5
                              h-3.5
                              w-3.5
                              rounded-full
                              border-2
                              border-white
                              ${status.dot}
                            `}
                          />

                        </div>

                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            ${status.bg}
                          `}
                        >
                          <span
                            className={`
                              h-2.5
                              w-2.5
                              rounded-full
                              ${status.dot}
                            `}
                          />
                        </div>

                      </div>

                      <div className="mt-5">

                        <h3
                          className="
                            truncate
                            text-[17px]
                            font-bold
                            tracking-[-0.015em]
                            text-[#102044]
                          "
                        >
                          {employee.name}
                        </h3>

                        <p className="mt-1 text-sm text-[#667085]">
                          {employee.role}
                        </p>

                      </div>

                      <div className="mt-4 flex items-center gap-2">

                        <div
                          className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#F2F8F5]
                          "
                        >
                          <UsersRound
                            size={14}
                            className="text-[#18B978]"
                          />
                        </div>

                        <span className="text-xs font-medium text-[#667085]">
                          {employee.department}
                        </span>

                      </div>

                    </div>

                    {/* Bottom */}

                    <div
                      className={`
                        flex
                        items-center
                        justify-between
                        border-t
                        px-5
                        py-3.5
                        ${
                          isSelected
                            ? 'border-[#D9F1E5] bg-[#F5FCF8]'
                            : 'border-[#EEF1F5] bg-[#FCFDFE]'
                        }
                      `}
                    >

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-[#087B5A]
                        "
                      >
                        View profile
                      </span>

                      <ArrowRight
                        size={16}
                        className="
                          text-[#087B5A]
                          transition-transform
                          duration-200
                          group-hover:translate-x-1
                        "
                      />

                    </div>

                  </button>
                )
              })}

            </div>

            {/* Empty state */}

            {filteredEmployees.length === 0 && (
              <div className="py-20 text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F2F4F7]
                  "
                >
                  <Search
                    size={22}
                    className="text-[#98A2B3]"
                  />
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#172033]">
                  No employees found
                </h3>

                <p className="mt-1 text-xs text-[#667085]">
                  Try another employee name or department.
                </p>

              </div>
            )}

          </div>

        </Card>

        {/* =====================================================
            SELECTED EMPLOYEE MINI PANEL
        ====================================================== */}

        {selectedEmployee && (
          <div
            className="
              fixed
              bottom-5
              left-1/2
              z-40
              hidden
              w-[min(520px,calc(100%-32px))]
              -translate-x-1/2
              rounded-2xl
              border
              border-[#DCE7E1]
              bg-white
              p-4
              shadow-[0_15px_45px_rgba(16,24,40,0.15)]
              lg:block
            "
          >

            <div className="flex items-center gap-4">

              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="
                  h-12
                  w-12
                  rounded-full
                  object-cover
                "
              />

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-bold text-[#172033]">
                  {selectedEmployee.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-[#667085]">
                  {selectedEmployee.department} ·{' '}
                  {selectedEmployee.role}
                </p>

              </div>

              <span
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  ${statusStyles[selectedEmployee.status].bg}
                  ${statusStyles[selectedEmployee.status].text}
                `}
              >

                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full
                    ${statusStyles[selectedEmployee.status].dot}
                  `}
                />

                {statusStyles[selectedEmployee.status].label}

              </span>

              <button
                type="button"
                className="
                  flex
                  h-9
                  items-center
                  gap-1.5
                  rounded-lg
                  bg-[#18B978]
                  px-3
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-[#119B65]
                "
              >
                View
                <ArrowRight size={14} />
              </button>

            </div>

          </div>
        )}

      </div>
    </AppLayout>
  )
}

/*
 * ============================================================
 * REUSABLE FORM FIELD
 * ============================================================
 */

const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-[#DDE3EA]
  bg-white
  px-4
  text-sm
  text-[#172033]
  outline-none
  transition
  placeholder:text-[#98A2B3]
  focus:border-[#18B978]
  focus:ring-4
  focus:ring-[#18B978]/10
`

function FormField({
  label,
  required = false,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>

      <label
        className="
          mb-2
          block
          text-[13px]
          font-semibold
          text-[#344054]
        "
      >
        {label}

        {required && (
          <span className="ml-1 text-[#EF4444]">
            *
          </span>
        )}
      </label>

      {children}

    </div>
  )
}