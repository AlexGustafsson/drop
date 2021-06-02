import { build } from "esbuild";
import { renderFile } from "ejs";
import postcss from "postcss";
import atImport from "postcss-import";
import cssnano from "cssnano";
import { rm, readFile, writeFile, readdir } from "fs/promises";

async function main() {
  await rm("dist", { force: true, recursive: true });

  await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: "dist/static",
    tsconfig: "tsconfig.browser.json",
    watch: {
      async onRebuild(error) {
        if (error) {
          console.error(error);
          return;
        }

        const files: [string] = await readdir("./dist/static");
        console.log(files);
        const mainScriptPath = files.find(x => x === "main.js");

        const css = await readFile("./src/main.css");
        const styleResult = await postcss()
          .use(atImport())
          .use(cssnano())
          .process(css, {
            from: "src/main.css",
            to: "dist/static/main.css",
            map: {
              inline: false,
            },
          });

        await writeFile(`./dist/static/main.css`, styleResult.css);
        await writeFile(`./dist/static/main.css.map`, styleResult.map.toString());

        const result = await renderFile(
          "./src/index.ejs",
          {
            stylePath: `/static/main.css`,
            scriptPath: `/static/${mainScriptPath}`,
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
