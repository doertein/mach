
exports.seed = function(knex, Promise) {
  return knex('lists').del()
    .then(function () {
      return knex('lists').insert([
        { name: 'list_1', owner_id: 1, time_created: new Date() },
        { name: 'list_2', owner_id: 1, time_created: new Date() },
      ]);
    });
};
