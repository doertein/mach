"use strict"; 
const listController = require('../controllers/lists.js');

module.exports = [ 
  {
    method: 'GET',
    path: '/lists',
    handler: (request, h) => listController.getLists(request, h)
  },
  {
    method: 'GET',
    path: '/lists/{list_id}',
    handler: (request, h) => listController.getList(request, h)
  },
  {
    method: 'GET',
    path: '/lists/{list_id}/tasks',
    handler: (request, h) => listController.getTasks(request, h)
  },
  {
    method: 'POST',
    path: '/lists',
    handler: (request, h) => listController.newList(request, h)
  },
  {
    method: 'DELETE',
    path: '/lists/{list_id}',
    handler: (request, h) => listController.deleteList(request, h)
  },
  {
    method: 'PATCH',
    path: '/lists/{list_id}',
    handler: (request, h) => listController.editList(request, h)
  },
];
