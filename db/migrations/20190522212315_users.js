
exports.up = function(knex) {
  return knex
    .schema
    .createTable('users', (table) => {
      table.increments('user_id')
        .unsigned();

      table.string('email').notNullable();
      table.datetime('time_created', { useTz : true }).notNullable();
    });
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists('users');
};
