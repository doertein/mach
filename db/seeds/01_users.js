
exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        { email: 'simon.meyer@mailbox.org', time_created: new Date() },
        { email: 'sajdfasdfasf@asfdsdfs.re', time_created: new Date() },
        { email: 'sdfhasdfsadf@sdfsfds.res', time_created: new Date() },
        { email: 'sidfsadfa@fdasdfsdf.er', time_created: new Date() },
      ]);
    });
};
