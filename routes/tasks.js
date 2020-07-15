"use strict"; 
const taskController = require('../controllers/tasks.js');

module.exports = [ 
  {
    method: 'GET',
    path: '/tasks',
    handler: (request, h) => taskController.getTasks(request, h)
  },
  {
    method: 'GET',
    path: '/tasks/{task_id}',
    handler: (request, h) => taskController.getTask(request, h)
  },
  {
    method: 'POST',
    path: '/tasks',
    handler: (request, h) => taskController.newTask(request, h)
  },
  {
    method: 'DELETE',
    path: '/tasks/{task_id}',
    handler: (request, h) => taskController.deleteTask(request, h)
  },
  {
    method: 'PATCH',
    path: '/tasks/{task_id}',
    handler: (request, h) => taskController.editTask(request, h)
  }
];
