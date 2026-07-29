import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateArtifact } from "./validate-artifact.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const runtimeRoot = path.join(projectRoot, ".sites-runtime");
const timeoutMs = Number.parseInt(
  process.env.SITES_BUILD_TIMEOUT_MS || "180000",
  10,
);

await Promise.all([
  mkdir(path.join(runtimeRoot, "npm-cache"), { recursive: true }),
  mkdir(path.join(runtimeRoot, "tmp"), { recursive: true }),
  mkdir(path.join(runtimeRoot, "wrangler", "logs"), { recursive: true }),
]);

const env = {
  ...process.env,
  npm_config_cache: path.join(runtimeRoot, "npm-cache"),
  npm_config_audit: "false",
  npm_config_fund: "false",
  npm_config_update_notifier: "false",
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: path.join(runtimeRoot, "wrangler", "logs"),
  MINIFLARE_REGISTRY_PATH: path.join(runtimeRoot, "wrangler", "registry"),
};

const vinextCli = path.join(
  projectRoot,
  "node_modules",
  "vinext",
  "dist",
  "cli.js",
);

console.log("Running bounded vinext build...");
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [vinextCli, "build"], {
    cwd: projectRoot,
    env,
    stdio: "inherit",
  });
  const timer = setTimeout(() => {
    child.kill("SIGTERM");
    reject(new Error(`vinext build exceeded ${timeoutMs}ms`));
  }, timeoutMs);

  child.once("error", (error) => {
    clearTimeout(timer);
    reject(error);
  });
  child.once("exit", (code, signal) => {
    clearTimeout(timer);
    if (code === 0) {
      resolve();
      return;
    }
    reject(
      new Error(
        `vinext build failed${signal ? ` with ${signal}` : ` with exit code ${code}`}`,
      ),
    );
  });
});

await validateArtifact(projectRoot);
