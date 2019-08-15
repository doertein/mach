"use strict"; 

const Task = require('../models/tasks.js');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const postTaskSchema = Joi.object().keys({
  list_id: Joi.number().integer().min(1),
  name: Joi.string(),
  user_created: Joi.number().integer().min(1),
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
});

module.exports = [ 
  {
    method: 'GET',
    path: '/api/tasks',
    handler: (request) => {
      if(!request.query.list_id) {
        return Boom.badRequest('missing list id');
      }

      return Task.getTasks(request.query.list_id);
    },
  },
  {
    method: 'GET',
    path: '/api/tasks/{task_id}',
    handler: async (request) => {
      let task = await Task.getTask(request.params.task_id);

      // filter not existings tasks
      if(task.length === 0) {
        return Boom.notFound('no resource(s) found for [' + request.params.task_id + ']');
      }

      return Task.getTask(request.params.task_id);
    },
  },
  {
    method: 'POST',
    path: '/api/tasks',
    handler: async (request, h) => {
      let err;
      let required = ['name', 'list_id', 'user_created'];
      let pl = request.payload;
      
      // check for parameters with a wrong value
      Joi.validate(pl, postTaskSchema, { abortEarly: false }, error => { 
        if(error) {
          err = new Boom('invalid parameters given.', { statusCode: 400, data: error.details.map( e => e.message ) });
          err.output.payload.detail = err.data;
        }
      });

      // check required keys
      Object.keys(pl).filter(k => {
        required = required.filter(r => { 
          return r !== k; 
        });
      });

      if(required.length > 0) {
        err = new Boom('missing parameter(s)', { statusCode: 400, data: required });
        err.output.payload.detail = err.data;
      }

      if(err && err instanceof Boom) {
        return err;
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
      let task = await Task.getTask(request.params.task_id);

      // filter not existings tasks
      if(task.length === 0) {
        return Boom.notFound('no resource(s) found for [' + request.params.task_id + ']');
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

      // filter not existings tasks
      if(task.length === 0) {
        err = Boom.notFound('no resource(s) found for [' + request.params.task_id + ']');
      }

      // check for parameters with a wrong value
      Joi.validate(pl, patchTaskSchema, { abortEarly: false }, error => { 
        if(error) {
          err = new Boom('invalid parameters given.', { statusCode: 400, data: error.details.map( e => e.message ) });
          err.output.payload.detail = err.data;
        }
      });

      // filter requests with anomaly in keys
      let diff = [];
      let keys = Object.keys(pl);
      let accepted_keys = Object.keys(task[0]);
      keys.filter((key) => {
        if(!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
      });

      if(diff.length > 0) {
        err = new Boom('unexpected key(s) in object.', { statusCode: 400, data: diff });
        err.output.payload.detail = err.data;
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
          if(allowed_to_remove.includes(key)) task[0][key] = null;
        });
      }

      //Joi.validate(task[0], dbTasksSchema, err => console.log(err));
      if(err && err instanceof Boom) {
        return err;
      }

      return Task.editTask(task[0]);
    },
  },
];
