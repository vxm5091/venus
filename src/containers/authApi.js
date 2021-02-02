/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

// import { SignIn } from './SignInContainer';


/* eslint-disable no-param-reassign */
const axios = require('axios');



// const AUTH_URL = 'http://localhost:9999';
// const AUTH_URL = 'http://ec2-3-15-29-241.us-east-2.compute.amazonaws.com';
// const AUTH_URL = 'https://ec2-3-15-29-241.us-east-2.compute.amazonaws.com';
// const AUTH_URL = 


/**
 * Object will contain functions related to auth API calls from the desktop app
 */
const authApi = {};
authApi.login = body => axios.post(`${body.serverAddress}/login`, body);
authApi.signout = () => axios.get(`${body.serverAddress}/signout`);
authApi.refreshToken = body => axios.post(`${body.serverAddress}/refresh_token`, body);

/**
 * intercept all axios requests and append customer 'x-auth-token' header if
 * accessToken is available in localStorage
 */
axios.interceptors.request.use(req => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) req.headers['x-auth-token'] = accessToken;
  return req;
});

/**
 * intercept all axios responses where server reject a request due to invalid token
 * in order to refresh token and try again
 */
axios.interceptors.response.use(res => res, err => {
  const reqOriginal = err.config;
  const refreshToken = localStorage.getItem('refreshToken');
  /**
   * check for (1) a valid refresh token in local storage
   * (2) a 401 status code indicating that the access token has expired
   * (3) that a token refresh hasn't already been attempted
   */
  if (refreshToken && err.response.status === 401 && !reqOriginal._retry) {
    reqOriginal._retry = true;
    return authApi.refreshToken({ refreshToken })
    // return axios.post(`${AUTH_URL}/refresh_token`, {
    //   refreshToken,
    // })
      .then(res => {
        if (res.status === 200) {
          localStorage.setItem('accessToken', res.data.accessToken);
        // FIXME delete console.log
          console.log('Access token refreshed successfully!');
          return axios(reqOriginal);
        }
      })
      .catch(error => console.error(error));
  }
  return Promise.reject(err);
});


export default authApi;
 