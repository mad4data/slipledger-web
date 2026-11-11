// SlipLedger service worker: keeps the app's own files so it opens offline. Only same-origin
// GET requests for those files are answered from the cache; everything else (the AI providers)
// always goes to the network and is never stored.
const VERSION = '99c916280327';
const BASE = '/slipledger-web/';
const FILES = [
  "/slipledger-web/",
  "/slipledger-web/_expo/static/js/web/[id]-9af134d3448992ac24dde12516422e37.js",
  "/slipledger-web/_expo/static/js/web/__common-1fe87a17bcda41fe7f838c2b4b486cce.js",
  "/slipledger-web/_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js",
  "/slipledger-web/_expo/static/js/web/_layout-160c7c90b92051e3a1904a5cd155a5b6.js",
  "/slipledger-web/_expo/static/js/web/catalog-edde519181c88134a58723fd4c8a4cc0.js",
  "/slipledger-web/_expo/static/js/web/entry-739dace2dafff156855af6ebded39af7.js",
  "/slipledger-web/_expo/static/js/web/export-41bdaad3e2c5bb7148f6d263cf1c663e.js",
  "/slipledger-web/_expo/static/js/web/inbox-01ef2aa9d5066dea9dcd03e9fe9a0eb5.js",
  "/slipledger-web/_expo/static/js/web/index-05859b3f9f1778d31dc2e616fb9679fb.js",
  "/slipledger-web/_expo/static/js/web/keys-95da0bfbbb9314f9f2b0c4dbf632f9cb.js",
  "/slipledger-web/_expo/static/js/web/node-2f6adc5de5b9519f1f4e8f111941efea.js",
  "/slipledger-web/_expo/static/js/web/node-47aa55f18304ba666eaed19026a03cd0.js",
  "/slipledger-web/_expo/static/js/web/reconcile-60d69d939be0ed4283f897ce3fef8ded.js",
  "/slipledger-web/_expo/static/js/web/registers-2240d3290705e5d0a8841efb0466d8c3.js",
  "/slipledger-web/_expo/static/js/web/settings-fed614f99abd94d02fce586a880a7645.js",
  "/slipledger-web/assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png",
  "/slipledger-web/assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png",
  "/slipledger-web/favicon.ico",
  "/slipledger-web/favicon.png",
  "/slipledger-web/icons/apple-touch-icon.png",
  "/slipledger-web/icons/icon-192.png",
  "/slipledger-web/icons/icon-512.png",
  "/slipledger-web/icons/maskable-512.png",
  "/slipledger-web/index.html",
  "/slipledger-web/manifest.webmanifest"
];
const CACHE = `slipledger-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('slipledger-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (req.mode === 'navigate') {
    // Any page of the app is the same single page: network first for fresh deploys, cache offline.
    event.respondWith(fetch(req).catch(() => caches.match(`${BASE}index.html`)));
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
