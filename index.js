const Pusher = require('pusher-client');
const Constants = require('./constants');
const DB = require('./database');

const http = require('http');

const pusherKey = process.env.PUSHER_KEY;
if (!pusherKey) {
  console.error(
    'Pusher key not found. Set it as PUSHER_KEY environment variable'
  );
  return;
}

const pusherClient = new Pusher(pusherKey, {
  cluster: 'ap2'
});

const previousValues = {};

const getCurrentDate = () => {
  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

const saveToDb = (currency, value) => {
  const date = getCurrentDate();
  const collection = Constants.currencies[currency].dbCollection;

  DB.saveData(collection, date, value);
};

pusherClient.subscribe('my-channel').bind('ticker', data => {
  const values = data.message.data;

  // Check if data is different from previous value
  Object.keys(Constants.currencies).map(currency => {
    const code = Constants.currencies[currency]['code'];
    const _old = previousValues[code];
    const _new = parseFloat(values[code]);
    if (_old !== _new) {
      previousValues[code] = _new;

      saveToDb(currency, _new);
    }
  });
});

const server = http.createServer((req, res) => {
  res.end('daemon running...');
});

server.listen(process.env.PORT || 3000);