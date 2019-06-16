
exports.up = function(knex, Promise) {
  return knex
    .schema
    .createTable('users', (table) => {
      table.increments('user_id')
        .unsigned();

      table.string('email').notNullable();
      table.datetime('time_created', { useTz : true }).notNullable();
    });
};

exports.down = function(knex, Promise) {
  return knex
    .schema
    .dropTableIfExists('users');
};
