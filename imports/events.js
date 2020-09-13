const logger = require('../logger').logger;
const loginEvent = async (storage, socket, data2, callback) => {
  logger.info('Invoked Login Event');
  logger.warn(JSON.stringify(data2));
  try {
    let u = await storage.getItem('USERNAME-' + data2.u);
    let p = await storage.getItem('USERNAME-' + data2.p);
    if (u && u === p) {
      throw new Error('Not Auth');
    } else {
      logger.info(' Logged In user ' + data2.u + ' as ' + socket.id);
      await storage.setItem('CURID-zack', socket.id);
      callback(data2.u);
    }
  } catch (e) {
    logger.error('Someone is  trying or u bad' + e + data2 + socket.handshake);
    return;
  }
};

exports.loginEvent = loginEvent;
