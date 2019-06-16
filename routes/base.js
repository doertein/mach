"use strict";

module.exports = {
  method: 'GET',
  path: '/public/css/{file*}',
  handler: {
    directory: {
      path: 'public/css'
    }
  },
}
