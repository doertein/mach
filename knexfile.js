module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'mach',
      user:     'mach_api',
      password: 'machtest',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + '/db/migrations',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
  },
  production: {
  },

};
