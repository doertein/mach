const Joi = require('@hapi/joi');

let newList = Joi.object().keys({
  name: Joi.string().required(),
  owner_id: Joi.number().integer().min(1).required(),
});

let patchList = Joi.object().keys({
  name: Joi.string(),
  owner_id: Joi.number().integer().min(1).required()
});

module.exports = { newList, patchList };
