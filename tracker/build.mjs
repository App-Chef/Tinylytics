// Builds the tracker into web/public/tracker.js so the dashboard serves it
// from the same origin as the ingestion API.
import { build } from "esbuild";
import { readFileSync, mkdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outfile = resolve(here, "../web/public/tracker.js");
mkdirSync(dirname(outfile), { recursive: true });

await build({
  entryPoints: [resolve(here, "src/tracker.js")],
  outfile,
  bundle: false,
  minify: true,
  target: ["es2017"],
  legalComments: "inline",
  logLevel: "warning",
});

const code = readFileSync(outfile);
const gzip = gzipSync(code).length;
console.log(`tracker.js: ${code.length} bytes, ${gzip} bytes gzipped`);

// Guard against the tracker quietly growing.
const LIMIT = 2048;
if (gzip > LIMIT) {
  console.error(`tracker.js is over the ${LIMIT} byte gzip budget`);
  process.exit(1);
}
