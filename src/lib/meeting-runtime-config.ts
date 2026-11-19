// Server configuration only. A missing key disables just built-in meetings.
export function builtInConfiguration() {
  if (process.env.MEETING_BUILT_IN_ENABLED !== "true")
    return {
      enabled: false,
      error: "Built-in meetings are disabled. Use an external meeting link.",
    };
  if (
    !process.env.DAILY_API_KEY ||
    !process.env.DAILY_API_KEY.trim() ||
    !/^[a-z0-9-]+\.daily\.co$/.test(process.env.DAILY_DOMAIN?.trim() || "")
  )
    return {
      enabled: false,
      error:
        "Built-in meetings need DAILY_API_KEY and a valid DAILY_DOMAIN in this deployment environment. External meeting links remain available.",
    };
  return { enabled: true, error: null };
}
export function validateMeetingStartup() {
  const r = builtInConfiguration();
  if (process.env.MEETING_BUILT_IN_ENABLED === "true" && !r.enabled)
    console.error(
      "[Meetings configuration] Built-in meetings disabled: configure DAILY_API_KEY and DAILY_DOMAIN for this environment. External links remain available.",
    );
}
