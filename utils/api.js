const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

function checkKeys(accepted_keys, keys) {
  // filter requests with anomaly in keys
  let diff = [];
  keys.filter((key) => {
    if(!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
  });

  // there are keys that were not expected so we give an error
  if(diff.length > 0) {
    let err = Boom.badRequest('Unexpected key(s) in object.');
    throw err;
  }
}

let requestHelper = {
  validateId: (id) => {
    let validation = Joi
      .number()
      .integer()
      .min(1)
      .validate(id)

    if(validation.error) {
      throw Boom.badRequest('identifier_must_be_integer');
    }
  },

  validateSchema: (schema, object) => {
    let validation = schema.validate(object, { abortEarly: false, error: { escapeHtml: true } });
    if(validation.error) {
      let err = Boom.badRequest('invalid_parameters');
      err.output.payload.detail = validation.error;

      throw err;
    }
  },
}


module.exports = { checkKeys, requestHelper };
