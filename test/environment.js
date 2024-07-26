import path from 'node:path';
import { vi, expect, assert } from 'vitest';
import { useState, useReducer } from 'react';
import _ from 'lodash';
import * as RTL from '@testing-library/react';

export const environment = {
  sandbox: {
    ...global,
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
    context: 'sandbox',
    external: true,
    builtin: ['*'],
    mock: {
      fs: {
        readFileSync: x => x
      },
      './readme': x => x,
      'fs-extra': x => x,
      glob: x => x,
      'user-home': x => x,
      express: {
        Router: () => ({ use: () => {}, get: () => {} })
      },
      // TODO: Once we migrate to ESLint 9, we could try to import actual modules
      '@eslint/js': {
        config(x) {
          return x;
        },
        configs: {
          recommended: []
        }
      },
      'typescript-eslint': {
        config(x) {
          return x;
        },
        configs: {
          recommended: []
        }
      }
    }
  }
};
