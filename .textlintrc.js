const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// Read all content files to use for relative links validation
const chapters = globSync('manuscript/*.md').map(filename => ({
  filename,
  text: fs.readFileSync(filename, 'utf8')
}));

module.exports = {
  rules: {
    terminology: true,
    apostrophe: true,
    quotes: true,
    diacritics: true,
    'common-misspellings': true,
    'stop-words': {
      severity: 'warning',
      exclude: [
        'divide and conquer',
        'we all know that',
        'never say never'
      ]
    },
    'write-good': {
      severity: 'warning',
      adverb: false,
      cliches: false,
      illusion: true,
      passive: false,
      so: false,
      thereIs: false,
      tooWordy: false,
      weasel: false
    },
    alex: {
      profanitySureness: 2,
      allow: [
        'color',
        'easy',
        'invalid',
        'just',
        'obvious',
        'of-course',
        'simple',
        'special',
        'straightforward',
        'vomit',
        'whitespace'
      ]
    },
    '@textlint-rule/no-unmatched-pair': true,
    'doubled-spaces': true,
    'alive-link': {
      preferGET: ['https://www.amazon.com'],
      ignore: [
        // Skip on GitHub because it always fails there
        url =>
          process.env.GITHUB_ACTIONS &&
          url.startsWith('https://www.reddit.com'),
        // Fails half of the time
        url => url.startsWith('https://www.rssing.com')
      ],
      checkRelative: true,
      baseURI: url => {
        // Images
        if (url.startsWith('images/')) {
          return path.join(__dirname, 'manuscript/resources', url);
        }

        // Chapter links
        if (url.startsWith('#')) {
          // Try to find a chapter with the anchor (`{#pizza}`)
          const chapter = chapters.find(({ text }) =>
            text.includes(`{${url}}`)
          );
          return chapter?.filename;
        }

        return '';
      }
    }
  },
  filters: {
    comments: true
  }
};
