declare module "*.svg" {
  import type React from "react";

  export const SVG: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
}

// The root address of the Drop API
declare const DROP_API_ROOT: string;
