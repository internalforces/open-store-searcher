import { render } from 'preact';

import { App } from './app.js';
import { demoLoader } from './demo-loader.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Application root not found.');
}

render(<App loader={demoLoader} />, root);
