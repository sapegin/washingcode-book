// Common libraries
global._ = require('lodash');

// To make JSX work
global.React = require('react');

// Doesn't work without this for some reason
global.jest = jest;
global.URLSearchParams = URLSearchParams;

// Common components
global.Button = (...props) =>
  global.React.createElement('button', props);
global.Text = (...props) => global.React.createElement('p', props);
