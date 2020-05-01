"use strict";

const Hapi = require('@hapi/hapi');
const taskRoutes = require('./routes/tasks.js');
const listRoutes = require('./routes/lists.js');
const userRoutes = require('./routes/users.js');

const server = new Hapi.Server({
  port: '4000',
});

function prefixRoutes(routes, prefix) {
  routes.map((r) => {
    r.path = `${prefix}${r.path}`;
  });

  return routes;
}

const validate = async function (decoded, request, h) {
  console.log(decoded);
}

const init = async () => {

  await server.register(require('hapi-auth-jwt2'));
  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validate
  });

  server.auth.default('jwt');

  server.route(prefixRoutes(taskRoutes, '/api/v1'));
  server.route(prefixRoutes(listRoutes, '/api/v1'));
  server.route(prefixRoutes(userRoutes, '/api/v1'));

  server.events.on('log', (event, tags) => {
    if(tags.error) {
      console.log(`server error ${event.error.message}`);
    }
  });

  server.events.on('request', (event, tags) => {
    if(tags.error) {
      console.log(tags.tags);
      console.log(`server error ${tags.error}`);
    }
  });

  await server.start();
  console.log(`server running at ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
