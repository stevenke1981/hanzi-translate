import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function validateArtifact(projectRoot = process.cwd()) {
  const workerPath = path.join(projectRoot, "dist", "server", "index.js");
  const hostingPath = path.join(
    projectRoot,
    "dist",
    ".openai",
    "hosting.json",
  );

  await Promise.all([access(workerPath), access(hostingPath)]);
  const hosting = JSON.parse(await readFile(hostingPath, "utf8"));
  assert.match(hosting.project_id ?? "", /^appgprj_[a-z0-9]+$/);

  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("sites-validation", `${process.pid}-${Date.now()}`);
  const worker = await import(workerUrl.href);
  assert.equal(
    typeof worker.default?.fetch,
    "function",
    "dist/server/index.js must export default.fetch",
  );

  console.log(
    "Validated Sites artifact: Worker default.fetch and hosting manifest are present.",
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await validateArtifact();
}
