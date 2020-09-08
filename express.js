"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = require("../config");
var logger_1 = require("./logger");
var axios_1 = __importDefault(require("axios"));
var fs_1 = __importDefault(require("fs"));
var form_data_1 = __importDefault(require("form-data"));
exports.default = (function () {
    var app = express_1.default();
    var http = require('http').createServer(app);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var io = require('socket.io')(http);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var puppeteer = require('puppeteer');
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('getlink', function (_a) {
            var link = _a.link, acti = _a.acti, type = _a.type;
            logger_1.logger.info('Downloading ' + link + acti + type);
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            (function main() {
                return __awaiter(this, void 0, void 0, function () {
                    var browser_1, page, actions, index, action, err_1, err_2, err_3, filepath, cdp, data, file_1, messageData, err_4;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 32, , 33]);
                                socket.emit('info', 'Started Task');
                                return [4 /*yield*/, puppeteer.launch({
                                        args: ['--no-sandbox'],
                                    })];
                            case 1:
                                browser_1 = _a.sent();
                                socket.emit('info', 'launched Browser');
                                return [4 /*yield*/, browser_1.pages()];
                            case 2:
                                page = (_a.sent())[0];
                                return [4 /*yield*/, page.goto(link)];
                            case 3:
                                _a.sent();
                                actions = JSON.parse(acti);
                                if (!(parseInt(actions.length) > 0)) return [3 /*break*/, 25];
                                index = 0;
                                _a.label = 4;
                            case 4:
                                if (!(index < actions.length)) return [3 /*break*/, 25];
                                socket.emit('info', 'Running Action' + index);
                                action = actions[index];
                                if (!(action[0] === 0)) return [3 /*break*/, 10];
                                _a.label = 5;
                            case 5:
                                _a.trys.push([5, 8, , 9]);
                                return [4 /*yield*/, page.waitForSelector(action[1], { timeout: 10000 })];
                            case 6:
                                _a.sent();
                                return [4 /*yield*/, page.type(action[1], action[2])];
                            case 7:
                                _a.sent();
                                socket.emit('info', 'Action' + index + 'Success');
                                return [3 /*break*/, 9];
                            case 8:
                                err_1 = _a.sent();
                                socket.emit('error', 'Action' + index + 'Faied 10s Timeout' + err_1);
                                throw err_1;
                            case 9: return [3 /*break*/, 24];
                            case 10:
                                if (!(action[0] === 1)) return [3 /*break*/, 16];
                                _a.label = 11;
                            case 11:
                                _a.trys.push([11, 14, , 15]);
                                return [4 /*yield*/, page.waitForSelector(action[1], { timeout: 10000 })];
                            case 12:
                                _a.sent();
                                return [4 /*yield*/, page.click(action[1])];
                            case 13:
                                _a.sent();
                                socket.emit('info', 'Action' + index + 'Success');
                                return [3 /*break*/, 15];
                            case 14:
                                err_2 = _a.sent();
                                socket.emit('error', 'Action' + index + 'Faied 10s Timeout' + err_2);
                                throw err_2;
                            case 15: return [3 /*break*/, 24];
                            case 16:
                                _a.trys.push([16, 23, , 24]);
                                if (!(action[2] === 0)) return [3 /*break*/, 18];
                                return [4 /*yield*/, page.keyboard.press(action[3])];
                            case 17:
                                _a.sent();
                                return [3 /*break*/, 22];
                            case 18:
                                if (!(action[2] === 1)) return [3 /*break*/, 20];
                                return [4 /*yield*/, page.keyboard.up(action[3])];
                            case 19:
                                _a.sent();
                                return [3 /*break*/, 22];
                            case 20: return [4 /*yield*/, page.keyboard.down(action[3])];
                            case 21:
                                _a.sent();
                                _a.label = 22;
                            case 22:
                                socket.emit('info', 'Action' + index + 'Success');
                                return [3 /*break*/, 24];
                            case 23:
                                err_3 = _a.sent();
                                socket.emit('error', 'Action' + index + 'Faied 10s Timeout' + err_3);
                                throw err_3;
                            case 24:
                                index++;
                                return [3 /*break*/, 4];
                            case 25:
                                filepath = void 0;
                                if (!(parseInt(type) === 1)) return [3 /*break*/, 28];
                                socket.emit('info', 'Generating MHTML' + link);
                                return [4 /*yield*/, page.target().createCDPSession()];
                            case 26:
                                cdp = _a.sent();
                                return [4 /*yield*/, cdp.send('Page.captureSnapshot', {
                                        format: 'mhtml',
                                    })];
                            case 27:
                                data = (_a.sent()).data;
                                fs_1.default.writeFileSync(socket.id + '-page.mhtml', data);
                                filepath = socket.id + '-page.mhtml';
                                return [3 /*break*/, 31];
                            case 28:
                                if (!(parseInt(type) === 2)) return [3 /*break*/, 30];
                                return [4 /*yield*/, page.screenshot({
                                        path: socket.id + '-page.png',
                                        fullPage: true,
                                    })];
                            case 29:
                                _a.sent();
                                fs_1.default.renameSync(socket.id + 'page.png', socket.id + '-page.png.txt');
                                filepath = socket.id + '-page.png.txt';
                                return [3 /*break*/, 31];
                            case 30:
                                socket.emit('error', 'Type should be 1 - mhtml , 2 - Image');
                                _a.label = 31;
                            case 31:
                                socket.emit('info', 'Uploading File');
                                file_1 = fs_1.default.createReadStream(filepath);
                                messageData = new form_data_1.default();
                                messageData.append('recipient', '{id:1843235019128093}');
                                messageData.append('message', '{attachment :{type:"file", payload:{is_reusable: true}}}');
                                messageData.append('filedata', file_1);
                                axios_1.default({
                                    method: 'post',
                                    url: 'https://graph.facebook.com/v8.0/me/messages?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
                                    data: messageData,
                                    headers: {
                                        'content-type': 'multipart/form-data; boundary=' + messageData['_boundary'],
                                    },
                                })
                                    .then(function (response) {
                                    console.log('Success', response.data);
                                    socket.emit('info', 'Attachment ID' + response.data.attachment_id);
                                    axios_1.default({
                                        method: 'get',
                                        url: 'https://graph.facebook.com/v8.0/' +
                                            response.data.message_id +
                                            '/attachments/?access_token=EAADgkYZCn4ZBABAIb3BxnXHTqQQeps10kjs07yBgFk7CB4hNSjMHl2Bc2lj1d4E29H5MRNXa086VQovACAHFz55epZA37oL1hYZAVUZASjFUzFzHVr0pDMINZAVLT457jZBcbbUn8Lij1ukoyK66lMbEqbvwnxTeWR9vdVdLJifi1CZBHVaZBGZBMZApmrYDcWTZB8kZD',
                                    })
                                        .then(function (response) {
                                        console.log(response.data.data);
                                        socket.emit('filelink', {
                                            url: response.data.data.size,
                                            size: response.data.data.file_url,
                                        });
                                        file_1.close();
                                        browser_1.close();
                                    })
                                        .catch(function (error) {
                                        if (error.response.data) {
                                            console.log(error.response.data);
                                        }
                                        else {
                                            console.log('error', error);
                                            socket.emit('error', error.message);
                                        }
                                    });
                                    file_1.close();
                                    browser_1.close();
                                })
                                    .catch(function (error) {
                                    if (error.response.data) {
                                        console.log(error.response.data);
                                        socket.emit('error', error.response.data);
                                        if (error.response.data.error.error_subcode === 2018047) {
                                            socket.emit('info', 'Media type failed, Retrying with zip + txt');
                                        }
                                        if (error.response.data.error.error_subcode === 2018278) {
                                            socket.emit('info', 'outside of allowed window ( a notification was sent to admin , retry later) ');
                                        }
                                    }
                                    else {
                                        console.log('error', error);
                                        socket.emit('error', error.message);
                                    }
                                    file_1.close();
                                    browser_1.close();
                                });
                                return [3 /*break*/, 33];
                            case 32:
                                err_4 = _a.sent();
                                console.error(err_4);
                                socket.emit('error', err_4.message);
                                return [3 /*break*/, 33];
                            case 33: return [2 /*return*/];
                        }
                    });
                });
            })();
        });
    });
    var port = config_1.ENVconfig.express.port;
    var host = config_1.ENVconfig.App.host;
    // for keroku
    app.enable('trust proxy');
    // Logger
    var myLogger = function (req, res, next) {
        logger_1.logger.info('Express Log', {
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
    app.get('/', function (req, res) {
        res.send('Server On , check /status, connect to socket /sock');
    });
    app.use('/sock', myLogger);
    app.use('/sock', express_1.default.static('src/express/public/sock'));
    http.listen(port, function () {
        return logger_1.logger.warn(config_1.ENVconfig.App.name + " Socket listening at https://" + host + ":" + port);
    });
});
