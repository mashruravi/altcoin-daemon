'use strict';

const MongoClient = require('mongodb').MongoClient;

let url = '';
if (process.env.VCAP_SERVICES) {
  const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
  url = vcap_services.mongodb[0].credentials.uri;
} else {
  url = 'mongodb://localhost:27017/altcoin';
}

const _getDbInstance = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      resolve(db);
    });
  });
};

const _getRecordAtDate = (date, collection) => {
  return new Promise((resolve, reject) => {
    _getDbInstance().then(db => {
      db
        .collection(collection)
        .find({
          'date': date
        })
        .toArray((err, arr) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(arr);
          db.close();
        });
    });
  });
};

const _insertIntoDb = (collection, data) => {
  _getDbInstance().then(db => {
    db
      .collection(collection)
      .insert(data)
      .then(() => {
        db.close();
      });
  });
};

const _updateRecord = (collection, date, updateData) => {
  _getDbInstance().then(db => {
    db
      .collection(collection)
      .update({ date: date }, updateData)
      .then(() => {
        db.close();
      });
  });
};

module.exports = {
  saveData: (collection, date, value) => {
    _getRecordAtDate(date, collection).then(arr => {
      if (arr.length === 0) {
        _insertIntoDb(collection, {
          date: date,
          open: value,
          close: value,
          min: value,
          max: value
        });
      } else {
        const record = arr[0];
        const date = record['date'];

        const update = {
          $set: { close: value }
        };

        if (value < record['min']) {
          update.$set['min'] = value;
        }

        if (value > record['max']) {
          update.$set['max'] = value;
        }

        _updateRecord(collection, date, update);
      }
    });
  }
};
