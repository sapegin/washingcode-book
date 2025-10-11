import { URL } from 'node:url';
import { vi, expect } from 'vitest';
import { useState, useReducer } from 'react';
import _ from 'lodash';
import * as RTL from '@testing-library/react';

export const environment = {
  sandbox: {
    // Globals
    ...global,
    URL,
    // Testing APIs
    vi,
    expect,
    RTL,
    // React
    useState,
    useReducer,
    // Globals used in tests
    _
  },
  require: {}
};
