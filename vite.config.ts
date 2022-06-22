import esbuild from 'esbuild'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'

import { transform } from '@svgr/core'
import react from '@vitejs/plugin-react'

function svg() {
  return {
    name: 'svgr',
    async transform(src: string, id: string) {
      if (!id.endsWith('.svg')) {
        return
      }

      const content = await readFile(id)
      const component = (
        await transform(content.toString(), {}, { componentName: 'SVG' })
      ).replace('export default SVG', 'export { SVG }')
      const result = await esbuild.transform(`${component}\n${src}`, {
        loader: 'jsx',
      })
      return {
        code: result.code,
        // map: result.map, // doesn't seem to work with vite build
      }
    },
  }
}

export default ({ mode }) => {
  return defineConfig({
    plugins: [react(), svg()],
    root: 'web',
    build: {
      sourcemap: true,
      outDir: '../internal/web/static',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, '/web'),
      },
    },
    define: {
      DROP_API_ROOT:
        mode === 'development' ? "'http://localhost:8080/api/v1'" : "'/api/v1'",
      'process.env': {},
    },
  })
}
