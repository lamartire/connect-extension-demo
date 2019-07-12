import { MESSAGE } from '@/constants';

const CSP_HEADERS = ['content-security-policy', 'x-webkit-csp'];
const CSP_SOURCES = [
  'connect-src',
  'default-src',
  'font-src',
  'frame-src',
  'img-src',
  'media-src',
  'object-src',
  'script-src',
  'style-src',
];

function isCspHeader(headerName) {
  return CSP_HEADERS.includes(headerName.toLowerCase());
}

chrome.runtime.onInstalled.addListener(function() {
  // TODO: add an action here
  console.log('activated');
});

chrome.browserAction.onClicked.addListener(function(tab) {
  const contentPayload = {
    scope: MESSAGE.SCOPE,
    to: MESSAGE.BROWSER,
    method: 'openAccount',
  };

  chrome.tabs.sendMessage(tab.id, contentPayload);
});

chrome.webRequest.onHeadersReceived.addListener(
  details => {
    details.responseHeaders.forEach(responseHeader => {
      if (!isCspHeader(responseHeader.name)) return;

      let csp = responseHeader.value;

      CSP_SOURCES.forEach(cspSource => {
        csp = csp.replace(cspSource, `${cspSource} https://*.endpass.com/*`);
      });

      /* eslint-disable-next-line */
      responseHeader.value = csp;
    });

    if (details.url.includes('endpass')) {
      console.log('intercepted output: ', details);
    }

    return Object.assign(details, {
      responseHeaders: details.responseHeaders,
    });
  },
  {
    // urls: ['https://*.endpass.com/*'],
    urls: ['*://*/*'],
    types: ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'other'],
  },
  ['blocking', 'responseHeaders'],
);
