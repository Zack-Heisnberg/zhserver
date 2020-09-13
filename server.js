const logger = require('./logger').logger;
const config = require('./config.js').ENVconfig;
const Events = require('./imports/events.js');
const Functions = require('./imports/functions.js');
const BrowserHandler = require('./imports/browser.js').bh;
const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const storage = require('node-persist');
logger.warn('Zh Server v 1.0.1');
logger.warn(JSON.stringify(config));

const connected = [];
async function startup() {
  await storage.init(/* options ... */);
  await storage.setItem('USERNAME-zack', 'zakaria123');
  console.log(await storage.getItem('name'));
  // lunch one browser
  const browser = new BrowserHandler();
  io.on('connection', socket => {
    connected.push(socket.id);
    socket.on('disconnect', () => {
      socket.removeAllListeners();
      logger.info('Disconnected' + socket.id);
      for (let i = 0; i < connected.length; i++) {
        if (connected[i] === socket.id) {
          console.log(connected[i] + ' just disconnected');
          connected.splice(i, 1);
        }
      }
      socket = { id: socket.id };
    });
    logger.info('Connected' + socket.id);
    // Login In
    let user = false;
    socket.once('login', data => {
      Events.loginEvent(storage, socket, data, callback => {
        user = callback;
        Functions.emit(storage, user, socket, 'Logged In', 'Hello User', false);
        socket.on('getlink', data => {
          Functions.getlink(data, socket, user, storage, browser);
        });
      });
    });
    setTimeout(() => {
      if (!user) {
        logger.info('Disconneting non logged' + socket.id);
        for (let i = 0; i < connected.length; i++) {
          if (connected[i] === socket.id) {
            console.log(connected[i] + ' just disconnected');
            connected.splice(i, 1);
          }
        }
        socket.disconnect();
      }
    }, 10000);
  });
  boot();
}
startup();

function boot() {
  const myLogger = function(req, res, next) {
    logger.info('Express Log', {
      method: req.method,
      params: req.params,
      query: req.query,
      ip: req.ips,
      url: req.originalUrl,
      body: req.body,
      headers: req.headers,
    });
    next();
  };
  app.enable('trust proxy');
  app.use('/', myLogger);
  app.get('/', (req, res) => {
    res.send('Server On');
  });
  const port = config.express.port;
  const host = config.App.host;
  http.listen(port, () => logger.warn(`${config.App.name} Socket listening at http://${host}:${port}`));
}
