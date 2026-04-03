import type { SkillCluster } from "../types/content";

type SkillClusterCardProps = {
  cluster: SkillCluster;
};

function SkillClusterCard({ cluster }: SkillClusterCardProps) {
  return (
    <article className="skill-card">
      <h3>{cluster.title}</h3>
      <p>{cluster.summary}</p>
      <div className="chip-row">
        {cluster.items.map((item) => (
          <span key={item} className="chip chip--muted">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

export default SkillClusterCard;
