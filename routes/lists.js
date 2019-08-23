"use strict"; 

const List = require('../models/lists.js');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const postListSchema = Joi.object().keys({
  name: Joi.string().required(),
  owner_id: Joi.number().integer().min(1).required(),
});

module.exports = [ 
  {
    method: 'GET',
    path: '/api/lists',
    handler: () => {
      //auth play a big factor here
      return List.getLists(1);
    },
  },
  {
    method: 'GET',
    path: '/api/lists/{list_id}',
    handler: async (request) => {
      Joi.validate(request.params.list_id, Joi.number().integer().min(1), error => {
        if(error) {
          throw new Boom('The identifier has to be an integer', { statusCode: 400 });
        }
      });

      return List.getList(request.params.list_id);
    },
  },
  {
    method: 'POST',
    path: '/api/lists',
    handler: async (request, h) => {
      let pl = request.payload;

      // check for parameters with a wrong value
      Joi.validate(pl, postListSchema, { abortEarly: false }, error => { 
        if(error) {
          let err = new Boom('Invalid parameters given.', { statusCode: 400, data: error.details.map( e => e.message ) });
          err.output.payload.detail = err.data;

          throw err;
        }
      });

      return List.newList(pl.name, pl.owner_id)
        .then(data => { 
          return h.response(data).code(201); 
        });
    },
  },
  {
    method: 'DELETE',
    path: '/api/lists/{list_id}',
    handler: async (request, h) => {
      Joi.validate(request.params.list_id, Joi.number().integer().min(1), error => {
        if(error) {
          throw new Boom('The identifier has to be an integer', { statusCode: 400 });
        }
      });

      return List.deleteList(request.params.list_id);
    },
  },
  {
    method: 'PATCH',
    path: '/api/lists/{list_id}',
    handler: async (request, h) => {
      Joi.validate(request.params.list_id, Joi.number().integer().min(1), error => {
        if(error) {
          throw new Boom('The identifier has to be an integer', { statusCode: 400 });
        }
      });
    },
  },
];
