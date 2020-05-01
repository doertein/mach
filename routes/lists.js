"use strict"; 

const List = require('../models/lists.js');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const listSchemas = require('../schemas/lists.js');

module.exports = [ 
  {
    method: 'GET',
    path: '/lists',
    handler: () => {
      //auth play a big factor here
      return List.getLists(1);
    },
  },
  {
    method: 'GET',
    path: '/api/lists/{list_id}',
    handler: async (request) => {
      let validation = Joi.number().integer().min(1).validate(request.params.list_id);
      if(validation.error) {
        throw Boom.badRequest('The identifier has to be an integer');
      }

      return List.getList(request.params.list_id);
    },
  },
  {
    method: 'POST',
    path: '/lists',
    handler: async (request, h) => {
      let pl = request.payload;

      // check for parameters with a wrong value
      let validation = listSchemas.newList.validate(pl, { abortEarly: false, errors: { escapeHtml: true } });
      if(validation.error) {
        let err = Boom.badRequest('Invalid parameters given.');
        err.output.payload.detail = validation.error;

        throw err;
      }

      return List.newList(pl.name, pl.owner_id)
        .then(data => { 
          return h.response(data).code(201); 
        });
    },
  },
  {
    method: 'DELETE',
    path: '/lists/{list_id}',
    handler: async (request, h) => {
      let validation = Joi.number().integer().min(1).validate(request.params.list_id);
      if(validation.error) {
        throw Boom.badRequest('The identifier has to be an integer');
      }

      return List.deleteList(request.params.list_id);
    },
  },
  {
    method: 'PATCH',
    path: '/lists/{list_id}',
    handler: async (request, h) => {
      let validation = Joi.number().integer().min(1).validate(request.params.list_id);
      if(validation.error) {
        throw Boom.badRequest('The identifier has to be an integer');
      }

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
        let err = Boom.badRequest('Unexpected key(s) in object.');
        throw err;
      }

      let list = await List.getList(request.params.list_id);
      return list;
    },
  },
];
