"use client";
import { useEffect, useState, type FormEvent } from "react";
import { type LeavePolicy } from "@/lib/leave-policy";
import { leaveCategories } from "@/lib/leave-dates";
export default function LeavePolicyEditor() {
  const [year, setYear] = useState(new Date().getFullYear()),
    [policy, setPolicy] = useState<LeavePolicy | null>(null),
    [holidays, setHolidays] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    fetch("/api/hr/leave-policy?year=" + year, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (active) {
          setPolicy(d.policy);
          setHolidays(d.policy.holidays.join("\n"));
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [year, retry]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!policy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/hr/leave-policy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            policy: {
              ...policy,
              holidays: holidays.split(/\s+/).filter(Boolean),
            },
          }),
        }),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      setNotice(
        "Leave policy saved. Balances now use this calendar and accrual policy.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save policy.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="aero-card">
      <h2 className="text-xl font-bold">Company leave policy</h2>
      <p className="mt-2 text-sm text-slate-600">
        Set your organisation’s entitlements. Review against employment
        contracts and applicable law; no statutory allowance is assumed.
      </p>
      <label className="mt-4 block text-sm font-semibold">
        Policy year
        <select
          className="aero-input mt-2"
          value={year}
          onChange={(e) => {
            setPolicy(null);
            setYear(Number(e.target.value));
            setNotice("");
          }}
        >
          {[
            new Date().getFullYear() - 1,
            new Date().getFullYear(),
            new Date().getFullYear() + 1,
          ].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </label>
      {error && (
        <p role="alert" className="mt-4 text-red-800">
          {error}
          <button
            className="ml-3 underline"
            onClick={() => setRetry((r) => r + 1)}
          >
            Try again
          </button>
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-emerald-800">
          {notice}
        </p>
      )}
      {!policy ? (
        <p role="status" className="mt-4">
          Loading policy…
        </p>
      ) : (
        <form onSubmit={save} className="mt-5 space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold">Working days</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day, i) => (
                <label
                  key={day}
                  className="flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={policy.workweek.includes(i + 1)}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        workweek: e.target.checked
                          ? [...policy.workweek, i + 1]
                          : policy.workweek.filter((d) => d !== i + 1),
                      })
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-semibold">
            Holidays (one YYYY-MM-DD date per line)
            <textarea
              className="aero-input mt-2"
              rows={4}
              value={holidays}
              onChange={(e) => setHolidays(e.target.value)}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {leaveCategories.map((category) => (
              <fieldset
                key={category}
                className="rounded-xl border border-slate-200 p-4"
              >
                <legend className="px-1 font-semibold capitalize">
                  {category} leave
                </legend>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={policy.categories[category].enabled}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        categories: {
                          ...policy.categories,
                          [category]: {
                            ...policy.categories[category],
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                  />
                  Enabled
                </label>
                <label className="mt-2 block text-sm">
                  Default yearly entitlement (blank = HR review)
                  <input
                    type="number"
                    min="0"
                    max="366"
                    step="0.01"
                    className="aero-input mt-1"
                    value={policy.categories[category].allowance ?? ""}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        categories: {
                          ...policy.categories,
                          [category]: {
                            ...policy.categories[category],
                            allowance:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </label>
                <div className="mt-3">
                  <label
                    htmlFor={"accrual-" + category}
                    className="block text-sm"
                  >
                    Accrual
                  </label>
                  <select
                    id={"accrual-" + category}
                    className="aero-input mt-1"
                    value={policy.categories[category].accrual}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        categories: {
                          ...policy.categories,
                          [category]: {
                            ...policy.categories[category],
                            accrual: e.target.value as "upfront" | "monthly",
                          },
                        },
                      })
                    }
                  >
                    <option value="upfront">Available upfront</option>
                    <option value="monthly">Completed calendar months</option>
                  </select>
                </div>
                <label className="mt-3 block text-sm">
                  Carryover cap (days)
                  <input
                    type="number"
                    min="0"
                    max="366"
                    step="0.01"
                    className="aero-input mt-1"
                    value={policy.categories[category].carryoverCap}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        categories: {
                          ...policy.categories,
                          [category]: {
                            ...policy.categories[category],
                            carryoverCap: Number(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </label>
              </fieldset>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={policy.enforceBalances}
              onChange={(e) =>
                setPolicy({ ...policy, enforceBalances: e.target.checked })
              }
            />
            Prevent requests above configured balances. Unconfigured categories
            require HR review.
          </label>
          <p className="text-xs leading-5 text-slate-600">
            Employee entitlements override defaults. Monthly accrual credits
            completed calendar months from the month of hire. Carryover uses
            unused prior-year earned/opening entitlement, capped here; older
            carryover expires at year-end. Historical requests remain unchanged.
          </p>
          <button
            disabled={busy}
            className="aero-button bg-blue-700 text-white"
          >
            {busy ? "Saving policy…" : "Save company policy"}
          </button>
        </form>
      )}
    </section>
  );
}
