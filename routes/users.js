"use strict";

const Boom = require('@hapi/boom');
const Db = require('../db');
const Jwt = require('jsonwebtoken');
const User = require('../models/users.js');
const Joi = require('@hapi/joi');
const userSchemas = require('../schemas/users.js');
require('dotenv').config();

const userModel = new User(Db);

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

      let user = await userModel.register(request.payload.email, request.payload.password);
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

      return userModel.login(request.payload.email, request.payload.password)
        .then(res => {
          if(res.error) {
            let err = Boom.badRequest('Login failed');
            err.output.payload.detail = res.error.message;
            throw err;
          }

          let token = Jwt.sign({ user: res }, process.env.JWT_SECRET);
          
          return { 'user': res, 'token': token };
        });
    },
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/users',
    handler: (request, h) => {

    },
  }
]
