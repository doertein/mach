
exports.up = function(knex) {
  return knex
    .schema
    .createTable('lists', (table) => {
      table.increments('list_id')
      .unsigned();

      table.string('name')
        .notNullable();
      table.integer('owner_id')
        .unsigned()
        .notNullable()
        .references('users.user_id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table.datetime('time_created', { useTz : true })
        .notNullable();
    });
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists('lists');
};
