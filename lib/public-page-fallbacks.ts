import { SectionType } from "@prisma/client";

import type { Locale } from "@/i18n/config";
import type { PublicPageData, PublicPageSection } from "@/lib/public-pages";

type FallbackPage = Omit<PublicPageData, "sections"> & {
  sections: Array<Omit<PublicPageSection, "type"> & { type: SectionType }>;
};

const EN_FALLBACKS: Record<string, FallbackPage> = {
  home: {
    slug: "home",
    title: "Welcome to Damira Pharma",
    metaTitle: "Damira Pharma | Trusted Pharmaceutical Partner",
    metaDescription:
      "Damira Pharma delivers trusted pharmaceutical distribution, market access, and compliance-led healthcare solutions across the region.",
    sections: [
      {
        id: "home-hero",
        type: SectionType.HERO,
        order: 0,
        content: {
          title: "Healthcare Distribution Built on Trust",
          subtitle:
            "We connect global healthcare innovation with regional market expertise to deliver better patient outcomes.",
          ctaText: "Explore Our Services",
          ctaLink: "/services",
          overlayOpacity: 40,
          backgroundImage: {
            url: "/globe.svg",
          },
        },
      },
      {
        id: "home-stats",
        type: SectionType.STATS,
        order: 1,
        content: {
          title: "Our Impact",
          stats: [
            { id: "s1", number: "20+", label: "Years of market expertise" },
            { id: "s2", number: "1,200+", label: "Healthcare partners served" },
            {
              id: "s3",
              number: "98",
              unit: "%",
              label: "On-time delivery rate",
            },
          ],
        },
      },
      {
        id: "home-cards",
        type: SectionType.CARDS,
        order: 2,
        content: {
          title: "Core Business Areas",
          description:
            "A full-spectrum model designed for pharmaceutical growth and reliability.",
          cardsPerRow: 3,
          cards: [
            {
              id: "c1",
              title: "Commercial Operations",
              description:
                "Strategic brand positioning and in-market execution.",
            },
            {
              id: "c2",
              title: "Distribution Excellence",
              description:
                "Cold-chain enabled logistics from warehouse to last mile.",
            },
            {
              id: "c3",
              title: "Regulatory Enablement",
              description:
                "Submission, approval, and lifecycle support with local expertise.",
            },
          ],
        },
      },
      {
        id: "home-cta",
        type: SectionType.CTA,
        order: 3,
        content: {
          title: "Looking for a strategic healthcare partner?",
          description:
            "Let us build a growth plan tailored to your portfolio and markets.",
          buttonText: "Partner With Us",
          buttonLink: "/partnerships",
          buttonStyle: "primary",
          textColor: "white",
        },
      },
    ],
  },
  about: {
    slug: "about",
    title: "About Us",
    metaTitle: "About Damira Pharma | Vision, Mission, and Values",
    metaDescription:
      "Learn about Damira Pharma vision, mission, and values shaping responsible pharmaceutical growth across the region.",
    sections: [
      {
        id: "about-text",
        type: SectionType.TEXT,
        order: 0,
        content: {
          title: "Who We Are",
          content:
            "<p>Damira Pharma is a regional pharmaceutical company built on operational discipline, ethical practice, and long-term healthcare value creation.</p>",
          alignment: "left",
          backgroundColor: "white",
        },
      },
      {
        id: "about-features",
        type: SectionType.FEATURES,
        order: 1,
        content: {
          title: "Vision, Mission, and Core Values",
          layout: "grid",
          features: [
            {
              id: "f1",
              icon: "🎯",
              title: "Vision",
              description:
                "To be the most trusted pharmaceutical growth partner in the region.",
            },
            {
              id: "f2",
              icon: "🤝",
              title: "Mission",
              description:
                "Deliver safe, compliant, and accessible healthcare solutions at scale.",
            },
            {
              id: "f3",
              icon: "🛡️",
              title: "Values",
              description:
                "Integrity, patient focus, accountability, and continuous improvement.",
            },
          ],
        },
      },
      {
        id: "about-image-text",
        type: SectionType.IMAGE_TEXT,
        order: 2,
        content: {
          title: "Case Study: Market Expansion",
          content:
            "<p>Our launch framework helped international partners achieve rapid, compliant market entry with sustainable growth after year one.</p>",
          imagePosition: "right",
          imageRatio: "16:9",
          image: {
            url: "/window.svg",
          },
        },
      },
    ],
  },
  services: {
    slug: "services",
    title: "Services",
    metaTitle: "Pharmaceutical Services | Damira Pharma",
    metaDescription:
      "Explore Damira Pharma integrated pharmaceutical services including regulatory affairs, market access, and controlled distribution.",
    sections: [
      {
        id: "services-hero",
        type: SectionType.HERO,
        order: 0,
        content: {
          title: "Integrated Pharmaceutical Services",
          subtitle:
            "From market strategy to execution, all under one quality-driven operating model.",
          overlayOpacity: 50,
          backgroundImage: {
            url: "/file.svg",
          },
        },
      },
      {
        id: "services-cards",
        type: SectionType.CARDS,
        order: 1,
        content: {
          title: "What We Deliver",
          cardsPerRow: 3,
          cards: [
            {
              id: "sc1",
              title: "Regulatory Affairs",
              description: "End-to-end dossier and authority support.",
            },
            {
              id: "sc2",
              title: "Commercial Planning",
              description: "Launch strategy and demand forecasting.",
            },
            {
              id: "sc3",
              title: "Supply Chain",
              description:
                "Controlled infrastructure and distribution visibility.",
            },
          ],
        },
      },
      {
        id: "services-image-text",
        type: SectionType.IMAGE_TEXT,
        order: 2,
        content: {
          title: "Infrastructure and Last-Mile Control",
          content:
            "<p>Our infrastructure combines warehousing, cold-chain handling, and route-level monitoring to preserve product integrity through every step.</p>",
          imagePosition: "left",
          imageRatio: "4:3",
          image: {
            url: "/window.svg",
          },
        },
      },
    ],
  },
  compliance: {
    slug: "compliance",
    title: "Quality & Compliance",
    metaTitle: "Quality and Compliance | Damira Pharma",
    metaDescription:
      "Discover Damira Pharma quality systems, ethics commitments, and compliance-first operations for patient safety and continuity.",
    sections: [
      {
        id: "compliance-text",
        type: SectionType.TEXT,
        order: 0,
        content: {
          title: "Quality Without Compromise",
          content:
            "<p>We operate with strict quality governance, documented procedures, and continuous audit readiness across all critical workflows.</p>",
          alignment: "left",
          backgroundColor: "light-gray",
        },
      },
      {
        id: "compliance-features",
        type: SectionType.FEATURES,
        order: 1,
        content: {
          title: "Compliance Pillars",
          layout: "list",
          features: [
            {
              id: "cf1",
              icon: "✅",
              title: "GxP Alignment",
              description:
                "Operating standards aligned with recognized quality systems.",
            },
            {
              id: "cf2",
              icon: "📋",
              title: "Regulatory Oversight",
              description:
                "Proactive risk management and documentation controls.",
            },
            {
              id: "cf3",
              icon: "⚖️",
              title: "Ethics Commitment",
              description:
                "Transparent, accountable, and patient-first conduct.",
            },
          ],
        },
      },
      {
        id: "compliance-cta",
        type: SectionType.CTA,
        order: 2,
        content: {
          title: "Need regulatory confidence for your product line?",
          description:
            "Our team can support compliant market entry and lifecycle continuity.",
          buttonText: "Contact Compliance Team",
          buttonLink: "/contact",
          buttonStyle: "secondary",
          textColor: "dark",
        },
      },
    ],
  },
  partnerships: {
    slug: "partnerships",
    title: "Partnerships",
    metaTitle: "Partner With Damira Pharma",
    metaDescription:
      "Build strategic healthcare partnerships with Damira Pharma to accelerate market entry, distribution, and sustainable growth.",
    sections: [
      {
        id: "partners-hero",
        type: SectionType.HERO,
        order: 0,
        content: {
          title: "Why Partner With Damira",
          subtitle:
            "A local partner with strategic access, execution rigor, and long-term commitment.",
          ctaText: "Start a Partnership",
          ctaLink: "/contact",
          overlayOpacity: 45,
          backgroundImage: {
            url: "/globe.svg",
          },
        },
      },
      {
        id: "partners-stats",
        type: SectionType.STATS,
        order: 1,
        content: {
          title: "Partnership Outcomes",
          stats: [
            {
              id: "ps1",
              number: "95",
              unit: "%",
              label: "Portfolio retention rate",
            },
            { id: "ps2", number: "30+", label: "Strategic brands supported" },
            {
              id: "ps3",
              number: "12",
              label: "Markets with active access programs",
            },
          ],
        },
      },
      {
        id: "partners-cta",
        type: SectionType.CTA,
        order: 2,
        content: {
          title: "Let's Build the Future of Healthcare",
          description:
            "Tell us about your portfolio and growth goals. We will respond with a practical market strategy.",
          buttonText: "Talk to Our Team",
          buttonLink: "/contact",
          buttonStyle: "primary",
          textColor: "white",
        },
      },
    ],
  },
};

const AR_FALLBACKS: Record<string, FallbackPage> = {
  home: {
    slug: "home",
    title: "مرحبا بكم في داميرا فارما",
    metaTitle: "داميرا فارما | شريك دوائي موثوق",
    metaDescription:
      "داميرا فارما تقدم حلول توزيع دوائي وخدمات صحية موثوقة في المنطقة مع التزام قوي بالجودة.",
    sections: [
      {
        id: "home-hero-ar",
        type: SectionType.HERO,
        order: 0,
        content: {
          title: "توزيع دوائي موثوق قائم على الثقة",
          subtitle:
            "نربط الابتكار الصحي العالمي بخبرة السوق المحلية لتحقيق نتائج أفضل للمرضى.",
          ctaText: "اكتشف خدماتنا",
          ctaLink: "/services",
          overlayOpacity: 40,
          backgroundImage: {
            url: "/globe.svg",
          },
        },
      },
      {
        id: "home-stats-ar",
        type: SectionType.STATS,
        order: 1,
        content: {
          title: "أثرنا",
          stats: [
            { id: "as1", number: "+20", label: "سنة من الخبرة السوقية" },
            { id: "as2", number: "+1200", label: "شريك رعاية صحية" },
            {
              id: "as3",
              number: "98",
              unit: "%",
              label: "نسبة الالتزام بالتسليم",
            },
          ],
        },
      },
      {
        id: "home-cta-ar",
        type: SectionType.CTA,
        order: 2,
        content: {
          title: "هل تبحث عن شريك استراتيجي في الرعاية الصحية؟",
          description: "نصمم خطة نمو مناسبة لمحفظتك وأسواقك.",
          buttonText: "ابدأ الشراكة",
          buttonLink: "/partnerships",
          buttonStyle: "primary",
          textColor: "white",
        },
      },
    ],
  },
  about: {
    slug: "about",
    title: "من نحن",
    metaTitle: "من نحن | داميرا فارما",
    metaDescription:
      "تعرف على رؤية داميرا فارما ورسالتها وقيمها في بناء نموذج دوائي قائم على الجودة والمسؤولية.",
    sections: [
      {
        id: "about-text-ar",
        type: SectionType.TEXT,
        order: 0,
        content: {
          title: "من نحن",
          content:
            "<p>داميرا فارما شركة دوائية إقليمية تعتمد على الانضباط التشغيلي والالتزام الأخلاقي وصناعة قيمة صحية مستدامة.</p>",
          alignment: "right",
          backgroundColor: "white",
        },
      },
      {
        id: "about-features-ar",
        type: SectionType.FEATURES,
        order: 1,
        content: {
          title: "الرؤية والرسالة والقيم",
          layout: "grid",
          features: [
            {
              id: "af1",
              icon: "🎯",
              title: "الرؤية",
              description: "أن نكون الشريك الدوائي الأكثر موثوقية في المنطقة.",
            },
            {
              id: "af2",
              icon: "🤝",
              title: "الرسالة",
              description:
                "تقديم حلول صحية آمنة ومتوافقة ومتاحة على نطاق واسع.",
            },
          ],
        },
      },
    ],
  },
  services: {
    slug: "services",
    title: "خدماتنا",
    metaTitle: "الخدمات الدوائية | داميرا فارما",
    metaDescription:
      "اكتشف خدمات داميرا فارما المتكاملة في الشؤون التنظيمية والتخطيط التجاري وسلسلة الإمداد المنضبطة.",
    sections: [
      {
        id: "services-hero-ar",
        type: SectionType.HERO,
        order: 0,
        content: {
          title: "خدمات دوائية متكاملة",
          subtitle:
            "من الاستراتيجية حتى التنفيذ ضمن نموذج تشغيلي قائم على الجودة.",
          overlayOpacity: 50,
          backgroundImage: {
            url: "/file.svg",
          },
        },
      },
      {
        id: "services-cards-ar",
        type: SectionType.CARDS,
        order: 1,
        content: {
          title: "خدماتنا الرئيسية",
          cardsPerRow: 3,
          cards: [
            {
              id: "asc1",
              title: "الشؤون التنظيمية",
              description: "دعم متكامل للتسجيل والاعتماد.",
            },
            {
              id: "asc2",
              title: "التخطيط التجاري",
              description: "استراتيجية إطلاق وتنبؤ دقيق بالطلب.",
            },
            {
              id: "asc3",
              title: "سلسلة الإمداد",
              description: "بنية تحتية متقدمة ورقابة لوجستية.",
            },
          ],
        },
      },
    ],
  },
  compliance: {
    slug: "compliance",
    title: "الجودة والامتثال",
    metaTitle: "الجودة والامتثال | داميرا فارما",
    metaDescription:
      "اطلع على منظومة الجودة والامتثال في داميرا فارما ونهجنا الأخلاقي لحماية المرضى واستمرارية المنتجات.",
    sections: [
      {
        id: "compliance-text-ar",
        type: SectionType.TEXT,
        order: 0,
        content: {
          title: "الجودة دون تنازل",
          content:
            "<p>نعمل ضمن حوكمة جودة صارمة وإجراءات موثقة وجاهزية دائمة للتدقيق في جميع العمليات الحساسة.</p>",
          alignment: "right",
          backgroundColor: "light-gray",
        },
      },
      {
        id: "compliance-cta-ar",
        type: SectionType.CTA,
        order: 1,
        content: {
          title: "هل تحتاج إلى دعم تنظيمي موثوق؟",
          description:
            "فريقنا يساعدك في دخول السوق وإدارة دورة الحياة وفق المتطلبات التنظيمية.",
          buttonText: "تواصل معنا",
          buttonLink: "/contact",
          buttonStyle: "secondary",
          textColor: "dark",
        },
      },
    ],
  },
  partnerships: {
    slug: "partnerships",
    title: "الشراكات",
    metaTitle: "الشراكة مع داميرا فارما",
    metaDescription:
      "اعمل مع داميرا فارما كشريك موثوق لدخول السوق والتوسع المستدام عبر نموذج تنفيذي منضبط.",
    sections: [
      {
        id: "partners-hero-ar",
        type: SectionType.HERO,
        order: 0,
        content: {
          title: "لماذا الشراكة مع داميرا",
          subtitle: "شريك محلي بخبرة تنفيذية قوية ورؤية نمو طويلة المدى.",
          ctaText: "ابدأ الشراكة",
          ctaLink: "/contact",
          overlayOpacity: 45,
        },
      },
      {
        id: "partners-cta-ar",
        type: SectionType.CTA,
        order: 1,
        content: {
          title: "لنبن مستقبل الرعاية الصحية معا",
          description: "شاركنا أهدافك وسنقدم لك خطة دخول ونمو عملية.",
          buttonText: "تحدث مع فريقنا",
          buttonLink: "/contact",
          buttonStyle: "primary",
          textColor: "white",
        },
      },
    ],
  },
};

export function getFallbackPublicPage(
  slug: string,
  locale: Locale,
): PublicPageData | null {
  const normalizedSlug = slug || "home";
  const localeMap = locale === "ar" ? AR_FALLBACKS : EN_FALLBACKS;
  const fallback = localeMap[normalizedSlug] || EN_FALLBACKS[normalizedSlug];

  if (!fallback) {
    return null;
  }

  return {
    ...fallback,
    sections: [...fallback.sections].sort((a, b) => a.order - b.order),
  };
}

export function getFallbackPublicPageSeo(slug: string, locale: Locale) {
  const normalizedSlug = slug || "home";
  const localeMap = locale === "ar" ? AR_FALLBACKS : EN_FALLBACKS;
  const fallback = localeMap[normalizedSlug] || EN_FALLBACKS[normalizedSlug];

  if (!fallback) {
    return null;
  }

  return {
    slug: fallback.slug,
    title: fallback.title,
    metaTitle: fallback.metaTitle,
    metaDescription: fallback.metaDescription,
  };
}
