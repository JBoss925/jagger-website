import { Link, useLocation } from "react-router-dom";

function DemoBrandBar() {
  const location = useLocation();
  const isEmbedded = new URLSearchParams(location.search).get("embed") === "1";

  if (isEmbedded) {
    return null;
  }

  return (
    <header className="demo-brand-bar">
      <Link
        to="/"
        className="demo-brand-pill"
        aria-label="Jagger Brulato — Back to home"
      >
        <span className="demo-brand-pill__mark" aria-hidden="true">
          <img src="/favicon.svg" alt="" width={34} height={34} />
        </span>
        <span className="demo-brand-pill__text">
          <strong>Jagger Brulato</strong>
          <small>Staff Engineer</small>
        </span>
      </Link>
    </header>
  );
}

export default DemoBrandBar;
