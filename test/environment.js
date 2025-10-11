import path from 'node:path';
import { URL } from 'node:url';
import { vi, expect, assert } from 'vitest';
import { useState, useReducer } from 'react';
import _ from 'lodash';
import * as RTL from '@testing-library/react';

export const environment = {
  sandbox: {
    ...global,
    URL,
    module: { exports: {} },
    // Testing APIs
    vi,
    expect,
    assert,
    RTL,
    // React
    useState,
    useReducer,
    // Globals used in tests
    _,
    path
  },
  require: {
    fs: {
      readFileSync: x => x
    },
    './readme': x => x,
    glob: x => x,
    'user-home': x => x,
    express: {
      Router: () => ({ use: () => {}, get: () => {} })
    }
  }
};
