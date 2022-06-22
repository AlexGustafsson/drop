declare module '*.svg' {
  import type React from 'react'

  export const SVG: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
}
