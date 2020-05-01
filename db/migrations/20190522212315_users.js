
exports.up = function(knex) {
  return knex
    .schema
    .createTable('users', (table) => {
      table.increments('user_id')
        .unsigned();

      table.string('email').notNullable();
      table.datetime('time_created', { useTz : true }).notNullable();
      table.binary('hash', 60);

      table.unique('email');
    });
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists('users');
};
