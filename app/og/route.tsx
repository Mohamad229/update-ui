import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title") || "Damira Pharma";
  const locale =
    request.nextUrl.searchParams.get("locale") === "ar" ? "ar" : "en";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background:
          "radial-gradient(circle at 8% 14%, rgba(11,164,232,0.35) 0%, rgba(255,255,255,0) 45%), radial-gradient(circle at 92% 20%, rgba(32,177,116,0.28) 0%, rgba(255,255,255,0) 42%), linear-gradient(135deg, #062640 0%, #0b4d73 45%, #0a7ea8 100%)",
        color: "#ffffff",
        fontFamily: locale === "ar" ? "Cairo" : "Arial",
        padding: "72px",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          border: "1px solid rgba(255,255,255,0.35)",
          borderRadius: 999,
          padding: "10px 18px",
          fontSize: 24,
          letterSpacing: 2,
        }}
      >
        DAMIRA PHARMA
      </div>
      <div
        style={{
          fontSize: 64,
          lineHeight: 1.1,
          maxWidth: 1020,
          fontWeight: 700,
          textAlign: locale === "ar" ? "right" : "left",
        }}
      >
        {title}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
