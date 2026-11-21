import { useEffect, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import StudioPage from "../features/studio/StudioPage";
import GamesPage from "../features/games/GamesPage";
import DomesPage from "../features/games/DomesPage";
import JordlePage from "../features/games/JordlePage";
import JolorPage from "../features/games/JolorPage";
import JinxPage from "../features/games/JinxPage";
import JudokuPage from "../features/games/JudokuPage";
import JigsawPage from "../features/games/JigsawPage";

const MuseumPage = lazy(() => import("../features/studio/MuseumPage"));
const LibraryPage = lazy(() => import("../features/studio/LibraryPage"));
const JaggerScriptPage = lazy(
  () => import("../features/jaggerscript/JaggerScriptPage")
);
const GeneticTsRoute = lazy(
  () => import("../features/genetic-ts/GeneticTsRoute")
);
const OJamlRoute = lazy(() => import("../features/ojaml/OJamlRoute"));
const RenginePage = lazy(() => import("../features/rengine/RenginePage"));
const PapersPage = lazy(() => import("../features/papers/PapersPage"));
const PaperPage = lazy(() => import("../features/papers/PaperPage"));

const DocsPage = lazy(() => import("../features/docs/DocsPage"));

function App() {
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<StudioPage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/jaggerscript" element={<JaggerScriptPage />} />
        <Route path="/ojaml" element={<OJamlRoute />} />
        <Route path="/genetic-ts" element={<GeneticTsRoute />} />
        <Route path="/rengine" element={<RenginePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/:slug" element={<DocsPage />} />
        <Route path="/docs/:slug/:mode" element={<DocsPage />} />
        <Route path="/docs/:slug/:mode/:pageId" element={<DocsPage />} />
        <Route path="/papers" element={<PapersPage />} />
        <Route path="/papers/:slug" element={<PaperPage />} />
        <Route path="/jagger-papers" element={<Navigate to="/papers" replace />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/domes" element={<DomesPage />} />
        <Route path="/games/jordle" element={<JordlePage />} />
        <Route path="/games/jolor" element={<JolorPage />} />
        <Route path="/games/jinx" element={<JinxPage />} />
        <Route path="/games/judoku" element={<JudokuPage />} />
        <Route path="/games/jigsaw" element={<JigsawPage />} />
        <Route path="/games/jeardle" element={<Navigate to="/games/jolor" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
