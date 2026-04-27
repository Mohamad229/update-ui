"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { Eye, EyeOff, Loader2, Shield, Lock, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const callbackUrl = "/admin";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(result?.url || callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo & Brand Header */}
      <div className="text-center mb-8">
        {/* Logo Mark - Hexagonal/Molecular inspired */}
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Outer ring with gradient */}
          <div className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-dark to-secondary rotate-6 opacity-20 blur-sm" />
          <div className="absolute w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark rotate-6" />

          {/* Inner icon container */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/25 rotate-6">
            <div className="-rotate-6">
              {/* Stylized "D" with molecular accent */}
              <svg
                viewBox="0 0 40 40"
                className="w-10 h-10 text-white"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 8h10c7.732 0 14 6.268 14 14s-6.268 14-14 14H10V8z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="28"
                  cy="12"
                  r="3"
                  fill="currentColor"
                  opacity="0.6"
                />
                <circle
                  cx="32"
                  cy="20"
                  r="2"
                  fill="currentColor"
                  opacity="0.4"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
          Damira
          <span className="text-primary"> Pharma</span>
        </h1>

        {/* Subtitle with security indicator */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Shield className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium tracking-wide uppercase">
            Admin Dashboard
          </span>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative">
        {/* Card glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur opacity-60" />

        {/* Main card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

          <div className="p-8">
            {/* Welcome text */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground">
                Sign in to access the management portal
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-3 h-3 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Authentication failed
                    </p>
                    <p className="text-sm text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isPending}
                    placeholder="admin@damira-pharma.com"
                    className="block w-full pl-12 pr-4 py-3.5 text-foreground bg-slate-50/50 border border-slate-200 rounded-xl placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isPending}
                    placeholder="Enter your password"
                    className="block w-full pl-12 pr-12 py-3.5 text-foreground bg-slate-50/50 border border-slate-200 rounded-xl placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="relative w-full group"
              >
                {/* Button glow on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-300" />

                <div className="relative flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg">
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in to Dashboard</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              <span>Secured with enterprise-grade encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <a
            href="mailto:support@damira-pharma.com"
            className="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
          >
            Contact support
          </a>
        </p>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground/70">
          &copy; {new Date().getFullYear()} Damira Pharma. All rights reserved.
        </p>
      </div>
    </div>
  );
}
