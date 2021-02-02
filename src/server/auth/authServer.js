/* eslint-disable camelcase */
require('dotenv').config();
const express = require('express');


const app = express();
const server = require('http').createServer(app);

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const AUTH_PORT = 8080;

// jwt ACCESS token lifetime (in MINUTES)
const access_token_lifetime = 5;

// jwt REFRESH token lifetime (in HOURS)
const refresh_token_lifetime = 24;

server.listen(AUTH_PORT, () => {
  console.log(`Auth server started on port ${AUTH_PORT}`);
});

// FIXME 
let SERVER_IP='testserver'
let ACCESS_SECRET='Wa29*#B6H^n'
let REFRESH_SECRET='g#RD4dXaQH54'
let REFRESH_TOKEN_STORED;


const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');

/**
 * socket.io handler 
 * at this point, a jwt access token has already been generated and stored in localStorage
 * the handler verifies that the accessToken has been provided and subsequently verifies it 
 */
io.use(function (socket, next) {
  console.log(socket);
  if (socket.handshake.query && socket.handshake.query.accessToken) {
      console.log('SUCCESSFUL HANDSHAKE')
      jwt.verify(socket.handshake.query.accessToken, ACCESS_SECRET, (err, decoded) => {
        if (err) return next(new Error('Token authentication error!'))
        socket.emit('')
        socket.decoded = decoded;
        return next();
      });
    } else {
      return next(new Error('Token authentication error!'))
    }
})
.on('connection', socket => {
  console.log('SERVER SOCKET CONNECTED')
});




/** handler for login request
 * will check against serverIP and secret environment variables
 * if it's a match, will generate an access token and a refresh token
 */
app.post('/login', (req, res) => {
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
        // FIXME change back to original lifetime
        expiresIn: access_token_lifetime * 60,
        // expiresIn: 10,

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
app.post('/refresh_token', (req, res) => {
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


// FIXME incorporate into React signout functionality
app.get('/signout', (req, res) => {
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
