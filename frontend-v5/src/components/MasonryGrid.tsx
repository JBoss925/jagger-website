import { Children, useLayoutEffect, useRef, type ReactNode } from "react";

type MasonryGridProps = {
  children: ReactNode;
  className: string;
  wideItemIndexes?: number[];
};

const DESKTOP_MASONRY_QUERY = "(min-width: 1181px)";

function MasonryGrid({ children, className, wideItemIndexes = [] }: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") return;

    const items = Array.from(grid.querySelectorAll<HTMLElement>(":scope > .masonry-grid__item"));
    const mediaQuery = window.matchMedia(DESKTOP_MASONRY_QUERY);
    let frame = 0;

    const layout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!mediaQuery.matches) {
          items.forEach((item) => item.style.removeProperty("grid-row-end"));
          return;
        }

        const styles = getComputedStyle(grid);
        const rowHeight = Number.parseFloat(styles.gridAutoRows) || 1;
        const rowGap = Number.parseFloat(styles.rowGap) || 0;

        items.forEach((item) => {
          const card = item.firstElementChild as HTMLElement | null;
          if (!card) return;
          const span = Math.ceil((card.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
          item.style.gridRowEnd = `span ${span}`;
        });
      });
    };

    const observer = new ResizeObserver(layout);
    items.forEach((item) => {
      const card = item.firstElementChild;
      if (card) observer.observe(card);
    });
    mediaQuery.addEventListener("change", layout);
    layout();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mediaQuery.removeEventListener("change", layout);
    };
  }, []);

  const wideItems = new Set(wideItemIndexes);

  return (
    <div ref={gridRef} className={`${className} masonry-grid`}>
      {Children.map(children, (child, index) => (
        <div className={`masonry-grid__item${wideItems.has(index) ? " masonry-grid__item--wide" : ""}`}>
          {child}
        </div>
      ))}
    </div>
  );
}

export default MasonryGrid;
