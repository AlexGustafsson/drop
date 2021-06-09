import {build} from "esbuild";
import {renderFile} from "ejs";
import postcss from "postcss";
import atImport from "postcss-import";
import cssnano from "cssnano";
import {rm, readFile, writeFile, readdir} from "fs/promises";
import {createHash} from "crypto";

async function main() {
  await rm("dist", { force: true, recursive: true });

  const buildResult = await build({
    entryPoints: ["src/main.ts", "src/worker.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: "dist/static",
    entryNames: "[dir]/[name]-[hash]",
    tsconfig: "tsconfig.browser.json",
  });

  const files: string[] = await readdir("./dist/static");
  const mainScriptPath = files.find(x => x.match(/^main-.*\.js$/));
  const workerScriptPath = files.find(x => x.match(/^worker-.*\.js$/));

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

  const mainScript = (await readFile(`./dist/static/${mainScriptPath}`)).toString();
  await writeFile(`./dist/static/${mainScriptPath}`, mainScript.replace(/\/static\/worker.js/, `/static/${workerScriptPath}`));

  const styleHash = createHash("md5").update(styleResult.css).digest("base64url").substr(0, 8).toUpperCase();
  await writeFile(`./dist/static/main-${styleHash}.css`, styleResult.css);
  await writeFile(`./dist/static/main-${styleHash}.css.map`, styleResult.map.toString());

  const result = await renderFile(
    "./src/index.ejs",
    {
      stylePath: `/static/main-${styleHash}.css`,
      scriptPath: `/static/${mainScriptPath}`,
    },
    {}
  );

  await writeFile("./dist/index.html", result);
}

try {
  main();
} catch (error) {
  console.log("Build failed");
  console.error(error);
  process.exit(1);
}
