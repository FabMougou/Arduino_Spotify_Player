const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = 8888;

//link to run https://accounts.spotify.com/authorize?client_id=f12e30f3795c4bbe9592050d8c2c8f04&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-state%20user-read-currently-playing

// Replace these with your Spotify app credentials
const clientId = 'f12e30f3795c4bbe9592050d8c2c8f04';
const clientSecret = 'd2d57cdd7fc04f25b435dab68be9ff77';
const redirectUri = 'http://localhost:8888/callback';

// Storage for tokens (example, use your preferred method like a database)
let accessToken = '';
let refreshToken = '';

// Step 1: Redirect to Spotify Authorization Page
app.get('/login', (req, res) => {
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-read-playback-state user-read-currently-playing';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.redirect(authUrl);
});

// Step 2: Spotify redirects to this URL with an authorization code
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify({
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        })
    };

    try {
        const response = await axios(authOptions);
        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        res.send(`
            <h1>Spotify Authorization Successful</h1>
            <p>Access Token: ${accessToken}</p>
            <p>Refresh Token: ${refreshToken}</p>
        `);
    } catch (error) {
        res.send('Error getting tokens: ' + error.message);
    }
});

// Route to refresh access token using refresh token
app.get('/refresh_token', async (req, res) => {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'post',
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    };

    try {
        const response = await axios(authOptions);
        accessToken = response.data.access_token;

        res.send(`
            <h1>Access Token Refreshed</h1>
            <p>New Access Token: ${accessToken}</p>
        `);
    } catch (error) {
        res.send('Error refreshing token: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

