const _ = require('lodash');

// Common libraries
global._ = _;
global.isEmpty = _.isEmpty;

// Node.js
global.path = require('path');

// To make JSX work
global.React = require('react');

// Doesn't work without this for some reason
global.jest = jest;
global.setImmediate = jest.useRealTimers;
global.clearImmediate = jest.useRealTimers;

// More stuff for testing
global.ReactDOM = require('react-dom');
global.RTL = require('@testing-library/react');

// Common components
global.Button = (...props) =>
  global.React.createElement('button', props);
