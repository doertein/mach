const bcrypt = require('bcrypt');

exports.seed = function(knex) {
  return knex('users').del()
    .then(function () {
      let pass = bcrypt.hashSync('qwertzztrewq', 12);

      return knex('users').insert([
        { email: 'simon.meyer@mailbox.org', hash: Buffer.from(pass), time_created: new Date() },
        { email: 'sajdfasdfasf@asfdsdfs.re', hash: Buffer.from(pass),  time_created: new Date() },
        { email: 'sdfhasdfsadf@sdfsfds.res', hash: Buffer.from(pass), time_created: new Date() },
        { email: 'sidfsadfa@fdasdfsdf.er', hash: Buffer.from(pass), time_created: new Date() },
      ]);
    });
};
