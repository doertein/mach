const Task = require('../models/tasks.js');
const List = require('../models/lists.js');
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
    this.validateSchema(listSchemas.patchList, payload);
    this.checkAcceptedKeys(['name', 'owner_id'], Object.keys(payload));

    let list = await List.getList(request.params.list_id);
    if (list.length === 0) {
      throw Boom.notFound('no_resource_found');
    }

    if (payload.name) {
      list[0].name = payload.name;
    }

    if (payload.owner_id) {
      list[0].owner_id = payload.owner_id;
    }

    return List.editList(list[0]);
  }

  async deleteList(request, h) {
    this.validateId(request.params.list_id);

    return List.deleteList(request.params.list_id)
      .then(() => h.response().code(204));
  }

  async newList(request, h) {
    let payload = request.payload;
    this.validateSchema(listSchemas.newList, payload);

    if (payload.owner_id != request.auth.credentials.user.id) {
      throw Boom.unauthorized('no_permission');
    }

    return List.newList(payload.name, payload.owner_id)
      .then(data => h.response(data).code(201));
  }

  async getList(request) {
    this.validateId(request.params.list_id);
    return List.getList(request.params.list_id);
  }

  async getLists(request) {
    this.validateId(request.auth.credentials.user.id);
    return List.getLists(request.auth.credentials.user.id);
  }

  async getTasks(request) {
    this.validateId(request.params.list_id);
    return Task.getTasks(request.params.list_id);
  }
}

module.exports = new listController();
