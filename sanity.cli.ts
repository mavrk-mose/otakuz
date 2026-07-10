import { defineCliConfig } from "sanity/cli";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_SANITY_PROJECT_ID is required. Add it to .env before running Sanity CLI commands."
  );
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
