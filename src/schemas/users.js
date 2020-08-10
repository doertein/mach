const Joi = require('@hapi/joi');

let register = Joi.object().keys({
  email: Joi.string()
  .email()
  .required(),

  password: Joi.string()
  .pattern(new RegExp(/^[\S]{10,}$/))
  .required(),

  password_confirmation: Joi.any()
  .valid(Joi.ref('password'))
  .required()
});

let login = Joi.object().keys({
  email: Joi.string()
  .email()
  .required(),

  password: Joi.string()
  .pattern( new RegExp(/^[\S]{10,}$/) )
  .required()
});

module.exports = { register, login };
