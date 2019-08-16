"use strict"; 

const Task = require('../models/tasks.js');
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
    handler: (request) => {
      if(!request.query.list_id) {
        throw Boom.badRequest('missing list id');
      }

      Joi.validate(request.query.list_id, Joi.number().integer().min(1), error => {
        if(error) {
          throw new Boom('list_id has to be an integer', { statusCode: 400 });
        }
      });

      return Task.getTasks(request.query.list_id);
    },
  },
  {
    method: 'GET',
    path: '/api/tasks/{task_id}',
    handler: async (request) => {
      Joi.validate(request.params.task_id, Joi.number().integer().min(1), error => {
        if(error) {
          throw new Boom('The identifier has to be an integer', { statusCode: 400 });
        }
      });

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
      Joi.validate(pl, postTaskSchema, { abortEarly: false }, error => { 
        if(error) {
          let err = new Boom('Invalid parameters given.', { statusCode: 400, data: error.details.map( e => e.message ) });
          err.output.payload.detail = err.data;

          throw err;
        }
      });

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
      Joi.validate(request.params.task_id, Joi.number().integer().min(1), error => {
        if(error) {
          throw new Boom('The identifier has to be an integer', { statusCode: 400 });
        }
      });

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
      let pl = request.payload;
      let task = await Task.getTask(request.params.task_id);

      // define attributes that are removable
      let allowed_to_remove = ['asignee_id', 'timer_reminder', 'due_date'];

      // filter not existings tasks and give back the error
      if(task.length === 0) {
        throw Boom.notFound('No resource(s) found for [' + request.params.task_id + ']');
      }

      // check for parameters with a wrong value
      Joi.validate(pl, patchTaskSchema, { abortEarly: false }, error => { 
        if(error) {
          err = new Boom('invalid parameters given.', { statusCode: 400, data: error.details.map( e => e.message ) });
          err.output.payload.detail = err.data;

          throw err;
        }
      });

      // filter requests with anomaly in keys
      let diff = [];
      let keys = Object.keys(pl);
      let accepted_keys = Object.keys(task[0]);
      keys.filter((key) => {
        if(!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
      });

      // there are keys that were not expected so we give an error
      if(diff.length > 0) {
        err = new Boom('Unexpected key(s) in object.', { statusCode: 400, data: diff });
        err.output.payload.detail = err.data;

        throw err;
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
