'use strict';
exports.__esModule = true;
const dotenv = require('dotenv');
function getOsEnv(key) {
  if (typeof process.env[key] === 'undefined') {
    throw new Error(`⚠️ Environment variable ${key} is not set .`);
  }

  return process.env[key];
}
const envFound = dotenv.config();

if (envFound.error) {
  // This error should crash whole process
  throw new Error(
    "⚠️ Couldn't find .env file ⚠️ \n" + JSON.stringify(envFound),
  );
}
// Config Objext
exports.ENVconfig = {
  App: {
    name: getOsEnv('APP_NAME'),
    version: '1.0.0',
    host: getOsEnv('APP_HOST'),
  },
  logs: {
    fileslevel: getOsEnv('fileslevel'),
    cloudlevel: getOsEnv('cloudlevel'),
  },
  express: {
    port: parseInt(process.env.PORT || '8080'),
  },
};
