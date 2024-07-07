//==============================================SPOTIFY SETUP

const SpotifyWebApi = require('spotify-web-api-node');
const access_token = 'BQD_arMOBKHlCWWWi48Ell5x_83My7qoOlYfKmaLAEr3P2ZX65ySrBs68HbCJOohNdd2RD6mptd7UpcUzZ8km5nwwq_afHadMpAI86AMEOEibjBX9iDiH8NECVIEJAGc3shzF13qBcypqIqxBUa6BrIqrYkCcKuOqct3v8593GgDQPQOZwd2hddwiCkXi1pwWwx6k6C8rT1Qjb_ZBh3-NktWJGdAzoOBVw9tPxyy4w-gQXSxwxcjsrP_jA';
const refresh_token = 'AQBkU9mqqMeWhOOssdvK-arLyO6jBTnnBgRBD7DhKApfTxYaSj7jt-1JeAyjJtJynmr2NdI1zN18E0RP6c3x3lSaPU6j9QLOuV-gGbysr2P-sfEnrSmcvwogW-BrP_GCTvo';
const deviceId = '6e5068422777bebe01b0707b8d30cc99ba2bb00f';

const cron = require('node-cron');

const spotifyApi = new SpotifyWebApi({
  clientId: 'f12e30f3795c4bbe9592050d8c2c8f04',
  clientSecret: 'd2d57cdd7fc04f25b435dab68be9ff77',
});

spotifyApi.setAccessToken(access_token);
  
//============================================Port handling
const { read, write } = require('johnny-five/lib/pin');
const { SerialPort } = require('serialport');
var receivedData = '';


const sp = new SerialPort({
  path: 'COM3',
  baudRate: 9600,
  autoOpen: false
});

sp.open((err) => {
  if (err) { 
    return console.log('Error opening port:', err.message);
  }
  console.log('Port has opened');
});

sp.on('data', async (data) => {
  var enc = new TextDecoder();
  var arr = new Uint8Array(data);
  var chunk = String(enc.decode(arr));
  chunk = chunk.trim();  // Remove leading/trailing whitespace

  //# is delimiter character
  if (chunk == "#"){
    handleKeypad(receivedData);
    handleRFID(receivedData);

    receivedData = '';
    chunk = "";
  }
  else {
    receivedData += chunk;  // Append received chunk to accumulated data
    console.log("Received data:", receivedData)
  }
});

async function writeToDisplay(msg){
  sp.write(msg, (err) => {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
}


//================================== SPOTIFY FUNCTIONS

function spotifyPlay(){
  spotifyApi.play({
    device_id: deviceId,
  })
  .then(() => {
    console.log('Playback resumed!');
  })
  .catch((err) => {
    console.error('Error resuming playback:', err);
  });
}

function spotifyPause(){
  spotifyApi.pause({
    device_id: deviceId,
  })
  .then(() => {
    console.log('Playback paused!');
  })
  .catch((err) => {
    console.error('Error pausing playback:', err);
  });
}

async function spotifyTogglePlayback() {
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState();
    if (data.body && data.body.is_playing) {
      spotifyPause();
    } else {
      spotifyPlay();
    }
  } catch (err) {
    console.error('Error checking playback state:', err);
    return false; 
  }
}

function spotifyGetDevices(){
  spotifyApi.getMyDevices()
  .then((data) => {
    const devices = data.body.devices;
    if (devices.length > 0) {
      console.log('List of devices:');
      devices.forEach((device) => {
        console.log(`Name: ${device.name}, ID: ${device.id}`);
      });
    } else {
      console.log('No devices found.');
    }
  })
  .catch((err) => {
    console.error('Error fetching devices:', err);
  });

}

async function spotifyNext(){
  spotifyApi.skipToNext({
    device_id: deviceId,
  })
  .then(() => {
    console.log('Skipped to next track!');
  })
  .catch((err) => {
    console.error('Error skipping to next track:', err);
  });
};

async function spotifyBack(){
  spotifyApi.skipToPrevious({
    device_id: deviceId,
  })
  .then(() => {
    console.log('Skipped to previous track!');
  })
  .catch((err) => {
    console.error('Error skipping to previous track:', err);
  });
};

async function checkShuffleState() {
  try {
    const data = await spotifyApi.getMyCurrentPlaybackState({ device_id: deviceId });

    if (data.body && data.body.shuffle_state) {
      return true; // Shuffle mode is enabled
    } else {
      return false; // Shuffle mode is disabled
    }
  } catch (err) {
    console.error('Error checking shuffle state:', err);
    return false; // Return false in case of error
  }
}

async function spotifyToggleShuffle(deviceId) {
  try {
    const shuffleState = await checkShuffleState();
    await spotifyApi.setShuffle(!shuffleState, { device_id: deviceId });
    console.log('Shuffle mode toggled!');
  } catch (error) {
    console.error('Error toggling shuffle state:', error);
  }
}

async function spotifyPlayPlaylist(playlistId) {
  try {
    await spotifyApi.play({
      context_uri: `spotify:playlist:${playlistId}`,
      device_id: deviceId,
    });
    console.log('Playlist playback started!');
  } catch (error) {
    console.error('Error playing playlist:', error);
  }
}

async function spotifyCurrentSong(){
  const data = await spotifyApi.getMyCurrentPlayingTrack();

    if (data.body && data.body.is_playing) {
      const track = data.body.item;
      const song = track.name;
      const artists = track.artists.map(artist => artist.name).join(', ');
      console.log(`Now Playing: ${song} by ${artists}`);
      writeToDisplay(song + "#" + artists);

    } else {
      console.log('No song currently playing.');
    }
}
//================================== HANDLING INPUTS
async function handleKeypad(key){
  if (key == '1') {
    await spotifyTogglePlayback();
    await spotifyCurrentSong();
  };
  if (key == '2') {
    await spotifyNext();
  };

  if (key == '3') {
    await spotifyBack();
  };

  if (key == '4'){
    await spotifyToggleShuffle();
  };
};

async function handleRFID(uid){
  if (uid == "4DD836AB82A81"){
    spotifyPlayPlaylist('5wZAfBSotlMHA6tfuh6MgT?si=eb218af942ba443a');
  }
};

cron.schedule('*/10 * * * * *', spotifyCurrentSong);