const sheets    = require("./sheets");
const translate = require("./translate");
const argv      = require('yargs').argv;
const Promise   = require("bluebird");

run = Promise.coroutine(function* () {
  var input = argv.in;
  if (input == null) {
    console.log("Error: no input was received to be translated");
    return;
  }

  try {
    var rowCells = [];
    var key      = translate.getKey(input, argv.key);

    var translations = yield translate.getTranslations(input)

    rowCells.push(key, input);
    rowCells = rowCells.concat(translations);

    yield sheets.updateTranslationSheet(rowCells);

  } catch (e) {
    console.log("Whoops! An Error was thrown.");
    console.log(e);
  }
});

run();
