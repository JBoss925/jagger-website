import Editor, { type Monaco } from "@monaco-editor/react";
import { startTransition, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SiteNavigation from "../../components/SiteNavigation";
import { usePageReveal } from "../../hooks/usePageReveal";
import { defaultExampleId, jaggerscriptExamples } from "../../content/jaggerscriptExamples";
import { profileContent } from "../../content/profile";
import { loadExample, run } from "../../lib/jaggerscript/bridge";
import { getJaggerScriptSyntaxMarkers } from "../../lib/jaggerscript/diagnostics";
import { monarchJaggerScriptTokenizer } from "../../lib/jaggerscript/monarchJaggerScriptTokenizer";

function configureJaggerScriptMonaco(monaco: Monaco) {
  const languageId = "JaggerScript";

  if (
    !monaco.languages
      .getLanguages()
      .some((language: { id: string }) => language.id === languageId)
  ) {
    monaco.languages.register({ id: languageId });
  }

  monaco.languages.setMonarchTokensProvider(languageId, monarchJaggerScriptTokenizer);
  monaco.editor.defineTheme("atlas-night", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6f8ca7" },
      { token: "keyword", foreground: "7fd7ff" },
      { token: "string", foreground: "9be0b6" },
      { token: "number", foreground: "f7c67d" },
      { token: "console", foreground: "d8a7c9" },
      { token: "funcName", foreground: "45d8be" },
      { token: "operator", foreground: "ede7a4" },
      { token: "type.identifier", foreground: "93b7ff" }
    ],
    colors: {
      "editor.background": "#07101c",
      "editorLineNumber.foreground": "#46617d",
      "editorLineNumber.activeForeground": "#9cc6ff",
      "editor.selectionBackground": "#14304a",
      "editor.inactiveSelectionBackground": "#10263b"
    }
  });
}

function JaggerScriptPage() {
  const markerOwner = "jaggerscript-syntax";
  const isPageReady = usePageReveal();
  const initialExample = useMemo(() => loadExample(defaultExampleId), []);
  const [selectedExampleId, setSelectedExampleId] = useState(initialExample.id);
  const [source, setSource] = useState(initialExample.source);
  const [output, setOutput] = useState<string[]>([`Loaded ${initialExample.title}.`]);
  const editorMonacoRef = useRef<Monaco | null>(null);
  const editorModelRef = useRef<Parameters<NonNullable<Monaco["editor"]["setModelMarkers"]>>[1] | null>(null);
  const exampleRailRef = useRef<HTMLDivElement | null>(null);
  const hasInitializedExampleRail = useRef(false);

  const selectedExample = loadExample(selectedExampleId);
  const selectedExampleIndex = jaggerscriptExamples.findIndex((example) => example.id === selectedExampleId);
  const deferredOutput = useDeferredValue(output.join("\n"));

  useLayoutEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
  }, []);

  const handleLoadExample = (exampleId: string) => {
    const example = loadExample(exampleId);
    setSelectedExampleId(example.id);
    startTransition(() => setSource(example.source));
    setOutput([`Loaded ${example.title}.`]);
  };

  const handleRun = () => {
    setOutput(run(source));
  };

  const handleReset = () => {
    handleLoadExample(selectedExampleId);
  };

  const scrollSelectedExampleIntoView = (behavior: ScrollBehavior) => {
    const rail = exampleRailRef.current;

    if (!rail) {
      return;
    }

    const selectedCard = rail.querySelector<HTMLButtonElement>(
      `[data-example-id="${selectedExampleId}"]`
    );

    if (!selectedCard) {
      return;
    }

    const fadeInset = 48;
    const railPadding = 18;
    const targetLeft = Math.max(0, selectedCard.offsetLeft - fadeInset - railPadding);

    if (typeof rail.scrollTo === "function") {
      rail.scrollTo({ left: targetLeft, behavior });
    } else {
      rail.scrollLeft = targetLeft;
    }
  };

  const handleSelectAdjacentExample = (direction: "previous" | "next") => {
    if (selectedExampleIndex < 0) {
      return;
    }

    const nextIndex =
      direction === "previous"
        ? Math.max(0, selectedExampleIndex - 1)
        : Math.min(jaggerscriptExamples.length - 1, selectedExampleIndex + 1);

    if (nextIndex === selectedExampleIndex) {
      return;
    }

    handleLoadExample(jaggerscriptExamples[nextIndex].id);
  };

  useEffect(() => {
    if (!hasInitializedExampleRail.current) {
      hasInitializedExampleRail.current = true;
      scrollSelectedExampleIntoView("auto");
      return;
    }

    scrollSelectedExampleIntoView("smooth");
  }, [selectedExampleId]);

  useEffect(() => {
    if (!editorMonacoRef.current || !editorModelRef.current) {
      return;
    }

    const handle = window.setTimeout(() => {
      const monaco = editorMonacoRef.current;
      const model = editorModelRef.current;

      if (!monaco || !model) {
        return;
      }

      const markers = getJaggerScriptSyntaxMarkers(source, monaco.MarkerSeverity.Error);
      monaco.editor.setModelMarkers(model, markerOwner, markers);
    }, 150);

    return () => window.clearTimeout(handle);
  }, [markerOwner, source]);

  const handleEditorMount = (
    editor: { getModel: () => Parameters<NonNullable<Monaco["editor"]["setModelMarkers"]>>[1] | null },
    monaco: Monaco
  ) => {
    editorMonacoRef.current = monaco;
    editorModelRef.current = editor.getModel();

    if (editorModelRef.current) {
      const markers = getJaggerScriptSyntaxMarkers(source, monaco.MarkerSeverity.Error);
      monaco.editor.setModelMarkers(editorModelRef.current, markerOwner, markers);
    }
  };

  return (
    <div className={isPageReady ? "page-shell page-shell--ready ide-page" : "page-shell page-shell--entering ide-page"}>
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>
      <SiteNavigation sections={profileContent.sceneSections} />

      <main className="content-shell ide-shell">
        <section className="glass-card ide-workspace">
          <header className="ide-workspace__header">
            <div>
              <h1 className="ide-workspace__title">JaggerScript</h1>
              <p>A browser runner for a small strongly typed scripting language with a real parser and interpreter.</p>
            </div>
          </header>

          <div className="ide-workspace__example-meta">
            <span className="section-heading__eyebrow">Examples</span>
          </div>

          <div className="ide-example-rail">
            <button
              type="button"
              className="ide-example-rail__nav ide-example-rail__nav--previous"
              aria-label="Previous example"
              onClick={() => handleSelectAdjacentExample("previous")}
              disabled={selectedExampleIndex <= 0}
            >
              <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                <path d="M10.5 3.5 6 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div
              ref={exampleRailRef}
              className="ide-example-rail__scroller"
              role="list"
              aria-label="Examples"
            >
              {jaggerscriptExamples.map((example) => (
                <button
                  key={example.id}
                  data-example-id={example.id}
                  type="button"
                  className={
                    example.id === selectedExampleId
                      ? "example-card is-active"
                      : "example-card"
                  }
                  onClick={() => handleLoadExample(example.id)}
                >
                  <strong>{example.title}</strong>
                  <span>{example.description}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="ide-example-rail__nav ide-example-rail__nav--next"
              aria-label="Next example"
              onClick={() => handleSelectAdjacentExample("next")}
              disabled={selectedExampleIndex >= jaggerscriptExamples.length - 1}
            >
              <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                <path d="M5.5 3.5 10 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="ide-workspace__body">
            <article className="ide-panel ide-panel--editor">
            <header className="ide-panel__header">
              <div>
                <h3>Source</h3>
                <span>Editable browser interpreter input</span>
              </div>
              <div className="ide-panel__actions">
                <button type="button" className="cta-button cta-button--secondary" onClick={handleReset}>
                  Reset example
                </button>
                <button type="button" className="ide-run-button" onClick={handleRun}>
                  <span className="ide-run-button__icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" focusable="false">
                      <path d="M4 3.5v9l8-4.5-8-4.5Z" fill="currentColor" />
                    </svg>
                  </span>
                  <span>Run</span>
                </button>
              </div>
            </header>
            <div className="ide-editor ide-editor--wide">
              <Editor
                beforeMount={configureJaggerScriptMonaco}
                onMount={handleEditorMount}
                defaultLanguage="JaggerScript"
                language="JaggerScript"
                theme="atlas-night"
                value={source}
                onChange={(value) => setSource(value ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 3,
                  wordWrap: "on"
                }}
              />
            </div>
            </article>

            <article className="ide-panel ide-panel--console">
            <header className="ide-panel__header">
              <div>
                <h3>Console</h3>
                <span>Interpreter output</span>
              </div>
            </header>
            <pre className="console-output">{deferredOutput}</pre>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}

export default JaggerScriptPage;
