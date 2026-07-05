import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // dotenv/config: local runs pick up the factory-injected .env (dev database);
  // CI provides DATABASE_URL via the workflow's postgres service.
  test: { include: ["test/**/*.test.ts"], setupFiles: ["dotenv/config"] },
});
