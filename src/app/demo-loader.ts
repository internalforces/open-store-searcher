import { demoMetadata } from './demo-metadata.js';
import firstUrl from './demo-parts/demo-1.json?url&no-inline';
import secondUrl from './demo-parts/demo-2.json?url&no-inline';
import thirdUrl from './demo-parts/demo-3.json?url&no-inline';
import { createPartitionLoader } from './partition-loader.js';

// Build-managed URLs have no input-dependent component. Production delivery remains gated.
export const demoLoader = createPartitionLoader({
  metadata: demoMetadata,
  kind: 'synthetic',
  parts: [firstUrl, secondUrl, thirdUrl].map((url) => async (signal) => {
    const response = await fetch(url, {
      signal,
      referrerPolicy: 'no-referrer',
      credentials: 'omit',
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error('Unable to load synthetic data part.');
    }
    return response.json();
  }),
});
