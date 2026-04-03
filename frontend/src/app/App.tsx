import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("../features/home/HomePage"));
const JaggerScriptPage = lazy(
  () => import("../features/jaggerscript/JaggerScriptPage")
);

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
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jaggerscript" element={<JaggerScriptPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
