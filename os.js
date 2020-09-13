const axios = require('axios');
const fs = require('fs');
const io = require('socket.io')();
const Path = require('path');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');

let working = false;
io.on('connection', function(socket) {
  socket.on('downlink2', async obj => {
    let int = setInterval(() => {
      check();
    }, 2000);
    function check() {
      if (working) {
        socket.emit('message', 'Waiting to end other task');
        socket.emit('message', 'Still doing ..');
        return;
      } else {
        socket.emit('message', 'Downloading ..');
        clearInterval(int);
        download();
      }
    }
    check();
    return;
    async function download() {
      working = true;
      const url = obj.url;
      const type = parseInt(obj.type);
      const zip = parseInt(obj.zip);
      let name = 'none';
      try {
        socket.emit('message', 'Connecting …');
        const { data } = await axios({
          url,
          method: 'GET',
          responseType: 'stream',
        });
        socket.emit('message', 'Starting download');
        rimraf.sync(Path.resolve(__dirname, 'mhtml'));
        fs.mkdirSync('mhtml');
        if (zip === 1) {
          name = Path.resolve(__dirname, 'mhtml', 'zack.zip');
        } else {
          if (type === 1) {
            name = Path.resolve(__dirname, 'mhtml', 'page.mhtml');
          } else if (type === 2) {
            name = Path.resolve(__dirname, 'mhtml', 'page.png');
          }
        }
        const writer = fs.createWriteStream(name);
        data.pipe(writer);
        data.on('data', chunk => {
          socket.emit('percentage', chunk.length);
          working = false;
        });
        data.on('error', error => {
          console.log('downloadError', error);
          working = false;
        });
        data.on('end', () => {
          // console.log('end');
        });

        writer.on('finish', () => {
          console.log('done');
          if (zip === 1) {
            const zipfile = new AdmZip(name);
            var zipEntries = zipfile.getEntries(); // an array of ZipEntry records
            const zname = zipEntries[0].entryName;
            zipfile.extractEntryTo(zname, Path.resolve(__dirname, 'mhtml'));
            socket.emit('done', Path.resolve(__dirname, 'mhtml', zname));
            working = false;
          } else {
            socket.emit('done', Path.resolve(__dirname, 'mhtml', name));
            working = false;
          }
        });
      } catch (er) {
        socket.emit('er', er.message);
        working = false;
      }
    }
  });
});
io.listen(3000);
