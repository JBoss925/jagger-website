import SiteNavigation from "../../components/SiteNavigation";
import { profileContent } from "../../content/profile";
import { usePageReveal } from "../../hooks/usePageReveal";
import { GeneticTsPage } from "../../../../genetic_ts/src";

function GeneticTsRoute() {
  const isPageReady = usePageReveal();

  return (
    <div className={isPageReady ? "page-shell page-shell--ready ide-page" : "page-shell page-shell--entering ide-page"}>
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>
      <SiteNavigation sections={profileContent.sceneSections} />

      <main className="content-shell ide-shell">
        <GeneticTsPage />
      </main>
    </div>
  );
}

export default GeneticTsRoute;
