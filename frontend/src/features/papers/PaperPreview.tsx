type PaperPreviewProps = {
  image?: string;
  alt?: string;
};

function PaperPreview({ image, alt }: PaperPreviewProps) {
  if (image) {
    return (
      <div className="paper-preview-art paper-preview-art--image">
        <img src={image} alt={alt ?? "Paper preview"} />
      </div>
    );
  }

  return (
    <div className="paper-preview-art" aria-hidden="true">
      <div className="paper-preview-art__header">
        <span />
        <span />
        <span />
      </div>
      <svg viewBox="0 0 520 300" role="img" aria-label="Hearth paper preview">
        <path className="paper-preview-art__axis" d="M42 234 H482 M42 234 V38" />
        <path className="paper-preview-art__curve" d="M58 224 C136 224 144 184 194 150 C244 116 280 186 326 146 C376 102 392 76 462 76" />
        <path className="paper-preview-art__flow" d="M76 72 H166 M188 72 H278 M300 72 H390 M412 72 H462" />
        <g>
          <rect x="68" y="52" width="76" height="40" />
          <rect x="178" y="52" width="76" height="40" />
          <rect x="288" y="52" width="76" height="40" />
          <rect x="398" y="52" width="76" height="40" />
        </g>
        <g className="paper-preview-art__bars">
          <rect x="92" y="194" width="26" height="40" />
          <rect x="132" y="168" width="26" height="66" />
          <rect x="172" y="142" width="26" height="92" />
          <rect x="212" y="160" width="26" height="74" />
          <rect x="252" y="188" width="26" height="46" />
        </g>
      </svg>
    </div>
  );
}

export default PaperPreview;
