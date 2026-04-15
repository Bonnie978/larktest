import { execSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

const MAX_ITERATIONS = 14;
const PROJECT_DIR = join(import.meta.dirname, "..");
const PROMPT_FILE = join(import.meta.dirname, "prompt.md");

function countIncompleteStories(): number {
  const storiesDir = join(PROJECT_DIR, "docs/user-stories");
  let incomplete = 0;
  const files = execSync(`find ${storiesDir} -name '*.json'`, {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of files) {
    const content = JSON.parse(readFileSync(file, "utf-8"));
    incomplete += content.filter(
      (s: { passes: boolean }) => !s.passes
    ).length;
  }
  return incomplete;
}

function runAgent(iteration: number, extraPrompt?: string): void {
  const prompt = readFileSync(PROMPT_FILE, "utf-8");
  const fullPrompt = extraPrompt
    ? `${prompt}\n\n## Additional Context\n\n${extraPrompt}`
    : prompt;

  console.log(`\n🤖 Ralph Iteration ${iteration}`);
  console.log(`📋 Incomplete stories: ${countIncompleteStories()}`);
  console.log("─".repeat(50));

  try {
    execSync(
      `cd "${PROJECT_DIR}" && claude --print "${fullPrompt.replace(/"/g, '\\"')}"`,
      {
        stdio: "inherit",
        timeout: 600_000, // 10 min per iteration
      }
    );
  } catch (err) {
    console.error(`⚠️ Iteration ${iteration} encountered an error`);
  }
}

function main() {
  const extraPrompt = process.argv
    .slice(2)
    .find((a) => a.startsWith("--prompt="))
    ?.replace("--prompt=", "");

  console.log("🚀 Ralph Agent Loop Starting");
  console.log(`📂 Project: ${PROJECT_DIR}`);
  console.log(`🔄 Max iterations: ${MAX_ITERATIONS}`);

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    const remaining = countIncompleteStories();
    if (remaining === 0) {
      console.log("\n🎉 All stories passing! Ralph is done.");
      break;
    }
    runAgent(i, extraPrompt);
  }

  const final = countIncompleteStories();
  if (final > 0) {
    console.log(`\n⚠️ ${final} stories still incomplete after ${MAX_ITERATIONS} iterations`);
  }
}

main();
