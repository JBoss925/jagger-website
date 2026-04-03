import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("../features/home/HomePage"));
const JaggerScriptPage = lazy(
  () => import("../features/jaggerscript/JaggerScriptPage")
);

function App() {
  return (
    <Suspense
      fallback={<div className="route-loading">Calibrating the system map...</div>}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jaggerscript" element={<JaggerScriptPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
