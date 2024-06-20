import fs from 'fs-extra';
import { globSync } from 'glob';
import _ from 'lodash';
import richtypo from 'richtypo';
import {
  shortWords,
  orphans,
  ellipses,
  dashesBasic,
  numberUnits,
  degreeSigns,
  prepositions,
  quotes
} from 'richtypo-rules-en';

const rules = [
  shortWords,
  prepositions,
  orphans,
  dashesBasic,
  ellipses,
  numberUnits,
  degreeSigns,
  quotes
];

const SOURCE_DIR = 'manuscript';
const DEST_DIR = 'generator/content';

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

const typo = contents => richtypo(rules, contents);

console.log();
console.log('[MD] Preparing Markdown files...');
const files = globSync(`${SOURCE_DIR}/*.md`);

fs.ensureDir(DEST_DIR);

for (const filepath of files) {
  console.log(`[MD] 👉 ${filepath}`);
  const markuaText = read(filepath);
  const gfmText = _.flow(typo, updateAnchors, updateTips)(markuaText);

  fs.writeFileSync(filepath.replace(SOURCE_DIR, DEST_DIR), gfmText);
}
