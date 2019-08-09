const Db = require('../db');

module.exports = class Task {

  static getTasks(list_id) {
    return Db('tasks').where('list_id', list_id).orderBy('completed');
  }

  static getTask(task_id) {
    return Db('tasks').where('task_id', task_id);
  }

  static newTask(name, list_id, user_created) {
    return Db('tasks').insert({
      'name': name,
      'list_id': list_id,
      'user_created': user_created,
      'time_created': new Date(),
    })
      .returning('*');
  }

  static editTask(task) {
    //console.log(task);
    return false;
    return Db('tasks').update(task).where('task_id', task.task_id).returning('*');
  }

  static deleteTask(task_id) {
    return Db('tasks').where('task_id', task_id).del();
  }
};
