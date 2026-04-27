export interface MilestoneTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface MilestoneDefinition {
  id: number;
  title: string;
  tasks: MilestoneTask[];
}

export const milestoneTen: MilestoneDefinition = {
  id: 10,
  title: "Public Website - Product Catalog",
  tasks: [
    {
      id: "10.1",
      label:
        "Create public product server actions (published listing, single fetch, search)",
      completed: true,
    },
    {
      id: "10.2",
      label: "Build products listing page with grid cards and grid/list toggle",
      completed: true,
    },
    {
      id: "10.3",
      label: "Implement search, filters, URL state management, and pagination",
      completed: true,
    },
    {
      id: "10.4",
      label:
        "Build product detail page with full info, attachments, and related products",
      completed: true,
    },
    {
      id: "10.5",
      label: "Implement SEO metadata and validate bilingual EN/AR behavior",
      completed: true,
    },
  ],
};

export const milestoneEleven: MilestoneDefinition = {
  id: 11,
  title: "Public Website - Contact & Forms",
  tasks: [
    {
      id: "11.1",
      label:
        "Create form submission server action with Zod schemas (contact, partnership, product inquiry)",
      completed: true,
    },
    {
      id: "11.2",
      label:
        "Build Contact Us page with form, company contact information, and optional map",
      completed: true,
    },
    {
      id: "11.3",
      label:
        "Create form components with validation display, loading states, success/error feedback, and honeypot spam protection",
      completed: true,
    },
    {
      id: "11.4",
      label:
        "Add partnership form to Partnerships page with inquiry type dropdown",
      completed: true,
    },
  ],
};

export const milestoneTwelve: MilestoneDefinition = {
  id: 12,
  title: "SEO, Performance & Production Readiness",
  tasks: [
    {
      id: "12.1",
      label:
        "Implement dynamic metadata generation for all pages and products, create sitemap.ts and robots.ts",
      completed: true,
    },
    {
      id: "12.2",
      label:
        "Add Open Graph/Twitter card metadata and optional OG image generation",
      completed: true,
    },
    {
      id: "12.3",
      label:
        "Implement structured data (JSON-LD) for organization and products",
      completed: true,
    },
    {
      id: "12.4",
      label:
        "Configure ISR revalidation for public and product pages, optimize all images with next/image",
      completed: true,
    },
    {
      id: "12.5",
      label:
        "Build custom 404/500 error pages, add loading skeletons throughout, review Core Web Vitals",
      completed: true,
    },
    {
      id: "12.6",
      label:
        "Configure production environment, deployment pipeline, and deployment documentation",
      completed: true,
    },
  ],
};

export const activeMilestone: MilestoneDefinition = milestoneTwelve;

export function getMilestoneProgress(milestone: MilestoneDefinition) {
  const completed = milestone.tasks.filter((task) => task.completed).length;
  const total = milestone.tasks.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
}
