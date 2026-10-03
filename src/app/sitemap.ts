import type { MetadataRoute } from "next";
import { TOTAL_DAYS } from "@/lib/content/lessons";
import { glossary } from "@/lib/content/glossary";

const BASE_URL = "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/roadmap",
    "/dashboard",
    "/progress",
    "/calculators",
    "/formulas",
    "/glossary",
    "/case-studies",
    "/simulator",
    "/business-model-canvas",
    "/startup-validator",
    "/journal",
    "/achievements",
    "/final-project",
  ].map((route) => ({ url: `${BASE_URL}${route}`, lastModified: new Date() }));

  const lessonRoutes = Array.from({ length: TOTAL_DAYS }, (_, i) => ({
    url: `${BASE_URL}/learn/day/${i + 1}`,
    lastModified: new Date(),
  }));

  const glossaryRoutes = glossary.map((g) => ({
    url: `${BASE_URL}/glossary/${g.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...lessonRoutes, ...glossaryRoutes];
}
