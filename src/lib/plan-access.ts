export const planRanks={basic:1,professional:2,business:3,enterprise:4} as const;
export function requiredPlan(path:string){if(/\/automation|\/workflows|\/compliance|\/reports|\/ai/.test(path))return 'business';if(/\/payroll|\/attendance|\/onboarding|\/training|\/performance|\/documents|\/confirmations|\/surveys|\/goals|\/exits/.test(path))return 'professional';return 'basic'}
export function planAllows(plan:string,path:string){return (planRanks[plan as keyof typeof planRanks]||0)>=planRanks[requiredPlan(path)]}
