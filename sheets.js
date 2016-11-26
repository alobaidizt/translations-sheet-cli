var Promise    = require("bluebird");
var fs         = Promise.promisifyAll(require('fs'));
var readline   = require('readline');
var google     = require('googleapis');
var googleAuth = require('google-auth-library');

let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES     = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR  = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

updateTranslationSheet = Promise.coroutine(function* (translations) {
  // Load client secrets from a local file.
  var content      = yield fs.readFileAsync('client_secret.json');
  var credentials  = JSON.parse(content);

  // Authorize a client with the loaded credentials
  var clientSecret = credentials.installed.client_secret;
  var clientId     = credentials.installed.client_id;
  var redirectUrl  = credentials.installed.redirect_uris[0];
  var auth         = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  try {
    // Check if we have previously stored a token.
    var token = yield fs.readFileAsync(TOKEN_PATH);
    oauth2Client.credentials = JSON.parse(token);
    yield appendTranslations(oauth2Client, translations);

  } catch (e) {
    yield getNewToken(oauth2Client, translations);
  }
});

getNewToken = Promise.coroutine(function* (oauth2Client, translations) {
  //oauth2Client.getToken = Promise.promisify(oauth2Client.getToken);
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope:       SCOPES
  });

  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', Promise.coroutine(function* (code) {
    rl.close();
    try {
      var token = yield Promise.promisify(oauth2Client.getToken(code));
      oauth2Client.credentials = token;
      storeToken(token);
      yield appendTranslations(oauth2Client, translations);

    } catch (err) {
      console.log('Error while trying to retrieve access token', err);
      return;
    }
  }));
});

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

appendTranslations = Promise.coroutine(function* (auth, translations) {
  try {
    var sheets = google.sheets('v4');
    Promise.promisifyAll(sheets.spreadsheets.values);
    var response = yield sheets.spreadsheets.values.appendAsync({
      auth:             auth,
      spreadsheetId:    config.spreadSheetId,
      range:            'Sheet1!A2',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      fields:           ["updates.updatedCells"],
      resource:
        {
          range: 'Sheet1!A2',
          majorDimension: 'ROWS',
          values: [translations]
        }
    });

    var updatedCells = response.updates.updatedCells;
    if (updatedCells == 0)
      console.log("No updates were pushed!");
    else
      console.log("updated!");

  } catch (err) {
    console.log('The API returned an error: ' + err);
    return;
  }
});

module.exports = {
  updateTranslationSheet: updateTranslationSheet
}
