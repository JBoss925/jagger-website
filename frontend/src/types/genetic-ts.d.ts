declare module "@genetic-ts" {
  import type { ComponentType } from "react";

  export type GeneticTsPageProps = {
    standalone?: boolean;
  };

  export const GeneticTsPage: ComponentType<GeneticTsPageProps>;
}
