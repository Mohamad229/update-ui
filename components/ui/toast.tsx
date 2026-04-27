"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

// Types
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// Context
const ToastContext = React.createContext<ToastContextValue | null>(null);

// Hook
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Generate unique IDs
let toastCount = 0;
function generateId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${toastCount}-${Date.now()}`;
}

// Default duration in milliseconds
const DEFAULT_DURATION = 5000;

// Provider Props
interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum number of toasts to show at once */
  maxToasts?: number;
}

// Provider Component
export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timeoutRefs = React.useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismiss = React.useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      const id = generateId();
      const duration = props.duration ?? DEFAULT_DURATION;

      setToasts((prev) => {
        const newToasts = [...prev, { ...props, id }];
        // Limit to maxToasts
        if (newToasts.length > maxToasts) {
          const removed = newToasts.shift();
          if (removed) {
            const timeout = timeoutRefs.current.get(removed.id);
            if (timeout) {
              clearTimeout(timeout);
              timeoutRefs.current.delete(removed.id);
            }
          }
        }
        return newToasts;
      });

      // Auto dismiss after duration
      if (duration > 0) {
        const timeout = setTimeout(() => {
          dismiss(id);
        }, duration);
        timeoutRefs.current.set(id, timeout);
      }

      return id;
    },
    [dismiss, maxToasts],
  );

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    const refs = timeoutRefs.current;
    return () => {
      refs.forEach((timeout) => clearTimeout(timeout));
      refs.clear();
    };
  }, []);

  const value = React.useMemo(
    () => ({ toasts, toast, dismiss, dismissAll }),
    [toasts, toast, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

// Toast Item Props
interface ToastItemProps extends Toast {
  onDismiss: (id: string) => void;
}

// Variant styles and icons
const variantStyles = {
  default: {
    container: "bg-card border-border",
    icon: Info,
    iconClass: "text-primary",
  },
  success: {
    container: "bg-card border-success/30",
    icon: CheckCircle,
    iconClass: "text-success",
  },
  error: {
    container: "bg-card border-error/30",
    icon: AlertCircle,
    iconClass: "text-error",
  },
  warning: {
    container: "bg-card border-warning/30",
    icon: AlertTriangle,
    iconClass: "text-warning",
  },
};

// Individual Toast Component
function ToastItem({
  id,
  title,
  description,
  variant = "default",
  onDismiss,
}: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false);
  const { icon: Icon, container, iconClass } = variantStyles[variant];

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => onDismiss(id), 150);
  };

  return (
    <div
      data-slot="toast"
      data-state={isExiting ? "closed" : "open"}
      role="alert"
      aria-live="polite"
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
        "rounded-[var(--radius-lg)] border p-4 shadow-lg",
        container,
        // Animation
        "animate-in slide-in-from-right-full fade-in-0 duration-200",
        isExiting &&
          "animate-out slide-out-to-right-full fade-out-0 duration-150",
      )}
    >
      <Icon className={cn("size-5 shrink-0 mt-0.5", iconClass)} />
      <div className="flex-1 grid gap-1">
        {title && (
          <div
            data-slot="toast-title"
            className="text-sm font-semibold text-foreground"
          >
            {title}
          </div>
        )}
        {description && (
          <div
            data-slot="toast-description"
            className="text-sm text-muted-foreground"
          >
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          "absolute right-2 top-2 rounded-[var(--radius-sm)] p-1",
          "text-muted-foreground hover:text-foreground",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-150",
          "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-label="Dismiss notification"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export { ToastItem };
