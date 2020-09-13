const puppeteer = require('puppeteer-core');
exports.bh = class BrowserHandler {
  constructor() {
    const launch_browser = async () => {
      this.browser = false;
      this.browser = await puppeteer.launch({
        headless: false,
        executablePath:
          'C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe',
        args: ['--no-sandbox'],
      });
      this.browser.on('disconnected', launch_browser);
    };
    (async () => {
      await launch_browser();
    })();
  }
};
exports.wfb = browser_handler =>
  new Promise(resolve => {
    const browser_check = setInterval(() => {
      if (browser_handler.browser !== false) {
        clearInterval(browser_check);
        resolve(true);
      }
    }, 500);
  });
