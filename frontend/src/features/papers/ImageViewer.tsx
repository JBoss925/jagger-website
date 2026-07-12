import { useEffect, useState } from "react";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const DEFAULT_ZOOM = 1;

type ImageViewerProps = {
  alt: string;
  caption?: string;
  image: string;
  onClose: () => void;
};

function clampZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(zoom.toFixed(2))));
}

function zoomIn(currentZoom: number) {
  if (currentZoom < ZOOM_STEP) {
    return ZOOM_STEP;
  }

  return clampZoom(currentZoom + ZOOM_STEP);
}

function zoomOut(currentZoom: number) {
  const nextZoom = clampZoom(currentZoom - ZOOM_STEP);

  if (nextZoom < ZOOM_STEP) {
    return MIN_ZOOM;
  }

  return nextZoom;
}

function ImageViewer({ alt, caption, image, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const isMinZoom = zoom <= MIN_ZOOM;
  const isMaxZoom = zoom >= MAX_ZOOM;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if ((event.key === "+" || event.key === "=") && !event.metaKey && !event.ctrlKey) {
        setZoom(zoomIn);
      }
      if (event.key === "-" && !event.metaKey && !event.ctrlKey) {
        setZoom(zoomOut);
      }
      if (event.key === "0" && !event.metaKey && !event.ctrlKey) {
        setZoom(DEFAULT_ZOOM);
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
          <button type="button" onClick={() => setZoom(zoomOut)} disabled={isMinZoom}>
            -
          </button>
          <button type="button" onClick={() => setZoom(DEFAULT_ZOOM)}>
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" onClick={() => setZoom(zoomIn)} disabled={isMaxZoom}>
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
