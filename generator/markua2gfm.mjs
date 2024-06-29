import fs from 'fs-extra';
import { globSync } from 'glob';
import _ from 'lodash';
import richtypo from 'richtypo';
import rules from 'richtypo/rules/en';

/**
 * Convert Markdown files from Markua dialect used by LeanPub to
 * GitHub Flavored Markdown (GFM) / Commonmark used by Pandoc
 */

const SOURCE_DIR = 'manuscript';
const DEST_DIR_EPUB = 'generator/content-epub';
const DEST_DIR_PDF = 'generator/content-pdf';

// https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
const TIPS = {
  'I>': 'NOTE',
  'W>': 'WARNING',
  'E>': 'CAUTION',
  'T>': 'TIP'
};

const read = file => fs.readFileSync(file, 'utf8');

/** Convert Markua tips to GFM alerts */
const updateTips = contents =>
  contents.replace(
    /\n([IWET]>) /gm,
    ($, marker) => `\n> [!${TIPS[marker]}]\n> `
  );

/** `{#pizza}\n# Heading` → `# Heading {#pizza}` */
const updateAnchors = contents =>
  contents.replace(
    /\{#([\w-]+)\}\n\n(#+\s*[^\n]+)/gm,
    ($, anchor, heading) => `${heading} {#${anchor}}`
  );

/**
 * Pandoc doesn't support TSX syntax highlighting:
 * Replace it with JSX that seems to look good enough.
 */
const updateCode = contents =>
  contents.replace(/```tsx/g, '```jsx');

/**
 * Pandoc doesn't work well with SVG images in PDFs:
 * Replace them with PNG files.
 */
const updateImages = contents =>
  contents.replace(/\.svg/, '.png');

/** Pretty typography */
const typo = contents => richtypo(rules, contents);

console.log();
console.log('[MD] Preparing Markdown files...');
const files = globSync(`${SOURCE_DIR}/*.md`);

fs.ensureDir(DEST_DIR_EPUB);
fs.ensureDir(DEST_DIR_PDF);

for (const filepath of files) {
  console.log(`[MD] 👉 ${filepath}`);
  const markuaText = read(filepath);
  const epubText = _.flow(
    typo,
    updateAnchors,
    updateTips,
    updateCode
  )(markuaText);

  fs.writeFileSync(
    filepath.replace(SOURCE_DIR, DEST_DIR_EPUB),
    epubText
  );

  const pdfText = _.flow(
    typo,
    updateAnchors,
    updateTips,
    updateCode,
    updateImages
  )(markuaText);

  fs.writeFileSync(
    filepath.replace(SOURCE_DIR, DEST_DIR_PDF),
    pdfText
  );
}

console.log();
console.log('[MD] 🦜 Done');
console.log();
