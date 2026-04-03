import Editor, { type Monaco } from "@monaco-editor/react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import SiteNavigation from "../../components/SiteNavigation";
import { defaultExampleId, jaggerscriptExamples } from "../../content/jaggerscriptExamples";
import { profileContent } from "../../content/profile";
import { loadExample, run } from "../../lib/jaggerscript/bridge";

function defineEditorTheme(monaco: Monaco) {
  monaco.editor.defineTheme("atlas-night", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6f8ca7" },
      { token: "keyword", foreground: "7fd7ff" },
      { token: "string", foreground: "9be0b6" },
      { token: "number", foreground: "f7c67d" }
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
    <div className="page-shell ide-page">
      <div className="scene-static" aria-hidden="true">
        <div className="scene-static__gradient" />
        <div className="scene-static__grid" />
      </div>
      <SiteNavigation sections={profileContent.sceneSections} />

      <main className="content-shell ide-shell">
        <section className="ide-hero glass-card">
          <div>
            <span className="section-heading__eyebrow">Interactive language project</span>
            <h1>JaggerScript Playground</h1>
            <p>{profileContent.jaggerscriptIntro.summary}</p>
          </div>
          <div className="chip-row">
            {profileContent.jaggerscriptIntro.bullets.map((bullet) => (
              <span key={bullet} className="chip chip--muted">
                {bullet}
              </span>
            ))}
          </div>
        </section>

        <section className="ide-layout">
          <aside className="glass-card ide-sidebar">
            <div className="ide-sidebar__section">
              <h2>Examples</h2>
              <p>
                Each example comes directly from the language repo so the playground stays tied to the real runtime surface.
              </p>
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
            <div className="ide-sidebar__section">
              <h2>What it shows</h2>
              <p>{profileContent.jaggerscriptIntro.headline}</p>
            </div>
          </aside>

          <div className="ide-workspace">
            <div className="glass-card ide-toolbar">
              <div>
                <span className="section-heading__eyebrow">Current example</span>
                <h2>{selectedExample.title}</h2>
                <p>{selectedExample.description}</p>
              </div>
              <div className="ide-toolbar__actions">
                <button type="button" className="cta-button" onClick={handleRun}>
                  Run program
                </button>
                <button type="button" className="cta-button cta-button--secondary" onClick={handleReset}>
                  Reset example
                </button>
              </div>
            </div>

            <div className="ide-panels">
              <article className="glass-card ide-panel">
                <header className="ide-panel__header">
                  <h3>Source</h3>
                  <span>Editable browser interpreter input</span>
                </header>
                <div className="ide-editor">
                  <Editor
                    beforeMount={defineEditorTheme}
                    defaultLanguage="typescript"
                    language="typescript"
                    theme="atlas-night"
                    value={source}
                    onChange={(value) => setSource(value ?? "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      lineNumbersMinChars: 3,
                      wordWrap: "on"
                    }}
                  />
                </div>
              </article>

              <article className="glass-card ide-panel ide-panel--console">
                <header className="ide-panel__header">
                  <h3>Console</h3>
                  <span>Interpreter output</span>
                </header>
                <pre className="console-output">{deferredOutput}</pre>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default JaggerScriptPage;
