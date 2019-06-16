const Db = require('../db');
module.exports = {
  getAll: () => {
    return [];
  },
  getById: (id) => {
    let query = "SELECT * FROM users WHERE user_id = $1";
    let values = [id];

    Db.query(query, values)
      .then(res => console.log(res))
      .catch(err => console.log(err.stack));
    return {};
  },
};
