import { defineConfig } from "vitest/config";

export default defineConfig({
  // dotenv/config: local runs pick up the factory-injected .env (dev database);
  // CI provides DATABASE_URL via the workflow's postgres service.
  test: { include: ["test/**/*.test.ts"], setupFiles: ["dotenv/config"] },
});
