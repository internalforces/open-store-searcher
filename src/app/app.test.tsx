import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';

import { App } from './app.js';

describe('App', () => {
  it('renders the application name as the page heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'open-store-searcher' })).toBeTruthy();
  });
});
