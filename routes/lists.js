"use strict"; 
const listController = require('../controllers/lists.js');

//TODO implement authorization process
module.exports = [ 
  {
    method: 'GET',
    path: '/lists',
    handler: listController.getLists
  },
  {
    method: 'GET',
    path: '/lists/{list_id}',
    handler: listController.getList
  },
  {
    method: 'GET',
    path: '/lists/{list_id}/tasks',
    handler: listController.getTasks
  },
  {
    method: 'POST',
    path: '/lists',
    handler: listController.newList
  },
  {
    method: 'DELETE',
    path: '/lists/{list_id}',
    handler: listController.deleteList
  },
  {
    method: 'PATCH',
    path: '/lists/{list_id}',
    handler: listController.editList
  },
];
