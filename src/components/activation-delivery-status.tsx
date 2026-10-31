"use client";
import { useCallback, useEffect, useState } from "react";
export default function ActivationDeliveryStatus({
  employeeId,
}: {
  employeeId: string;
}) {
  const [data, setData] = useState<{
      activated: boolean;
      configured: boolean;
      delivery: {
        status: string;
        attempts: number;
        created_at: string;
        last_error: string | null;
      } | null;
    } | null>(null),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const r = await fetch("/api/employees/invite?employeeId=" + employeeId, {
          cache: "no-store",
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setData(d);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load invitation status.",
      );
    }
  }, [employeeId]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">Employee activation</h2>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-red-800">
          {error}
        </p>
      ) : !data ? (
        <p role="status" className="mt-2 text-sm text-slate-600">
          Loading invitation status…
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-700">
            {data.activated
              ? "Employee account activated."
              : data.delivery?.status === "done"
                ? "Invitation accepted by the email provider. Inbox delivery is not guaranteed."
                : data.delivery?.status === "dead"
                  ? "Delivery needs attention. Review the email address/configuration and queue a new invitation."
                  : data.delivery
                    ? "Invitation queued or being retried."
                    : "No invitation has been queued yet."}
          </p>
          {!data.configured && !data.activated && (
            <p className="mt-2 text-sm text-amber-900">
              Email delivery is not configured. An administrator must complete
              setup.
            </p>
          )}
        </>
      )}
      <button
        type="button"
        className="aero-button mt-3 border"
        onClick={() => void load()}
      >
        Refresh activation status
      </button>
    </section>
  );
}
