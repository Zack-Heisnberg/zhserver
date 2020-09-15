const logger = require('../logger').logger;
const ytdl = require('youtube-dl');
const axios = require('axios');
const wfb = require('./browser.js').wfb;
const fs = require('fs');
const FormData = require('form-data');
const AdmZip = require('adm-zip');
const progress = require('progress-stream');
const pb = require('pretty-bytes');
const ps = require('pretty-ms');
const rimraf = require('rimraf');
const Path = require('path');
const ffmpeg = require('fluent-ffmpeg');

let counter = {};
const zemit = async function zemit(storage, user, socket, event, message, persist, curdpart) {
  logger.info('Invoked emit function');
  if (persist) {
    if (event === 'message') {
      let errors = await storage.getItem('Surfer-PERSISTE-' + user + '-Err');
      errors ? errors.push(message) : (errors = []);
      await storage.setItem('PERSISTE-' + user + '-Err', errors);
    }
    if (event === 'filepart') {
      await storage.setItem('YTDL-PERSISTE-' + user + '-filepart-' + curdpart, message);
    }
    if (event === 'filelink') {
      await storage.setItem('Surfer-PERSISTE-' + user + '-filelink', message);
    }
    if (event === 'curpage') {
      await storage.setItem('PERSISTE-' + user + '-curpage', message);
    }
    if (event === 'curfile') {
      await storage.setItem('PERSISTE-' + user + '-curfile', message);
    }
    if (event === 'show') {
      await storage.setItem('PERSISTE-' + user + '-show', message);
    }
    if (event === 'rd') {
      await storage.setItem('PERSISTE-' + user + '-rd', message);
    }
    if (event === 'ru') {
      await storage.setItem('PERSISTE-' + user + '-ru', message);
    }
    if (event === 'formats') {
      await storage.setItem('PERSISTE-' + user + '-formats', message);
    }
    if (event === 'curformat') {
      await storage.setItem('PERSISTE-' + user + '-curformat', message);
    }
  }
  if (socket.connected) {
    logger.info('Emited to ' + user + ' (' + socket.id + ') ' + ' event: ' + event + ' m:  ' + message);
    socket.emit(event, message);
  } else {
    logger.info('Nothandled Coz Disconnected' + socket.id + message);
  }
};

const getlink = async ({ link, acti, type, vw, ghandle }, socket, user, storage, browser) => {
  // clearing old errors / nh
  await storage.setItem('PERSISTE-' + user + '-nh', []);
  await storage.setItem('Surfer-PERSISTE-' + user + '-Err', []);
  await storage.setItem('Surfer-PERSISTE-' + user + '-filelink', 'New');
  const checkyt = () => {
    zemit(storage, user, socket, 'info', 'Checking Link (YTDL)...', false);
    ytdl.getInfo(link, (err, info) => {
      if (err) {
        // console.log(err);
        logger.error(err.message);
        zemit(storage, user, socket, 'info', 'Not Supported , checking axios', false);
        checkax();
      } else {
        zemit(storage, user, socket, 'info', 'Supported by YTDL', false);
        // console.log(info);
        zemit(storage, user, socket, 'show', { file: info._filename }, true);
        socket.once('response', async data => {
          await storage.setItem('YTDL-PERSISTE-' + user + '-filepart', []);
          const formats = [];
          switch (parseInt(data)) {
            case 1:
              // stream
              //callback(user, 'stream');
              zemit(storage, user, socket, 'info', 'Gettings Formats', false);
              if (info.formats) {
                info.formats.map((value, index) => {
                  let format = {
                    i: index,
                    ext: value.ext,
                    w: value.width,
                    h: value.height,
                    for: value.format,
                    fi: value.format_id,
                    p: value.protocol,
                  };
                  if (value.filesize) {
                    format.filesize = value.filesize;
                  }
                  formats.push(format);
                });
                zemit(storage, user, socket, 'format', formats, true);
                socket.once('response', data => {
                  // console.log(formats);
                  // console.log(parseInt(data));
                  // console.log(info.formats[parseInt(data)]);
                  if (info.formats[parseInt(data)].protocol === 'm3u8_native') {
                    zemit(storage, user, socket, 'curformat', data, true);
                    m3u8_native(storage, user, socket, info, info.formats[parseInt(data)]);
                  } else if (
                    info.formats[parseInt(data)].protocol === 'http' ||
                    info.formats[parseInt(data)].protocol === 'https'
                  ) {
                    if (info.formats[parseInt(data)].ext) {
                      if (info.formats[parseInt(data)].ext === 'mp4') {
                        downfirst(link, storage, user, socket, info.formats[parseInt(data)]);
                      }
                    }
                  } else {
                    zemit(storage, user, socket, 'message', 'download not made yet lel', false);
                  }
                });
              } else {
                zemit(storage, user, socket, 'message', 'download not made yet lel', false);
              }
              break;
            case 2:
              // download
              zemit(storage, user, socket, 'message', 'download not made yet lel', false);
              //callback(user, 'download');
              break;
            case 3:
              //surf
              this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
              break;
            default:
              break;
          }
        });
      }
    });
  };
  const checkax = () => {
    axios
      .head(link)
      .then(response => {
        zemit(storage, user, socket, 'info', 'Checking Link (DL)', false);
        const h = response.headers['content-type'];
        if (h) {
          if (h.split('/')[0] === 'text' || h === 'application/x-httpd-php') {
            zemit(storage, user, socket, 'info', response.headers['content-type'], false);
            zemit(storage, user, socket, 'info', 'Header is Surfable', false);
            this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
          } else if (h.split('/')[0] === 'video') {
            zemit(storage, user, socket, 'info', response.headers['content-type'], false);
            zemit(storage, user, socket, 'info', 'Header is Video', false);
          } else if (h.split('/')[0] === 'image') {
            zemit(storage, user, socket, 'info', response.headers['content-type'], false);
            zemit(storage, user, socket, 'info', 'Header is image', false);
          } else if (h.split('/')[0] === 'audio') {
            zemit(storage, user, socket, 'info', response.headers['content-type'], false);
            zemit(storage, user, socket, 'info', 'Header is audio', false);
          } else {
            zemit(storage, user, socket, 'info', response.headers['content-type'], false);
            zemit(storage, user, socket, 'info', 'Header is File/ Undetected', false);
          }
        } else {
          zemit(storage, user, socket, 'info', 'Header is Undetected trying surf', false);
          this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
        }
      })
      .catch(err => {
        // console.log(err.message);
        zemit(storage, user, socket, 'message', err.message, true);
        zemit(storage, user, socket, 'info', 'Header is Undetected trying surf', false);
        this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
      });
  };
  logger.info(`Invoked getlink function for ${user} ${socket.id} :=> ${link} / ${acti}`);
  try {
    JSON.parse(acti);
    if (link === (await storage.getItem('PERSISTE-' + user + '-curpage')) && parseInt(ghandle) === 1) {
      zemit(storage, user, socket, 'info', 'Applying Actions to Current Page', false);
      this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
      // surf jsut action
    } else {
      await storage.setItem('PERSISTE-' + user + '-curpage', link);
      if (parseInt(ghandle) === 2) {
        checkyt();
      } else {
        checkax();
      }
    }
  } catch (e) {
    logger.error(user);
    logger.error(e.message);
    zemit(storage, user, socket, 'message', e.message, true);
  }
};

exports.surf = async function({ link, acti, type, vw, ghandle }, socket, user, storage, browser) {
  logger.info(`Invoked surf function for ${user} ${socket.id} :=> ${link} / ${acti}`);

  try {
    zemit(storage, user, socket, 'info', 'Setting Browser', false);
    await wfb(browser);
    const [page] = await browser.browser.pages();
    const vwp = JSON.parse(vw);
    await page.setViewport({
      width: parseInt(vwp.w),
      height: parseInt(vwp.h),
      deviceScaleFactor: parseInt(vwp.d),
    });
    if (parseInt(ghandle) === 1) {
      zemit(storage, user, socket, 'info', 'Getting Tab', false);
    } else {
      zemit(storage, user, socket, 'info', 'Opening Link', false);
      await page.goto(link, { waitUntil: 'networkidle0' });
    }
    // ACTIONS
    const actions = JSON.parse(acti);
    if (parseInt(actions.length) > 0) {
      await page.waitFor(1000);
      for (let index = 0; index < actions.length; index++) {
        zemit(storage, user, socket, 'info', 'Running Action:' + index, false);
        const action = actions[index];
        try {
          if (action[0] === 0) {
            try {
              await page.waitFor(1000);
              await page.evaluate(action => {
                document.querySelector(action[1]).value = action[2];
              }, action);
            } catch (e) {
              zemit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              try {
                await page.waitForSelector(action[1], { timeout: 4000 });
                await page.type(action[1], action[2]);
              } catch (e) {
                zemit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              }
            }
          } else if (action[0] === 1) {
            try {
              await page.waitFor(1000);
              await page.evaluate(action => {
                document.querySelector(action[1]).click();
              }, action);
            } catch (e) {
              zemit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              try {
                await page.waitForSelector(action[1], { timeout: 4000 });
                await page.click(action[1]);
              } catch (e) {
                zemit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              }
            }
          } else if (action[0] === 2) {
            if (parseInt(action[1]) === 0) {
              await page.keyboard.press(action[2]);
            } else if (parseInt(action[1]) === 1) {
              await page.keyboard.up(action[2]);
            } else {
              await page.keyboard.down(action[2]);
            }
          } else if (action[0] === 3) {
            await page.waitForNavigation();
          } else if (action[0] === 4) {
            await page.waitFor(parseInt(action[1]));
          } else if (action[0] === 5) {
            await page.waitFor(1000);
            await page.evaluate(action => {
              window.scrollBy(parseInt(action[1]), parseInt(action[2]));
            }, action);
          } else if (action[0] === 6) {
            await page.waitFor(500);
            await page.mouse.click(parseInt(action[1]), parseInt(action[2]));
          }
        } catch (err) {
          zemit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + err, false);
        }
      }
      await page.waitFor(1000);
    }
    // ACTIONS
    // File
    let filepath = './BADTYPE';
    if (parseInt(type) === 1) {
      filepath = Path.resolve(__dirname, '../downs', user + '-' + socket.id + '-page.mhtml');
      zemit(storage, user, socket, 'info', 'capturing MHTML', false);
      const cdp = await page.target().createCDPSession();
      const { data } = await cdp.send('Page.captureSnapshot', {
        format: 'mhtml',
      });
      fs.writeFileSync(filepath, data);
      fs.writeFile(filepath, data, () => {
        // File
        zemit(
          storage,
          user,
          socket,
          'rd',
          {
            rdt: 'MHTML Saved',
            rdp: 1000,
            rds: '100%',
          },
          true,
        );
        this.Upload(filepath, storage, user, socket);
      });
    } else if (parseInt(type) === 2) {
      filepath = Path.resolve(__dirname, '../downs', user + '-' + socket.id + '-page.png');
      zemit(storage, user, socket, 'info', 'Taking a ScreenShot', false);
      await page.screenshot({
        path: filepath,
        fullPage: true,
      });
      zemit(
        storage,
        user,
        socket,
        'rd',
        {
          rdt: 'ScreenShoted',
          rdp: 1000,
          rds: '100%',
        },
        true,
      );
      // File
      this.Upload(filepath, storage, user, socket);
    }
  } catch (e) {
    logger.error(user);
    logger.error(e.message);
    zemit(storage, user, socket, 'message', e.message, true);
  }
};

exports.Upload = async (filepath2, storage, user, socket) => {
  try {
    zemit(storage, user, socket, 'info', 'Zipping And Uploading File', false);
    let zfile = Path.resolve(__dirname, '../zip', user + '-' + socket.id + '-page.txt.000');
    let filepath = filepath2;
    let zipped = false;
    try {
      var zip = new AdmZip();
      zip.addLocalFile(filepath2);
      zip.writeZip(zfile);
      filepath = zfile;
      zipped = true;
    } catch (e) {
      logger.error(e);
      zemit(storage, user, socket, 'message', "Couldn't Zip , uploading directly:" + e.message, true);
      filepath = filepath2;
    }
    const file = fs.createReadStream(filepath);
    const messageData = new FormData();
    messageData.append('recipient', '{id:1843235019128093}');
    messageData.append('message', '{attachment :{type:"file", payload:{is_reusable: true}}}');
    messageData.append('filedata', file);
    axios
      .post(
        'https://graph.facebook.com/v8.0/me/messages?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
        messageData,
        {
          headers: {
            'content-type': 'multipart/form-data; boundary=' + messageData['_boundary'],
          },
        },
      )
      .then(response => {
        // console.log('Success', response.data);
        zemit(storage, user, socket, 'info', 'Attachment ID' + response.data.attachment_id, false);
        axios({
          method: 'get',
          url:
            'https://graph.facebook.com/v8.0/' +
            response.data.message_id +
            '/attachments/?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
        })
          .then(response => {
            let yawzip = 0;
            if (zipped) {
              yawzip = 1;
            }
            zemit(
              storage,
              user,
              socket,
              'ru',
              {
                rut: 'Uploaded File',
                rup: 1000,
                rus: '100%',
              },
              true,
            );
            zemit(
              storage,
              user,
              socket,
              'filelink',
              {
                size: response.data.data[0].size,
                url: response.data.data[0].file_url,
                zip: yawzip,
              },
              true,
            );
          })
          .catch(error => {
            if (error.response.data) {
              // console.log(error.response.data);
              zemit(storage, user, socket, 'message', error.response.data, true);
            } else {
              // console.log('error', error);
              zemit(storage, user, socket, 'message', error.message, true);
            }
          })
          .finally(() => {
            file.close();
            fs.unlink(filepath, err => {
              // console.log('bay it me it me');
              // console.log(err);
            });
            fs.unlink(filepath2, err => {
              // console.log('bat it me it me');
              // console.log(err);
            });
          });
      })
      .catch(error => {
        if (error.response) {
          if (error.response.data) {
            // console.log(error.response.data);
            socket.emit('message', error.response.data);
            if (error.response.data.error.error_subcode === 2018047) {
              // console.log('error', error);
              zemit(storage, user, socket, 'message', 'Media type failed, ( txt later)', true);
            }
            if (error.response.data.error.error_subcode === 2018278) {
              // console.log('error', error);
              zemit(storage, user, socket, 'message', 'outside of allowed window, Notify Zack', true);
            }
          } else {
            logger.info('error', error);
            zemit(storage, user, socket, 'message', error.message, true);
          }
        } else {
          logger.info('error', error);
          zemit(storage, user, socket, 'message', error.message, true);
        }
        file.close();
        fs.unlink(filepath, err => {
          // console.log('it me it me');
          // console.log(err);
        });
        fs.unlink(filepath2, err => {
          // console.log('it me it me');
          // console.log(err);
        });
      });
  } catch (err) {
    zemit(storage, user, socket, 'message', err.message, true);
    logger.error(err);
  }
};
const downfirst = async (link, storage, user, socket, format) => {
  const video = ytdl(
    link,
    // Optional arguments passed to youtube-dl.
    ['--format=' + format.format_id],
    // Additional options can be given for calling `child_process.execFile()`.
    { cwd: __dirname },
  );
  // Will be called when the download starts.
  let str;
  video.on('info', function(info) {
    console.log('Download started');
    console.log('filename: ' + info._filename);
    console.log('size: ' + info.size);
    str = progress({
      length: info.size,
      time: 200 /* ms */,
    });
  });

  str.on('progress', async function(prg) {
    let prig = {
      rdp: parseInt(prg.percentage * 10).toFixed(),
      rds: parseInt(prg.percentage).toFixed(2) + '%',
      rdt: `${pb(prg.transferred)} / ${pb(prg.length)} at ${pb(prg.speed)}/S - Eta: ${ps(prg.runtime * 1000)} / ${ps(
        prg.eta * 1000,
      )}  `,
    };
    socket.emit('rd', prig);
    await storage.setItem('PERSISTE-' + user + '-rd', prig);
  });
  const dirpath = Path.resolve(__dirname, '../downs/' + user + 'tube');
  const filepath = Path.resolve(dirpath, socket.id);
  rimraf.sync(dirpath);
  fs.mkdirSync(dirpath);
  video.on('end', function() {
    ffmpeg.ffprobe('filepath', function(err, metadata) {
      //console.dir(metadata); // all metadata
      if (err) {
        zemit(storage, user, socket, 'message', err.message, false);
        return;
      }
      let cuttdure = metadata.format.duration;
      m3u8_native(storage, user, socket, { _duration_raw: cuttdure }, { url: filepath });
    });
  });
  video.pipe(str).pipe(fs.createWriteStream(filepath));
};
let hptime;
let hptime2;
let hitime;
let hitime2;
const m3u8_native = async (storage, user, socket, info, format) => {
  let curdpart = 0;
  counter[user] = 0;
  clearTimeout(hptime);
  clearTimeout(hptime2);
  clearTimeout(hitime);
  clearTimeout(hitime2);
  let tot = Math.ceil(parseInt(info._duration_raw) / 15) + 1;
  zemit(storage, user, socket, 'info', 'M3U8 Native Grabbing', false);
  const dirpath = Path.resolve(__dirname, '../downs/' + user);
  rimraf.sync(dirpath);
  fs.mkdirSync(dirpath);
  zemit(storage, user, socket, 'info', 'FFMPEG SPAWANED', false);
  const { spawn } = require('child_process');
  const ls = spawn('ffmpeg', [
    '-i',
    format.url,
    '-bsf:a',
    'aac_adtstoasc',
    '-f',
    'hls',
    '-c',
    'copy',
    '-hls_segment_type',
    'fmp4',
    '-hls_time',
    '15',
    dirpath + '/output',
  ]);
  const handleinit = () => {
    if (fs.existsSync(dirpath + '/init.mp4')) {
      zemit(storage, user, socket, 'info', 'Found Init.mp4', false);
      // zemit(storage, user, socket, 'info', 'Sending mime-codec', false);
      /*
      ffmpeg.ffprobe('init.mp4',function(err, metadata) {
        // console.log(metadata.streams[0]);
      });
      */
      UploadStream(dirpath + '/init.mp4', storage, user, socket, 'init', tot);
      hptime = setTimeout(() => {
        handlepart();
      }, 500);
    } else {
      hitime = setTimeout(() => {
        handleinit();
      }, 500);
    }
  };
  hitime2 = setTimeout(() => {
    handleinit();
  }, 100);
  zemit(storage, user, socket, 'tot', { tot: tot, dur: parseInt(info._duration_raw) }, false);
  const handlepart = () => {
    if (fs.existsSync(dirpath + '/output' + curdpart + '.m4s')) {
      let percentage = ((curdpart + 2) / tot) * 100;
      zemit(
        storage,
        user,
        socket,
        'rd',
        {
          rdt: `${parseInt(curdpart + 2)} from ${tot}`,
          rdp: parseInt(percentage * 10).toFixed(),
          rds: parseInt(percentage).toFixed(2) + '%',
        },
        true,
      );
      UploadStream(dirpath + '/output' + curdpart + '.m4s', storage, user, socket, curdpart, tot);
      curdpart++;
      hptime2 = setTimeout(() => {
        handlepart();
      }, 500);
    } else {
      if (curdpart <= tot) {
        hptime2 = setTimeout(() => {
          handlepart();
        }, 500);
      } else {
        zemit(storage, user, socket, 'info', 'Sending to uploader Done', false);
      }
    }
  };
  ls.on('close', code => {
    if (code === 0) {
      zemit(storage, user, socket, 'info', 'Download Done', false);
    } else {
      zemit(storage, user, socket, 'message', 'Download Failed', true);
    }
    // console.log(`child process exited with code ${code}`);
  });
};

async function UploadStream(filepath, storage, user, socket, curdpart, tot) {
  try {
    const file = fs.createReadStream(filepath);
    const messageData = new FormData();
    messageData.append('recipient', '{id:1843235019128093}');
    messageData.append('message', '{attachment :{type:"file", payload:{is_reusable: true}}}');
    messageData.append('filedata', file);
    axios
      .post(
        'https://graph.facebook.com/v8.0/me/messages?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
        messageData,
        {
          headers: {
            'content-type': 'multipart/form-data; boundary=' + messageData['_boundary'],
          },
        },
      )
      .then(response => {
        // console.log('Success', response.data);
        axios({
          method: 'get',
          url:
            'https://graph.facebook.com/v8.0/' +
            response.data.message_id +
            '/attachments/?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
        })
          .then(response => {
            counter[user]++;
            let percentage = (parseInt(counter[user]) / parseInt(tot)) * 100;
            zemit(
              storage,
              user,
              socket,
              'filepart',
              {
                id: curdpart,
                size: response.data.data[0].size,
                url: response.data.data[0].file_url,
                uploaded: counter[user],
                ru: JSON.stringify({
                  rut: `${counter[user]} from ${tot}`,
                  rup: parseInt(percentage * 10).toFixed(),
                  rus: parseInt(percentage).toFixed(2) + '%',
                }),
              },
              true,
              curdpart,
            );
            file.close();
            fs.unlink(filepath, err => {
              // console.log('bay it me it me');
              // console.log(err);
            });
          })
          .catch(error => {
            if (error.response.data) {
              // console.log(error.response.data);
              zemit(storage, user, socket, 'message', error.response.data, true);
            } else {
              // console.log('error', error);
              zemit(storage, user, socket, 'message', error.message, true);
            }
            setTimeout(() => {
              if (socket.connected) {
                UploadStream(filepath, storage, user, socket, curdpart, tot);
              }
            }, 2000);
          });
      })
      .catch(error => {
        if (error.response) {
          if (error.response.data) {
            // console.log(error.response.data);
            socket.emit('message', error.response.data);
            if (error.response.data.error.error_subcode === 2018047) {
              // console.log('error', error);
              zemit(storage, user, socket, 'message', 'Media type failed, ( txt later)', true);
            }
            if (error.response.data.error.error_subcode === 2018278) {
              // console.log('error', error);
              zemit(storage, user, socket, 'message', 'outside of allowed window, Notify Zack', true);
            }
          } else {
            logger.info('error', error);
            zemit(storage, user, socket, 'message', error.message, true);
          }
        } else {
          logger.info('error', error);
          zemit(storage, user, socket, 'message', error.message, true);
        }
        file.close();

        setTimeout(() => {
          if (socket.connected) {
            UploadStream(filepath, storage, user, socket, curdpart, tot);
          }
        }, 2000);
      });
  } catch (err) {
    zemit(storage, user, socket, 'message', err.message, true);
    logger.error(err);
  }
}

exports.emit = zemit;

exports.getlink = getlink;

exports.m3u8_native = m3u8_native;
