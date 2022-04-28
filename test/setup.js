const _ = require('lodash');

// Common libraries
global._ = _;
global.isEmpty = _.isEmpty;

// To make JSX work
global.React = require('react');

// Doesn't work without this for some reason
global.jest = jest;

// Common components
global.Button = (...props) =>
  global.React.createElement('button', props);
global.Text = (...props) => global.React.createElement('p', props);
