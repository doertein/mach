'use strict';

const Hapi = require('@hapi/hapi');
const taskRoutes = require('./routes/tasks.js');
const listRoutes = require('./routes/lists.js');
const userRoutes = require('./routes/users.js');
const HapiJwt = require('hapi-auth-jwt2');

function prefixRoutes(routes, prefix) {
  routes.map((r) => {
    r.path = `${prefix}${r.path}`;
  });

  return routes;
}

const server = new Hapi.Server({
  port: '4000',
  routes: {
    cors: {
      origin: [ 'http://localhost:3000' ]
    }
  }
});

server.route(prefixRoutes(taskRoutes, '/api/v1'));
server.route(prefixRoutes(listRoutes, '/api/v1'));
server.route(prefixRoutes(userRoutes, '/api/v1'));

// TODO: pretty secure, huh? ☉ ‿ ⚆
const validate = async function (decoded, request, h) {
  return { isValid: true };
}


exports.init = async () => {

  await server.register(HapiJwt, { once: true });

  await server.initialize();
  return server;
};

exports.start = async () => {

  await exports.init();

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validate
  });

  server.auth.default('jwt');

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
  return server;
}

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
