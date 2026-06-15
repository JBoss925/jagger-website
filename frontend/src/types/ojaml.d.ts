declare module "@ojaml" {
  import type { ComponentType } from "react";

  export type OJamlExample = {
    id: string;
    title: string;
    source: string;
  };

  export type OJamlEditorProps = {
    initialSource?: string;
    initialExampleId?: string;
    examples?: OJamlExample[];
    className?: string;
  };

  export const OJamlEditor: ComponentType<OJamlEditorProps>;
  export const ojamlExamples: OJamlExample[];
}

declare module "@ojaml/styles.css";
