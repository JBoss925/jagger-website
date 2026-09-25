import { useId, useState, type ReactNode } from "react";

type CardDisclosureProps = {
  children: ReactNode;
  label: string;
};

function CardDisclosure({ children, label }: CardDisclosureProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className={`card-disclosure${open ? " is-open" : ""}`}>
      <div className="card-disclosure__content" id={contentId} aria-hidden={!open}>
        <div className="card-disclosure__clip">
          <div className="card-disclosure__inner">{children}</div>
        </div>
      </div>
      <button
        type="button"
        className="card-disclosure__toggle"
        aria-expanded={open}
        aria-controls={contentId}
        aria-label={`${open ? "Hide" : "Show"} ${label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}

export default CardDisclosure;
