"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog provider");
  }
  return context;
}

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, children, asChild, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(true);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          onClick: handleClick,
        },
      );
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

interface DialogPortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

function DialogPortal({ children, container }: DialogPortalProps) {
  const { open } = useDialogContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const target = container || document.body;
  return ReactDOM.createPortal(children, target);
}

type DialogOverlayProps = React.HTMLAttributes<HTMLDivElement>;

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();

    return (
      <div
        ref={ref}
        data-slot="dialog-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
          // Animation
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className,
        )}
        data-state="open"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Callback when close button is clicked or escape is pressed */
  onClose?: () => void;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, showCloseButton = true, onClose, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext();
    const contentRef = React.useRef<HTMLDivElement>(null);
    const previousActiveElement = React.useRef<HTMLElement | null>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => contentRef.current!, []);

    // Handle escape key
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          onClose?.();
          onOpenChange(false);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange, onClose]);

    // Focus trap and scroll lock
    React.useEffect(() => {
      if (open) {
        // Store currently focused element
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Prevent body scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Focus the dialog
        requestAnimationFrame(() => {
          const focusableElements = contentRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const firstFocusable = focusableElements?.[0] as HTMLElement;
          firstFocusable?.focus();
        });

        return () => {
          document.body.style.overflow = originalOverflow;
          previousActiveElement.current?.focus();
        };
      }
    }, [open]);

    // Focus trap
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    };

    const handleClose = () => {
      onClose?.();
      onOpenChange(false);
    };

    return (
      <DialogPortal>
        <DialogOverlay />
        <div
          ref={contentRef}
          data-slot="dialog-content"
          role="dialog"
          aria-modal="true"
          data-state="open"
          onKeyDown={handleKeyDown}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-lg max-h-[85vh] overflow-auto",
            "rounded-[var(--radius-lg)] border border-border bg-background p-6 shadow-lg",
            // Animation
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-200",
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <button
              type="button"
              data-slot="dialog-close"
              onClick={handleClose}
              className={cn(
                "absolute right-4 top-4 rounded-[var(--radius-sm)] p-1",
                "text-muted-foreground hover:text-foreground",
                "opacity-70 hover:opacity-100",
                "transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              aria-label="Close dialog"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = "DialogContent";

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5 pr-8", className)}
      {...props}
    />
  ),
);
DialogHeader.displayName = "DialogHeader";

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      data-slot="dialog-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
DialogTitle.displayName = "DialogTitle";

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="dialog-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 mt-6",
        className,
      )}
      {...props}
    />
  ),
);
DialogFooter.displayName = "DialogFooter";

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, children, asChild, ...props }, ref) => {
    const { onOpenChange } = useDialogContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(false);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          onClick: handleClick,
        },
      );
    }

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
);
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};
export type {
  DialogProps,
  DialogTriggerProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogCloseProps,
};
