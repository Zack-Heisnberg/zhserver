const logger = require('./logger').logger;
const config = require('./config.js').ENVconfig;
const Events = require('./imports/events.js');
const Functions = require('./imports/functions.js');
const BrowserHandler = require('./imports/browser.js').bh;
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const storage = require('node-persist');
logger.warn('Zh Server v 1.0.1');
logger.warn(JSON.stringify(config));

// const connected = [];
async function startup() {
  await storage.init(/* options ... */);
  await storage.setItem('USERNAME-zack', 'zakaria123');
  // console.log(await storage.getItem('name'));
  // lunch one browser
  const browser = new BrowserHandler();
  io.on('connection', socket => {
    //   connected.push(socket.id);
    //   socket.on('disconnect', () => {
    //     socket.removeAllListeners();
    //     logger.info('Disconnected' + socket.id);
    //     for (let i = 0; i < connected.length; i++) {
    //       if (connected[i] === socket.id) {
    //         // console.log(connected[i] + ' just disconnected');
    //         global.gc();
    //         connected.splice(i, 1);
    //       }
    //     }
    //   });
    logger.info('Connected' + socket.id);
    // Login In
    let user = 'zack';
    socket.on('getlink', data => {
      Functions.getlink(data, socket, user, storage, browser);
    });
    socket.on('getplink', async data => {
      let datagot = await storage.getItem('YTDL-PERSISTE-' + user + '-filepart-' + data);
      socket.emit('response', datagot);
    });
    socket.on('important', async data => {
      logger.info('Invoked important function');
      if ((await storage.getItem('CURID-' + data.user)) !== socket.id) {
        Functions.emit(storage, user, socket, 'message', 'UNAUTHORIZED !!!', false);
        logger.error('UNAUTH' + data.user);
      } else {
        const ru = await storage.getItem('PERSISTE-' + data.user + '-ru');
        Functions.emit(storage, data.user, socket, 'ru', ru, false);
        const rd = await storage.getItem('PERSISTE-' + data.user + '-rd');
        Functions.emit(storage, data.user, socket, 'rd', rd, false);
        const link = await storage.getItem('Surfer-PERSISTE-' + data.user + '-filelink');
        if (link !== 'New') {
          Functions.emit(storage, data.user, socket, 'filelink', link, false);
        } else {
          let errors = await storage.getItem('Surfer-PERSISTE-' + data.user + '-Err');
          errors.map(value => {
            Functions.emit(storage, data.user, socket, 'message', value, false);
          });
        }
      }
    });
    //  socket.once('login', data => {
    // Events.loginEvent(storage, socket => {
    //   user = 'zack';
    //   Functions.emit(storage, user, socket, 'Logged In', 'Hello User', false);
    // });
    //  });
    // setTimeout(() => {
    //   if (!user) {
    //     logger.info('Disconneting non logged' + socket.id);
    //     for (let i = 0; i < connected.length; i++) {
    //       if (connected[i] === socket.id) {
    //         // console.log(connected[i] + ' just disconnected');
    //         connected.splice(i, 1);
    //       }
    //     }
    //     socket.disconnect();
    //   }
    // }, 10000);
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
  try {
    http.listen(port, () => logger.warn(`${config.App.name} Socket listening at http://${host}:${port}`));
  } catch (e) {
    logger.error(e.messsage);
  }
}
