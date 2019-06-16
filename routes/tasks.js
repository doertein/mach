"use strict"; 

const Task = require('../models/tasks.js');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const tasksSchema = Joi.object().keys({
  task_id: Joi.number().integer().min(1),
  list_id: Joi.number().integer().min(1),
  name: Joi.string().alphanum(),
  completed: Joi.boolean(),
  user_completed: Joi.number().integer().min(1),
  asignee_id: Joi.number().integer().min(1),
  due_date: Joi.date(),
  time_reminder: Joi.date(),
  user_created: Joi.number().integer().min(1),
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
      let required = ['name', 'list_id', 'user_created'];
      let pl = request.payload;

      // check required keys
      Object.keys(pl).filter(k => {
        required = required.filter(r => { 
          return r !== k; 
        });
      });

      if(required.length > 0) {
        let error = new Boom('missing parameter(s)', { statusCode: 400, data: required });
        error.output.payload.detail = error.data;
        return error;
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
    handler: async (request, h) => {
      let pl = request.payload;
      let task = await Task.getTask(request.params.task_id);

      // define attributes that are removable
      let allowed_to_remove = ['asignee_id', 'timer_reminder', 'due_date'];

      // filter not existings tasks
      if(task.length === 0) {
        return Boom.notFound('no resource(s) found for [' + request.params.task_id + ']');
      }

      Joi.validate(pl, tasksSchema, err => h.response(Boom.boomify(err, { statusCode: 400 })));

      // filter requests with anomaly in keys
      let diff = [];
      let keys = Object.keys(pl);
      let accepted_keys = Object.keys(task[0]);
      keys.filter((key) => {
        if(!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
      });

      if(diff.length > 0) {
        let error = new Boom('unexpected key(s) in object.', { statusCode: 400, data: diff });
        error.output.payload.detail = error.data;
        return error;
      }

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
        console.log(pl.time_reminder);
        task[0].time_reminder = new Date(pl.time_reminder);
      }

      if(pl.remove && pl.remove.length > 0) {
        pl.remove.filter(key => {
          if(allowed_to_remove.includes(key)) task[0][key] = null;
        });
      }
      
      // validate new task againts joi schema
      Joi.validate(task[0], tasksSchema, (err) => console.log(err.details));

      return Task.editTask(task[0]);
    },
  },
];
