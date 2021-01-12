const Db = require('../db');

module.exports = class List {

  static getLists(owner_id) {
    return Db('lists').where('owner_id', owner_id);
  }

  static getList(list_id) {
    return Db('lists').where('list_id', list_id).first();
  }

  static newList(name, owner_id) {
    return Db('lists').insert({
      'name': name,
      'owner_id': owner_id,
      'time_created': new Date(),
    })
      .returning('*');
  }

  static editList(list) {
    return Db('lists').update(list).where('list_id', list.list_id).returning('*');
  }

  static deleteList(list_id) {
    return Db('lists').where('list_id', list_id).del();
  }
};
