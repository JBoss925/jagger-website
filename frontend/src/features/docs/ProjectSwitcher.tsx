import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { docProjects } from "../../content/docs";

type Props = { slug: string; name: string };

export default function ProjectSwitcher({ slug, name }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [slug]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (!open) {
      if (event.target !== trigger.current) return;
      event.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>(".docs-project-switcher__panel a")?.focus());
      return;
    }
    const links = Array.from(root.current?.querySelectorAll<HTMLAnchorElement>(".docs-project-switcher__panel a") ?? []);
    if (!links.length) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : event.key === "ArrowDown" ? (index + 1) % links.length : (index - 1 + links.length) % links.length;
    links[next].focus();
  }

  return (
    <div className="docs-project-switcher" ref={root} onKeyDown={onKeyDown} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <span className="docs-project-switcher__label" id={`${panelId}-label`}>Switch project</span>
      <button ref={trigger} type="button" className="docs-project-switcher__trigger" aria-labelledby={`${panelId}-label ${panelId}-value`} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(current => !current)}>
        <span id={`${panelId}-value`}>{name}</span>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className={open ? "is-open" : ""}><path d="m5 7.5 5 5 5-5" /></svg>
      </button>
      {open && <nav id={panelId} className="docs-project-switcher__panel" aria-label="Choose a documentation project">
        {docProjects.map(project => <Link key={project.source.slug} to={`/docs/${project.source.slug}`} aria-current={project.source.slug === slug ? "page" : undefined} onClick={() => setOpen(false)}>
          <span>{project.name}</span><span aria-hidden="true">{project.source.slug === slug ? "✓" : ""}</span>
        </Link>)}
      </nav>}
    </div>
  );
}
