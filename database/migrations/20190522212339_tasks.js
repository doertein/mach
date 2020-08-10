
exports.up = function(knex) {
  return knex
    .schema
    .createTable('tasks', (table) => {
      table.increments('task_id')
        .unsigned();

      table.integer('list_id')
        .unsigned()
        .notNullable()
        .references('lists.list_id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.string('name')
        .notNullable();

      table.boolean('completed')
        .defaultTo(false)
        .notNullable();

      table.integer('user_completed')
        .references('users.user_id');

      table.integer('asignee_id')
        .unsigned()
        .references('users.user_id')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');

      table.date('due_date');

      table.timestamp('time_completed', { useTz : true });

      table.timestamp('time_reminder', { useTz : true });

      table.integer('user_created')
        .unsigned()
        .notNullable()
        .references('users.user_id');

      table.timestamp('time_created', { useTz : true })
        .notNullable();
    });
};

exports.down = function(knex) {
  return knex
    .schema
    .dropTableIfExists('tasks');
};
