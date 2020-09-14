const logger = require('../logger').logger;
const ytdl = require('youtube-dl');
const axios = require('axios');
const wfb = require('./browser.js').wfb;
const fs = require('fs');
const FormData = require('form-data');
const AdmZip = require('adm-zip');
const pb = require('pretty-bytes');
const rimraf = require('rimraf');
const Path = require('path');
exports.emit = async function zemit(storage, user, socket, event, message, persist, curdpart) {
  logger.info('Invoked emit function');
  if (persist) {
    if (event === 'message') {
      let errors = await storage.getItem('Surfer-PERSISTE-' + user + '-Err');
      errors ? errors.push(message) : (errors = []);
      await storage.setItem('PERSISTE-' + user + '-Err', errors);
    }
    if (event === 'filepart') {
      let filepart = await storage.getItem('YTDL-PERSISTE-' + user + '-File');
      filepart ? console.log('ok') : (filepart = []);
      filepart[curdpart] = message;
      await storage.setItem('YTDL-PERSISTE-' + user + '-filepart', filepart);
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
    logger.info('Nothandled Coz Disconnected' + socket.id);
    if (!persist) {
      let nh = await storage.getItem('PERSISTE-' + user + '-nh');
      nh ? nh.push(message) : (nh = []);
      await storage.setItem('PERSISTE-' + user + '-nh', nh);
    }
  }
};

exports.getlink = async ({ link, acti, type, vw, ghandle }, socket, user, storage, browser) => {
  // clearing old errors / nh
  await storage.setItem('PERSISTE-' + user + '-nh', []);
  await storage.setItem('Surfer-PERSISTE-' + user + '-Err', []);
  await storage.setItem('Surfer-PERSISTE-' + user + '-filelink', 'New');
  const checkyt = () => {
    this.emit(storage, user, socket, 'info', 'Checking Link (YTDL)...', false);
    ytdl.getInfo(link, (err, info) => {
      if (err) {
        console.log(err);
        logger.error(err.message);
        this.emit(storage, user, socket, 'info', 'Not Supported , checking axios', false);
        checkax();
      } else {
        this.emit(storage, user, socket, 'info', 'Supported by YTDL', false);
        console.log(info);
        this.emit(storage, user, socket, 'show', { file: info._filename }, true);
        socket.once('response', async data => {
          await storage.setItem('YTDL-PERSISTE-' + user + '-filepart', []);
          const formats = [];
          switch (parseInt(data)) {
            case 1:
              // stream
              //callback(user, 'stream');
              this.emit(storage, user, socket, 'info', 'Gettings Formats', false);
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
                this.emit(storage, user, socket, 'format', info.formats, true);
                socket.once('response', data => {
                  console.log(formats);
                  console.log(parseInt(data));
                  console.log(info.formats[parseInt(data)]);
                  if (info.formats[parseInt(data)].protocol === 'm3u8_native') {
                    this.emit(storage, user, socket, 'curformat', data, true);
                    this.m3u8_native(storage, user, socket, info, info.formats[parseInt(data)]);
                  } else {
                    this.emit(storage, user, socket, 'message', 'download not made yet lel', false);
                  }
                });
              } else {
                this.emit(storage, user, socket, 'message', 'download not made yet lel', false);
              }
              break;
            case 2:
              // download
              this.emit(storage, user, socket, 'message', 'download not made yet lel', false);
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
        this.emit(storage, user, socket, 'info', 'Checking Link (DL)', false);
        const h = response.headers['content-type'];
        if (h) {
          if (h.split('/')[0] === 'text' || h === 'application/x-httpd-php') {
            this.emit(storage, user, socket, 'info', response.headers['content-type'], false);
            this.emit(storage, user, socket, 'info', 'Header is Surfable', false);
            this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
          } else if (h.split('/')[0] === 'video') {
            this.emit(storage, user, socket, 'info', response.headers['content-type'], false);
            this.emit(storage, user, socket, 'info', 'Header is Video', false);
          } else if (h.split('/')[0] === 'image') {
            this.emit(storage, user, socket, 'info', response.headers['content-type'], false);
            this.emit(storage, user, socket, 'info', 'Header is image', false);
          } else if (h.split('/')[0] === 'audio') {
            this.emit(storage, user, socket, 'info', response.headers['content-type'], false);
            this.emit(storage, user, socket, 'info', 'Header is audio', false);
          } else {
            this.emit(storage, user, socket, 'info', response.headers['content-type'], false);
            this.emit(storage, user, socket, 'info', 'Header is File/ Undetected', false);
          }
        } else {
          this.emit(storage, user, socket, 'info', 'Header is Undetected trying surf', false);
          this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
        }
      })
      .catch(err => {
        console.log(err.message);
        this.emit(storage, user, socket, 'message', err.message, true);
        this.emit(storage, user, socket, 'info', 'Header is Undetected trying surf', false);
        this.surf({ link, acti, type, vw, ghandle }, socket, user, storage, browser);
      });
  };
  logger.info(`Invoked getlink function for ${user} ${socket.id} :=> ${link} / ${acti}`);
  try {
    JSON.parse(acti);
    if (link === (await storage.getItem('PERSISTE-' + user + '-curpage')) && parseInt(ghandle) === 1) {
      this.emit(storage, user, socket, 'info', 'Applying Actions to Current Page', false);
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
    this.emit(storage, user, socket, 'message', e.message, true);
  }
};

exports.surf = async function({ link, acti, type, vw, ghandle }, socket, user, storage, browser) {
  logger.info(`Invoked surf function for ${user} ${socket.id} :=> ${link} / ${acti}`);

  try {
    this.emit(storage, user, socket, 'info', 'Setting Browser', false);
    await wfb(browser);
    const [page] = await browser.browser.pages();
    const vwp = JSON.parse(vw);
    await page.setViewport({
      width: parseInt(vwp.w),
      height: parseInt(vwp.h),
      deviceScaleFactor: parseInt(vwp.d),
    });
    if (parseInt(ghandle) === 1) {
      this.emit(storage, user, socket, 'info', 'Getting Tab', false);
    } else {
      this.emit(storage, user, socket, 'info', 'Opening Link', false);
      await page.goto(link, { waitUntil: 'networkidle0' });
    }
    // ACTIONS
    const actions = JSON.parse(acti);
    if (parseInt(actions.length) > 0) {
      await page.waitFor(1000);
      for (let index = 0; index < actions.length; index++) {
        this.emit(storage, user, socket, 'info', 'Running Action:' + index, false);
        const action = actions[index];
        try {
          if (action[0] === 0) {
            try {
              await page.waitFor(1000);
              await page.evaluate(action => {
                document.querySelector(action[1]).value = action[2];
              }, action);
            } catch (e) {
              this.emit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              try {
                await page.waitForSelector(action[1], { timeout: 4000 });
                await page.type(action[1], action[2]);
              } catch (e) {
                this.emit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              }
            }
          } else if (action[0] === 1) {
            try {
              await page.waitFor(1000);
              await page.evaluate(action => {
                document.querySelector(action[1]).click();
              }, action);
            } catch (e) {
              this.emit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
              try {
                await page.waitForSelector(action[1], { timeout: 4000 });
                await page.click(action[1]);
              } catch (e) {
                this.emit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + e, false);
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
          this.emit(storage, user, socket, 'message', 'Action: ' + index + ' Failed , err => ' + err, false);
        }
      }
      await page.waitFor(1000);
    }
    // ACTIONS
    // File
    let filepath = './BADTYPE';
    if (parseInt(type) === 1) {
      filepath = Path.resolve(__dirname, '../downs', user + '-' + socket.id + '-page.mhtml');
      this.emit(storage, user, socket, 'info', 'capturing MHTML', false);
      const cdp = await page.target().createCDPSession();
      const { data } = await cdp.send('Page.captureSnapshot', {
        format: 'mhtml',
      });
      fs.writeFileSync(filepath, data);
      fs.writeFile(filepath, data, () => {
        // File
        this.emit(
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
      this.emit(storage, user, socket, 'info', 'Taking a ScreenShot', false);
      await page.screenshot({
        path: filepath,
        fullPage: true,
      });
      this.emit(
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
    this.emit(storage, user, socket, 'message', e.message, true);
  }
};

exports.Upload = async (filepath2, storage, user, socket) => {
  try {
    this.emit(storage, user, socket, 'info', 'Zipping And Uploading File', false);
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
      this.emit(storage, user, socket, 'message', "Couldn't Zip , uploading directly:" + e.message, true);
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
        console.log('Success', response.data);
        this.emit(storage, user, socket, 'info', 'Attachment ID' + response.data.attachment_id, false);
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
            this.emit(
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
            this.emit(
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
              console.log(error.response.data);
              this.emit(storage, user, socket, 'message', error.response.data, true);
            } else {
              console.log('error', error);
              this.emit(storage, user, socket, 'message', error.message, true);
            }
          })
          .finally(() => {
            file.close();
            fs.unlink(filepath, err => {
              console.log('bay it me it me');
              console.log(err);
            });
            fs.unlink(filepath2, err => {
              console.log('bat it me it me');
              console.log(err);
            });
          });
      })
      .catch(error => {
        if (error.response) {
          if (error.response.data) {
            console.log(error.response.data);
            socket.emit('message', error.response.data);
            if (error.response.data.error.error_subcode === 2018047) {
              console.log('error', error);
              this.emit(storage, user, socket, 'message', 'Media type failed, ( txt later)', true);
            }
            if (error.response.data.error.error_subcode === 2018278) {
              console.log('error', error);
              this.emit(storage, user, socket, 'message', 'outside of allowed window, Notify Zack', true);
            }
          } else {
            logger.info('error', error);
            this.emit(storage, user, socket, 'message', error.message, true);
          }
        } else {
          logger.info('error', error);
          this.emit(storage, user, socket, 'message', error.message, true);
        }
        file.close();
        fs.unlink(filepath, err => {
          console.log('it me it me');
          console.log(err);
        });
        fs.unlink(filepath2, err => {
          console.log('it me it me');
          console.log(err);
        });
      });
  } catch (err) {
    this.emit(storage, user, socket, 'message', err.message, true);
    logger.error(err);
  }
};

exports.m3u8_native = async (storage, user, socket, info, format) => {
  this.emit(storage, user, socket, 'info', 'M3U8 Native Grabbing', false);
  const dirpath = Path.resolve(__dirname, './downs/' + user);
  rimraf.sync(dirpath);
  fs.mkdirSync(dirpath);
  if (info._duration_raw) {
    this.emit(storage, user, socket, 'info', "Progress won't be detected", false);
  } else {
    this.emit(storage, user, socket, 'info', 'Total Duration is' + info._duration_raw, false);
  }
  this.emit(storage, user, socket, 'info', 'FFMPEG SPAWANED', false);
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
    '-hls_segment_time',
    '15',
    dirpath + '/output',
  ]);
  ls.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });
  ls.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
  });
  function handleinit() {
    if (fs.existsSync(dirpath + '/init.mp4')) {
      this.emit(storage, user, socket, 'info', 'Found Init.mp4', false);
      this.emit(storage, user, socket, 'info', 'Sending mime-codec', false);
      /*
      ffmpeg.ffprobe('init.mp4',function(err, metadata) {
        console.log(metadata.streams[0]);
      });
      */
      this.UploadStream(dirpath + '/init.mp4', storage, user, socket, 'init', tot, 0);

      handlepart();
    } else {
      setTimeout(() => {
        handleinit();
      }, 100);
    }
  }
  handleinit();
  let curdpart = 0;
  let tot = parseInt(info._duration_raw) / 15;
  function handlepart() {
    if (fs.existsSync(dirpath + '/output' + curdpart + '.m4s')) {
      curdpart++;
      let percentage = (curdpart / tot) * 100;
      this.emit(
        storage,
        user,
        socket,
        'rd',
        {
          rdt: `${curdpart} from ${tot}`,
          rdp: parseInt(percentage * 10).toFixed(),
          rds: parseInt(percentage).toFixed(2) + '%',
        },
        true,
      );
      this.UploadStream(dirpath + '/output' + curdpart + '.m4s', storage, user, socket, curdpart, tot, percentage);
      handlepart();
    } else {
      if (curdpart !== tot) {
        setTimeout(() => {
          handlepart();
        }, 100);
        this.emit(storage, user, socket, 'info', 'Sending to uploader Done', false);
      }
    }
  }
  ls.on('close', code => {
    if (code === 0) {
      this.emit(storage, user, socket, 'info', 'Download Done', false);
    } else {
      this.emit(storage, user, socket, 'message', 'Download Failed', true);
    }
    console.log(`child process exited with code ${code}`);
  });
};

exports.UploadStream = async (filepath, storage, user, socket, curdpart, tot, percentage) => {
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
        console.log('Success', response.data);
        this.emit(storage, user, socket, 'info', 'Attachment ID' + response.data.attachment_id, false);
        axios({
          method: 'get',
          url:
            'https://graph.facebook.com/v8.0/' +
            response.data.message_id +
            '/attachments/?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
        })
          .then(response => {
            this.emit(
              storage,
              user,
              socket,
              'rd',
              {
                rdt: `${curdpart} from ${tot}`,
                rdp: parseInt(percentage * 10).toFixed(),
                rds: parseInt(percentage).toFixed(2) + '%',
              },
              true,
            );
            this.emit(
              storage,
              user,
              socket,
              'filepart',
              {
                size: response.data.data[0].size,
                url: response.data.data[0].file_url,
              },
              true,
              curdpart,
            );
          })
          .catch(error => {
            if (error.response.data) {
              console.log(error.response.data);
              this.emit(storage, user, socket, 'message', error.response.data, true);
            } else {
              console.log('error', error);
              this.emit(storage, user, socket, 'message', error.message, true);
            }
          })
          .finally(() => {
            file.close();
            fs.unlink(filepath, err => {
              console.log('bay it me it me');
              console.log(err);
            });
          });
      })
      .catch(error => {
        if (error.response) {
          if (error.response.data) {
            console.log(error.response.data);
            socket.emit('message', error.response.data);
            if (error.response.data.error.error_subcode === 2018047) {
              console.log('error', error);
              this.emit(storage, user, socket, 'message', 'Media type failed, ( txt later)', true);
            }
            if (error.response.data.error.error_subcode === 2018278) {
              console.log('error', error);
              this.emit(storage, user, socket, 'message', 'outside of allowed window, Notify Zack', true);
            }
          } else {
            logger.info('error', error);
            this.emit(storage, user, socket, 'message', error.message, true);
          }
        } else {
          logger.info('error', error);
          this.emit(storage, user, socket, 'message', error.message, true);
        }
        file.close();
        fs.unlink(filepath, err => {
          console.log('it me it me');
          console.log(err);
        });
      });
  } catch (err) {
    this.emit(storage, user, socket, 'message', err.message, true);
    logger.error(err);
  }
};
