"use client";
import { useRef, useEffect, type ReactNode } from "react";
export default function CollaborationDialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    const focus = document.activeElement as HTMLElement | null;
    d?.showModal();
    return () => {
      d?.close();
      focus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      className="m-auto max-h-[90dvh] w-[min(720px,94vw)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-950/50"
      aria-label={title}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button type="button" className="aero-button border" onClick={close}>
          Close
        </button>
      </div>
      {children}
    </dialog>
  );
}
