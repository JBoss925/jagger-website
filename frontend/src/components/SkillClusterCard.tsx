import type { SkillCluster } from "../types/content";
import { renderInlineEmphasis } from "./renderInlineEmphasis";

type SkillClusterCardProps = {
  cluster: SkillCluster;
};

function SkillClusterCard({ cluster }: SkillClusterCardProps) {
  return (
    <article className="skill-card">
      <h3>{cluster.title}</h3>
      <p>{renderInlineEmphasis(cluster.summary)}</p>
      <div className="chip-row">
        {cluster.items.map((item) => (
          <span key={item} className="chip">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

export default SkillClusterCard;
