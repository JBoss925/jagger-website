import Editor, { type Monaco } from "@monaco-editor/react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import SiteNavigation from "../../components/SiteNavigation";
import { usePageReveal } from "../../hooks/usePageReveal";
import { defaultExampleId, jaggerscriptExamples } from "../../content/jaggerscriptExamples";
import { profileContent } from "../../content/profile";
import { loadExample, run } from "../../lib/jaggerscript/bridge";
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
  const isPageReady = usePageReveal();
  const initialExample = useMemo(() => loadExample(defaultExampleId), []);
  const [selectedExampleId, setSelectedExampleId] = useState(initialExample.id);
  const [source, setSource] = useState(initialExample.source);
  const [output, setOutput] = useState<string[]>([
    "Load an example, edit the program, and run it to inspect the runtime."
  ]);

  const selectedExample = loadExample(selectedExampleId);
  const deferredOutput = useDeferredValue(output.join("\n"));

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

  return (
    <div className={isPageReady ? "page-shell page-shell--ready ide-page" : "page-shell page-shell--entering ide-page"}>
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>
      <SiteNavigation sections={profileContent.sceneSections} />

      <main className="content-shell ide-shell">
        <section className="ide-hero glass-card">
          <div className="ide-hero__intro">
            <span className="section-heading__eyebrow">Interactive language project</span>
            <h1>JaggerScript Playground</h1>
            <p>{profileContent.jaggerscriptIntro.summary}</p>
          </div>
          <div className="ide-hero__actions">
            <button type="button" className="cta-button" onClick={handleRun}>
              Run program
            </button>
            <button type="button" className="cta-button cta-button--secondary" onClick={handleReset}>
              Reset example
            </button>
          </div>
        </section>

        <section className="glass-card ide-example-strip">
          <div className="ide-example-strip__header">
            <div>
              <span className="section-heading__eyebrow">Examples</span>
              <h2>{selectedExample.title}</h2>
            </div>
            <p>{selectedExample.description}</p>
          </div>
          <div className="example-list" role="list">
            {jaggerscriptExamples.map((example) => (
              <button
                key={example.id}
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
        </section>

        <section className="ide-panels ide-panels--playground">
          <article className="glass-card ide-panel ide-panel--editor">
            <header className="ide-panel__header">
              <div>
                <h3>Source</h3>
                <span>Editable browser interpreter input</span>
              </div>
              <div className="chip-row">
                {profileContent.jaggerscriptIntro.bullets.slice(0, 2).map((bullet) => (
                  <span key={bullet} className="chip chip--muted">
                    {bullet}
                  </span>
                ))}
              </div>
            </header>
            <div className="ide-editor ide-editor--wide">
              <Editor
                beforeMount={configureJaggerScriptMonaco}
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

          <article className="glass-card ide-panel ide-panel--console">
            <header className="ide-panel__header">
              <div>
                <h3>Console</h3>
                <span>Interpreter output</span>
              </div>
            </header>
            <pre className="console-output">{deferredOutput}</pre>
          </article>
        </section>
      </main>
    </div>
  );
}

export default JaggerScriptPage;
