"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  label: string;
  onDismiss: () => void;
  children: ReactNode;
};

export default function Modal({ label, onDismiss, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Native modal dialogs contain focus and make the rest of the page inert.
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onCancel={(event) => { event.preventDefault(); onDismiss(); }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-white backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div
        className="flex h-full items-center justify-center p-3 sm:p-5"
        onMouseDown={(event) => { if (event.target === event.currentTarget) onDismiss(); }}
      >
        <div className="flex max-h-[95dvh] w-full max-w-[1150px] flex-col overflow-hidden rounded-[24px] bg-[#090d1c] text-white shadow-2xl">
          {children}
        </div>
      </div>
    </dialog>
  );
}
