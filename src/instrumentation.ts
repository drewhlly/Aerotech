export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateMeetingStartup } =
      await import("./lib/meeting-runtime-config");
    validateMeetingStartup();
  }
}
