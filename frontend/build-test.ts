import { build } from "esbuild";
import { rm, writeFile } from "fs/promises";
import {promisify} from "util";
import {default as originalGlob} from "glob";
import { render } from "ejs";

const glob = promisify(originalGlob);

const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8" />
  <title>Mocha</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="/node_modules/mocha/mocha.css" />
</head>

<body>
  <div id="mocha"></div>
  <script src="/node_modules/mocha/mocha.js"></script>
  <script src="/node_modules/source-map-support/browser-source-map-support.js"></script>
  <script>
  sourceMapSupport.install();
  mocha.setup("bdd");
  </script>
  <% for(let i = 0; i < tests.length; i++) { %>
    <script src="/dist/test/<%=tests[i]%>"></script>
  <% } %>
  <script>
  mocha.run();
  </script>
</body>

</html>
`;

async function main() {
  await rm("dist", { force: true, recursive: true });

  const entryPoints = await glob("src/**/*.test.ts");

  await build({
    entryPoints: entryPoints,
    bundle: true,
    sourcemap: true,
    outdir: "dist/test/src",
    tsconfig: "tsconfig.browser.test.json",
    outbase: "src",
    watch: {
      async onRebuild(error) {
        if (error) {
          console.error(error);
          return;
        }

        const result = await render(html, { tests: entryPoints.map(x => x.replace(/\.ts$/, ".js")) }, {});
        await writeFile("./dist/test/index.html", result);
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
