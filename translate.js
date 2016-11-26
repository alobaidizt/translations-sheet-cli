const _         = require("lodash");
const fs        = require('fs');
const Translate = require('@google-cloud/translate');
const Promise   = require("bluebird");

let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

var translate = Promise.promisifyAll(Translate({
  key: config.translateApiKey
}));

getTranslations = Promise.coroutine(function* (input) {

  console.log("getting translations!");
  translations = yield Promise.map(config.languages, Promise.coroutine(function* (target) {
    return yield translate.translateAsync(input, target)
  }));

  return translations;
});

function getKey(input, key) {
  if (key == null)
    key = input;
  else
    key = key;

  key = _.kebabCase(key).replace(/-/g, '.');
  return key
}

module.exports = {
  getKey: getKey,
  getTranslations: getTranslations
}
