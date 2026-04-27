export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100">
      {/* Animated background pattern - molecular/hexagonal grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-secondary/15 to-primary/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />

        {/* Hexagonal molecular pattern overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hexagons"
              width="50"
              height="43.4"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(2)"
            >
              <polygon
                points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary-dark"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>

        {/* Floating molecular dots */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0s] [animation-duration:3s]" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-secondary/25 rounded-full animate-bounce [animation-delay:0.5s] [animation-duration:4s]" />
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-primary/20 rounded-full animate-bounce [animation-delay:1s] [animation-duration:3.5s]" />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-accent/20 rounded-full animate-bounce [animation-delay:1.5s] [animation-duration:4.5s]" />
      </div>

      {/* Main content - centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}
