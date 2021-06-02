import {build} from "esbuild";
import {renderFile} from "ejs";
import {rm, writeFile} from "fs/promises";

async function main() {
  await rm("dist", { recursive: true });

  await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: "dist/static",
    tsconfig: "tsconfig.browser.json",
    watch: {
      async onRebuild(error, buildResult) {
        if (error) {
          console.error(error);
          return;
        }

        const result = await renderFile(
          "./src/index.ejs",
          {
            stylePath: "/static/main.css",
            scriptPath: "/static/main.js",
          },
          {}
        );

        writeFile("./dist/index.html", result);
      },
    },
  });
}

try {
  main();
} catch (error) {
  console.log("Build failed");
  console.error(error);
  process.exit(1);
}
