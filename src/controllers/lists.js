const TaskModel = require('../models/tasks.js');
const ListModel = require('../models/lists.js');
const Boom = require('@hapi/boom');
const listSchemas = require('../schemas/lists.js');
const ApiController = require('./api.js');

class listController extends ApiController {
  constructor() {
    super();
  }

  async editList(request) {
    let payload = request.payload;

    this.validateId(request.params.list_id);
    this.checkAcceptedKeys(['name', 'owner_id'], Object.keys(payload));
    this.validateSchema(listSchemas.patchListSchema, payload);

    let [list] = await ListModel.getList(request.params.list_id);
    if (!list) {
      throw Boom.notFound('no_resource_found');
    }

    if (payload.name) {
      list.name = payload.name;
    }

    if (payload.owner_id) {
      list.owner_id = payload.owner_id;
    }

    return ListModel.editList(list);
  }

  async deleteList(request, h) {
    this.validateId(request.params.list_id);

    return ListModel.deleteList(request.params.list_id)
      .then(() => h.response().code(204));
  }

  async newList(request, h) {
    let payload = request.payload;
    this.validateSchema(listSchemas.newListSchema, payload);

    if (payload.owner_id != request.auth.credentials.user.id) {
      throw Boom.unauthorized('no_permission');
    }

    return ListModel.newList(payload.name, payload.owner_id)
      .then(data => h.response(data).code(201));
  }

  async getList(request) {
    this.validateId(request.params.list_id);
    return ListModel.getList(request.params.list_id);
  }

  async getLists(request) {
    this.validateId(request.auth.credentials.user.id);
    return ListModel.getLists(request.auth.credentials.user.id);
  }

  async getTasks(request) {
    this.validateId(request.params.list_id);
    return TaskModel.getTasks(request.params.list_id);
  }
}

module.exports = new listController();
