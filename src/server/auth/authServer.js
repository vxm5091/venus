/* eslint-disable camelcase */
require('dotenv').config();
const express = require('express');


const auth = express();
const jwt = require('jsonwebtoken');
// TODO figure out if we really need CORS

const cors = require('cors');

const bodyParser = require('body-parser');

auth.use(bodyParser.json());
auth.use(bodyParser.urlencoded({ extended: true }));



const AUTH_PORT = 9999;
// process.env.AUTH_PORT = AUTH_PORT;

// jwt ACCESS token lifetime (in MINUTES)
const access_token_lifetime = 5;

// jwt REFRESH token lifetime (in HOURS)
const refresh_token_lifetime = 24;

auth.listen(AUTH_PORT, () => {
  console.log(`Auth server started on port ${AUTH_PORT}`);
});


let SERVER_IP='testserver'
let ACCESS_SECRET='Wa29*#B6H^n'
let REFRESH_SECRET='g#RD4dXaQH54'
let REFRESH_TOKEN_STORED;



/**
 * global middleware to check if incoming request is authorized
 */
// TODO this should be a global middleware handler on the main server file
auth.get('*', (req, res, next) => {
  //  get the token stored in the customer header called 'x-auth-token'
  const token = req.get('x-auth-token');
  console.log('CHECK TOKEN', token)
  // send error message if no token is found
  if (!token) {
    return res.sendStatus(401).json({
      error: 'Access denied! Missing token...',
    });
  }
  try {
    /**
     * if incoming request has a valid token, we extract the payload from
     * the token and attach it to the request object
     */
    const payload = jwt.verify(token, ACCESS_SECRET);
    console.log('CHECK PAYLOAD', payload)
    req.serverIP = payload.serverIP;
    return next();
  } catch (error) {
    return res.status(401).json({ error });
  }
});

/** handler for login request
 * will check against serverIP and secret environment variables
 * if it's a match, will generate an access token and a refresh token
 */
auth.post('/login', (req, res) => {
  console.log('LOGIN BODY', req.body);
  console.log('ENV DATA', {
    serverIP: SERVER_IP,
    secret: ACCESS_SECRET,
  });
  const { serverIP, secret } = req.body;
  // check against environment variables
  if (
    serverIP === SERVER_IP
    && secret === ACCESS_SECRET
  ) {
    // generate access token
    const accessToken = jwt.sign(
      {
        serverIP,
      },
      secret,
      {
        expiresIn: access_token_lifetime * 60,
      },
    );

    // generate refresh token
    const refreshToken = jwt.sign(
      {
        serverIP,
      },
      REFRESH_SECRET,
      {
        // 3600 = seconds in 1 hour
        expiresIn: refresh_token_lifetime * 3600,
      },
    );
    // FIXME update logic
    REFRESH_TOKEN_STORED = refreshToken;
    console.log('ACCESS TOKEN', accessToken)
    console.log('REFRESH TOKEN', refreshToken)
    console.log('REFRESH TOKEN STORED', REFRESH_TOKEN_STORED)
    return res.json({
      accessToken,
      refreshToken,
    });
  }
  res.status(403).send('Incorrect credentials');
});

// refresh token handler
auth.post('/refresh_token', (req, res) => {
  const { refreshToken } = req.body;
  // check if refreshToken was included in body
  if (!refreshToken) {
    return res.sendStatus(401).json({
      error: 'Access denied! Missing token...',
    });
  }
  // query cache to ensure that token is valid
  console.log('REQ BODY TOKEN', refreshToken)
  console.log('STORED TOKEN', REFRESH_TOKEN_STORED);
  if (refreshToken !== REFRESH_TOKEN_STORED) {
    return res.status(403).json({
      error: 'Token expired!',
    });
  }
  // extract payload from refresh token and generate new access token
  const payload = jwt.verify(REFRESH_TOKEN_STORED, REFRESH_SECRET);
  const accessToken = jwt.sign(
    {
      serverIP: payload,
    },
    ACCESS_SECRET,
    {
      expiresIn: access_token_lifetime * 60,
    },
    // FIXME take this line out
    (err, token) => console.log(`access token successfully created ${token}`),
  );
  return res.json({ accessToken });
});

auth.get('/signout', (req, res) => {
  try {
    // delete the refresh token saved in local cache
    // const { refreshToken } = req.body;
    // FIXME update logic
    REFRESH_TOKEN_STORED = null;
    return res.json({
      success: 'User logged out!'
    })
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error!"
    })
  }
});
