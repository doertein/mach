"use strict";

const Db = require('../db');
const userModel = require('../models/users.js');

const registerSchema = Joi.object().keys({
  email: Joi.string.email().required(),
  password: Joi.string.pattern(),
  repeat_password: Joi.ref('password'),
});

module.exports = [
  {
    method: 'POST',
    path: '/users/register',
    handler: async(request, h) => {
      let query = `INSERT INTO 
                     users
                  (
                    user_email,
                    user_creation_time
                  )
                   VALUES
                   (
                    $1,
                    NOW()
                   )`;
      let pl = request.payload;
      let values = [pl.user_email];

      try {
        let res = await Db.query(query, value);
        if(res && res.rowCount === 1) { 
          return {
            success: true,
          };
        } else {
          return {
            success: false,
          };
        }
      } catch(err) {
        request.log(['error', 'database', 'users', 'register'], err);
        return {
          success: false,
        };
      }
    },
  },
  {
    method: 'GET',
    path: '/users',
    handler: (request, h) => {
      
    },
  }
]
