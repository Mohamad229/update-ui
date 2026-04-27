import "dotenv/config";

import {
  PrismaClient,
  UserRole,
  ProductType,
  ProductStatus,
  SectionType,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seeding...");

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@damirapharma.com" },
    update: {},
    create: {
      email: "admin@damirapharma.com",
      password: hashedPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
    },
  });
  console.log("Admin user created:", adminUser.email);

  // Create Therapeutic Areas
  const therapeuticAreas = [
    { slug: "oncology", name: "Oncology", nameAr: "الأورام" },
    { slug: "cardiology", name: "Cardiology", nameAr: "أمراض القلب" },
    { slug: "neurology", name: "Neurology", nameAr: "الأعصاب" },
    { slug: "immunology", name: "Immunology", nameAr: "المناعة" },
    { slug: "respiratory", name: "Respiratory", nameAr: "الجهاز التنفسي" },
    {
      slug: "gastroenterology",
      name: "Gastroenterology",
      nameAr: "الجهاز الهضمي",
    },
    { slug: "dermatology", name: "Dermatology", nameAr: "الأمراض الجلدية" },
    { slug: "endocrinology", name: "Endocrinology", nameAr: "الغدد الصماء" },
  ];

  for (const area of therapeuticAreas) {
    await prisma.therapeuticArea.upsert({
      where: { slug: area.slug },
      update: {},
      create: area,
    });
  }
  console.log("Therapeutic areas created:", therapeuticAreas.length);

  // Create Categories
  const categories = [
    { slug: "pharmaceuticals", name: "Pharmaceuticals", nameAr: "الأدوية" },
    { slug: "biologics", name: "Biologics", nameAr: "المستحضرات الحيوية" },
    { slug: "vaccines", name: "Vaccines", nameAr: "اللقاحات" },
    {
      slug: "medical-devices",
      name: "Medical Devices",
      nameAr: "الأجهزة الطبية",
    },
    { slug: "diagnostics", name: "Diagnostics", nameAr: "التشخيص" },
    {
      slug: "nutraceuticals",
      name: "Nutraceuticals",
      nameAr: "المكملات الغذائية",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log("Categories created:", categories.length);

  // Create Manufacturers
  const manufacturers = [
    { slug: "damira-pharma", name: "Damira Pharma", country: "Saudi Arabia" },
    { slug: "pfizer", name: "Pfizer", country: "United States" },
    { slug: "novartis", name: "Novartis", country: "Switzerland" },
    { slug: "roche", name: "Roche", country: "Switzerland" },
    { slug: "sanofi", name: "Sanofi", country: "France" },
    { slug: "astrazeneca", name: "AstraZeneca", country: "United Kingdom" },
  ];

  for (const manufacturer of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { slug: manufacturer.slug },
      update: {},
      create: manufacturer,
    });
  }
  console.log("Manufacturers created:", manufacturers.length);

  // Create Site Settings
  const siteSettings = [
    { key: "site_name", value: "Damira Pharma" },
    { key: "site_name_ar", value: "داميرا فارما" },
    { key: "contact_email", value: "info@damirapharma.com" },
    { key: "contact_phone", value: "+966 XX XXX XXXX" },
    { key: "address", value: "Riyadh, Saudi Arabia" },
    { key: "address_ar", value: "الرياض، المملكة العربية السعودية" },
    {
      key: "default_meta_description",
      value:
        "Damira Pharma - Leading pharmaceutical solutions in the Middle East",
    },
    {
      key: "default_meta_description_ar",
      value: "داميرا فارما - حلول صيدلانية رائدة في الشرق الأوسط",
    },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("Site settings created:", siteSettings.length);

  // Create Homepage
  const homepage = await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      isPublished: true,
      translations: {
        create: [
          {
            locale: "en",
            title: "Home",
            metaTitle: "Damira Pharma - Healthcare Solutions",
            metaDescription:
              "Leading pharmaceutical distribution and healthcare solutions in the Middle East",
          },
          {
            locale: "ar",
            title: "الرئيسية",
            metaTitle: "داميرا فارما - حلول الرعاية الصحية",
            metaDescription:
              "توزيع الأدوية الرائد وحلول الرعاية الصحية في الشرق الأوسط",
          },
        ],
      },
    },
  });
  console.log("Homepage created");

  // Create About Page
  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      slug: "about",
      isPublished: true,
      translations: {
        create: [
          {
            locale: "en",
            title: "About Us",
            metaTitle: "About Damira Pharma",
            metaDescription: "Learn about our vision, mission, and values",
          },
          {
            locale: "ar",
            title: "من نحن",
            metaTitle: "عن داميرا فارما",
            metaDescription: "تعرف على رؤيتنا ورسالتنا وقيمنا",
          },
        ],
      },
    },
  });
  console.log("About page created");

  // Create Structured Page Content (v2 System)
  // Home Page - English
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "home", locale: "en" } },
    update: {},
    create: {
      pageKey: "home",
      locale: "en",
      title: "Home",
      metaTitle: "Damira Pharma - Healthcare Solutions",
      metaDescription:
        "Leading pharmaceutical distribution and healthcare solutions in the Middle East",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "Trusted, Healthy",
                },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "Transforming Healthcare in Syria",
                },
                {
                  fieldKey: "buttonText",
                  fieldType: "text",
                  value: "Learn More",
                },
                {
                  fieldKey: "buttonLink",
                  fieldType: "text",
                  value: "/en/about",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "trustMetrics",
            order: 2,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "Why Trust Damira",
                },
                { fieldKey: "items", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "capabilities",
            order: 3,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "Our Capabilities",
                },
                { fieldKey: "description", fieldType: "textarea", value: null },
                { fieldKey: "cards", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "featuredProducts",
            order: 4,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "Featured Products",
                },
                { fieldKey: "productIds", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "cta",
            order: 5,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "Ready to Partner?",
                },
                { fieldKey: "description", fieldType: "textarea", value: null },
                {
                  fieldKey: "buttonText",
                  fieldType: "text",
                  value: "Contact Us",
                },
                {
                  fieldKey: "buttonLink",
                  fieldType: "text",
                  value: "/en/contact",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Home page content created (EN)");

  // Home Page - Arabic
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "home", locale: "ar" } },
    update: {},
    create: {
      pageKey: "home",
      locale: "ar",
      title: "الرئيسية",
      metaTitle: "داميرا فارما - حلول الرعاية الصحية",
      metaDescription:
        "توزيع الأدوية الرائد وحلول الرعاية الصحية في الشرق الأوسط",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "موثوق، صحي" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "تحويل الرعاية الصحية في سوريا",
                },
                {
                  fieldKey: "buttonText",
                  fieldType: "text",
                  value: "تعرف أكثر",
                },
                {
                  fieldKey: "buttonLink",
                  fieldType: "text",
                  value: "/ar/about",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "trustMetrics",
            order: 2,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "لماذا تثق بـ داميرا",
                },
                { fieldKey: "items", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "capabilities",
            order: 3,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "قدراتنا" },
                { fieldKey: "description", fieldType: "textarea", value: null },
                { fieldKey: "cards", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "featuredProducts",
            order: 4,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "المنتجات المميزة",
                },
                { fieldKey: "productIds", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "cta",
            order: 5,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "هل أنت مستعد للشراكة؟",
                },
                { fieldKey: "description", fieldType: "textarea", value: null },
                {
                  fieldKey: "buttonText",
                  fieldType: "text",
                  value: "اتصل بنا",
                },
                {
                  fieldKey: "buttonLink",
                  fieldType: "text",
                  value: "/ar/contact",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Home page content created (AR)");

  // About Page - English
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "about", locale: "en" } },
    update: {},
    create: {
      pageKey: "about",
      locale: "en",
      title: "About Us",
      metaTitle: "About Damira Pharma",
      metaDescription: "Learn about our vision, mission, and values",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "About Us" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "Leadership in Healthcare",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "story",
            order: 2,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "Our Story" },
                { fieldKey: "content", fieldType: "textarea", value: null },
              ],
            },
          },
          {
            sectionKey: "missionVision",
            order: 3,
            fields: {
              create: [
                {
                  fieldKey: "missionTitle",
                  fieldType: "text",
                  value: "Our Mission",
                },
                {
                  fieldKey: "missionContent",
                  fieldType: "textarea",
                  value: null,
                },
                {
                  fieldKey: "visionTitle",
                  fieldType: "text",
                  value: "Our Vision",
                },
                {
                  fieldKey: "visionContent",
                  fieldType: "textarea",
                  value: null,
                },
              ],
            },
          },
          {
            sectionKey: "values",
            order: 4,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "Our Values" },
                { fieldKey: "values", fieldType: "json", value: "[]" },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("About page content created (EN)");

  // About Page - Arabic
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "about", locale: "ar" } },
    update: {},
    create: {
      pageKey: "about",
      locale: "ar",
      title: "من نحن",
      metaTitle: "عن داميرا فارما",
      metaDescription: "تعرف على رؤيتنا ورسالتنا وقيمنا",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "من نحن" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "القيادة في الرعاية الصحية",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "story",
            order: 2,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "قصتنا" },
                { fieldKey: "content", fieldType: "textarea", value: null },
              ],
            },
          },
          {
            sectionKey: "missionVision",
            order: 3,
            fields: {
              create: [
                {
                  fieldKey: "missionTitle",
                  fieldType: "text",
                  value: "رسالتنا",
                },
                {
                  fieldKey: "missionContent",
                  fieldType: "textarea",
                  value: null,
                },
                { fieldKey: "visionTitle", fieldType: "text", value: "رؤيتنا" },
                {
                  fieldKey: "visionContent",
                  fieldType: "textarea",
                  value: null,
                },
              ],
            },
          },
          {
            sectionKey: "values",
            order: 4,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "قيمنا" },
                { fieldKey: "values", fieldType: "json", value: "[]" },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("About page content created (AR)");

  // Services Page - English
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "services", locale: "en" } },
    update: {},
    create: {
      pageKey: "services",
      locale: "en",
      title: "Services",
      metaTitle: "Our Services",
      metaDescription: "Explore our comprehensive healthcare services",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "Our Services" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "Complete Healthcare Solutions",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "serviceBlocks",
            order: 2,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "What We Offer",
                },
                { fieldKey: "services", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "infrastructure",
            order: 3,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "Our Infrastructure",
                },
                { fieldKey: "highlights", fieldType: "json", value: "[]" },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Services page content created (EN)");

  // Services Page - Arabic
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "services", locale: "ar" } },
    update: {},
    create: {
      pageKey: "services",
      locale: "ar",
      title: "الخدمات",
      metaTitle: "خدماتنا",
      metaDescription: "اكتشف خدماتنا الشاملة للرعاية الصحية",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "خدماتنا" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "حلول الرعاية الصحية الكاملة",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "serviceBlocks",
            order: 2,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "ما نقدمه" },
                { fieldKey: "services", fieldType: "json", value: "[]" },
              ],
            },
          },
          {
            sectionKey: "infrastructure",
            order: 3,
            fields: {
              create: [
                {
                  fieldKey: "title",
                  fieldType: "text",
                  value: "البنية التحتية لدينا",
                },
                { fieldKey: "highlights", fieldType: "json", value: "[]" },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Services page content created (AR)");

  // Products Page - English
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "products", locale: "en" } },
    update: {},
    create: {
      pageKey: "products",
      locale: "en",
      title: "Products",
      metaTitle: "Our Products",
      metaDescription: "Explore our pharmaceutical product portfolio",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "Our Products" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "High-quality healthcare portfolio",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "introduction",
            order: 2,
            fields: {
              create: [
                { fieldKey: "content", fieldType: "textarea", value: null },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Products page content created (EN)");

  // Products Page - Arabic
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "products", locale: "ar" } },
    update: {},
    create: {
      pageKey: "products",
      locale: "ar",
      title: "المنتجات",
      metaTitle: "منتجاتنا",
      metaDescription: "استكشف محفظة منتجاتنا الصيدلانية",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "المنتجات" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "محفظة رعاية صحية عالية الجودة",
                },
                { fieldKey: "imageId", fieldType: "media", value: null },
              ],
            },
          },
          {
            sectionKey: "introduction",
            order: 2,
            fields: {
              create: [
                { fieldKey: "content", fieldType: "textarea", value: null },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Products page content created (AR)");

  // Contact Page - English
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "contact", locale: "en" } },
    update: {},
    create: {
      pageKey: "contact",
      locale: "en",
      title: "Contact",
      metaTitle: "Contact Damira Pharma",
      metaDescription: "Get in touch with Damira Pharma",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "Contact Us" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "We are here to support you",
                },
              ],
            },
          },
          {
            sectionKey: "contactInfo",
            order: 2,
            fields: {
              create: [
                {
                  fieldKey: "email",
                  fieldType: "text",
                  value: "info@damirapharma.com",
                },
                {
                  fieldKey: "phone",
                  fieldType: "text",
                  value: "+966 XX XXX XXXX",
                },
                {
                  fieldKey: "address",
                  fieldType: "text",
                  value: "Riyadh, Saudi Arabia",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Contact page content created (EN)");

  // Contact Page - Arabic
  await prisma.pageContent.upsert({
    where: { pageKey_locale: { pageKey: "contact", locale: "ar" } },
    update: {},
    create: {
      pageKey: "contact",
      locale: "ar",
      title: "اتصل بنا",
      metaTitle: "تواصل مع داميرا فارما",
      metaDescription: "تواصل مع داميرا فارما",
      sections: {
        create: [
          {
            sectionKey: "hero",
            order: 1,
            fields: {
              create: [
                { fieldKey: "title", fieldType: "text", value: "اتصل بنا" },
                {
                  fieldKey: "subtitle",
                  fieldType: "text",
                  value: "نحن هنا لدعمك",
                },
              ],
            },
          },
          {
            sectionKey: "contactInfo",
            order: 2,
            fields: {
              create: [
                {
                  fieldKey: "email",
                  fieldType: "text",
                  value: "info@damirapharma.com",
                },
                {
                  fieldKey: "phone",
                  fieldType: "text",
                  value: "+966 XX XXX XXXX",
                },
                {
                  fieldKey: "address",
                  fieldType: "text",
                  value: "الرياض، المملكة العربية السعودية",
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("Contact page content created (AR)");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
