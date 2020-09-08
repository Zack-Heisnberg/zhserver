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
            var link = _a.link, actions = _a.actions, type = _a.type;
            logger_1.logger.info('Downloading ' + link + actions + type);
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            (function main() {
                return __awaiter(this, void 0, void 0, function () {
                    var browser, page, cdp, data, file_1, messageData, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 6, , 7]);
                                socket.emit('info', 'Started Task');
                                return [4 /*yield*/, puppeteer.launch({
                                        args: ['--no-sandbox'],
                                    })];
                            case 1:
                                browser = _a.sent();
                                socket.emit('info', 'launched Browser');
                                return [4 /*yield*/, browser.pages()];
                            case 2:
                                page = (_a.sent())[0];
                                return [4 /*yield*/, page.goto(link)];
                            case 3:
                                _a.sent();
                                socket.emit('info', 'Generating MHTML' + link);
                                return [4 /*yield*/, page.target().createCDPSession()];
                            case 4:
                                cdp = _a.sent();
                                return [4 /*yield*/, cdp.send('Page.captureSnapshot', {
                                        format: 'mhtml',
                                    })];
                            case 5:
                                data = (_a.sent()).data;
                                socket.emit('info', 'Uploading File');
                                fs_1.default.writeFileSync(socket.id + 'page.mhtml', data);
                                file_1 = fs_1.default.createReadStream(socket.id + 'page.mhtml');
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
                                        console.log(response.data.file_url);
                                        socket.emit('filelink', response.data.file_url);
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
                                });
                                return [3 /*break*/, 7];
                            case 6:
                                err_1 = _a.sent();
                                console.error(err_1);
                                socket.emit('error', err_1.message);
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
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
