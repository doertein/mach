const Joi = require('@hapi/joi');

let newTask = Joi.object().keys({
  list_id: Joi.number().integer().min(1).required(),
  name: Joi.string().required(),
  user_created: Joi.number().integer().min(1).required(),
});

let patchTask = Joi.object().keys({
  task_id: Joi.number().integer().min(1),
  list_id: Joi.number().integer().min(1),
  name: Joi.string(),
  completed: Joi.boolean(),
  user_completed: Joi.number().integer().min(1),
  asignee_id: Joi.number().integer().min(1),
  due_date: Joi.date().iso(),
  time_reminder: Joi.date().iso(),
  remove: Joi.array().items(Joi.string()),
});

module.exports = { newTask, patchTask };
