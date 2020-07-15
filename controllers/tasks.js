const Task = require('../models/tasks.js');
const List = require('../models/lists.js');
const Boom = require('@hapi/boom');
const taskSchemas = require('../schemas/tasks.js');
const ApiController = require('./api.js');

class taskController extends ApiController {

  //TODO: way to complicated
  async editTask(request) {
    let payload = request.payload;
    let allowed_to_remove = ['asignee_id', 'time_reminder', 'due_date'];

    this.validateId(request.params.task_id);
    this.validateSchema(taskSchemas.patchTask, payload);

    let task = await Task.getTask(request.params.task_id);
    if(task.length === 0) { 
      throw Boom.notFound('no_resource_found');
    }

    checkKeys(Object.keys(task[0]), Object.keys(payload));
    // PARAMETER VALIDATION

    if(payload.list_id) {
      task[0].list_id = payload.list_id;
    }

    if(payload.name) {
      task[0].name = payload.name;
    }

    // task is completed. so save date 6 user
    if(payload.completed && payload.user_completed) {
      task[0].completed = payload.completed;
      task[0].user_completed = payload.user_completed ? payload.user_completed : null;
      task[0].time_completed = payload.time_completed === true ? new Date() : null;
    }

    if(payload.asignee_id) {
      task[0].asignee_id = payload.asignee_id;
    }

    if(payload.due_date) {
      task[0].due_date = payload.due_date;
    }

    if(payload.time_reminder) {
      task[0].time_reminder = new Date(payload.time_reminder);
    }

    // remove attributes 
    if(payload.remove && payload.remove.length > 0) {
      payload.remove.filter(key => {
        if(allowed_to_remove.includes(key)) {
          task[0][key] = null;
        }
      });
    }

    return Task.editTask(task[0]);
  }

  async deleteTask(request, h) {
    this.validateId(request.params.task_id);

    let task = await Task.getTask(request.params.task_id);
    if(task.length === 0) { 
      throw Boom.notFound('no_resource_found');
    }

    return Task.deleteTask(request.params.task_id)
      .then(() => {
        return h.response().code(204);
      });
  }

  async newTask(request, h) {
    let payload = request.payload;

    this.validateSchema(taskSchemas.newTask, payload);

    return Task.newTask(payload.name, payload.list_id, payload.user_created)
      .then(() => h.response().code(201));
  }

  async getTask(request) {
    this.validateId(request.params.task_id);

    let task = await Task.getTask(request.params.task_id);
    if(task.length === 0) { 
      throw Boom.notFound('no_resource_found');
    }

    return task;
  }

  async getTasks(request) {
    if(!request.query.list_id) {
      throw Boom.badRequest('missing_list_id');
    }

    this.validateId(request.query.list_id);

    let list = await List.getList(request.query.list_id);
    if(list.length === 0) {
      throw Boom.notFound('list_not_found');
    }

    return Task.getTasks(request.query.list_id);
  }
}

module.exports = new taskController();
