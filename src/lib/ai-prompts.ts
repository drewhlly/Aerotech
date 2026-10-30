// Fixed, non-personal prompts only: Google prohibits sensitive data on its unpaid tier.
export const generalQuestions={
 interview:'How can an employer plan a fair, structured interview process?',
 onboarding:'What should a general employee onboarding checklist include?',
 attendance:'How can an organisation communicate an attendance policy clearly?',
 payroll:'Explain the general steps in preparing a payroll.',
 learning:'How can an employer plan employee learning and development?',
 feedback:'How can an organisation collect and act on employee feedback?',
} as const;
export type GeneralQuestion=keyof typeof generalQuestions;
