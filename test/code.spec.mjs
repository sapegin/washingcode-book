import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import glob from 'glob';
import babel from '@babel/core';
import { NodeVM } from 'vm2';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';

const MANUSCRIPT_PATTERN = path.resolve('manuscript/*.md');

const LANGS = ['js', 'jsx', 'ts', 'tsx'];
const IGNORE = [
  'prettier-ignore',
  'textlint-disable',
  'textlint-enable'
];
const SKIP_TAG = 'test-skip';

const vm = new NodeVM({
  sandbox: global,
  require: {
    external: true,
    builtin: ['*'],
    mock: {
      fs: {
        readFileSync: x => x
      },
      reamde: x => x
    }
  }
});

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

function getHeader(nodes, index) {
  const header = nodes[index - 1];
  if (!isInstruction(header)) {
    return '';
  }

  const cleanHeader = unwrapHtmlComment(header.value);

  if (IGNORE.includes(cleanHeader)) {
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
  return headingNode.children[0].value;
}

const testNameIndicies = {};

function getTestName(title) {
  if (!testNameIndicies[title]) {
    testNameIndicies[title] = 0;
  }

  testNameIndicies[title] += 1;

  return `${title} ${testNameIndicies[title]}`;
}

async function executeCode(source, filename) {
  const { code } = await babel.transformAsync(source, {
    filename
  });
  vm.run(code, filename);
}

function testMarkdown(markdown, filepath) {
  const filename = path.basename(filepath);

  function visitor() {
    return ast => {
      visit(ast, 'code', (node, index, { children: siblings }) => {
        if (!LANGS.includes(node.lang)) {
          return;
        }

        const header = getHeader(siblings, index);
        if (header === SKIP_TAG) {
          return;
        }

        const footer = getFooter(siblings, index);
        const linesToPad =
          node.position.start.line - header.split('\n').length - 3;

        const code = [
          // Show correct line number in code snippets
          '\n'.repeat(linesToPad),
          header,
          node.value,
          footer
        ].join('\n\n');

        test(
          getTestName(getChapterTitle(siblings, index)),
          async () => {
            await executeCode(code, `${filename}.${node.lang}`);
          }
        );
      });
    };
  }

  describe(filename, () => {
    remark().use(visitor).processSync(markdown);
  });
}

// RUN!
glob.sync(MANUSCRIPT_PATTERN).forEach(filepath => {
  const content = fs.readFileSync(filepath, 'utf8');
  testMarkdown(content, filepath);
});
