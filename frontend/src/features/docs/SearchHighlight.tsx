import { highlightParts } from "./docSearch";

export default function SearchHighlight({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  return (
    <>
      {highlightParts(text, query).map((part, index) =>
        part.matched ? <mark key={index}>{part.text}</mark> : part.text,
      )}
    </>
  );
}
