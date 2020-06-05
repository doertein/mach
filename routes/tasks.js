"use strict"; 
const taskController = require('../controllers/tasks.js');

module.exports = [ 
  {
    method: 'GET',
    path: '/tasks',
    handler: taskController.getTasks
  },
  {
    method: 'GET',
    path: '/tasks/{task_id}',
    handler: taskController.getTask
  },
  {
    method: 'POST',
    path: '/tasks',
    handler: taskController.newTask,
  },
  {
    method: 'DELETE',
    path: '/tasks/{task_id}',
    handler: taskController.deleteTask,
  },
  {
    method: 'PATCH',
    path: '/tasks/{task_id}',
    handler: taskController.editTask
  }
];
