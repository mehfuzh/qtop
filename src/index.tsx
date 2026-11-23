#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';
import { parseTheme } from './lib/theme.js';

render(<App initialTheme={parseTheme(process.argv.slice(2), process.env.QTOP_THEME)} />);
