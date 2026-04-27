import { cn } from "@/lib/utils";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        {/* Animated spinner with brand styling */}
        <div className="relative">
          {/* Outer ring */}
          <div
            className={cn(
              "h-16 w-16 rounded-full",
              "border-4 border-primary/20",
            )}
          />
          {/* Spinning arc */}
          <div
            className={cn(
              "absolute inset-0 h-16 w-16 rounded-full",
              "border-4 border-transparent border-t-primary",
              "animate-spin",
            )}
            style={{ animationDuration: "1s" }}
          />
          {/* Inner logo mark */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "text-primary font-bold text-xs tracking-wider",
            )}
          >
            <svg
              className="h-6 w-6 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Damira Pharma
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Loading</span>
            {/* Animated dots */}
            <span className="flex gap-0.5">
              <span
                className="h-1 w-1 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="h-1 w-1 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1 w-1 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
