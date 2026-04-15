import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface UserStory {
  description: string;
  category?: string;
  steps: string[];
  passes: boolean;
}

async function findJsonFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findJsonFiles(fullPath)));
    } else if (entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files;
}

function validateStory(story: unknown, index: number, file: string): string[] {
  const errors: string[] = [];
  if (typeof story !== "object" || story === null) {
    errors.push(`  [${index}] Not an object`);
    return errors;
  }
  const s = story as Record<string, unknown>;
  if (typeof s.description !== "string" || !s.description) {
    errors.push(`  [${index}] Missing or invalid "description"`);
  }
  if (!Array.isArray(s.steps) || s.steps.length === 0) {
    errors.push(`  [${index}] Missing or empty "steps" array`);
  } else if (s.steps.some((step: unknown) => typeof step !== "string")) {
    errors.push(`  [${index}] All steps must be strings`);
  }
  if (typeof s.passes !== "boolean") {
    errors.push(`  [${index}] Missing or invalid "passes" (must be boolean)`);
  }
  return errors;
}

async function main() {
  const storiesDir = join(process.cwd(), "docs/user-stories");
  const files = await findJsonFiles(storiesDir);

  if (files.length === 0) {
    console.log("No user story files found in docs/user-stories/");
    process.exit(1);
  }

  let totalStories = 0;
  let totalPassing = 0;
  let hasErrors = false;

  console.log("\n📋 User Stories Verification\n");

  for (const file of files) {
    const relative = file.replace(process.cwd() + "/", "");
    const content = await readFile(file, "utf-8");

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.log(`❌ ${relative}: Invalid JSON`);
      hasErrors = true;
      continue;
    }

    if (!Array.isArray(parsed)) {
      console.log(`❌ ${relative}: Root must be an array`);
      hasErrors = true;
      continue;
    }

    const stories = parsed as UserStory[];
    const passing = stories.filter((s) => s.passes === true).length;
    totalStories += stories.length;
    totalPassing += passing;

    const allErrors: string[] = [];
    stories.forEach((story, i) => {
      allErrors.push(...validateStory(story, i, file));
    });

    if (allErrors.length > 0) {
      console.log(`❌ ${relative}: ${passing}/${stories.length} passing`);
      allErrors.forEach((e) => console.log(e));
      hasErrors = true;
    } else {
      const icon = passing === stories.length ? "✅" : "🔲";
      console.log(`${icon} ${relative}: ${passing}/${stories.length} passing`);
    }
  }

  console.log(`\n📊 Total: ${totalPassing}/${totalStories} stories passing\n`);

  if (hasErrors) process.exit(1);
  if (totalPassing < totalStories) process.exit(0);
  console.log("🎉 All stories passing!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
