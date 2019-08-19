const discordClientID = '521793846577856513';
export const MAPPROVIDER = 'https://stamen-tiles.a.ssl.fastly.net/toner-lite/';
const productionHostname = 'dx4.org';
const productionAPIBaseURL = 'https://dx4.org/raidalert/';
const developmentAPIBaseURL = 'https://dx4.org/raidalert-dev/';

// Don't edit below this line
const hostname = window && window.location && window.location.hostname;

export let APIBASEURL;
if (hostname === productionHostname) {
  APIBASEURL = productionAPIBaseURL;
} else {
  console.log('Running in development mode');
  APIBASEURL = developmentAPIBaseURL;
}
export const DISCORDAUTHURL =
 'https://discordapp.com/api/oauth2/authorize?client_id='
  + discordClientID
  + '&redirect_uri='
  + encodeURIComponent(APIBASEURL)
  + 'oauth.php&response_type=code&scope=identify%20guilds';
