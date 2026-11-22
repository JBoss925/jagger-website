import { useEffect, Suspense, lazy } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { docsUrl, gamesUrl, papersUrl } from "@jagger-ui/urls";
import StudioPage from "../features/studio/StudioPage";

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

function ExternalRedirect({
  buildUrl,
}: {
  buildUrl: (rest: string) => string;
}) {
  const { "*": rest = "" } = useParams();
  useEffect(() => {
    window.location.replace(buildUrl(rest));
  }, [buildUrl, rest]);
  return null;
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
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<StudioPage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/jaggerscript" element={<JaggerScriptPage />} />
        <Route path="/ojaml" element={<OJamlRoute />} />
        <Route path="/genetic-ts" element={<GeneticTsRoute />} />
        <Route path="/rengine" element={<RenginePage />} />
        <Route
          path="/docs/*"
          element={<ExternalRedirect buildUrl={(rest) => docsUrl(rest)} />}
        />
        <Route
          path="/docs"
          element={<ExternalRedirect buildUrl={() => docsUrl()} />}
        />
        <Route
          path="/papers/*"
          element={<ExternalRedirect buildUrl={(rest) => papersUrl(rest)} />}
        />
        <Route
          path="/papers"
          element={<ExternalRedirect buildUrl={() => papersUrl()} />}
        />
        <Route
          path="/jagger-papers"
          element={<ExternalRedirect buildUrl={() => papersUrl()} />}
        />
        <Route
          path="/games/jeardle"
          element={<ExternalRedirect buildUrl={() => gamesUrl("/jolor")} />}
        />
        <Route
          path="/games/*"
          element={<ExternalRedirect buildUrl={(rest) => gamesUrl(rest)} />}
        />
        <Route
          path="/games"
          element={<ExternalRedirect buildUrl={() => gamesUrl()} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
