import { describe, expect, it } from "vitest";
import { libraryCatalog } from "@jagger-ui/content/libraryCatalog";
import { docsUrl, gamesUrl, papersUrl } from "@jagger-ui/urls";
import type { ProjectEntry } from "../../types/content";
import { projects, views } from "./content";
import {
  categories,
  categoryFor,
  filterProjects,
  getDemoHref,
  getProjectResources,
} from "./explorerModel";
import { isEmbeddableDemo } from "./spatialModel";

const project = (slug: string) => projects.find((item) => item.slug === slug)!;

describe("spatial explorer content model", () => {
  it("keeps the complete shared inventory and assigns each project one usable category", () => {
    expect(filterProjects("", "all")).toEqual(projects);
    expect(projects).toHaveLength(14);
    const categorized = categories
      .filter((item) => item.id !== "all")
      .flatMap((category) => filterProjects("", category.id));
    expect(new Set(categorized.map((item) => item.slug)).size).toBe(
      projects.length,
    );
    expect(categorized).toHaveLength(projects.length);
    expect(categoryFor(project("hearth"))).toBe("systems");
    expect(categoryFor(project("risk"))).toBe("systems");
    expect(categoryFor(project("genetic-ts"))).toBe("play");
  });

  it("finds engineering details and game names while combining category and query", () => {
    expect(
      filterProjects("  WebAssembly  ", "languages").map((item) => item.slug),
    ).toContain("ojaml");
    expect(filterProjects("jigsaw", "play").map((item) => item.slug)).toEqual([
      "jagger-games",
    ]);
    expect(
      filterProjects("Monaco TypeScript", "languages").map((item) => item.slug),
    ).toEqual(["ojaml", "jaggerscript"]);
    expect(filterProjects("jigsaw", "systems")).toEqual([]);
    expect(filterProjects("unfindable-92731", "all")).toEqual([]);
  });

  it("offers browser destinations and embeds Arena, JetStream, Risk, and Games in-app", () => {
    for (const [slug, href] of Object.entries({
      ojaml: "/ojaml",
      risk: "https://risk.jaggerbrulato.com/",
      jaggerscript: "/jaggerscript",
      "genetic-ts": "/genetic-ts",
      rengine: "/rengine",
      "jagger-games": `${gamesUrl()}/`,
      jetstream: "https://jetstream.jaggerbrulato.com/",
      "random-arena": "https://arena.jaggerbrulato.com/",
    })) {
      expect(getDemoHref(project(slug))).toBe(href);
      expect(isEmbeddableDemo(href)).toBe(true);
    }
    for (const slug of [
      "hearth",
      "aixc-compressor",
      "liveboard",
      "tsxlight-renderer",
      "chains",
      "portfolio-site",
    ])
      expect(getDemoHref(project(slug))).toBeUndefined();
    const misleading: ProjectEntry = {
      ...project("hearth"),
      links: [
        {
          label: "Open Demo",
          href: "https://github.com/JBoss925/Hearth/releases/download/v1.0/Hearth.1.0.amxd",
        },
      ],
    };
    expect(getDemoHref(misleading)).toBeUndefined();
  });

  it("pairs all eight real papers with documentation on their dedicated subdomains", () => {
    const paperSlugs = new Set(libraryCatalog.map((paper) => paper.slug));
    for (const item of projects) {
      const resources = getProjectResources(item);
      expect(
        resources.filter(
          (resource) => resource.kind === "paper" || resource.kind === "docs",
        ),
      ).toEqual(
        paperSlugs.has(item.slug)
          ? [
              {
                kind: "paper",
                label: "Read paper",
                href: papersUrl(`/${item.slug}`),
              },
              {
                kind: "docs",
                label: "Documentation",
                href: docsUrl(`/${item.slug}`),
              },
            ]
          : [],
      );
      expect(new Set(resources.map((resource) => resource.href)).size).toBe(
        resources.length,
      );
    }
  });

  it("preserves special resources: device download, six games, all site views, and reference", () => {
    expect(getProjectResources(project("hearth"))).toContainEqual(
      expect.objectContaining({
        kind: "download",
        href: expect.stringContaining("Hearth.1.0.amxd"),
      }),
    );
    expect(
      getProjectResources(project("jagger-games")).filter(
        (item) => item.kind === "game",
      ),
    ).toHaveLength(6);
    const portfolioResources = getProjectResources(project("portfolio-site"));
    for (const view of views)
      expect(portfolioResources).toContainEqual(
        expect.objectContaining({ kind: "view", href: view.href }),
      );
    expect(getProjectResources(project("chains"))).toContainEqual(
      expect.objectContaining({
        kind: "reference",
        href: expect.stringContaining("gist.github.com"),
      }),
    );
  });
});
