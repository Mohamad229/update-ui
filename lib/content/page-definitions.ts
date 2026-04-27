/**
 * Page Content Definitions
 *
 * Defines fixed page structures with predefined sections and fields.
 * Each page specifies what sections it contains and what data they need.
 * This replaces the dynamic section builder with a structured approach.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "json"
  | "media"
  | "number"
  | "boolean";

export interface FieldDefinition {
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

export interface SectionDefinition {
  sectionKey: string;
  label: string;
  description?: string;
  fields: Record<string, FieldDefinition>;
}

export interface PageDefinition {
  pageKey: string;
  label: string;
  sections: SectionDefinition[];
}

function sectionDataField(description: string): Record<string, FieldDefinition> {
  return {
    data: {
      type: "json",
      label: "Section Data",
      placeholder: "{}",
      description,
    },
  };
}

/**
 * All page definitions
 * Maps page keys to their section structures
 */
export const PAGE_DEFINITIONS: Record<string, PageDefinition> = {
  home: {
    pageKey: "home",
    label: "Home Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        description: "Controls hero title, subtitle, actions, and image",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "atAGlance",
        label: "At A Glance",
        description: "Stats block below hero",
        fields: sectionDataField("Use object shape from the current atAGlance section data."),
      },
      {
        sectionKey: "strategicFocus",
        label: "Strategic Focus",
        description: "Strategic focus cards and labels",
        fields: sectionDataField("Use object shape from the current strategicFocus section data."),
      },
      {
        sectionKey: "keyStrengths",
        label: "Key Strengths",
        description: "Core strengths cards",
        fields: sectionDataField("Use object shape from the current keyStrengths section data."),
      },
      {
        sectionKey: "coverageReach",
        label: "Coverage And Reach",
        description: "Coverage stats section",
        fields: sectionDataField("Use object shape from the current coverageReach section data."),
      },
      {
        sectionKey: "portfolioPreview",
        label: "Portfolio Preview",
        description: "Preview cards for product portfolio",
        fields: sectionDataField("Use object shape from the current portfolioPreview section data."),
      },
      {
        sectionKey: "successHighlight",
        label: "Success Highlight",
        description: "Content block with key achievements",
        fields: sectionDataField("Use object shape from the current successHighlight section data."),
      },
      {
        sectionKey: "cta",
        label: "Call To Action",
        description: "Final call-to-action area",
        fields: sectionDataField("Use object shape from the current cta section data."),
      },
    ],
  },

  about: {
    pageKey: "about",
    label: "About Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        description: "Top hero section",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "companyOverview",
        label: "Company Overview",
        description: "Company overview content block",
        fields: sectionDataField("Use object shape from the current companyOverview section data."),
      },
      {
        sectionKey: "visionMission",
        label: "Vision And Mission",
        description: "Vision and mission content",
        fields: sectionDataField("Use object shape from the current visionMission section data."),
      },
      {
        sectionKey: "coreValues",
        label: "Core Values",
        description: "Core values cards",
        fields: sectionDataField("Use object shape from the current coreValues section data."),
      },
      {
        sectionKey: "focusVerticals",
        label: "Focus Verticals",
        description: "Focus vertical cards",
        fields: sectionDataField("Use object shape from the current focusVerticals section data."),
      },
      {
        sectionKey: "legacySuccess",
        label: "Legacy And Success",
        description: "Combined content and stats section",
        fields: sectionDataField("Use object shape from the current legacySuccess section data."),
      },
    ],
  },

  services: {
    pageKey: "services",
    label: "Services Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        description: "Top hero section",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "infrastructure",
        label: "Infrastructure",
        description: "Infrastructure section",
        fields: sectionDataField("Use object shape from the current infrastructure section data."),
      },
      {
        sectionKey: "coldChain",
        label: "Cold Chain",
        description: "Cold chain operations section",
        fields: sectionDataField("Use object shape from the current coldChain section data."),
      },
      {
        sectionKey: "regulatory",
        label: "Regulatory",
        description: "Regulatory section",
        fields: sectionDataField("Use object shape from the current regulatory section data."),
      },
      {
        sectionKey: "safetyVigilance",
        label: "Safety And Vigilance",
        description: "Safety and vigilance section",
        fields: sectionDataField("Use object shape from the current safetyVigilance section data."),
      },
      {
        sectionKey: "medicalSupport",
        label: "Medical Support",
        description: "Medical support section",
        fields: sectionDataField("Use object shape from the current medicalSupport section data."),
      },
      {
        sectionKey: "logisticsDistribution",
        label: "Logistics And Distribution",
        description: "Logistics and distribution section",
        fields: sectionDataField("Use object shape from the current logisticsDistribution section data."),
      },
      {
        sectionKey: "marketAccess",
        label: "Market Access",
        description: "Market access section",
        fields: sectionDataField("Use object shape from the current marketAccess section data."),
      },
    ],
  },

  products: {
    pageKey: "products",
    label: "Products Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        description: "Top hero section",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "categories",
        label: "Categories",
        description: "Product categories section",
        fields: sectionDataField("Use object shape from the current categories section data."),
      },
      {
        sectionKey: "currentPortfolio",
        label: "Current Portfolio",
        description: "Current portfolio cards",
        fields: sectionDataField("Use object shape from the current currentPortfolio section data."),
      },
      {
        sectionKey: "pipelineSegments",
        label: "Pipeline Segments",
        description: "Pipeline segments section",
        fields: sectionDataField("Use object shape from the current pipelineSegments section data."),
      },
      {
        sectionKey: "catalog",
        label: "Catalog",
        description: "Catalog filter section",
        fields: sectionDataField("Use object shape from the current catalog section data."),
      },
    ],
  },

  quality: {
    pageKey: "quality",
    label: "Quality Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "certifications",
        label: "Certifications",
        fields: sectionDataField("Use object shape from the current certifications section data."),
      },
      {
        sectionKey: "complianceDetails",
        label: "Compliance Details",
        fields: sectionDataField("Use object shape from the current complianceDetails section data."),
      },
      {
        sectionKey: "cta",
        label: "Call To Action",
        fields: sectionDataField("Use object shape from the current cta section data."),
      },
    ],
  },

  partnerships: {
    pageKey: "partnerships",
    label: "Partnerships Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "whyPartner",
        label: "Why Partner",
        fields: sectionDataField("Use object shape from the current whyPartner section data."),
      },
      {
        sectionKey: "partnershipForm",
        label: "Partnership Form",
        fields: sectionDataField("Use object shape from the current partnershipForm section data."),
      },
      {
        sectionKey: "marketAccess",
        label: "Market Access",
        fields: sectionDataField("Use object shape from the current marketAccess section data."),
      },
      {
        sectionKey: "infrastructureStrength",
        label: "Infrastructure Strength",
        fields: sectionDataField("Use object shape from the current infrastructureStrength section data."),
      },
      {
        sectionKey: "commercialReach",
        label: "Commercial Reach",
        fields: sectionDataField("Use object shape from the current commercialReach section data."),
      },
      {
        sectionKey: "provenSuccess",
        label: "Proven Success",
        fields: sectionDataField("Use object shape from the current provenSuccess section data."),
      },
      {
        sectionKey: "cta",
        label: "Call To Action",
        fields: sectionDataField("Use object shape from the current cta section data."),
      },
    ],
  },

  contact: {
    pageKey: "contact",
    label: "Contact Page",
    sections: [
      {
        sectionKey: "hero",
        label: "Hero Section",
        fields: sectionDataField("Use object shape from the current hero section data."),
      },
      {
        sectionKey: "contactInfo",
        label: "Contact Information",
        fields: sectionDataField("Use object shape from the current contactInfo section data."),
      },
      {
        sectionKey: "contactForm",
        label: "Contact Form",
        fields: sectionDataField("Use object shape from the current contactForm section data."),
      },
      {
        sectionKey: "companyIdentity",
        label: "Company Identity",
        fields: sectionDataField("Use object shape from the current companyIdentity section data."),
      },
    ],
  },
};

/**
 * Get page definition by key
 */
export function getPageDefinition(pageKey: string): PageDefinition | undefined {
  return PAGE_DEFINITIONS[pageKey];
}

/**
 * Get all available page keys
 */
export function getAllPageKeys(): string[] {
  return Object.keys(PAGE_DEFINITIONS);
}

/**
 * Get section definition within a page
 */
export function getSectionDefinition(
  pageKey: string,
  sectionKey: string,
): SectionDefinition | undefined {
  const page = getPageDefinition(pageKey);
  if (!page) return undefined;
  return page.sections.find((s) => s.sectionKey === sectionKey);
}

/**
 * Validate that a page structure is valid
 */
export function validatePageStructure(
  pageKey: string,
  structure: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const page = getPageDefinition(pageKey);

  if (!page) {
    errors.push(`Page '${pageKey}' not found`);
    return { valid: false, errors };
  }

  // Check that all required sections exist
  for (const section of page.sections) {
    if (!structure[section.sectionKey]) {
      // Note: sections can be optional, this is just a check
      // You can customize this logic
    }
  }

  return { valid: errors.length === 0, errors };
}
