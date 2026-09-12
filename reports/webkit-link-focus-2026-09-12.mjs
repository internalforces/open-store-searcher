// Reproduce native link traversal without application code or network requests.
import { webkit } from 'playwright';

const browser = await webkit.launch();
try {
  const page = await browser.newPage();
  await page.setContent(
    '<input id="start"><a href="#destination" id="link">link</a><button id="end">end</button>',
  );
  for (const key of ['Tab', 'Alt+Tab']) {
    await page.locator('#start').focus();
    await page.keyboard.press(key);
    console.log(
      JSON.stringify({
        platform: process.platform,
        key,
        activeId: await page.evaluate(() => document.activeElement?.id),
      }),
    );
  }
} finally {
  await browser.close();
}
