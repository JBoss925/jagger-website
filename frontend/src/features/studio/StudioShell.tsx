import { Link } from "react-router-dom";
export function StudioHeader() {
  return (
    <>
      <a href="#main-content" className="studio-skip">
        Skip to content
      </a>
      <header className="studio-nav">
        <Link className="studio-brand" to="/" aria-label="Jagger Brulato home">
          <span className="studio-monogram" aria-hidden="true">
            jb.
          </span>
          <span>Jagger Brulato</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="/#projects">Work</a>
          <a href="/#about">About</a>
          <Link to="/library">Library</Link>
        </nav>
        <a className="studio-contact" href="mailto:jagger@jaggerbrulato.com">
          Let’s talk <span aria-hidden="true">↗</span>
        </a>
      </header>
    </>
  );
}
export function StudioFooter() {
  return (
    <footer className="studio-footer">
      <Link to="/">
        Jagger Brulato <span>Engineer & builder</span>
      </Link>
      <div>
        <a href="https://github.com/JBoss925">GitHub ↗</a>
        <a href="https://www.linkedin.com/in/jaggerbrulato/">LinkedIn ↗</a>
        <a href="/files/resume.pdf">Résumé ↗</a>
      </div>
      <span>Built with intention.</span>
    </footer>
  );
}
