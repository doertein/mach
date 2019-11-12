"use strict"; 

const List = require('../models/lists.js');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const postListSchema = Joi.object().keys({
  name: Joi.string().required(),
  owner_id: Joi.number().integer().min(1).required(),
});

const patchListSchema = Joi.object().keys({
  name: Joi.string(),
  owner_id: Joi.number().integer().min(1),
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

      let pl = request.payload;

      // filter requests with anomaly in keys
      let diff = [];
      let keys = Object.keys(pl);
      let accepted_keys = ['name', 'list_id'];
      keys.filter((key) => {
        if(!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
      });

      // there are keys that were not expected so we give an error
      if(diff.length > 0) {
        let err = new Boom('Unexpected key(s) in object.', { statusCode: 400, data: diff });
        err.output.payload.detail = err.data;

        throw err;
      }

      let list = await List.getList(request.params.list_id);
      console.log(Joi.string().validate(pl.name));
      return list;
    },
  },
];
