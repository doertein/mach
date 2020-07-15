const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

class ApiController {

  /**
   * checks whether an object contains disallowed keys t
   * @param {object} accepted_keys the allowed keys
   * @param {object} keys the given keys 
   * 
   */
  checkAcceptedKeys(accepted_keys, keys) {
    // filter requests with anomaly in keys
    let diff = [];
    keys.filter((key) => {
      if (!accepted_keys.includes(key) && key !== 'remove') diff.push(key);
    });

    // there are keys that were not expected so we give an error
    if (diff.length > 0) {
      let err = Boom.badRequest('Unexpected key(s) in object.');
      throw err;
    }
  }

  /**
   * checks if the given request id is an actual valid id
   * @param {number} id 
   */
  validateId(id) {
    let validation = Joi
      .number()
      .required()
      .integer()
      .min(1)
      .validate(id)

    if (validation.error) {
      throw Boom.badRequest('identifier_must_be_integer');
    }
  }

  /**
   * 
   * @param {object} schema hapi joi schema
   * @param {object} payload the payload to check
   */
  validateSchema(schema, payload) {
    let validation = schema.validate(payload, { abortEarly: false, error: { escapeHtml: true } });
    if (validation.error) {
      let err = Boom.badRequest('invalid_parameters');
      err.output.payload.detail = validation.error;

      throw err;
    }
  }
}

module.exports = ApiController;