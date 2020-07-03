"use strict";

//TODO rethink authentication
//TODO blacklist some tokens i.e. when a user logs out (redis?)
//TODO use redis for storing tokens / start storing tokens
const userController = require('../controllers/users.js');
require('dotenv').config();

module.exports = [
  {
    method: 'POST',
    path: '/users/register',
    handler: userController.register,
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/users/login',
    handler: userController.login,
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/users/token',
    handler: userController.token,
    options: {
      auth: false
    }
  },
  {
    method: 'POST',
    path: '/users/logout',
    handler: (request, h) => {
      //TODO rethink authentication/authorization. store refreshtokens and blacklist users token
      //TODO remove stuff from redis maybe?
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
