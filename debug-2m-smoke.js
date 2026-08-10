const { chromium } = require('playwright');
(async() => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  page.on('requestfailed', (r) => console.log('REQUESTFAIL:', r.url(), r.failure()?.message));
  page.on('console', (m) => console.log('CONSOLE:', m.type(), m.text()));

  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 15000 });
  const hlsCapability = await page.evaluate(() => ({
    hlsSupported: Boolean(window.Hls && Hls.isSupported && Hls.isSupported()),
    canPlayMpegUrl: Boolean(document.getElementById('videoPlayer').canPlayType('application/vnd.apple.mpegurl')),
    canPlayXMime: Boolean(document.getElementById('videoPlayer').canPlayType('application/x-mpegurl'))
  }));
  console.log('HLS_RUNTIME_CAPABILITY:', JSON.stringify(hlsCapability));

  await page.locator('#playlist a[data-id]').first().waitFor({ state: 'attached', timeout: 10000 });

  const anchors = await page.locator('#playlist a[data-id]').evaluateAll((els) =>
    els.map((el) => ({
      id: el.dataset.id,
      title: el.querySelector('span.radiotitle')?.textContent,
      href: el.href
    }))
  );

  const target = anchors.find(x => /2M|Radio 2M/i.test(x.title || ''));
  console.log('FOUND:', JSON.stringify(target));

  if (target) {
    const stationAnchor = page.locator(`#playlist a[data-id="${target.id}"]`);
    await stationAnchor.click();
    await page.waitForTimeout(1200);

    const artist = (await page.locator('#artist').innerText()).trim();
    const cover = await page.locator('#coverimg').evaluate((img) => ({
      src: img.src,
      alt: img.alt
    }));

    console.log('UI_AFTER_CLICK:', JSON.stringify({ artist, cover }));

    const videoState = await page.locator('#videoPlayer').evaluate((v) => ({
      src: v.src,
      currentSrc: v.currentSrc,
      paused: v.paused,
      networkState: v.networkState,
      readyState: v.readyState
    }));

    console.log('PLAYER_SRC:', JSON.stringify(videoState));
  }

  await browser.close();
})();
