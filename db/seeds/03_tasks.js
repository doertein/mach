
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('tasks').del()
    .then(function () {
      // Inserts seed entries
      return knex('tasks').insert([
        {list_id: 1, name: 'task 1', user_created: 1, time_created: new Date()},
        {list_id: 2, name: 'task 2', user_created: 1, time_created: new Date()},
        {list_id: 1, name: 'task 3', user_created: 1, time_created: new Date()}
      ]);
    });
};
