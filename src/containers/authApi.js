/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const axios = require('axios');

const AUTH_URL = 'http://localhost:9999';


/**
 * Object will contain functions related to auth API calls from the desktop app
 */
const authApi = {};
authApi.login = body => axios.post(`${AUTH_URL}/login`, body);
authApi.refreshToken = body => axios.post(`${AUTH_URL}/refresh_token`, body);
authApi.signout = () => axios.get(`${AUTH_URL}/signout`);

/**
 * intercept all axios requests and append customer 'x-auth-token' header if
 * accessToken is available in localStorage
 */
axios.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) config.headers['x-auth-token'] = accessToken;
  return config;
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
    return axios.post(`${AUTH_URL}/refresh_token`, {
      refreshToken,
    })
      .then(res => {
        if (res.status === 200) {
          localStorage.setItem('accessToken', res.data.accessToken);
        // FIXME delete console.log
          console.log('Access token refresh successfully!');
          return axios(reqOriginal);
        }
        // Promise.reject('Token refresh error. Invalid status code')
      });
  }
  return Promise.reject(err);
});




export default authApi;
