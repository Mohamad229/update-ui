"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { cn } from "@/lib/utils";
import { useToast, ToastItem } from "./toast";

interface ToasterProps {
  /** Position of the toast container */
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  /** Additional className for the container */
  className?: string;
  /** Gap between toasts in pixels */
  gap?: number;
}

const positionStyles = {
  "top-right": "top-4 right-4 items-end",
  "top-left": "top-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
};

export function Toaster({
  position = "bottom-right",
  className,
  gap = 12,
}: ToasterProps) {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const content = (
    <div
      data-slot="toaster"
      aria-label="Notifications"
      className={cn(
        "fixed z-[100] flex flex-col pointer-events-none",
        "w-full max-w-[420px] p-4",
        positionStyles[position],
        className,
      )}
      style={{ gap }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={dismiss} />
      ))}
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
