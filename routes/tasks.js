"use strict"; 

const Task = require('../models/tasks.js');
const List = require('../models/lists.js');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const postTaskSchema = Joi.object().keys({
  list_id: Joi.number().integer().min(1).required(),
  name: Joi.string().required(),
  user_created: Joi.number().integer().min(1).required(),
});

const patchTaskSchema = Joi.object().keys({
  task_id: Joi.number().integer().min(1),
  list_id: Joi.number().integer().min(1),
  name: Joi.string(),
  completed: Joi.boolean(),
  user_completed: Joi.number().integer().min(1),
  asignee_id: Joi.number().integer().min(1),
  due_date: Joi.date().iso(),
  time_reminder: Joi.date().iso(),
  remove: Joi.array().items(Joi.string()),
});

module.exports = [ 
  {
    method: 'GET',
    path: '/api/tasks',
    handler: async (request) => {
      if(!request.query.list_id) {
        throw Boom.badRequest('Missing list_id');
      }

      let validation = Joi.number().integer().min(1).validate(request.query.list_id);
      if(validation.error) {
        throw Boom.badRequest('list_id has to be an integer');
      }

      let list = await List.getList(request.query.list_id);
      if(list.length === 0) {
        throw Boom.notFound('List not found for list_id=[' + request.query.list_id + ']');
      }

      return Task.getTasks(request.query.list_id);
    },
  },
  {
    method: 'GET',
    path: '/api/tasks/{task_id}',
    handler: async (request) => {
      let validation = Joi.number().integer().min(1).validate(request.params.task_id);
      if(validation.error) {
        throw Boom.badRequest('The identifier has to be an integer');
      }

      let task = await Task.getTask(request.params.task_id);

      // filter not existings tasks
      if(task.length === 0) {
        throw Boom.notFound('No resource(s) found for [' + request.params.task_id + ']');
      }

      return Task.getTask(request.params.task_id);
    },
  },
  {
    method: 'POST',
    path: '/api/tasks',
    handler: async (request, h) => {
      let pl = request.payload;

      // check for parameters with a wrong value
      let validation = postTaskSchema.validate(pl, { abortEarly: false, errors: { escapeHtml: true } }); 
      if(validation.error) {
        let err = Boom.badRequest('Invalid parameters given.');
        err.output.payload.detail = validation.error;

        throw err;
      }


      return Task.newTask(pl.name, pl.list_id, pl.user_created)
        .then(data => { 
          return h.response(data).code(201); 
        });
    },
  },
  {
    method: 'DELETE',
    path: '/api/tasks/{task_id}',
    handler: async (request, h) => {
      let validation = Joi.number().integer().min(1).validate(request.params.task_id);;
      if(validation.error) {
        throw Boom.badRequest('The identifier has to be an integer');
      }

      let task = await Task.getTask(request.params.task_id);

      // filter not existings tasks
      if(task.length === 0) {
        throw Boom.notFound('No resource(s) found for [' + request.params.task_id + ']');
      }

      return Task.deleteTask(request.params.task_id)
        .then(() => { 
          return h.response().code(204);
        });
    },
  },
  {
    method: 'PATCH',
    path: '/api/tasks/{task_id}',
    handler: async (request) => {
      let err;
      let validation;
      let pl = request.payload;

      validation = Joi.number().integer().min(1).validate(request.params.task_id);;
      if(validation.error) {
        throw Boom.badRequest('The identifier has to be an integer');
      }

      let task = await Task.getTask(request.params.task_id);

      // define removable attributes
      let allowed_to_remove = ['asignee_id', 'timer_reminder', 'due_date'];

      // filter non existings tasks and give an error
      if(task.length === 0) {
        throw Boom.notFound('No resource(s) found for [' + request.params.task_id + ']');
      }

      // check for parameters with a wrong value
      validation = patchTaskSchema.validate(pl, { abortEarly: false, errors: { escapeHtml: true } });
      if(validation.error) {
        err = Boom.badRequest('invalid parameters given.');
        err.output.payload.detail = validation.error;

        throw err;
      }

      // filter requests with unexpected keys
      let diff = [];
      let keys = Object.keys(pl);
      let accepted_keys = Object.keys(task[0]);
      keys.filter((key) => {
        if(!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
      });

      // there are unexpected keys so we send an error
      if(diff.length > 0) {
        throw Boom.badRequest('Unexpected key(s) in object.');
      }

      // PARAMETER VALIDATION

      if(pl.list_id) {
        task[0].list_id = pl.list_id;
      }

      if(pl.name) {
        task[0].name = pl.name;
      }

      if(pl.completed && pl.user_completed) {
        task[0].completed = pl.completed;
        task[0].user_completed = pl.user_completed ? pl.user_completed : null;
        task[0].time_completed = pl.completed === true ? new Date() : null;
      }

      if(pl.asignee_id) {
        task[0].asignee_id = pl.asignee_id;
      }

      if(pl.due_date) {
        task[0].due_date = pl.due_date;
      }

      if(pl.time_reminder) {
        task[0].time_reminder = new Date(pl.time_reminder);
      }

      if(pl.remove && pl.remove.length > 0) {
        pl.remove.filter(key => {
          if(allowed_to_remove.includes(key)) {
            console.log(key);
            task[0][key] = null;
          }
        });
      }

      return Task.editTask(task[0]);
    },
  },
];
