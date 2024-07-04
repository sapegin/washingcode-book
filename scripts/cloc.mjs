import fs from 'fs';
import { globSync } from 'glob';

let totalExamples = 0;
let totalLinesOfCode = 0;

const chapters = globSync('manuscript/*.md');

for (const file of chapters) {
  const content = fs.readFileSync(file, 'utf8');
  const codeBlocks = content.match(
    /```[a-z]*\n[\s\S]*?\n```/g
  );

  if (codeBlocks) {
    totalExamples += codeBlocks.length;
    for (const block of codeBlocks) {
      // Subtracting 2 for the ``` lines
      const lines = block.split('\n').length - 2;
      totalLinesOfCode += lines;
    }
  }
}

console.log(
  `[CLOC] Number of code examples: ${totalExamples}`
);
console.log(
  `[CLOC] Number of lines of code: ${totalLinesOfCode}`
);
