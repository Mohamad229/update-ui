import {
  Activity,
  Award,
  Building2,
  FileCheck2,
  FlaskConical,
  Globe2,
  Handshake,
  HeartPulse,
  LineChart,
  Microscope,
  Network,
  ShieldCheck,
  Snowflake,
  Stethoscope,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

import type {
  ContentSectionData,
  CtaSectionData,
  HeroSectionData,
  ProductCardData,
  ServiceCardData,
  StatsSectionData,
} from "@/components/public/sections/base";
import type { Locale } from "@/i18n/config";

interface GridWithServices {
  title: string;
  description?: string;
  columns?: 2 | 3 | 4;
  items: ServiceCardData[];
}

interface GridWithProducts {
  title: string;
  description?: string;
  columns?: 2 | 3 | 4;
  items: ProductCardData[];
}

interface VisionMissionData {
  title: string;
  description?: string;
  vision: {
    title: string;
    description: string;
  };
  mission: {
    title: string;
    description: string;
  };
}

interface ContactInfoData {
  title: string;
  description?: string;
  items: Array<{
    label: string;
    value: string;
    href?: string;
  }>;
}

interface ProductSpecificationsData {
  title: string;
  description?: string;
  items: Array<{
    label: string;
    value: string;
  }>;
}

interface InquiryTypeOptionData {
  value: string;
  label: string;
}

interface InquiryFormSectionData {
  title: string;
  description: string;
  fields: {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    inquiryType: string;
    inquiryTypePlaceholder: string;
    inquiryTypeOptions: InquiryTypeOptionData[];
    message: string;
    submit: string;
  };
}

export interface HomePageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  atAGlance: StatsSectionData;
  strategicFocus: GridWithServices;
  keyStrengths: GridWithServices;
  coverageReach: StatsSectionData;
  portfolioPreview: GridWithProducts;
  successHighlight: ContentSectionData;
  cta: CtaSectionData;
}

export interface AboutPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  companyOverview: ContentSectionData;
  visionMission: VisionMissionData;
  coreValues: GridWithServices;
  focusVerticals: GridWithServices;
  legacySuccess: {
    content: ContentSectionData;
    stats: StatsSectionData;
  };
}

export interface ServicesPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  infrastructure: ContentSectionData;
  coldChain: ContentSectionData;
  regulatory: ContentSectionData;
  safetyVigilance: ContentSectionData;
  medicalSupport: ContentSectionData;
  logisticsDistribution: ContentSectionData;
  marketAccess: ContentSectionData;
}

export interface ProductsPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  categories: GridWithServices;
  currentPortfolio: GridWithProducts;
  pipelineSegments: GridWithServices;
  catalog: GridWithProducts;
}

export interface QualityPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  certifications: GridWithServices;
  complianceDetails: ContentSectionData;
  cta: CtaSectionData;
}

export interface PartnershipsPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  whyPartner: GridWithServices;
  partnershipForm: InquiryFormSectionData;
  marketAccess: ContentSectionData;
  infrastructureStrength: ContentSectionData;
  commercialReach: StatsSectionData;
  provenSuccess: ContentSectionData;
  cta: CtaSectionData;
}

export interface ContactPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  contactInfo: ContactInfoData;
  companyIdentity: ContentSectionData;
  contactForm: InquiryFormSectionData;
}

export interface ProductDetailPageData {
  metadata: {
    title: string;
    description: string;
  };
  hero: HeroSectionData;
  productInfo: ContentSectionData;
  specifications: ProductSpecificationsData;
  relatedProducts: GridWithProducts;
  cta: CtaSectionData;
}

export interface PublicUiData {
  home: HomePageData;
  about: AboutPageData;
  services: ServicesPageData;
  products: ProductsPageData;
  quality: QualityPageData;
  partnerships: PartnershipsPageData;
  contact: ContactPageData;
}

const PRODUCT_CARDS_EN: ProductCardData[] = [
  {
    id: "rinolac",
    name: "Rinolac",
    category: "Specialized Nutrition",
    description:
      "Premium infant and pediatric nutrition designed for clinical confidence and sustained growth outcomes.",
    indication: "Nutritional support for infants and toddlers",
    storage: "Store in dry conditions below 25C",
    badge: "Current Portfolio",
    href: "/products/rinolac",
    image: { src: "/uploads/public/rinolac.jpg", alt: "Rinolac product pack" },
  },
  {
    id: "rino-plus",
    name: "Rino Plus",
    category: "Critical Care",
    description:
      "Hospital-focused therapeutic product line with reliable supply planning and scientific detailing.",
    indication: "ICU and acute care nutrition support",
    storage: "Controlled room temperature",
    badge: "Current Portfolio",
    href: "/products/rino-plus",
    image: { src: "/uploads/public/rino-plus.jpg", alt: "Rino Plus packaging" },
  },
  {
    id: "ausnutria",
    name: "Ausnutria",
    category: "Pediatrics",
    description:
      "Evidence-backed pediatric nutrition brand supported by localized education and field medical guidance.",
    indication: "Pediatric nutritional management",
    storage: "Keep away from humidity",
    badge: "Current Portfolio",
    href: "/products/ausnutria",
    image: {
      src: "/uploads/public/ausnutria.jpg",
      alt: "Ausnutria product range",
    },
  },
];

const PRODUCT_CARDS_AR: ProductCardData[] = [
  {
    id: "rinolac",
    name: "رينولاك",
    category: "التغذية المتخصصة",
    description:
      "حل تغذية للأطفال والرضع بمعايير موثوقة يدعم نتائج النمو بشكل مستدام.",
    indication: "دعم غذائي للرضع والأطفال",
    storage: "يحفظ في مكان جاف تحت 25 درجة",
    badge: "المحفظة الحالية",
    href: "/products/rinolac",
    image: { src: "/uploads/public/rinolac.jpg", alt: "منتج رينولاك" },
  },
  {
    id: "rino-plus",
    name: "رينو بلس",
    category: "العناية الحرجة",
    description:
      "خط علاجي موجه للمستشفيات مع تخطيط توريد موثوق ودعم علمي مستمر.",
    indication: "دعم غذائي في العناية المركزة",
    storage: "درجة حرارة الغرفة المضبوطة",
    badge: "المحفظة الحالية",
    href: "/products/rino-plus",
    image: { src: "/uploads/public/rino-plus.jpg", alt: "منتج رينو بلس" },
  },
  {
    id: "ausnutria",
    name: "أوسنوتريا",
    category: "طب الأطفال",
    description:
      "علامة تغذية أطفال مدعومة بالأدلة مع برامج تعليمية ميدانية محلية.",
    indication: "إدارة التغذية للأطفال",
    storage: "يحفظ بعيدًا عن الرطوبة",
    badge: "المحفظة الحالية",
    href: "/products/ausnutria",
    image: { src: "/uploads/public/ausnutria.jpg", alt: "منتجات أوسنوتريا" },
  },
];

const PUBLIC_UI_EN: PublicUiData = {
  home: {
    metadata: {
      title: "Building Syria's Specialized Healthcare Distribution Ecosystem",
      description:
        "Trusted partner for global life science, nutrition, and medical technology innovators.",
    },
    hero: {
      eyebrow: "Damira Pharma",
      title: "Building Syria's Specialized Healthcare Distribution Ecosystem",
      subtitle:
        "Trusted partner for global life science, nutrition, and medical technology innovators.",
      tagline: "Trusted. Healthy.",
      actions: [
        { label: "Explore Products", href: "/products", variant: "primary" },
        {
          label: "Become a Partner",
          href: "/partnerships",
          variant: "secondary",
        },
      ],
      metrics: [
        { value: "1,500 m2", label: "GDP & GSP Facility" },
        { value: "9,000 m3", label: "Climate-Controlled Storage" },
        { value: "50+ Years", label: "Group Legacy" },
      ],
      backgroundImage: {
        src: "/uploads/public/hero-healthcare.jpg",
        alt: "Healthcare logistics and pharmaceutical operations",
      },
    },
    atAGlance: {
      title: "Damira Pharma at a Glance",
      items: [
        { id: "founded", label: "Founded", value: "2025", icon: Building2 },
        {
          id: "legacy",
          label: "Al Ahlam Group Established",
          value: "1974",
          icon: Award,
        },
        {
          id: "facility",
          label: "Facility",
          value: "1,500 m2",
          icon: Warehouse,
        },
        { id: "storage", label: "Storage", value: "9,000 m3", icon: Snowflake },
      ],
    },
    strategicFocus: {
      title: "Strategic Focus Areas",
      description:
        "Four clinical segments where Damira delivers depth, control, and sustained value.",
      columns: 4,
      items: [
        {
          id: "oncology",
          title: "Oncology & Hematology",
          description:
            "Specialized programs with strict handling protocols and patient-centered supply continuity.",
          icon: Activity,
        },
        {
          id: "icu",
          title: "Critical Care & ICU",
          description:
            "Rapid-response supply models for high-acuity environments and life-support workflows.",
          icon: HeartPulse,
        },
        {
          id: "nutrition",
          title: "Nutrition & Pediatrics",
          description:
            "Clinically informed nutrition portfolios for neonatal, pediatric, and specialized care pathways.",
          icon: Stethoscope,
        },
        {
          id: "diagnostics",
          title: "Diagnostics & Devices",
          description:
            "Reliable movement of precision diagnostics and healthcare technologies across care networks.",
          icon: Microscope,
        },
      ],
    },
    keyStrengths: {
      title: "Key Strengths",
      description:
        "A corporate execution model built for compliance, control, and measurable outcomes.",
      items: [
        {
          id: "audit",
          title: "Audit-Ready Infrastructure",
          description:
            "Documented systems, validated workflows, and inspection-grade operating discipline.",
          icon: ShieldCheck,
        },
        {
          id: "cold-chain",
          title: "Advanced Cold Chain",
          description:
            "Validated 2-8C and ultra-low environments with real-time monitoring coverage.",
          icon: Snowflake,
        },
        {
          id: "regulatory",
          title: "Regulatory Expertise",
          description:
            "Structured dossiers, authorization pathways, and continuous regulatory follow-up.",
          icon: FileCheck2,
        },
        {
          id: "distribution",
          title: "Nationwide Distribution",
          description:
            "Field-proven last-mile capabilities spanning hospitals, pharmacies, and institutions.",
          icon: Truck,
        },
        {
          id: "legacy-strength",
          title: "50+ Years Group Legacy",
          description:
            "Operational maturity and financial stability through Al Ahlam Group foundations.",
          icon: Award,
        },
      ],
    },
    coverageReach: {
      title: "Coverage & Reach",
      items: [
        {
          id: "hospitals",
          label: "Hospitals & Centers",
          value: "100+",
          icon: Building2,
        },
        { id: "pos", label: "Points of Sale", value: "35,000+", icon: Network },
        {
          id: "pharmacies",
          label: "Pharmacies",
          value: "15,000+",
          icon: Users,
        },
        {
          id: "coverage",
          label: "Nationwide Access",
          value: "Syria",
          icon: Globe2,
        },
      ],
    },
    portfolioPreview: {
      title: "Portfolio Preview",
      description:
        "A focused and scalable portfolio balancing current brands and pipeline growth.",
      items: PRODUCT_CARDS_EN,
    },
    successHighlight: {
      eyebrow: "Success Highlight",
      title: "Proven Brand Scaling with +20% Market Share Growth",
      subtitle:
        "Rinolac growth was driven by data-first targeting and synchronized field execution.",
      body: [
        "Damira aligns supply continuity, scientific communication, and in-market visibility to accelerate adoption.",
        "Each launch is built around measurable account performance and disciplined stakeholder engagement.",
      ],
      bullets: [
        "Data-driven targeting strategy",
        "Strong point-of-care visibility",
        "Supply and promotion alignment",
      ],
      image: {
        src: "/uploads/public/success-analytics.jpg",
        alt: "Commercial performance and healthcare market analytics",
      },
    },
    cta: {
      eyebrow: "Partnership",
      title: "Let's Build the Future of Healthcare in Syria",
      description:
        "Partner with Damira Pharma to enter the Syrian healthcare market through a trusted, compliant, and scalable platform.",
      primaryAction: { label: "Become a Partner", href: "/partnerships" },
      secondaryAction: { label: "Contact Us", href: "/contact" },
      backgroundImage: {
        src: "/uploads/public/cta-healthcare.jpg",
        alt: "Healthcare collaboration",
      },
    },
  },
  about: {
    metadata: {
      title: "About Damira Pharma",
      description:
        "Specialized healthcare division of Al Ahlam Group with a modern, compliant operating model.",
    },
    hero: {
      eyebrow: "About Us",
      title: "About Damira Pharma",
      subtitle: "Specialized Healthcare Division of Al Ahlam Group",
      tagline: "Built on Legacy. Driven by Science.",
      actions: [
        { label: "Explore Services", href: "/services", variant: "primary" },
      ],
      backgroundImage: {
        src: "/uploads/public/about-hero.jpg",
        alt: "Damira Pharma facility and team",
      },
    },
    companyOverview: {
      eyebrow: "Company Overview",
      title: "A New Healthcare Platform with Deep Operational Roots",
      body: [
        "Damira Pharma was founded in 2025 as the specialized healthcare division of Al Ahlam Group, established in 1974.",
        "The group is ISO and FDA certified and supports nationwide execution through trusted infrastructure and disciplined governance.",
      ],
      bullets: [
        "Founded in 2025 with focused healthcare specialization",
        "Built on Al Ahlam Group legacy since 1974",
        "Nationwide infrastructure with quality-first execution",
      ],
      image: {
        src: "/uploads/public/about-overview.jpg",
        alt: "Corporate pharmaceutical operations",
      },
    },
    visionMission: {
      title: "Vision & Mission",
      description:
        "A long-term strategy anchored in access, quality, and scientific commercialization.",
      vision: {
        title: "Vision",
        description:
          "To be the preferred strategic partner for global healthcare innovators seeking resilient and compliant growth in Syria.",
      },
      mission: {
        title: "Mission",
        description:
          "To provide a GDP-compliant ecosystem that ensures safe and reliable access to therapies while building sustainable partnerships.",
      },
    },
    coreValues: {
      title: "Core Values",
      items: [
        {
          id: "quality",
          title: "Quality & Compliance",
          description:
            "Every process is designed for consistency, documentation, and patient safety.",
          icon: ShieldCheck,
        },
        {
          id: "science",
          title: "Scientific Excellence",
          description:
            "Clinical accuracy and evidence-based engagement guide all field and medical activities.",
          icon: FlaskConical,
        },
        {
          id: "ethics",
          title: "Ethics & Partnerships",
          description:
            "Transparent collaboration with principled governance and long-term accountability.",
          icon: Handshake,
        },
        {
          id: "team",
          title: "Team Development",
          description:
            "Structured capability-building programs sustain performance and leadership continuity.",
          icon: Users,
        },
        {
          id: "patient",
          title: "Patient Commitment",
          description:
            "Operational decisions prioritize therapeutic access and continuity of care.",
          icon: HeartPulse,
        },
      ],
    },
    focusVerticals: {
      title: "Focus Verticals",
      columns: 4,
      items: [
        {
          id: "v1",
          title: "Oncology & Hematology",
          description:
            "High-value therapies with strict quality and handling workflows.",
          icon: Activity,
        },
        {
          id: "v2",
          title: "Critical Care & ICU",
          description:
            "Time-sensitive products for intensive and emergency clinical settings.",
          icon: HeartPulse,
        },
        {
          id: "v3",
          title: "Nutrition & Pediatrics",
          description:
            "Targeted nutritional solutions for specialized pediatric needs.",
          icon: Stethoscope,
        },
        {
          id: "v4",
          title: "Diagnostics & Devices",
          description:
            "Trusted movement of healthcare technologies and diagnostics.",
          icon: Microscope,
        },
      ],
    },
    legacySuccess: {
      content: {
        eyebrow: "Legacy & Strength",
        title: "Operational Strength Backed by 50+ Years of Experience",
        body: [
          "Damira benefits from established healthcare relationships and a national network shaped through decades of operational execution.",
          "The organization combines mature governance with agile market operations to scale partners sustainably.",
        ],
        image: {
          src: "/uploads/public/about-legacy.jpg",
          alt: "Long-term healthcare partnership legacy",
        },
      },
      stats: {
        title: "Success Story Metrics",
        items: [
          {
            id: "m1",
            label: "Operational Legacy",
            value: "50+ Years",
            icon: Award,
          },
          {
            id: "m2",
            label: "Proven Growth",
            value: "+20%",
            description: "Market growth achieved for Rinolac",
            icon: LineChart,
          },
          {
            id: "m3",
            label: "National Network",
            value: "Nationwide",
            icon: Network,
          },
          {
            id: "m4",
            label: "Healthcare Relationships",
            value: "Long-term",
            icon: Handshake,
          },
        ],
      },
    },
  },
  services: {
    metadata: {
      title:
        "Comprehensive Healthcare Distribution & Commercialization Services",
      description:
        "Integrated infrastructure, regulatory, logistics, and medical support capabilities.",
    },
    hero: {
      eyebrow: "Services",
      title:
        "Comprehensive Healthcare Distribution & Commercialization Services",
      subtitle:
        "From validated infrastructure to scientific market execution, Damira delivers a full specialized healthcare operating stack.",
      actions: [
        { label: "Explore Products", href: "/products", variant: "primary" },
      ],
      backgroundImage: {
        src: "/uploads/public/services-hero.jpg",
        alt: "Healthcare logistics and service operations",
      },
    },
    infrastructure: {
      eyebrow: "Infrastructure",
      title: "Advanced Infrastructure & Storage",
      subtitle: "1,500 m2 facility with 9,000 m3 climate-controlled capacity.",
      bullets: [
        "Segregated zones for oncology, ambient, and sterile products",
        "HVAC and HEPA environmental controls",
        "24/7 monitored security and restricted access",
      ],
      image: {
        src: "/uploads/public/service-infrastructure.jpg",
        alt: "Storage infrastructure",
      },
    },
    coldChain: {
      eyebrow: "Cold Chain",
      title: "Validated Temperature-Controlled Operations",
      bullets: [
        "2-8C validated cold rooms",
        "-80C ultra-low storage capability",
        "Real-time monitoring with alarm escalation",
        "72-hour backup fuel contingency",
        "Shipment-level temperature validation",
      ],
      image: {
        src: "/uploads/public/service-cold-chain.jpg",
        alt: "Cold chain logistics",
      },
      imagePosition: "left",
    },
    regulatory: {
      eyebrow: "Regulatory Services",
      title: "Structured Regulatory Affairs Execution",
      bullets: [
        "Dossier preparation and submission planning",
        "Product registration and market authorization",
        "Continuous regulatory monitoring and updates",
      ],
      image: {
        src: "/uploads/public/service-regulatory.jpg",
        alt: "Regulatory documentation",
      },
    },
    safetyVigilance: {
      eyebrow: "Safety & Vigilance",
      title: "Pharmacovigilance and Materiovigilance Readiness",
      bullets: [
        "PV and MV frameworks with SOP-guided workflows",
        "24-hour serious event reporting model",
        "Dedicated safety officer oversight",
      ],
      image: {
        src: "/uploads/public/service-safety.jpg",
        alt: "Safety vigilance operations",
      },
      imagePosition: "left",
    },
    medicalSupport: {
      eyebrow: "Medical Support",
      title: "Clinical & Scientific Support Capabilities",
      bullets: [
        "Clinical education and evidence-based engagement",
        "KOL relationship development",
        "Scientific communication for healthcare professionals",
      ],
      image: {
        src: "/uploads/public/service-medical.jpg",
        alt: "Medical and scientific collaboration",
      },
    },
    logisticsDistribution: {
      eyebrow: "Logistics & Distribution",
      title: "Nationwide Delivery and Traceability",
      bullets: [
        "Nationwide delivery network across Syria",
        "Multi-zone temperature-controlled transport",
        "End-to-end shipment traceability",
        "Direct hospital and institutional delivery",
      ],
      image: {
        src: "/uploads/public/service-logistics.jpg",
        alt: "Distribution fleet",
      },
      imagePosition: "left",
    },
    marketAccess: {
      eyebrow: "Market Access",
      title: "Hospital Access and Commercial Acceleration",
      bullets: [
        "Hospital relationship management",
        "Decision-maker engagement",
        "Tender and bid management support",
        "Scientific events and symposia execution",
      ],
      image: {
        src: "/uploads/public/service-market-access.jpg",
        alt: "Market access strategy",
      },
    },
  },
  products: {
    metadata: {
      title: "Strategic Portfolio of Specialized Healthcare Products",
      description:
        "Focused portfolio and growth pipeline across critical therapeutic verticals.",
    },
    hero: {
      eyebrow: "Products",
      title: "Strategic Portfolio of Specialized Healthcare Products",
      subtitle:
        "Damira aligns specialized brands with market need, quality infrastructure, and scientific execution.",
      actions: [
        {
          label: "Contact Product Team",
          href: "/contact",
          variant: "secondary",
        },
      ],
      backgroundImage: {
        src: "/uploads/public/products-hero.jpg",
        alt: "Pharmaceutical product portfolio",
      },
    },
    categories: {
      title: "Product Categories",
      columns: 4,
      items: [
        {
          id: "c1",
          title: "Oncology & Hematology",
          description: "Therapies aligned with specialized hospital pathways.",
          icon: Activity,
        },
        {
          id: "c2",
          title: "Critical Care & ICU",
          description: "Acute and intensive care support products.",
          icon: HeartPulse,
        },
        {
          id: "c3",
          title: "Nutrition & Pediatrics",
          description: "Clinical nutrition lines for pediatric care.",
          icon: Stethoscope,
        },
        {
          id: "c4",
          title: "Diagnostics & Devices",
          description: "Advanced diagnostics and medical technologies.",
          icon: Microscope,
        },
      ],
    },
    currentPortfolio: {
      title: "Current Portfolio",
      description:
        "Core strategic brands currently distributed and supported by Damira Pharma.",
      items: PRODUCT_CARDS_EN,
    },
    pipelineSegments: {
      title: "Pipeline Segments",
      description:
        "Future-focused therapeutic areas under evaluation and commercialization planning.",
      items: [
        {
          id: "p1",
          title: "Oncology Therapies",
          description:
            "Targeted additions in oncology and hematology segments.",
          icon: Activity,
        },
        {
          id: "p2",
          title: "ICU Life-Saving Drugs",
          description:
            "Critical life-support treatments for intensive care settings.",
          icon: HeartPulse,
        },
        {
          id: "p3",
          title: "Clinical Nutrition",
          description:
            "Advanced nutrition products for specialized care pathways.",
          icon: FlaskConical,
        },
        {
          id: "p4",
          title: "Pediatric Products",
          description: "Therapeutic and nutritional pediatric expansions.",
          icon: Users,
        },
        {
          id: "p5",
          title: "Diagnostic Solutions",
          description: "Precision diagnostic and monitoring technologies.",
          icon: Microscope,
        },
      ],
    },
    catalog: {
      title: "Product Catalog",
      description:
        "Each product profile includes category, indication, storage requirements, and supporting documents.",
      items: PRODUCT_CARDS_EN,
      columns: 3,
    },
  },
  quality: {
    metadata: {
      title: "Commitment to Quality, Safety, and Regulatory Excellence",
      description:
        "System-driven quality management and ethical healthcare operations.",
    },
    hero: {
      eyebrow: "Quality & Compliance",
      title: "Commitment to Quality, Safety, and Regulatory Excellence",
      subtitle:
        "Damira's quality architecture supports resilient healthcare delivery through compliance-by-design.",
      backgroundImage: {
        src: "/uploads/public/quality-hero.jpg",
        alt: "Quality and compliance systems",
      },
      actions: [
        { label: "Read About Services", href: "/services", variant: "ghost" },
      ],
    },
    certifications: {
      title: "Certifications",
      columns: 4,
      items: [
        {
          id: "q1",
          title: "GDP Compliant",
          description: "Aligned with good distribution practice standards.",
          icon: ShieldCheck,
        },
        {
          id: "q2",
          title: "GSP Compliant",
          description: "Storage systems validated for healthcare integrity.",
          icon: Warehouse,
        },
        {
          id: "q3",
          title: "ISO Certified Group",
          description:
            "Process-driven quality and operational standardization.",
          icon: Award,
        },
        {
          id: "q4",
          title: "FDA Certified Group",
          description: "Global-quality governance across group operations.",
          icon: FileCheck2,
        },
      ],
    },
    complianceDetails: {
      eyebrow: "Quality Management System",
      title: "Structured Governance Across Every Stage",
      body: [
        "Damira operates a full SOP and CAPA framework with documented internal audits and traceable quality records.",
        "Cold chain integrity and risk-prevention systems are monitored continuously to protect product safety and efficacy.",
      ],
      bullets: [
        "GDP and GSP compliance protocols",
        "SOP framework and CAPA workflows",
        "Internal audits and full documentation",
        "Code of conduct and fair-market-value policies",
        "Continuous compliance training",
      ],
      image: {
        src: "/uploads/public/quality-system.jpg",
        alt: "Compliance and SOP documentation",
      },
      imagePosition: "left",
    },
    cta: {
      eyebrow: "Trust Through Compliance",
      title: "Need a Quality-First Market Entry Partner?",
      description:
        "Damira provides inspection-ready operations for global healthcare brands entering Syria.",
      primaryAction: {
        label: "Start a Partnership Discussion",
        href: "/partnerships",
      },
      secondaryAction: { label: "Contact Compliance Team", href: "/contact" },
    },
  },
  partnerships: {
    metadata: {
      title: "Partner with Damira Pharma",
      description:
        "Strategic commercialization and distribution partnerships for healthcare innovators.",
    },
    hero: {
      eyebrow: "Partnerships",
      title: "Partner with Damira Pharma",
      subtitle:
        "Accelerate market entry in Syria through a specialized, compliant, and financially stable healthcare platform.",
      actions: [
        {
          label: "Explore Opportunities",
          href: "/contact",
          variant: "primary",
        },
        { label: "View Services", href: "/services", variant: "ghost" },
      ],
      backgroundImage: {
        src: "/uploads/public/partnerships-hero.jpg",
        alt: "Strategic business partnership",
      },
    },
    whyPartner: {
      title: "Why Partner with Us",
      items: [
        {
          id: "w1",
          title: "Strategic Specialization",
          description:
            "Focused therapeutic verticals with deep operational know-how.",
          icon: Activity,
        },
        {
          id: "w2",
          title: "Audit-Ready Infrastructure",
          description:
            "Validated systems designed for international quality expectations.",
          icon: ShieldCheck,
        },
        {
          id: "w3",
          title: "Regulatory Strength",
          description:
            "Disciplined registration and compliance execution across lifecycle stages.",
          icon: FileCheck2,
        },
        {
          id: "w4",
          title: "Market Access Capabilities",
          description:
            "Hospital and specialist engagement with structured access programs.",
          icon: Globe2,
        },
        {
          id: "w5",
          title: "Data-Driven Commercialization",
          description:
            "Performance-led planning backed by field and market intelligence.",
          icon: LineChart,
        },
        {
          id: "w6",
          title: "Financial Backing",
          description:
            "Backed by Al Ahlam Group's long-standing financial stability.",
          icon: Award,
        },
      ],
    },
    partnershipForm: {
      title: "Request a Partnership",
      description:
        "Share your business model, portfolio focus, and market objectives. Our partnership team will route your request to the right commercial and regulatory stakeholders.",
      fields: {
        fullName: "Full Name",
        email: "Business Email",
        phone: "Phone Number",
        company: "Organization",
        inquiryType: "Partnership Type",
        inquiryTypePlaceholder: "Select partnership type",
        inquiryTypeOptions: [
          { value: "distribution", label: "Distribution Partnership" },
          { value: "licensing", label: "Licensing Opportunity" },
          { value: "strategic", label: "Strategic Alliance" },
          { value: "investment", label: "Investment / Joint Venture" },
          { value: "other", label: "Other" },
        ],
        message: "Partnership Details",
        submit: "Send Partnership Request",
      },
    },
    marketAccess: {
      eyebrow: "Market Access & KOL Network",
      title: "Scientific Engagement with Decision-Making Stakeholders",
      bullets: [
        "Hospital relationships and specialist network activation",
        "Scientific engagement and congress participation",
        "Tender and procurement management support",
      ],
      image: {
        src: "/uploads/public/partnership-market-access.jpg",
        alt: "Healthcare stakeholder meetings",
      },
    },
    infrastructureStrength: {
      eyebrow: "Infrastructure Strength",
      title: "Operational Readiness from Storage to Last Mile",
      bullets: [
        "Advanced storage and validated cold chain",
        "Nationwide logistics with full traceability",
        "Reliable handling for specialized healthcare products",
      ],
      image: {
        src: "/uploads/public/partnership-infrastructure.jpg",
        alt: "Infrastructure and logistics capacity",
      },
      imagePosition: "left",
    },
    commercialReach: {
      title: "Commercial Reach",
      items: [
        { id: "cr1", label: "Hospitals", value: "100+", icon: Building2 },
        { id: "cr2", label: "Points of Sale", value: "35,000+", icon: Network },
        { id: "cr3", label: "Pharmacies", value: "15,000+", icon: Users },
        { id: "cr4", label: "Coverage", value: "Nationwide", icon: Globe2 },
      ],
    },
    provenSuccess: {
      eyebrow: "Proven Success",
      title: "Commercial Results You Can Scale On",
      body: [
        "Damira achieved 20% market growth for Rinolac through integrated supply, promotion, and targeting execution.",
        "Our launch model aligns medical, commercial, and operational teams around measurable partner objectives.",
      ],
      bullets: [
        "20% market growth for Rinolac",
        "Strong launch and adoption strategy",
        "Data-backed commercial model",
      ],
      image: {
        src: "/uploads/public/partnership-success.jpg",
        alt: "Commercial success metrics",
      },
    },
    cta: {
      eyebrow: "Partner with Confidence",
      title: "Explore Partnership Opportunities with Damira Pharma",
      description:
        "Let's define a market-entry and growth model tailored to your healthcare portfolio.",
      primaryAction: { label: "Contact Damira Pharma", href: "/contact" },
      secondaryAction: {
        label: "Explore Product Portfolio",
        href: "/products",
      },
    },
  },
  contact: {
    metadata: {
      title: "Get in Touch with Damira Pharma",
      description:
        "Contact our team for partnerships, product inquiries, and strategic collaboration.",
    },
    hero: {
      eyebrow: "Contact",
      title: "Get in Touch with Damira Pharma",
      subtitle:
        "Our team is ready to support your partnership, product, and market access needs.",
      actions: [
        {
          label: "Explore Partnerships",
          href: "/partnerships",
          variant: "secondary",
        },
      ],
      backgroundImage: {
        src: "/uploads/public/contact-hero.jpg",
        alt: "Corporate contact and support",
      },
    },
    contactInfo: {
      title: "Contact Information",
      description: "Reach our corporate office through the channels below.",
      items: [
        { label: "Address", value: "Erbin, Damascus Countryside, Syria" },
        {
          label: "Phone",
          value: "+963 935 222 202",
          href: "tel:+963935222202",
        },
        {
          label: "Email",
          value: "info@damirapharma.sy",
          href: "mailto:info@damirapharma.sy",
        },
      ],
    },
    companyIdentity: {
      eyebrow: "Company Identity",
      title: "Damira Pharma",
      subtitle: "Specialized Healthcare Division - Al Ahlam Group (Est. 1974)",
      body: [
        "Damira Pharma operates nationwide healthcare distribution across Syria, serving hospitals, clinics, and healthcare institutions.",
      ],
      image: {
        src: "/uploads/public/contact-identity.jpg",
        alt: "Damira corporate identity",
      },
    },
    contactForm: {
      title: "Send an Inquiry",
      description: "Submit your request and our team will follow up promptly.",
      fields: {
        fullName: "Full Name",
        email: "Business Email",
        phone: "Phone Number",
        company: "Company",
        inquiryType: "Inquiry Type",
        inquiryTypePlaceholder: "Select inquiry type",
        inquiryTypeOptions: [
          { value: "general", label: "General Inquiry" },
          { value: "partnership", label: "Partnership Follow-up" },
          { value: "products", label: "Product & Availability" },
          { value: "regulatory", label: "Regulatory & Compliance" },
          { value: "media", label: "Media & Communications" },
          { value: "other", label: "Other" },
        ],
        message: "Message",
        submit: "Submit Inquiry",
      },
    },
  },
};

const PUBLIC_UI_AR: PublicUiData = {
  ...PUBLIC_UI_EN,
  home: {
    ...PUBLIC_UI_EN.home,
    metadata: {
      title: "بناء منظومة توزيع الرعاية الصحية المتخصصة في سوريا",
      description:
        "شريك موثوق للابتكارات العالمية في علوم الحياة والتغذية والتقنيات الطبية.",
    },
    hero: {
      ...PUBLIC_UI_EN.home.hero,
      eyebrow: "داميرا فارما",
      title: "بناء منظومة توزيع الرعاية الصحية المتخصصة في سوريا",
      subtitle:
        "شريك موثوق للابتكارات العالمية في علوم الحياة والتغذية والتقنيات الطبية.",
      tagline: "موثوق. صحي.",
      actions: [
        { label: "استكشف المنتجات", href: "/products", variant: "primary" },
        { label: "كن شريكًا", href: "/partnerships", variant: "secondary" },
      ],
    },
    atAGlance: {
      title: "داميرا فارما بالأرقام",
      items: [
        { id: "founded", label: "سنة التأسيس", value: "2025", icon: Building2 },
        {
          id: "legacy",
          label: "تأسيس مجموعة الأحلام",
          value: "1974",
          icon: Award,
        },
        { id: "facility", label: "المرفق", value: "1,500 م2", icon: Warehouse },
        { id: "storage", label: "التخزين", value: "9,000 م3", icon: Snowflake },
      ],
    },
    strategicFocus: {
      ...PUBLIC_UI_EN.home.strategicFocus,
      title: "مجالات التركيز الاستراتيجي",
      description:
        "أربعة قطاعات سريرية تقدم فيها داميرا عمقًا تشغيليًا وقيمة مستدامة.",
    },
    keyStrengths: {
      ...PUBLIC_UI_EN.home.keyStrengths,
      title: "نقاط القوة الرئيسية",
      description: "نموذج تنفيذ مؤسسي قائم على الامتثال والنتائج.",
    },
    coverageReach: {
      title: "التغطية والانتشار",
      items: [
        {
          id: "hospitals",
          label: "المشافي والمراكز",
          value: "+100",
          icon: Building2,
        },
        { id: "pos", label: "نقاط البيع", value: "+35,000", icon: Network },
        { id: "pharmacies", label: "الصيدليات", value: "+15,000", icon: Users },
        {
          id: "coverage",
          label: "التغطية",
          value: "على مستوى سوريا",
          icon: Globe2,
        },
      ],
    },
    portfolioPreview: {
      ...PUBLIC_UI_EN.home.portfolioPreview,
      title: "لمحة عن المحفظة",
      description: "محفظة متوازنة بين العلامات الحالية وفرص التوسع القادمة.",
      items: PRODUCT_CARDS_AR,
    },
    successHighlight: {
      ...PUBLIC_UI_EN.home.successHighlight,
      eyebrow: "قصة نجاح",
      title: "نمو مثبت في الحصة السوقية بنسبة +20%",
      subtitle:
        "تم تحقيق نمو Rinolac عبر استهداف قائم على البيانات وتنفيذ ميداني منسق.",
      body: [
        "تُوائم داميرا بين استمرارية التوريد والتواصل العلمي والظهور في نقاط الرعاية لتسريع التبني.",
        "كل إطلاق يتم بناؤه وفق أداء قابل للقياس وخطة تفاعل واضحة مع أصحاب المصلحة.",
      ],
      bullets: [
        "استراتيجية استهداف قائمة على البيانات",
        "حضور قوي في نقاط الرعاية",
        "مواءمة بين التوريد والترويج",
      ],
    },
    cta: {
      ...PUBLIC_UI_EN.home.cta,
      eyebrow: "شراكة",
      title: "لنصنع مستقبل الرعاية الصحية في سوريا",
      description:
        "ادخل السوق السورية عبر منصة موثوقة ومتوافقة وقابلة للتوسع مع داميرا فارما.",
      primaryAction: { label: "كن شريكًا", href: "/partnerships" },
      secondaryAction: { label: "تواصل معنا", href: "/contact" },
    },
  },
  about: {
    ...PUBLIC_UI_EN.about,
    metadata: {
      title: "من نحن - داميرا فارما",
      description:
        "قسم رعاية صحية متخصص تابع لمجموعة الأحلام بخبرة تشغيلية راسخة.",
    },
    hero: {
      ...PUBLIC_UI_EN.about.hero,
      eyebrow: "من نحن",
      title: "عن داميرا فارما",
      subtitle: "قسم الرعاية الصحية المتخصصة في مجموعة الأحلام",
      tagline: "إرث قوي. تنفيذ علمي.",
      actions: [
        { label: "استكشف الخدمات", href: "/services", variant: "primary" },
      ],
    },
  },
  services: {
    ...PUBLIC_UI_EN.services,
    metadata: {
      title: "خدمات متكاملة للتوزيع والتسويق الدوائي",
      description:
        "بنية تحتية وتنظيم ولوجستيات ودعم علمي في منظومة تشغيل واحدة.",
    },
    hero: {
      ...PUBLIC_UI_EN.services.hero,
      eyebrow: "الخدمات",
      title: "خدمات متكاملة للتوزيع والتسويق الدوائي",
      subtitle:
        "من البنية التحتية المعتمدة إلى التنفيذ العلمي في السوق، توفر داميرا منظومة تشغيل متخصصة.",
      actions: [
        { label: "استكشف المنتجات", href: "/products", variant: "primary" },
      ],
    },
  },
  products: {
    ...PUBLIC_UI_EN.products,
    metadata: {
      title: "محفظة استراتيجية من منتجات الرعاية الصحية المتخصصة",
      description: "محفظة مركزة مع خطط نمو مستقبلية عبر مجالات علاجية حيوية.",
    },
    hero: {
      ...PUBLIC_UI_EN.products.hero,
      eyebrow: "المنتجات",
      title: "محفظة استراتيجية من منتجات الرعاية الصحية المتخصصة",
      subtitle:
        "توازن داميرا بين احتياج السوق والبنية المتوافقة والتنفيذ العلمي.",
      actions: [
        {
          label: "تواصل مع فريق المنتجات",
          href: "/contact",
          variant: "secondary",
        },
      ],
    },
    currentPortfolio: {
      ...PUBLIC_UI_EN.products.currentPortfolio,
      title: "المحفظة الحالية",
      description:
        "العلامات الأساسية التي تديرها داميرا فارما في السوق السورية.",
      items: PRODUCT_CARDS_AR,
    },
    catalog: {
      ...PUBLIC_UI_EN.products.catalog,
      title: "كتالوج المنتجات",
      description:
        "يشمل كل ملف منتج الفئة العلاجية والاستطباب والتخزين والوثائق المتاحة.",
      items: PRODUCT_CARDS_AR,
    },
  },
  quality: {
    ...PUBLIC_UI_EN.quality,
    metadata: {
      title: "التزام بالجودة والسلامة والامتثال التنظيمي",
      description: "نظام جودة تشغيلي يدعم موثوقية الخدمات الصحية.",
    },
    hero: {
      ...PUBLIC_UI_EN.quality.hero,
      eyebrow: "الجودة والامتثال",
      title: "التزام بالجودة والسلامة والامتثال التنظيمي",
      subtitle:
        "تعتمد منظومة الجودة في داميرا على امتثال مصمم ضمن كل مرحلة تشغيلية.",
      actions: [
        { label: "تعرف على الخدمات", href: "/services", variant: "ghost" },
      ],
    },
  },
  partnerships: {
    ...PUBLIC_UI_EN.partnerships,
    metadata: {
      title: "الشراكة مع داميرا فارما",
      description: "شراكات استراتيجية للتسويق والتوزيع في قطاع الرعاية الصحية.",
    },
    hero: {
      ...PUBLIC_UI_EN.partnerships.hero,
      eyebrow: "الشراكات",
      title: "الشراكة مع داميرا فارما",
      subtitle:
        "سرّع دخولك للسوق السورية عبر منصة صحية متخصصة ومتوافقة وموثوقة.",
      actions: [
        { label: "استكشف الفرص", href: "/contact", variant: "primary" },
        { label: "عرض الخدمات", href: "/services", variant: "ghost" },
      ],
    },
    partnershipForm: {
      title: "طلب شراكة",
      description:
        "شاركنا نموذج التعاون، ومحفظة المنتجات، وأهدافك السوقية ليتم توجيه طلبك إلى فريق الشراكات المناسب.",
      fields: {
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني للعمل",
        phone: "رقم الهاتف",
        company: "الجهة",
        inquiryType: "نوع الشراكة",
        inquiryTypePlaceholder: "اختر نوع الشراكة",
        inquiryTypeOptions: [
          { value: "distribution", label: "شراكة توزيع" },
          { value: "licensing", label: "فرصة ترخيص" },
          { value: "strategic", label: "تحالف استراتيجي" },
          { value: "investment", label: "استثمار / مشروع مشترك" },
          { value: "other", label: "أخرى" },
        ],
        message: "تفاصيل الشراكة",
        submit: "إرسال طلب الشراكة",
      },
    },
  },
  contact: {
    ...PUBLIC_UI_EN.contact,
    metadata: {
      title: "تواصل مع داميرا فارما",
      description: "تواصل مع فريقنا للشراكات والاستفسارات والفرص التجارية.",
    },
    hero: {
      ...PUBLIC_UI_EN.contact.hero,
      eyebrow: "اتصل بنا",
      title: "تواصل مع داميرا فارما",
      subtitle: "فريقنا جاهز لدعم الشراكات والاستفسارات والفرص السوقية.",
      actions: [
        {
          label: "استكشف الشراكات",
          href: "/partnerships",
          variant: "secondary",
        },
      ],
    },
    contactInfo: {
      ...PUBLIC_UI_EN.contact.contactInfo,
      title: "معلومات التواصل",
      description: "يمكنكم الوصول إلى المكتب الرئيسي عبر القنوات التالية.",
      items: [
        { label: "العنوان", value: "إربين، ريف دمشق، سوريا" },
        {
          label: "الهاتف",
          value: "+963 935 222 202",
          href: "tel:+963935222202",
        },
        {
          label: "البريد الإلكتروني",
          value: "info@damirapharma.sy",
          href: "mailto:info@damirapharma.sy",
        },
      ],
    },
    companyIdentity: {
      ...PUBLIC_UI_EN.contact.companyIdentity,
      eyebrow: "هوية الشركة",
      title: "داميرا فارما",
      subtitle: "قسم الرعاية الصحية المتخصصة - مجموعة الأحلام (تأسست 1974)",
      body: [
        "تعمل داميرا على التوزيع الصحي على مستوى سوريا لخدمة المشافي والعيادات والمؤسسات الصحية.",
      ],
    },
    contactForm: {
      title: "إرسال استفسار",
      description: "أرسل طلبك وسيتواصل معك فريقنا في أقرب وقت.",
      fields: {
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        company: "الشركة",
        inquiryType: "نوع الاستفسار",
        inquiryTypePlaceholder: "اختر نوع الاستفسار",
        inquiryTypeOptions: [
          { value: "general", label: "استفسار عام" },
          { value: "partnership", label: "متابعة شراكة" },
          { value: "products", label: "المنتجات والتوفر" },
          { value: "regulatory", label: "تنظيمي وامتثال" },
          { value: "media", label: "إعلام واتصال" },
          { value: "other", label: "أخرى" },
        ],
        message: "الرسالة",
        submit: "إرسال الطلب",
      },
    },
  },
};

interface ProductDetailTemplate {
  title: string;
  subtitle: string;
  description: string[];
  specifications: Array<{ label: string; value: string }>;
}

const PRODUCT_DETAILS_EN: Record<string, ProductDetailTemplate> = {
  rinolac: {
    title: "Rinolac",
    subtitle: "New Zealand Origin - Specialized Nutrition",
    description: [
      "Rinolac is positioned as a clinically guided nutritional product line supporting infant and pediatric growth pathways.",
      "The product is distributed through controlled quality systems and field-level scientific engagement programs.",
    ],
    specifications: [
      { label: "Category", value: "Specialized Nutrition" },
      {
        label: "Usage / Indication",
        value: "Infant and pediatric nutritional support",
      },
      {
        label: "Storage Conditions",
        value: "Store below 25C in dry conditions",
      },
      {
        label: "Regulatory Status",
        value: "Registered and actively monitored",
      },
      { label: "Commercial Status", value: "Current Portfolio" },
    ],
  },
  "rino-plus": {
    title: "Rino Plus",
    subtitle: "Regional Partnership - Critical Care Support",
    description: [
      "Rino Plus is designed for hospital and critical care utilization with robust distribution planning.",
      "Damira supports clinical communication, account planning, and controlled product handling for continuity.",
    ],
    specifications: [
      { label: "Category", value: "Critical Care" },
      {
        label: "Usage / Indication",
        value: "ICU and high-dependency care support",
      },
      { label: "Storage Conditions", value: "Controlled room temperature" },
      { label: "Regulatory Status", value: "Authorized and monitored" },
      { label: "Commercial Status", value: "Current Portfolio" },
    ],
  },
  ausnutria: {
    title: "Ausnutria",
    subtitle: "Netherlands Origin - Pediatric Nutrition",
    description: [
      "Ausnutria supports pediatric nutritional care with evidence-based positioning and healthcare education.",
      "Damira activates channel distribution with quality-compliant handling and scientific field support.",
    ],
    specifications: [
      { label: "Category", value: "Pediatrics" },
      {
        label: "Usage / Indication",
        value: "Specialized pediatric nutritional management",
      },
      {
        label: "Storage Conditions",
        value: "Keep away from heat and humidity",
      },
      { label: "Regulatory Status", value: "Registered and compliant" },
      { label: "Commercial Status", value: "Current Portfolio" },
    ],
  },
};

const PRODUCT_DETAILS_AR: Record<string, ProductDetailTemplate> = {
  rinolac: {
    title: "رينولاك",
    subtitle: "منشأ نيوزيلندي - تغذية متخصصة",
    description: [
      "يتموضع رينولاك كخط تغذية سريري يدعم مسارات نمو الرضع والأطفال.",
      "يتم توزيعه عبر منظومة جودة منضبطة وبرامج تواصل علمي ميدانية.",
    ],
    specifications: [
      { label: "الفئة", value: "التغذية المتخصصة" },
      { label: "الاستطباب", value: "دعم تغذوي للرضع والأطفال" },
      { label: "شروط التخزين", value: "يحفظ تحت 25 درجة وفي مكان جاف" },
      { label: "الحالة التنظيمية", value: "مسجل وتحت متابعة مستمرة" },
      { label: "الحالة التجارية", value: "ضمن المحفظة الحالية" },
    ],
  },
  "rino-plus": {
    title: "رينو بلس",
    subtitle: "شراكة إقليمية - دعم العناية الحرجة",
    description: [
      "تم تطوير رينو بلس للاستخدام في المستشفيات ووحدات العناية الحرجة مع تخطيط توريد قوي.",
      "تدعم داميرا التواصل السريري والتخطيط التجاري والتداول المنضبط للمنتج.",
    ],
    specifications: [
      { label: "الفئة", value: "العناية الحرجة" },
      { label: "الاستطباب", value: "دعم حالات العناية المركزة" },
      { label: "شروط التخزين", value: "درجة حرارة الغرفة المضبوطة" },
      { label: "الحالة التنظيمية", value: "معتمد وتحت المتابعة" },
      { label: "الحالة التجارية", value: "ضمن المحفظة الحالية" },
    ],
  },
  ausnutria: {
    title: "أوسنوتريا",
    subtitle: "منشأ هولندي - تغذية الأطفال",
    description: [
      "يدعم أوسنوتريا رعاية تغذية الأطفال عبر تموضع قائم على الأدلة وبرامج تعليمية للكوادر الصحية.",
      "تُفعّل داميرا التوزيع في القنوات المختلفة ضمن معايير جودة وامتثال واضحة.",
    ],
    specifications: [
      { label: "الفئة", value: "طب الأطفال" },
      { label: "الاستطباب", value: "إدارة تغذوية متخصصة للأطفال" },
      { label: "شروط التخزين", value: "يحفظ بعيدًا عن الحرارة والرطوبة" },
      { label: "الحالة التنظيمية", value: "مسجل ومتوافق" },
      { label: "الحالة التجارية", value: "ضمن المحفظة الحالية" },
    ],
  },
};

export function getPublicUiData(locale: Locale): PublicUiData {
  return locale === "ar" ? PUBLIC_UI_AR : PUBLIC_UI_EN;
}

export function getMockProductSlugs(): string[] {
  return Object.keys(PRODUCT_DETAILS_EN);
}

export function getProductDetailPageData(
  locale: Locale,
  slug: string,
): ProductDetailPageData | null {
  const ui = getPublicUiData(locale);
  const detail = (locale === "ar" ? PRODUCT_DETAILS_AR : PRODUCT_DETAILS_EN)[
    slug
  ];

  if (!detail) {
    return null;
  }

  const allProducts = ui.products.currentPortfolio.items;
  const current = allProducts.find(
    (product) => product.href === `/products/${slug}`,
  );

  if (!current) {
    return null;
  }

  const related = allProducts.filter((product) => product.id !== current.id);

  return {
    metadata: {
      title: detail.title,
      description: detail.description[0],
    },
    hero: {
      eyebrow: locale === "ar" ? "تفاصيل المنتج" : "Product Detail",
      title: detail.title,
      subtitle: detail.subtitle,
      actions: [
        {
          label: locale === "ar" ? "العودة إلى المنتجات" : "Back to Products",
          href: "/products",
          variant: "ghost",
        },
      ],
      backgroundImage: {
        src: current.image?.src || "/uploads/public/product-detail.jpg",
        alt: current.image?.alt || current.name,
      },
    },
    productInfo: {
      eyebrow: locale === "ar" ? "معلومات المنتج" : "Product Information",
      title: detail.title,
      subtitle: detail.subtitle,
      body: detail.description,
      bullets: [
        `${locale === "ar" ? "الفئة" : "Category"}: ${current.category}`,
        `${locale === "ar" ? "الاستطباب" : "Indication"}: ${current.indication || "-"}`,
        `${locale === "ar" ? "التخزين" : "Storage"}: ${current.storage || "-"}`,
      ],
      image: {
        src: current.image?.src || "/uploads/public/product-detail.jpg",
        alt: current.image?.alt || current.name,
      },
    },
    specifications: {
      title: locale === "ar" ? "المواصفات" : "Specifications",
      description:
        locale === "ar"
          ? "نقاط تقنية أساسية تدعم الاستخدام والتخزين والامتثال."
          : "Key technical details supporting use, storage, and compliance.",
      items: detail.specifications,
    },
    relatedProducts: {
      title: locale === "ar" ? "منتجات ذات صلة" : "Related Products",
      items: related,
      columns: 3,
    },
    cta: {
      eyebrow:
        locale === "ar"
          ? "هل تحتاج مزيدًا من التفاصيل؟"
          : "Need More Information?",
      title:
        locale === "ar"
          ? "تواصل مع فريق المنتجات لدى داميرا"
          : "Connect with Damira's Product Team",
      description:
        locale === "ar"
          ? "يساعدك فريقنا في المعلومات الفنية والتوفر وخطط الإطلاق."
          : "Our team can support technical questions, availability, and launch planning.",
      primaryAction: {
        label: locale === "ar" ? "تواصل معنا" : "Contact Us",
        href: "/contact",
      },
      secondaryAction: {
        label: locale === "ar" ? "استكشف الشراكات" : "Explore Partnerships",
        href: "/partnerships",
      },
    },
  };
}
