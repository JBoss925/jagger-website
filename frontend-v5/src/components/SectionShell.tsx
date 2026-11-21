import type { ReactNode } from "react";
import { renderInlineEmphasis } from "./renderInlineEmphasis";

type SectionShellProps = {
  id: string;
  eyebrow: string;
  title: string;
  summary?: string;
  children: ReactNode;
};

function SectionShell({ id, eyebrow, title, summary, children }: SectionShellProps) {
  return (
    <section id={id} className="content-section">
      <div className="section-heading">
        <span className="section-heading__eyebrow">{eyebrow}</span>
        <h2>{renderInlineEmphasis(title)}</h2>
        {summary ? <p>{renderInlineEmphasis(summary)}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default SectionShell;
