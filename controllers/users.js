const Boom = require('@hapi/boom');
const Jwt = require('jsonwebtoken');
const Auth = require('../models/auth.js');
const Db = require('../db');
const userSchemas = require('../schemas/users.js');
const { requestHelper } = require('../utils/api.js');
require('dotenv').config();

let refreshTokens = [];
let generateAuthTokens = (payload) => {
  // TODO change after testing stage
  let accessToken = Jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10y' });
  let refreshToken = Jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '14d' });

  return { 'accessToken': accessToken, 'refreshToken': refreshToken };
}

class UserController {

  async login(request) {
    userSchemas.login.validate(request.payload, { abortEarly: false, errors: { escapeHtml: true } });

    let auth = new Auth(Db);
    return auth.login(request.payload.email, request.payload.password)
      .then(res => {
        if(res.error) {
          let err = Boom.badRequest('login_failed');
          err.output.payload.detail = res.error.message;
          throw err;
        }

        // TODO: reset expiresIn to 10m as soon as frontend flow is ready
        let authTokens = generateAuthTokens({ user: res });
        refreshTokens.push(authTokens.refreshToken);

        return { 'user': res, 'accessToken': authTokens.accessToken, 'refreshToken': authTokens.refreshToken };
      });
  }

  async register(request) {
    requestHelper.validateSchema(userSchemas.login, request.payload);

    let auth = new Auth(Db);
    let user = await auth.register(request.payload.email, request.payload.password);
    if(user.error) {
      console.log(user.error.data);
      throw Boom.badImplementation(user.error.message);
    }

    // indeed very bulletproof
    return { 'success': true, 'user': user };
  }

  async token(request) {
    if(!request.payload || request.payload && !request.payload.refreshToken) {
      throw Boom.badRequest('Missing refresh token.');
    }

    let oldRefreshToken = request.payload.refreshToken;
    if(!refreshTokens.includes(oldRefreshToken)) {
      throw Boom.forbidden('Invalid refresh token.');
    }

    return Jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET, (err, user) => {

      if(err) {
        throw Boom.forbidden('Invalid refresh token.');
      }

      let authTokens = generateAuthTokens({ 'user': user });
      refreshTokens.push(authTokens.refreshToken);

      refreshTokens = refreshTokens.filter( t => t !== oldRefreshToken );
      return ({ 'accessToken': authTokens.accessToken, 'refreshToken': authTokens.refreshToken }); 
    });
  }
}

module.exports = new UserController();
