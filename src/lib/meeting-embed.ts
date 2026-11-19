// Browser adapters only. The portal UI depends on EmbeddedCall, not a provider SDK.
export type CallSession = {
  provider: "daily";
  url: string;
  token: string;
  name: string;
  type: "video" | "audio";
  expiresAt: number;
};
export type EmbeddedCall = { destroy: () => Promise<void> };
export async function embedMeeting(
  parent: HTMLElement,
  session: CallSession,
  onJoined: () => void,
  onLeft: () => void,
  onError: () => void,
  isActive = () => true,
): Promise<EmbeddedCall> {
  if (session.provider !== "daily") throw Error("Unsupported call interface");
  const Daily = (await import("@daily-co/daily-js")).default;
  if (!parent.isConnected || !isActive())
    throw Error("Meeting connection cancelled.");
  const frame = Daily.createFrame(parent, {
    iframeStyle: {
      width: "100%",
      height: "100%",
      border: "0",
      borderRadius: "12px",
    },
    showLeaveButton: true,
    showFullscreenButton: true,
    theme: {
      colors: {
        accent: "#155eef",
        accentText: "#ffffff",
        background: "#ffffff",
        baseText: "#071c3c",
      },
    },
  });
  frame
    .on("joined-meeting", onJoined)
    .on("left-meeting", onLeft)
    .on("error", onError)
    .on("camera-error", onError);
  // Return the destroy handle before Prebuilt's own Join is pressed. Otherwise a
  // pending iframe prejoin could retain camera tracks when the portal Leave is used.
  void frame
    .join({
      url: session.url,
      token: session.token,
      userName: session.name,
      startVideoOff: session.type === "audio",
      startAudioOff: true,
      ...(session.type === "audio" ? { videoSource: false as const } : {}),
    })
    .catch(async () => {
      onError();
      await frame.destroy().catch(() => {});
    });
  return {
    destroy: async () => {
      await frame.destroy();
    },
  };
}
