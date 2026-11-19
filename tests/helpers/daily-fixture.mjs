export function installDailyFixture() {
  process.env.DAILY_API_KEY = "daily-disposable-fixture";
  process.env.DAILY_DOMAIN = "meetings-fixture.daily.co";
  const original = global.fetch,
    rooms = new Map(),
    calls = [];
  global.fetch = async (url, options = {}) => {
    url = String(url);
    if (url === "https://api.resend.com/emails") {
      calls.push({ url, options });
      return Response.json({ id: "synthetic-email-id" });
    }
    if (!url.startsWith("https://api.daily.co/v1/"))
      return original(url, options);
    calls.push({ url, options });
    const body = options.body ? JSON.parse(options.body) : {};
    if (url.endsWith("/meeting-tokens"))
      return Response.json({
        token:
          "fixture." +
          Buffer.from(
            JSON.stringify({
              iat: Math.floor(Date.now() / 1000),
              ...body.properties,
            }),
          ).toString("base64url") +
          ".not-a-real-signature",
      });
    if (url.endsWith("/eject") || options.method === "DELETE")
      return Response.json({});
    if (options.method === "POST" && url.endsWith("/rooms")) {
      const r = {
        ...body,
        url: "https://meetings-fixture.daily.co/" + body.name,
        config: body.properties,
      };
      rooms.set(body.name, r);
      return Response.json(r);
    }
    const r = rooms.get(url.split("/").at(-1));
    return Response.json(r || { error: "missing" }, { status: r ? 200 : 404 });
  };
  return {
    calls,
    restore() {
      global.fetch = original;
      delete process.env.DAILY_API_KEY;
      delete process.env.DAILY_DOMAIN;
    },
  };
}
