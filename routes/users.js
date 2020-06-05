"use strict";

//TODO rethink authentication
//TODO blacklist some tokens i.e. when a user logs out (redis?)
//TODO use redis for storing tokens / start storing tokens
const Boom = require('@hapi/boom');
const Db = require('../db');
const Jwt = require('jsonwebtoken');
const Auth = require('../models/auth.js');
const Joi = require('@hapi/joi');
const userSchemas = require('../schemas/users.js');
require('dotenv').config();

const auth = new Auth(Db);
let refreshTokens = [];

module.exports = [
  {
    method: 'POST',
    path: '/users/register',
    handler: async(request, h) => {
      const validation = userSchemas.register.validate(request.payload, { abortEarly: false, errors: { escapeHtml: true } });
      if(validation.error) {
        let err = Boom.badRequest('invalid parameters given.');
        err.output.payload.detail = validation.error.details;

        throw err;
      }

      let user = await auth.register(request.payload.email, request.payload.password);
      if(user.error) {
        console.log(user.error.data);
        throw Boom.badImplementation(user.error.message);
      }

      return { 'success': true, 'user': user };
    },
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/users/login',
    handler: async (request, h) => {
      const validation = userSchemas.login.validate(request.payload, { abortEarly: false, errors: { escapeHtml: true } });
      if(validation.error) {
        let err = Boom.badRequest('invalid parameters given.');
        err.output.payload.detail = validation.error.details;

        throw err;
      }

      return auth.login(request.payload.email, request.payload.password)
        .then(res => {
          if(res.error) {
            let err = Boom.badRequest('Login failed');
            err.output.payload.detail = res.error.message;
            throw err;
          }

          let accessToken = Jwt.sign({ user: res }, process.env.JWT_SECRET, { expiresIn: '10d' });
          let refreshToken = Jwt.sign({ user: res }, process.env.REFRESH_SECRET, { expiresIn: '14d' });
          refreshTokens.push(refreshToken);

          return { 'user': res, 'accessToken': accessToken, 'refreshToken': refreshToken };
        });
    },
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/users/token',
    handler: (request, h) => {
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

        let accessToken = Jwt.sign({ 'user': user }, process.env.JWT_SECRET, { expiresIn: '10m' });
        let refreshToken = Jwt.sign({ 'user': user }, process.env.REFRESH_SECRET, { expiresIn: '14d' });
        refreshTokens.push(refreshToken);

        refreshTokens = refreshTokens.filter( t => t !== oldRefreshToken );
        return ({ 'accessToken': accessToken, 'refreshToken': refreshToken }); 
      });
    },
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/users/logout',
    handler: (request, h) => {
      //TODO rethink authentication/authorization. store refreshtokens and blacklist users token
      return { text: 'logged out' };
    }
  },
  {
    method: 'GET',
    path: '/users',
    handler: (request, h) => {

    },
  }
]
