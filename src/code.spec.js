const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const remark = require('remark');
const visit = require('unist-util-visit');

// TODO: skip
// TODO: filter by language
// TODO: JSX

// const MANUSCRIPT = path.resolve(__dirname, '../manuscript/book.md');
const MANUSCRIPT = path.resolve(__dirname, '../test/test.md');
// const LANGS = ['js' /*, 'jsx'*/];

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

function getTestCases(markdown) {
  const testCases = [];

  function processCode() {
    return ast => {
      visit(ast, 'code', (node, index, { children: siblings }) => {
        const header = getHeader(siblings, index);
        const footer = getFooter(siblings, index);
        const code = [header, node.value, footer].join('\n\n');
        test(getTestName(getChapterTitle(siblings, index)), () => {
          // eslint-disable-next-line no-eval
          eval(code);
        });
      });
    };
  }

  remark()
    .use(processCode)
    .processSync(markdown);

  return testCases;
}

// RUN!
const content = fs.readFileSync(MANUSCRIPT, 'utf8');
getTestCases(content);
