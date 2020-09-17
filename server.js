const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const storage = require('node-persist');
class Tasks {
  constructor(url, payload, sid) {
    this.id = Math.random()
      .toString(36)
      .substr(2, 9);
    this.link = url;
    this.payload = payload;
    this.stats = {};
    this.currentsocket = sid;
    (() => {
      tasks[this.id] = this;
    })();
  }
  getstats() {
    console.log(this.url);
  }
  setsid(sid) {
    this.currentsocket = sid;
  }
  respond() {}
  start() {}
  stop() {}
  clean() {}
}
let tasks = {};
app.enable('trust proxy');
app.get('/', (req, res) => {
  res.send('Server On');
});
const port = parseInt(process.env.PORT || '8080');
try {
  http.listen(port, () => console.warn(` Socket listening at http://${process.env.host}:${port}`));
} catch (e) {
  console.error(e.messsage);
}
