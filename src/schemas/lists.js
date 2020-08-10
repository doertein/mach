const Joi = require('@hapi/joi');

let newListSchema = Joi.object().keys({
  name: Joi.string().required(),
  owner_id: Joi.number().integer().min(1).required(),
});

let patchListSchema = Joi.object().keys({
  name: Joi.string(),
  owner_id: Joi.number().integer().min(1).required()
});

module.exports = { newListSchema, patchListSchema };
