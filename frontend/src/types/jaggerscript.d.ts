declare module "@jaggerscript" {
  import type { ComponentType } from "react";

  export type JaggerScriptExample = {
    id: string;
    title: string;
    description: string;
    source: string;
  };

  export type JaggerScriptEditorProps = {
    initialSource?: string;
    initialExampleId?: string;
    examples?: JaggerScriptExample[];
    className?: string;
  };

  export const JaggerScriptEditor: ComponentType<JaggerScriptEditorProps>;
  export const jaggerscriptExamples: JaggerScriptExample[];
}

declare module "@jaggerscript/styles.css";
