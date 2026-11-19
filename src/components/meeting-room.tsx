"use client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Mic, Video, ShieldCheck, Clock, ArrowLeft } from "lucide-react";
import BrandLogo from "./brand-logo";
import { WorkspaceRoleContext } from "./workspace-shell";
import { workspaceHomes } from "@/lib/portal-policy";
import {
  embedMeeting,
  type EmbeddedCall,
  type CallSession,
} from "@/lib/meeting-embed";
type Summary = {
  id: string;
  title: string;
  type: "video" | "audio";
  mode?: "external_link" | "built_in";
  name: string;
  host: boolean;
  status: string;
  admitted: boolean;
  configured: boolean;
  expiresAt: number;
};
export default function JoinMeeting({
  params,
  guestToken,
}: {
  params: Promise<{ id: string }>;
  guestToken?: string;
}) {
  const role = useContext(WorkspaceRoleContext) || "applicant",
    base = workspaceHomes[role] + "/meet";
  const [id, setId] = useState(""),
    [summary, setSummary] = useState<Summary | null>(null),
    [name, setName] = useState(""),
    [message, setMessage] = useState("Loading your invitation…"),
    [busy, setBusy] = useState(false),
    [waiting, setWaiting] = useState(false),
    [inCall, setInCall] = useState(false),
    [started, setStarted] = useState(0),
    [elapsed, setElapsed] = useState(0),
    [needsLogin, setNeedsLogin] = useState(false),
    [preview, setPreview] = useState(false),
    [externalUrl, setExternalUrl] = useState(""),
    [queue, setQueue] = useState<{ id: string; name: string }[]>([]);
  const container = useRef<HTMLDivElement>(null),
    video = useRef<HTMLVideoElement>(null),
    tracks = useRef<MediaStream | null>(null),
    call = useRef<EmbeddedCall | null>(null),
    generation = useRef(0),
    proof = useRef(guestToken || "");
  const stopPreview = useCallback(() => {
    tracks.current?.getTracks().forEach((t) => t.stop());
    tracks.current = null;
    if (video.current) video.current.srcObject = null;
    setPreview(false);
  }, []);
  const stopCall = useCallback(() => {
    generation.current++;
    const current = call.current;
    call.current = null;
    if (current) void current.destroy().catch(() => {});
    setInCall(false);
    setStarted(0);
    stopPreview();
  }, [stopPreview]);
  const headers = useCallback(
    () =>
      proof.current ? { Authorization: "Bearer " + proof.current } : undefined,
    [],
  );
  useEffect(() => {
    let active = true;
    void params.then(({ id }) => {
      if (!active) return;
      try {
        proof.current =
          guestToken ||
          sessionStorage.getItem("aerotech-meeting-invite:" + id) ||
          "";
        if (guestToken)
          sessionStorage.setItem("aerotech-meeting-invite:" + id, guestToken);
      } catch {}
      setId(id);
    });
    return () => {
      active = false;
      stopCall();
    };
  }, [params, guestToken, stopCall]);
  const refresh = useCallback(async () => {
    if (!id) return;
    const r = await fetch("/api/meet/" + id + "/join?status=1", {
      cache: "no-store",
      headers: headers(),
    });
    const d = await r.json();
    if (!r.ok) {
      if (r.status === 401) setNeedsLogin(true);
      throw Error(d.error || "Meeting not found.");
    }
    setNeedsLogin(false);
    setSummary(d);
    setName((n) => n || d.name);
    if (d.admitted) setWaiting(false);
    return d as Summary;
  }, [id, headers]);
  useEffect(() => {
    let active = true;
    void refresh()
      .then((d) => {
        if (active && d)
          setMessage(
            d.configured
              ? "Check your devices and confirm your name."
              : "Meetings are awaiting provider setup. Contact support.",
          );
      })
      .catch((e) => {
        if (active) setMessage(e.message);
      });
    return () => {
      active = false;
    };
  }, [refresh]);
  useEffect(() => {
    if (!id || !summary) return;
    const monitor = setInterval(
      () => {
        void refresh()
          .then(async (d) => {
            if (d && d.expiresAt <= Date.now()) {
              stopCall();
              setMessage("This meeting has ended.");
            }
          })
          .catch((e) => {
            stopCall();
            setMessage(e.message);
          });
        if (summary.host)
          void fetch("/api/meet/" + id + "/lobby", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : { waiting: [] }))
            .then((d) => setQueue(d.waiting))
            .catch(() => {});
      },
      waiting ? 3000 : 10000,
    );
    return () => clearInterval(monitor);
  }, [id, summary, waiting, refresh, stopCall]);
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [started]);
  useEffect(() => {
    const close = () => {
      stopPreview();
      stopCall();
    };
    window.addEventListener("pagehide", close);
    return () => window.removeEventListener("pagehide", close);
  }, [stopPreview, stopCall]);
  async function checkDevices() {
    stopPreview();
    setBusy(true);
    const gen = generation.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw Error("Open this page over HTTPS in Safari or Chrome.");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: summary?.type === "audio" ? false : { facingMode: "user" },
      });
      if (gen !== generation.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      tracks.current = stream;
      if (video.current) {
        video.current.srcObject = stream;
        await video.current.play();
      }
      setPreview(true);
      setMessage(
        "Microphone ready" +
          (summary?.type === "video"
            ? " · Camera ready."
            : " · Camera stays off for this audio meeting."),
      );
    } catch {
      setMessage(
        "Cannot access camera or microphone. Follow the permission guide below; you can also join with devices off.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function join() {
    if (!id || busy) return;
    setBusy(true);
    stopPreview();
    const gen = ++generation.current;
    try {
      const r = await fetch("/api/meet/" + id + "/join", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({ name }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      if (d.mode === "external_link") {
        setExternalUrl(d.externalUrl);
        setMessage(
          "Your invitation is confirmed. Open the host’s meeting link below.",
        );
        return;
      }
      if (r.status === 202) {
        setWaiting(true);
        setMessage(d.message);
        return;
      }
      if (!container.current || gen !== generation.current) return;
      setInCall(true);
      setMessage("Connecting to your private meeting…");
      const embedded = await embedMeeting(
        container.current,
        d as CallSession,
        () => {
          setStarted(Date.now());
          setElapsed(0);
          setMessage("You are in the meeting.");
        },
        () => {
          stopCall();
          setMessage("You left the meeting. You may rejoin while it is open.");
        },
        () =>
          setMessage(
            "Check camera/microphone permissions. The call can continue with devices off.",
          ),
        () => gen === generation.current,
      );
      if (gen !== generation.current) {
        await embedded.destroy();
        return;
      }
      call.current = embedded;
      try {
        sessionStorage.removeItem("aerotech-meeting-invite:" + id);
      } catch {}
    } catch (e) {
      stopCall();
      setMessage(
        e instanceof Error ? e.message : "Unable to join. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function admit(participantId: string, admit: boolean) {
    const r = await fetch("/api/meet/" + id + "/lobby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId, admit }),
    });
    if (r.ok) setQueue((q) => q.filter((p) => p.id !== participantId));
    else setMessage("Could not update the lobby. Try again.");
  }
  return (
    <div className="meet-workspace">
      <section className="aero-card meet-heading">
        <div>
          <BrandLogo compact href={guestToken ? "/" : workspaceHomes[role]} />
          <h1>Meeting room</h1>
          <p>{summary?.title || "Your private Aerotech meeting"}</p>
        </div>
        {!guestToken && (
          <Link className="aero-button border" href={base}>
            <ArrowLeft size={16} />
            All meetings
          </Link>
        )}
      </section>
      <p role="status" aria-live="polite" className="meet-message">
        {message}
      </p>
      {needsLogin && (
        <section className="aero-card">
          <h2>Sign in to accept your invitation</h2>
          <p>
            Use your invited Aerotech account. You do not need a Daily account.
          </p>
          <Link
            className="aero-button meet-primary"
            href={
              "/auth/login?" +
              new URLSearchParams({
                role: "applicant",
                next: "/applicant/meet/" + id,
              })
            }
          >
            Sign in to Aerotech
          </Link>
          <Link
            className="aero-button border"
            href={
              "/auth/signup/applicant?" +
              new URLSearchParams({ next: "/applicant/meet/" + id })
            }
          >
            Create a free applicant account
          </Link>
        </section>
      )}
      {summary?.mode === "external_link" && (
        <section className="aero-card space-y-4">
          <h2>Join the host’s meeting</h2>
          <p>
            This call opens at the host’s provider. Their admission, device and
            recording settings apply. Aerotech does not meter external calls.
          </p>
          {externalUrl ? (
            <a
              className="aero-button meet-primary"
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open meeting link
            </a>
          ) : (
            <button
              className="aero-button meet-primary"
              disabled={busy}
              onClick={() => void join()}
            >
              Confirm invitation
            </button>
          )}
        </section>
      )}
      {summary && summary.mode !== "external_link" && !inCall && (
        <section className="aero-card meet-prejoin">
          <div className="meet-preview">
            {summary.type === "audio" ? (
              <Mic size={48} aria-hidden="true" />
            ) : (
              <video
                ref={video}
                playsInline
                muted
                autoPlay
                aria-label="Private camera preview"
              />
            )}
            {!preview && <span>Your preview stays on this device</span>}
          </div>
          <div>
            <p className="meet-eyebrow">
              {summary.type === "audio"
                ? "Audio-only meeting"
                : "Video meeting"}
            </p>
            <h2>Ready when you are</h2>
            <label className="block">
              Confirm your name
              <input
                className="aero-input"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button
              className="aero-button border"
              onClick={() => void checkDevices()}
              disabled={busy || waiting}
            >
              {summary.type === "audio" ? (
                <Mic size={18} />
              ) : (
                <Video size={18} />
              )}
              Check{" "}
              {summary.type === "audio" ? "microphone" : "camera & microphone"}
            </button>
            {preview && (
              <button className="aero-button border" onClick={stopPreview}>
                Stop preview
              </button>
            )}
            <button
              className="aero-button meet-primary"
              disabled={busy || waiting || !name.trim() || !summary.configured}
              onClick={() => void join()}
            >
              {busy
                ? "Connecting…"
                : waiting
                  ? "Waiting for host…"
                  : "Join meeting"}
            </button>
            <p className="meet-notice">
              <ShieldCheck size={20} aria-hidden="true" />
              Daily handles live call media. Aerotech stores meeting metadata,
              not audio, video or in-call chat. Recording and transcription are
              off. Participants enter after host approval.
            </p>
          </div>
        </section>
      )}
      {summary?.host && summary.mode !== "external_link" && (
        <section className="aero-card">
          <h2>Host lobby</h2>
          {queue.length ? (
            queue.map((p) => (
              <div className="meet-waiting" key={p.id}>
                <span>{p.name}</span>
                <button
                  className="aero-button meet-primary"
                  onClick={() => void admit(p.id, true)}
                >
                  Admit
                </button>
                <button
                  className="aero-button border"
                  onClick={() => void admit(p.id, false)}
                >
                  Decline
                </button>
              </div>
            ))
          ) : (
            <p>No participants are waiting.</p>
          )}
        </section>
      )}
      {inCall && (
        <div className="meet-call-bar">
          <span>
            <Clock size={18} aria-hidden="true" />
            Time in call{" "}
            {Math.floor(elapsed / 60)
              .toString()
              .padStart(2, "0")}
            :{(elapsed % 60).toString().padStart(2, "0")}
          </span>
          <button
            className="aero-button border"
            onClick={() => {
              stopCall();
              setMessage("You left the meeting.");
            }}
          >
            Leave meeting
          </button>
        </div>
      )}
      <div
        ref={container}
        className={"meeting-stage meet-embed " + (!inCall ? "meet-hidden" : "")}
        aria-label="Embedded meeting controls"
      />
      {!inCall && (
        <section className="aero-card meet-help">
          <h2>Camera or microphone not working?</h2>
          <p>
            <strong>iPhone / Safari:</strong> open page settings → Website
            Settings → Camera and Microphone → Allow, then reload. Check
            Settings → Apps → Safari if needed.
          </p>
          <p>
            <strong>Android / Chrome:</strong> tap site controls → Permissions →
            allow Camera and Microphone. Check Android Settings → Apps → Chrome
            → Permissions if blocked.
          </p>
          <p>
            Close other apps using your camera, use headphones, and open the
            link directly in Safari or Chrome. Screen sharing is available on
            supported desktop browsers. Audio-only calls never request a camera.
          </p>
        </section>
      )}
    </div>
  );
}
