import DemoBrandBar from "../../components/DemoBrandBar";
import { usePageReveal } from "../../hooks/usePageReveal";
import { GeneticTsPage } from "@genetic-ts";

function GeneticTsRoute() {
  const isPageReady = usePageReveal();

  return (
    <div
      className={
        isPageReady
          ? "page-shell page-shell--ready ide-page studio-theme-light genetic-route"
          : "page-shell page-shell--entering ide-page studio-theme-light genetic-route"
      }
    >
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>
      <DemoBrandBar />

      <main className="content-shell ide-shell">
        <GeneticTsPage />
      </main>
    </div>
  );
}

export default GeneticTsRoute;
