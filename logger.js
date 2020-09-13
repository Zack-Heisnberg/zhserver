const winston = require('winston');
const ENVconfig = require('./config').ENVconfig;
const LoggingWinston = require('@google-cloud/logging-winston').LoggingWinston;
const loggingWinston = new LoggingWinston({ level: ENVconfig.logs.cloudlevel });

exports.logger = winston.createLogger({
  level: ENVconfig.logs.fileslevel,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.metadata(),
    winston.format.align(),
    winston.format.json(),
  ),
  defaultMeta: { Application: ENVconfig.App },
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    loggingWinston,
  ],
});
