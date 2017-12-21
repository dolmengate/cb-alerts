
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const bodyParser = require('body-parser');
const apis = require('./libs/apis');
const https = require('https');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const PORT = '3000';

/* express setup */
const express = require('express');
const app = express();

/* TLS setup */
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname, '..', 'test.key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', 'test.crt.pem')),
}, app);

/* websocket server setup */
const WebSocket = require('ws');
const wsserver = new WebSocket.Server( {server} );

/* express routes */
const dashboard = require('./routes/dashboard');
const signup = require('./routes/signup');
const login = require('./routes/login');
const logout = require('./routes/logout');

exports.start = function () {

    // set static files serving
    app.use(express.static(path.join(__dirname, 'public')));

    // setup view locations and interpretation
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    // allow reading request body
    app.use(bodyParser.urlencoded());
    app.use(bodyParser.json());

    const store = new MongoDBStore({
        uri: 'mongodb://localhost:27017/test',
        collection: 'sessions'
    });

    app.use(session({
        secret: 'elemenopeecue',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true, httpOnly: true },
        store: store
    }));

    store.on('error', (err) => {
        assert.ifError(err);
        assert.ok(false);
    });

    /* Route mappings */
    app.use('/calerts/dashboard', dashboard);
    app.use('/calerts/signup', signup);
    app.use('/calerts/login', login);
    app.use('/calerts/logout', logout);

    // catch and forward 404
    app.use((req, res, next) => {
        let err = new Error('404 - Not Found');
        err.status = 404;
    });

    // while a user is connected update the page results
    wsserver.on('connection', (socket, req) => {
        socket.on('message', (msg) => {
            console.log(msg);
        });

        // socket update loop
        setInterval(() => {
            // prevent WebSocket from throwing 'not opened' error
            if (socket.readyState === WebSocket.OPEN) {
                getTickerData((tdma, mm, cp) => {
                    socket.send(
                        JSON.stringify(
                            {
                                twoHundredDayMovingAverage: tdma.toFixed(2),
                                mayerMultiple: mm.toFixed(1),
                                currentPrice: cp.toFixed(2)
                            }), (err) => { /* don't crash the server ffs */ })
                })
            }
        }, 10000);  // ten seconds
    });

    server.listen(PORT);
    console.log('app listening on port: ' + PORT);
};

function getTickerData(callback) {
    apis.get200DayMovingAverage('BTC-USD', (tdma) => {
        apis.getMayerMultiple((mm) => {
            apis.getCurrentPrice('BTC-USD', (cp) => {
                callback(tdma, mm, cp);
            })
        })
    })
}
