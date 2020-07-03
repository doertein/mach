const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../server.js');
const Knex = require('knex');
const KnexConfig = require('../knexfile.js')['development'];

let knex = Knex(KnexConfig);

describe('should get an empty list' , () => {
  let server;
  let token;

  beforeEach(async () => {
    // do migrations to populate DB
    await knex.migrate.rollback(KnexConfig, true);
    await knex.migrate.latest(KnexConfig);
    await knex.seed.run();

    server = await init();

    const res = await server.inject({
      method: 'POST',
      url: '/api/v1/users/login',
      payload: {
        email: 'simon.meyer@mailbox.org',
        password: 'qwertzztrewq'
      }
    });

    token = res.result.accessToken;
  });

  afterEach(async () => {
    await server.stop();
  });

  it('responds with an empty array, because there is no list', async () => {
    const res = await server.inject({
      method: 'get',
      url: '/api/v1/lists/99',
      headers: {
        'Authorization': token
      }
    });

    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.array();
  });

  it('responds with an array with list data and a list id of 1', async () => {
    const res = await server.inject({
      url: '/api/v1/lists/1',
      headers: {
        Authorization: token
      }
    });

    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.array();

    let list = { ...res.result[0] };
    expect(list).to.be.an.object().and.contain('list_id');
    expect(list.list_id).to.equal(1);
  });

  it('responds with an error, because we gave a string instead of an integer as identifier', async() => {
    const res = await server.inject({
      url: '/api/v1/lists/a',
      headers: {
        Authorization: token
      }
    });

    expect(res.statusCode).to.equal(400);
  });
});

