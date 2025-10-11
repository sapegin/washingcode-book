import fs from 'fs';
import { globSync } from 'glob';
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

const pipe =
  (...fns) =>
  x =>
    fns.reduce((v, f) => f(v), x);

const read = file => fs.readFileSync(file, 'utf8');

/**
 * Convert Markua tips to GFM alerts
 * I> Tacocat
 * →
 * > [!NOTE] Tacocat
 */
const updateTips = contents =>
  contents
    // Replace the starting marker with a GFM alert marker
    .replaceAll(
      /\n\n([EITW]>) /gm,
      ($, marker) => `\n\n> [!${TIPS[marker]}]\n> `
    )
    // Replace the inner marker with a Markdown quote marker
    .replaceAll(/\n[EITW]>/gm, `\n>`);

/** `{#pizza}\n# Heading` → `# Heading {#pizza}` */
const updateAnchors = contents =>
  contents.replaceAll(
    /{#([\w-]+)}\n\n(#+\s*[^\n]+)/gm,
    ($, anchor, heading) => `${heading} {#${anchor}}`
  );

/**
 * Pandoc doesn't work well with SVG images in PDFs:
 * Replace them with PNG files.
 */
const updateImages = contents =>
  contents.replace(/\.svg/, '.png');

/**
 * Italicize local links so they are visible int the text.
 */
const updateLinks = contents =>
  contents.replaceAll(
    /\[([^\]]+)]\((#[\w-]+)\)/g,
    (_md, label, href) => {
      return `[_${label}_](${href})`;
    }
  );

/** Pretty typography */
const typo = contents => richtypo(rules, contents);

console.log();
console.log('[MD] Preparing Markdown files...');
const files = globSync(`${SOURCE_DIR}/*.md`);

fs.mkdirSync(DEST_DIR_EPUB, { recursive: true });
fs.mkdirSync(DEST_DIR_PDF, { recursive: true });

for (const filepath of files) {
  console.log(`[MD] 👉 ${filepath}`);
  const markuaText = read(filepath);
  const epubText = pipe(
    typo,
    updateAnchors,
    updateTips
  )(markuaText);

  fs.writeFileSync(
    filepath.replace(SOURCE_DIR, DEST_DIR_EPUB),
    epubText
  );

  const pdfText = pipe(
    typo,
    updateAnchors,
    updateTips,
    updateImages,
    updateLinks
  )(markuaText);

  fs.writeFileSync(
    filepath.replace(SOURCE_DIR, DEST_DIR_PDF),
    pdfText
  );
}

console.log();
console.log('[MD] 🦜 Done');
console.log();
