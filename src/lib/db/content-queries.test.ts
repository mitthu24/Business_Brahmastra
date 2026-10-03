// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "./test-client";
import { createUser } from "./auth-queries";
import {
  listGlossaryEntries,
  getGlossaryEntry,
  createGlossaryEntry,
  updateGlossaryEntry,
  setGlossaryEntryStatus,
  listFormulaEntries,
  getFormulaEntry,
  createFormulaEntry,
  setFormulaEntryStatus,
  listCaseStudyEntries,
  getCaseStudyEntry,
  createCaseStudyEntry,
  setCaseStudyEntryStatus,
} from "./content-queries";
import { seedContentFromHardcoded } from "./content-seed";
import { glossary } from "@/lib/content/glossary";
import { formulas } from "@/lib/content/formulas";
import { caseStudies } from "@/lib/content/case-studies";
import type { Database } from "./types";

let db: Database;
let founderId: string;

beforeEach(async () => {
  db = await createTestDb();
  const founder = await createUser(db, { email: "founder@example.com", passwordHash: "x", name: "Founder", role: "founder" });
  founderId = founder.id;
});

describe("content seed (idempotent migration of hardcoded content)", () => {
  it("inserts every hardcoded glossary/formula/case-study row as published, matching the exact source counts", async () => {
    const result = await seedContentFromHardcoded(db);
    expect(result.glossaryInserted).toBe(glossary.length);
    expect(result.formulasInserted).toBe(formulas.length);
    expect(result.caseStudiesInserted).toBe(caseStudies.length);

    const published = await listGlossaryEntries(db, { status: "published" });
    expect(published).toHaveLength(glossary.length);
  });

  it("is idempotent: running it twice inserts nothing the second time and never throws", async () => {
    await seedContentFromHardcoded(db);
    const second = await seedContentFromHardcoded(db);
    expect(second.glossaryInserted).toBe(0);
    expect(second.formulasInserted).toBe(0);
    expect(second.caseStudiesInserted).toBe(0);

    const rows = await listGlossaryEntries(db);
    expect(rows).toHaveLength(glossary.length);
  });

  it("preserves the existing stable slug/id as the primary key", async () => {
    await seedContentFromHardcoded(db);
    const revenue = await getGlossaryEntry(db, "revenue");
    expect(revenue?.term).toBe("Revenue");
    const profit = await getFormulaEntry(db, "profit");
    expect(profit?.name).toBe("Profit");
    const zerodha = await getCaseStudyEntry(db, "zerodha");
    expect(zerodha?.company).toBe("Zerodha");
  });
});

describe("glossary CMS", () => {
  it("creates a draft entry invisible to a published-only query, then publishes it", async () => {
    await createGlossaryEntry(
      db,
      { term: "Runway", slug: "runway", definition: "How long the cash lasts.", example: "₹10L at ₹2L/month burn = 5 months.", relatedTerms: ["Burn Rate"] },
      "draft",
      founderId
    );

    expect(await listGlossaryEntries(db, { status: "published" })).toHaveLength(0);
    const draftList = await listGlossaryEntries(db, { status: "draft" });
    expect(draftList).toHaveLength(1);

    await setGlossaryEntryStatus(db, "runway", "published", founderId);
    expect(await listGlossaryEntries(db, { status: "published" })).toHaveLength(1);
  });

  it("search filters by term or definition, case-insensitively", async () => {
    await createGlossaryEntry(db, { term: "Churn", slug: "churn", definition: "Customers who leave.", example: "...", relatedTerms: [] }, "published", founderId);
    await createGlossaryEntry(db, { term: "Retention", slug: "retention", definition: "The opposite of leaving.", example: "...", relatedTerms: [] }, "published", founderId);

    const bySearch = await listGlossaryEntries(db, { search: "chu" });
    expect(bySearch.map((e) => e.slug)).toEqual(["churn"]);
  });

  it("update preserves the slug and round-trips relatedTerms as an array", async () => {
    await createGlossaryEntry(db, { term: "LTV", slug: "ltv", definition: "Lifetime value.", example: "...", relatedTerms: ["CAC"] }, "draft", founderId);
    await updateGlossaryEntry(db, "ltv", { term: "LTV (Updated)", slug: "ltv", definition: "Updated definition.", example: "Updated example.", relatedTerms: ["CAC", "Churn"] }, founderId);

    const updated = await getGlossaryEntry(db, "ltv");
    expect(updated?.term).toBe("LTV (Updated)");
    expect(updated?.relatedTerms).toEqual(["CAC", "Churn"]);
  });
});

describe("formula library CMS", () => {
  it("lists only published formulas when filtered, and supports archiving", async () => {
    await createFormulaEntry(db, { id: "roi", name: "ROI", category: "Finance", expression: "Gain / Cost", explanation: "...", example: "..." }, "published", founderId);
    await setFormulaEntryStatus(db, "roi", "archived", founderId);

    expect(await listFormulaEntries(db, { status: "published" })).toHaveLength(0);
    expect(await listFormulaEntries(db, { status: "archived" })).toHaveLength(1);
  });
});

describe("case study CMS", () => {
  it("round-trips the lessons array and supports the full draft -> published -> archived lifecycle", async () => {
    const entry = await createCaseStudyEntry(
      db,
      {
        id: "test-co",
        company: "Test Co",
        category: "SaaS",
        industry: "Testing",
        factType: "illustrative",
        problem: "No tests existed.",
        solution: "Added tests.",
        customer: "Developers.",
        businessModel: "B2B SaaS.",
        revenueModel: "Subscription.",
        growth: "Steady.",
        competition: "Many.",
        challenges: "Coverage.",
        lessons: ["Write tests early.", "Automate everything."],
      },
      "draft",
      founderId
    );
    expect(entry.lessons).toEqual(["Write tests early.", "Automate everything."]);

    await setCaseStudyEntryStatus(db, "test-co", "published", founderId);
    expect((await listCaseStudyEntries(db, { status: "published" }))[0].id).toBe("test-co");

    await setCaseStudyEntryStatus(db, "test-co", "archived", founderId);
    const archived = await getCaseStudyEntry(db, "test-co");
    expect(archived?.status).toBe("archived");
  });
});
