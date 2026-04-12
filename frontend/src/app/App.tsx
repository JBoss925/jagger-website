import { useEffect, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GamesPage from "../features/games/GamesPage";
import DomesPage from "../features/games/DomesPage";
import JordlePage from "../features/games/JordlePage";
import JolorPage from "../features/games/JolorPage";
import JinxPage from "../features/games/JinxPage";
import JudokuPage from "../features/games/JudokuPage";
import JigsawPage from "../features/games/JigsawPage";

const HomePage = lazy(() => import("../features/home/HomePage"));
const JaggerScriptPage = lazy(
  () => import("../features/jaggerscript/JaggerScriptPage")
);
const GeneticTsRoute = lazy(
  () => import("../features/genetic-ts/GeneticTsRoute")
);
const RenginePage = lazy(() => import("../features/rengine/RenginePage"));

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <div className="route-loading__spinner" aria-hidden="true" />
      <div className="route-loading__copy">
        <span className="route-loading__eyebrow">Boot sequence</span>
        <strong>Calibrating the system map...</strong>
        <p>Loading scene data, preparing navigation, and bringing the resume surface online.</p>
      </div>
    </div>
  );
}

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
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jaggerscript" element={<JaggerScriptPage />} />
        <Route path="/genetic-ts" element={<GeneticTsRoute />} />
        <Route path="/rengine" element={<RenginePage />} />
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
