import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watchTriggerPatterns: [
      {
        // Rerun tests on changes in book Markdown files
        pattern: /^(.*)\.md$/,
        testsToRun: () => {
          return `./test/code.spec.mjs`;
        }
      }
    ]
  }
});
