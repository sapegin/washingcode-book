import fs from 'node:fs';
import path from 'node:path';
import vm, {
  SourceTextModule,
  SyntheticModule
} from 'node:vm';
import _ from 'lodash';
import { globSync } from 'glob';
import { describe, test, afterEach } from 'vitest';
import { build } from 'esbuild';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { cleanup } from '@testing-library/react';
import { environment } from './environment';

// @vitest-environment happy-dom
afterEach(() => {
  // Cleanup DOM, otherwise RTL appends each render to the existing DOM
  cleanup();
});

const MANUSCRIPT_PATTERN = path.resolve('manuscript/*.md');

const LANGS = ['js', 'jsx', 'ts', 'tsx'];
const IGNORE = [
  'eslint-skip',
  'eslint-disable',
  'prettier-ignore',
  'textlint-disable',
  'textlint-enable',
  'cspell:disable',
  'cspell:enable'
];
const SKIP_TAG = 'test-skip';
const DEFAULT_HEADER = `let $1 = false, $2 = false, $3 = false, $4 = false, $5 = false;`;

function isInstruction(node) {
  return (
    node &&
    node.type === 'html' &&
    node.value.startsWith('<!--') &&
    node.value.endsWith('-->')
  );
}

function unwrapHtmlComment(html) {
  return html.replace(/^<!--/, '').replace(/-->$/, '').trim();
}

function preprocessCode(code) {
  let conditionIndex = 0;
  return (
    code
      // Save results of conditions where the body only contains
      // a comment:
      // if (x === 42) {
      //   // Yup
      // }
      // →
      // if (x === 42) {
      //   $1 = true; // Yup
      // }
      .replaceAll(
        /(if \([^{]+{\n)(\s*)(\/[*/][^\n]+)(\n\s*})/gm,
        (__, condition, whitespace, comment, footer) => {
          conditionIndex++;
          const assignment = `$${conditionIndex} = true; `;
          return [
            condition,
            whitespace,
            assignment,
            comment,
            footer
          ].join('');
        }
      )
  );
}

function getHeader(nodes, index) {
  const header = nodes[index - 1];
  if (!isInstruction(header)) {
    return '';
  }

  const cleanHeader = unwrapHtmlComment(header.value);

  if (IGNORE.some(ignore => cleanHeader.startsWith(ignore))) {
    return getHeader(nodes, index - 1);
  }

  return cleanHeader;
}

function getFooter(nodes, index) {
  const footer = nodes[index + 1];
  if (!isInstruction(footer)) {
    return '';
  }

  const cleanFooter = unwrapHtmlComment(footer.value);

  if (IGNORE.includes(cleanFooter)) {
    return getFooter(nodes, index + 1);
  }

  return cleanFooter;
}

function getChapterTitle(nodes, index) {
  const headingIndex = _.findLastIndex(
    nodes,
    node => node.type === 'heading',
    index
  );
  if (headingIndex === -1) {
    return '';
  }

  const headingNode = nodes[headingIndex];
  const firstChildNode = headingNode.children[0];

  if (firstChildNode.type === 'link') {
    return firstChildNode.children[0].value;
  }

  return firstChildNode.value;
}

const testNameIndices = {};

function getTestName(title) {
  if (!testNameIndices[title]) {
    testNameIndices[title] = 0;
  }

  testNameIndices[title] += 1;

  return `${title} ${testNameIndices[title]}`;
}

async function executeCode(source, filename, lang) {
  const { outputFiles } = await build({
    stdin: {
      contents: source,
      sourcefile: filename.replace('.md', `.${lang}`),
      loader: lang
    },
    jsx: 'automatic',
    platform: 'node',
    format: 'esm',
    target: 'node22',
    write: false,
    bundle: false,
    minify: false,
    sourcemap: false,
    logLevel: 'info',
    logOverride: {
      // Suppress warning about not supported conversion of require() to ESM, we're mocking require calls
      'unsupported-require-call': 'debug'
    }
  });

  const context = vm.createContext({
    ...environment.sandbox,
    // Mock require() calls
    require: specifier => environment.require[specifier] ?? {}
  });

  const module = new SourceTextModule(outputFiles[0].text, {
    context,
    identifier: filename
  });

  await module.link(async specifier => {
    // Mock import
    if (environment.require[specifier]) {
      const exports = environment.require[specifier];
      const exportNames = Object.keys(exports);

      const syntheticModule = new SyntheticModule(
        ['default', ...exportNames],
        function () {
          this.setExport('default', exports);
          for (const [key, value] of Object.entries(
            exports
          )) {
            this.setExport(key, value);
          }
        },
        { context }
      );

      await syntheticModule.link(() => {});
      await syntheticModule.evaluate();

      return syntheticModule;
    }

    // Or import an actual module if there's no mock
    const importedModule = await import(specifier);

    const exportNames = Object.keys(importedModule);

    const syntheticModule = new SyntheticModule(
      exportNames,
      function () {
        for (const [key, value] of Object.entries(
          importedModule
        )) {
          this.setExport(key, value);
        }
      },
      { context }
    );

    await syntheticModule.link(() => {});
    await syntheticModule.evaluate();

    return syntheticModule;
  });

  await module.evaluate();
}

function testMarkdown(markdown, filepath) {
  let testCount = 0;
  const filename = path.basename(filepath);

  function visitor() {
    return ast => {
      visit(
        ast,
        'code',
        (node, index, { children: siblings }) => {
          if (LANGS.includes(node.lang) === false) {
            return;
          }

          const header = getHeader(siblings, index);
          if (header === SKIP_TAG) {
            return;
          }

          const footer = getFooter(siblings, index);
          const linesToPad =
            node.position.start.line -
            DEFAULT_HEADER.split('\n').length -
            header.split('\n').length -
            1;

          const code = [
            // Show correct line number in code snippets
            '\n'.repeat(linesToPad),
            DEFAULT_HEADER,
            header,
            preprocessCode(node.value),
            footer
          ].join('\n\n');

          test(
            getTestName(getChapterTitle(siblings, index)),
            async () => {
              await executeCode(code, filename, node.lang);
            }
          );

          testCount++;
        }
      );
    };
  }

  describe(filename, () => {
    remark().use(visitor).processSync(markdown);
    if (testCount === 0) {
      // Vitest fails if there are not test cases in a file
      test('No test cases in this file', () => {});
    }
  });
}

// RUN!
const chapters = globSync(MANUSCRIPT_PATTERN).toSorted();
for (const filepath of chapters) {
  const content = fs.readFileSync(filepath, 'utf8');
  testMarkdown(content, filepath);
}
