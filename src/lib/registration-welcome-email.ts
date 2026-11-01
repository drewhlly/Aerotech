/**
 * Transactional registration welcome emails for employer, applicant and
 * employee accounts. Must only be called after a successful DB commit.
 * Uses the same verified Resend sender as employee invitations.
 */
type RegistrationRole = "employer" | "employee" | "applicant";

type WelcomeDetails = {
  role: RegistrationRole;
  to: string;
  firstName: string;
  accountId: string;
};

const roleInfo: Record<RegistrationRole, { label: string; nextStep: string }> = {
  employer: {
    label: "employer",
    nextStep: "Sign in to your employer workspace to explore workforce management. A subscription is required to access paid employer features.",
  },
  employee: {
    label: "employee",
    nextStep: "Your employee account is now activated. Sign in to access the services made available by your employer.",
  },
  applicant: {
    label: "applicant",
    nextStep: "Your free applicant account is ready. Sign in to discover opportunities and manage your applications.",
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function sendRegistrationWelcomeEmail({
  role,
  to,
  firstName,
  accountId,
}: WelcomeDetails): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INVITATION_FROM_EMAIL;
  // Never fail account creation just because transactional email is not configured.
  if (!apiKey || !from) {
    console.warn("Aerotech welcome email skipped: email sender not configured");
    return false;
  }

  const details = roleInfo[role];
  if (!details || !accountId) return false;

  const name = firstName.trim().slice(0, 100) || "there";
  const loginUrl = "https://aerotechhr.app/auth/login?role=" + role;
  const text = [
    `Hello ${name},`,
    "",
    "Welcome to Aerotech! Your " + details.label + " account has been created successfully.",
    "",
    details.nextStep,
    "",
    "Sign in: " + loginUrl,
    "",
    "If you did not create this account, contact support@aerotechhr.app.",
    "",
    "Aerotech Team",
  ].join("\n");

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#0a1f47;line-height:1.6">',
    '<h1 style="font-size:26px;color:#166ae9">Welcome to Aerotech</h1>',
    `<p>Hello ${escapeHtml(name)},</p>`,
    `<p>Your <strong>${details.label}</strong> account has been created successfully.</p>`,
    `<p>${escapeHtml(details.nextStep)}</p>`,
    `<p><a href="${loginUrl}" style="background:#166ae9;color:#ffffff;display:inline-block;padding:12px 20px;border-radius:6px;text-decoration:none">Sign in to Aerotech</a></p>`,
    '<p style="font-size:13px;color:#556987">If you did not create this account, contact support@aerotechhr.app.</p>',
    '<p>Aerotech Team</p></div>',
  ].join("");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `aerotech-welcome-${role}-${accountId}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Welcome to Aerotech — your account is ready",
        text,
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      console.error("Aerotech welcome email provider rejected request", {status: response.status, role});
      return false;
    }
    return true;
  } catch {
    console.error("Aerotech welcome email delivery failed", {role});
    return false;
  }
}
