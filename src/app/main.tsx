import { render } from 'preact';

import { App } from './app.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Application root not found.');
}

render(<App />, root);
