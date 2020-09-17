const axios = require('axios');
const fs = require('fs');
const io = require('socket.io')();
const Path = require('path');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const progress = require('progress-stream');
const pb = require('pretty-bytes');
const ps = require('pretty-ms');

let working = false;
io.on('connection', function(socket) {
  socket.once('downlink2', async obj => {
    let i = 0;
    let int = setInterval(() => {
      check();
    }, 2000);
    function check() {
      if (working) {
        socket.emit('message', 'Waiting to end other task');
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
        const str = progress({
          length: obj.size,
          time: 200 /* ms */,
        });
        const writer = fs.createWriteStream(name);
        str.on('progress', function(prg) {
          socket.emit('percentage', {
            localprogpr: parseInt(prg.percentage * 10).toFixed(),
            localprogprstr: parseInt(prg.percentage).toFixed(2) + '%',
            localprog: `${pb(prg.transferred)} / ${pb(prg.length)} at ${pb(prg.speed)}/S - Eta: ${ps(
              prg.runtime * 1000,
            )} / ${ps(prg.eta * 1000)}  `,
          });
        });

        data.pipe(str).pipe(writer);
        data.on('error', error => {
          // console.log('downloadError', error);
          socket.emit('er', error.message);
          working = false;
        });
        data.on('end', () => {
          // // console.log('end');
        });

        writer.on('finish', () => {
          // console.log('done');
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
        working = false;
        socket.emit('er', er.message);
        if (i < 5) {
          setTimeout(() => {
            i++;
            socket.emit('Retrying..', er.message);
            download();
          }, 5000);
        }
      }
    }
  });
});
io.listen(3000);
