const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const remark = require('remark');
const visit = require('unist-util-visit');

// TODO: JSX (https://babeljs.io/docs/en/babel-core ?)
// TODO: Global setup (like Lodash)

// const MANUSCRIPT = path.resolve(__dirname, '../manuscript/book.md');
const MANUSCRIPT = path.resolve(__dirname, '../test/test.md');
const LANGS = ['js' /*, 'jsx'*/];

function isInstruction(node) {
  return (
    node &&
    node.type === 'html' &&
    node.value.startsWith('<!--') &&
    node.value.endsWith('-->')
  );
}

function unwrapHtmlComment(html) {
  return html
    .replace(/^<!--/, '')
    .replace(/-->$/, '')
    .trim();
}

function getHeader(nodes, index) {
  const header = nodes[index - 1];
  if (isInstruction(header)) {
    return unwrapHtmlComment(header.value);
  }
  return '';
}

function getFooter(nodes, index) {
  const footer = nodes[index + 1];
  if (isInstruction(footer)) {
    return unwrapHtmlComment(footer.value);
  }
  return '';
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

function executeCode(code) {
  // eslint-disable-next-line no-eval
  eval(code);
}

function testMarkdown(markdown) {
  function visitor() {
    return ast => {
      visit(ast, 'code', (node, index, { children: siblings }) => {
        if (!LANGS.includes(node.lang)) {
          return;
        }

        const header = getHeader(siblings, index);
        if (header === 'skip-test') {
          return;
        }

        const footer = getFooter(siblings, index);
        const code = [header, node.value, footer].join('\n\n');

        test(getTestName(getChapterTitle(siblings, index)), () => {
          executeCode(code);
        });
      });
    };
  }

  remark()
    .use(visitor)
    .processSync(markdown);
}

// RUN!
const content = fs.readFileSync(MANUSCRIPT, 'utf8');
testMarkdown(content);
