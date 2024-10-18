// Lint Markdown files

import fs from 'fs-extra';
import { globSync } from 'glob';

const CHAPTERS_DIR = 'manuscript/';
const IGNORE_CHAPTERS = ['manuscript/160_Footer.md'];

let hasErrors = false;

const read = (file: string) => fs.readFileSync(file, 'utf8');

const getIds = (
  contents: string
): { id: string; title: string }[] => {
  const headings = contents.match(
    /{#[^}]+}\n\n##?\s+[^\n]+/gm
  );
  if (headings === null) {
    return [];
  }

  return headings.map(heading => {
    const match =
      heading.match(/{#([^}]+)}\n\n##?\s+([^\n]+)/m) ?? [];
    return {
      id: match[1],
      title: match[2]
    };
  });
};

/**
 * Read the files
 */
console.log('[LINT] Reading chapters...');

const allLinks: Record<string, string> = {};

const files = globSync(`${CHAPTERS_DIR}/*.md`);
const chapters = files.flatMap(filepath => {
  if (IGNORE_CHAPTERS.includes(filepath)) {
    return [];
  }

  const contents = read(filepath);

  const ids = getIds(contents);

  // Collect all links and check duplicate IDs
  for (const { id, title } of ids) {
    if (allLinks[id]) {
      console.error(
        `[LINT] 🦀 Link with ID #${id} already exists, linked as “${title}”`
      );
      hasErrors = true;
      continue;
    }

    allLinks[id] = title;
  }

  return {
    file: filepath,
    contents
  };
});

/**
 * Check the links
 */
console.log('[LINT] Checking links...');
console.log();

for (const chapter of chapters) {
  console.log(`[LINT] 👉 ${chapter.file}`);

  const links =
    chapter.contents.match(/\[.*?]\(#.*?\)/g) ?? [];

  for (const linkMarkdown of links) {
    const [, linkLabel, id] =
      linkMarkdown.match(/\[(.*?)]\(#(.*?)\)/) ?? [];
    const chapterTitle = allLinks[id];
    if (chapterTitle === undefined) {
      console.error(
        `[LINT] 🦀 Chapter with ID #${id} not found, linked as “${linkLabel}”`
      );
      hasErrors = true;
      continue;
    }

    if (linkLabel !== chapterTitle) {
      console.error(
        `[LINT] 🦀 Link label doesn’t match chapter title #${id}: chapter “${chapterTitle}” linked as “${linkLabel}”`
      );
      hasErrors = true;
    }
  }
}

console.log();
console.log('[BOOK] Done 🦜');

if (hasErrors) {
  process.exit(1);
}
