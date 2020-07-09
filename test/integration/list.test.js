const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, before, describe, it } = exports.lab = Lab.script();
const { init } = require('../../server.js');
const Knex = require('knex');
const KnexConfig = require('../../knexfile.js')['development'];

let knex = Knex(KnexConfig);

describe('testing against the list api - ' , () => {
  let server;
  let credentials = {
    user: {
      id: 1,
      email: 'test@nartum.de'
    },
    iat: new Date().getTime(),
    exp: new Date().getTime() + 86400000
  }

  before(async() => {
    // do migrations to populate DB
    await knex.migrate.rollback(KnexConfig, true);
    await knex.migrate.latest(KnexConfig);
    await knex.seed.run();
  });

  beforeEach(async () => 
    server = await init()
  );

  afterEach(async () => 
    await server.stop()
  );

  it('should respond with an error, because we gave a string instead of an integer as identifier', async() => {
    const res = await server.inject({
      url: '/api/v1/lists/a',
      auth: {
        strategy: 'jwt',
        credentials: credentials
      }
    });

    expect(res.statusCode).to.equal(400);
  });

  it('should receive an empty array for a nonexisting list', async () => {
    const res = await server.inject({
      url: '/api/v1/lists/99',
      auth: {
        strategy: 'jwt',
        credentials: credentials
      }
    });

    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.array();
  });

  it('should respond with all lists for this user', async () => {
    const res = await server.inject({
      url: '/api/v1/lists',
      auth: {
        strategy: 'jwt',
        credentials: credentials
      }
    });

    expect(res.statusCode, 'statusCode should be 200').to.equal(200);
    expect(res.result, 'result has to be an array').to.be.an.array();
    expect(res.result, 'result has to have a length of 2').to.have.length(2);
  });

  it('should receive a list with id = 1', async () => {
    const res = await server.inject({
      url: '/api/v1/lists/1',
      auth: {
        strategy: 'jwt',
        credentials: credentials
      }
    });

    expect(res.statusCode).to.equal(200);
    expect(res.result).to.be.an.array();

    let list = { ...res.result[0] };
    expect(list).to.be.an.object().and.contain('list_id');
    expect(list.list_id).to.equal(1);
  });
});

