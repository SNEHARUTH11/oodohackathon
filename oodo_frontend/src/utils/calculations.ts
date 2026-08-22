export const calculateSalaryBreakdown = (monthlyWage: number) => {
  const basic = monthlyWage * 0.5
  const hra = basic * 0.5
  const standardAllow = 4167
  const performanceBonus = basic * 0.0833
  const lta = basic * 0.0833
  const fixedAllowance = Math.max(monthlyWage - (basic + hra + standardAllow + performanceBonus + lta), 0)
  const pfEmployee = basic * 0.12
  const pfEmployer = basic * 0.12
  const professionalTax = 200

  return {
    basic,
    hra,
    standard_allowance: standardAllow,
    performance_bonus: performanceBonus,
    lta,
    fixed_allowance: fixedAllowance,
    pf_employee: pfEmployee,
    pf_employer: pfEmployer,
    professional_tax: professionalTax,
    gross: basic + hra + standardAllow + performanceBonus + lta + fixedAllowance,
    deductions: pfEmployee + professionalTax,
    net: basic + hra + standardAllow + performanceBonus + lta + fixedAllowance - (pfEmployee + professionalTax)
  }
}

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
