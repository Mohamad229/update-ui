/**
 * Content System Types
 *
 * TypeScript type definitions for the structured page content system.
 */

/**
 * Parsed content field value
 */
export type FieldValue = string | number | boolean | object | null | undefined;

/**
 * Parsed section data (all fields for a section)
 */
export interface SectionData {
  [fieldKey: string]: FieldValue;
}

/**
 * Parsed page content (all sections with their data)
 */
export interface PageData {
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  [sectionKey: string]: SectionData | string | null | undefined;
}

/**
 * Specific section data types
 */
export interface HeroSection extends SectionData {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageId?: string;
}

export interface TrustMetricsSection extends SectionData {
  title?: string;
  items?: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
}

export interface CapabilitiesSection extends SectionData {
  title?: string;
  description?: string;
  cards?: Array<{
    icon?: string;
    title: string;
    description: string;
  }>;
}

export interface FeaturedProductsSection extends SectionData {
  title?: string;
  productIds?: string[];
}

export interface CTASection extends SectionData {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

/**
 * API Response Types
 */
export interface GetPageContentResponse {
  pageKey: string;
  locale: string;
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  sections: Record<string, SectionData>;
}

export interface UpdatePageContentResponse {
  success: boolean;
  message?: string;
  data?: GetPageContentResponse;
  errors?: Record<string, string[]>;
}

/**
 * Admin UI State Types
 */
export interface PageEditorState {
  isLoading: boolean;
  isSaving: boolean;
  pageKey: string;
  locale: string;
  data: PageData | null;
  errors: Record<string, string>;
  lastSaved?: Date;
}

export interface SectionEditorState {
  isExpanded: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

/**
 * Compose Home Page Type
 */
export interface HomePageContent extends PageData {
  hero?: HeroSection;
  trustMetrics?: TrustMetricsSection;
  capabilities?: CapabilitiesSection;
  featuredProducts?: FeaturedProductsSection;
  cta?: CTASection;
}

/**
 * Compose About Page Type
 */
export interface AboutPageContent extends PageData {
  hero?: HeroSection;
  story?: SectionData;
  missionVision?: SectionData;
  values?: SectionData;
}

/**
 * Compose Services Page Type
 */
export interface ServicesPageContent extends PageData {
  hero?: HeroSection;
  serviceBlocks?: SectionData;
  infrastructure?: SectionData;
}
