const Task = require('../models/tasks.js');
const List = require('../models/lists.js');
const Boom = require('@hapi/boom');
const taskSchemas = require('../schemas/tasks.js');
const ApiController = require('./api.js');

class taskController extends ApiController {

  //TODO: way to complicated. refactor.
  async editTask(request) {
    let payload = request.payload;
    let allowedToRemove = ['asignee_id', 'time_reminder', 'due_date'];

    this.validateId(request.params.task_id);
    this.validateSchema(taskSchemas.patchTask, payload);

    let [task] = await Task.getTask(request.params.task_id);
    if(!task) { 
      throw Boom.notFound('no_resource_found');
    }

    this.checkAcceptedKeys(Object.keys(task), Object.keys(payload));

    // patch provided details
    if(payload.list_id) {
      task.list_id = payload.list_id;
    }

    if(payload.name) {
      task.name = payload.name;
    }

    // task is completed. so save date 6 user
    if(payload.completed && payload.user_completed) {
      task.completed = payload.completed;
      task.user_completed = payload.user_completed ? payload.user_completed : null;
      task.time_completed = payload.time_completed === true ? new Date() : null;
    }

    if(payload.asignee_id) {
      task.asignee_id = payload.asignee_id;
    }

    if(payload.due_date) {
      task.due_date = payload.due_date;
    }

    if(payload.time_reminder) {
      task.time_reminder = new Date(payload.time_reminder);
    }

    // remove attributes for deletion 
    if(payload.remove && payload.remove.length > 0) {
      task = this.removeKeys(task, payload.remove, allowedToRemove);
    }

    return Task.editTask(task);
  }

  async deleteTask(request, h) {
    this.validateId(request.params.task_id);

    let task = await Task.getTask(request.params.task_id);
    if(task.length === 0) { 
      throw Boom.notFound('no_resource_found');
    }

    return Task.deleteTask(request.params.task_id)
      .then(() => h.response().code(204));
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
