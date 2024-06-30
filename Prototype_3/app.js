//==============================================SPOTIFY SETUP

const SpotifyWebApi = require('spotify-web-api-node');
const access_token = '';
const refresh_token = '';
const deviceId = '';

const spotifyApi = new SpotifyWebApi({
  clientId: '',
  clientSecret: '',
});

spotifyApi.setAccessToken(access_token);
  

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
}

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
}

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
    // Await the setShuffle call directly instead of using .then() and .catch()
    await spotifyApi.setShuffle(!shuffleState, { device_id: deviceId });
    console.log('Shuffle mode toggled!');
  } catch (error) {
    console.error('Error toggling shuffle state:', error);
  }
}
  

async function handleKeypad(key){
  if (key == 1) {
    await spotifyTogglePlayback();
  }
  if (key == 2) {
    await spotifyNext();
  }

  if (key == 3) {
    await spotifyBack();
  }

  if (key == 4){
    await spotifyToggleShuffle();
  }

}

//============================================Port handling
const { read } = require('johnny-five/lib/pin');
const { SerialPort } = require('serialport');


async function main(){
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
    const enc = new TextDecoder();
    const arr = new Uint8Array(data);
    const ready = enc.decode(arr);
  
    console.log('Data received:', ready);
    handleKeypad(ready);
  });

}

main()