const axios = require('axios');
const fs = require('fs');
const io = require('socket.io')();
const Path = require('path');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const progress = require('progress-stream');
const pb = require('pretty-bytes');
const ps = require('pretty-ms');

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
console.log(tasks);

io.on('connection', function(socket) {
  let id;
  socket.on('newtask', data => {
    id = new Tasks(data.url, data.payload, socket.id).id;
    console.log(tasks);
    socket.emit('tid', id);
    socket.on('disconnect', () => {
      tasks[id].setsid(false);
      console.log(tasks);
    });
  });
  socket.on('bindtotask', data => {
    if (tasks[data]) {
      tasks[data].setsid(socket.id);
      socket.emit('binded');
    } else {
      socket.emit('taskdied');
    }
  });
  socket.on('gettasks', () => {});
});

io.listen(3001);
