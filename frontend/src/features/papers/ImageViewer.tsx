import { useEffect, useState } from "react";

type ImageViewerProps = {
  alt: string;
  caption?: string;
  image: string;
  onClose: () => void;
};

function ImageViewer({ alt, caption, image, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if ((event.key === "+" || event.key === "=") && !event.metaKey && !event.ctrlKey) {
        setZoom((currentZoom) => Math.min(3, Number((currentZoom + 0.25).toFixed(2))));
      }
      if (event.key === "-" && !event.metaKey && !event.ctrlKey) {
        setZoom((currentZoom) => Math.max(1, Number((currentZoom - 0.25).toFixed(2))));
      }
      if (event.key === "0" && !event.metaKey && !event.ctrlKey) {
        setZoom(1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="paper-image-viewer" role="dialog" aria-modal="true" aria-label="Image preview">
      <button
        type="button"
        className="paper-image-viewer__backdrop"
        aria-label="Close image preview"
        onClick={onClose}
      />
      <div className="paper-image-viewer__bar">
        <div>
          <strong>Image preview</strong>
          {caption ? <span>{caption}</span> : null}
        </div>
        <div className="paper-image-viewer__controls" aria-label="Image zoom controls">
          <button type="button" onClick={() => setZoom((currentZoom) => Math.max(1, Number((currentZoom - 0.25).toFixed(2))))}>
            -
          </button>
          <button type="button" onClick={() => setZoom(1)}>
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" onClick={() => setZoom((currentZoom) => Math.min(3, Number((currentZoom + 0.25).toFixed(2))))}>
            +
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div
        className="paper-image-viewer__stage"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <img src={image} alt={alt} style={{ width: `${zoom * 100}%` }} />
      </div>
    </div>
  );
}

export default ImageViewer;
