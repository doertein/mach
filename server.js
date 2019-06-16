"use strict";

const Hapi = require('@hapi/hapi');
//const Inert = require('@hapi/inert');
//const Vision = require('@hapi/vision');
//const Handlebars = require('handlebars');

const server = new Hapi.Server({
  port: '4000',
});

const init = async () => {
  //  await server.register([
  //    { plugin: Inert },
  //    { plugin: Vision },
  //  ]);
  //
  //  server.views({
  //    engines: {
  //      html: Handlebars,
  //    },
  //    relativeTo: __dirname,
  //    path: 'views/',
  //  });

  //server.route(require('./routes/base.js'));
  //server.route(require('./routes/index.js'));
  server.route(require('./routes/tasks.js'));
  server.route(require('./routes/lists.js'));
  server.route(require('./routes/users.js'));

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
