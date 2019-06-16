const Knex = require('knex');
const KnexConfig = require('../knexfile.js')['development'];
module.exports = Knex(KnexConfig);
