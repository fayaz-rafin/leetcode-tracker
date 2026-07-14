import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Generation and validation do not need a live database connection.
    url:
      process.env.DATABASE_URL ??
      "postgresql://localhost:5432/leetcode_tracker",
  },
});
