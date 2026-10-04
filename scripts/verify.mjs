#!/usr/bin/env node
// Permanent verification pipeline (see CLAUDE.md "Standard code verification"). Actually runs
// each command and reports its real exit code - never echoes PASS without the command having
// run, and stops at the first failure so a later step never masks an earlier one.
import { spawnSync } from "node:child_process";

const steps = [
  { label: "Tests", cmd: "pnpm", args: ["test"] },
  { label: "Typecheck", cmd: "pnpm", args: ["typecheck"] },
  { label: "Lint", cmd: "pnpm", args: ["lint"] },
  { label: "Build", cmd: "pnpm", args: ["build"] },
];

console.log("=".repeat(40));
console.log("90-DAY BUSINESS SCHOOL VERIFICATION");
console.log("=".repeat(40));
console.log();

const results = [];
let failedAt = null;

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  const label = `[${i + 1}/${steps.length}] ${step.label}`;
  process.stdout.write(`${label} ... running\n`);

  const result = spawnSync(step.cmd, step.args, { stdio: "inherit", shell: false });
  const passed = result.status === 0;
  results.push({ label: step.label, passed });

  console.log(`${label} ${passed ? "PASS" : "FAIL"}`);
  console.log();

  if (!passed) {
    failedAt = step.label;
    break; // stop on first failure - a later step's "pass" would be meaningless noise
  }
}

console.log("=".repeat(40));
for (const r of results) {
  console.log(`${r.passed ? "PASS" : "FAIL"} - ${r.label}`);
}
console.log("=".repeat(40));

if (failedAt) {
  console.log(`VERIFICATION: FAIL (stopped at "${failedAt}")`);
  process.exit(1);
}

console.log("VERIFICATION: PASS");
process.exit(0);
