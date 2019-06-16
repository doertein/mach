"use strict"; 

const Db = require('../db');

module.exports = [ 
  {
    method: 'GET',
    path: '/api/lists',
    handler: async (request, h) => {
      try {
        let res = await(Db.query('SELECT * FROM lists WHERE list_creator_id = $1', [request.query.list_creator_id]));
        return {
          success: true,
          result: {
            count: res.rows.length,
            rows: res.rows,
          },
        };
      } catch(err) {
        console.log(err.stack);
        return {
          success: false,
        };
      }
    },
  },
  {
    method: 'POST',
    path: '/api/lists',
    handler: async (request, h) => {
      let query = `INSERT INTO 
                     lists
                  (
                    list_name,
                    list_creator_id,
                    list_creation_time
                  )
                   VALUES
                   (
                    $1,
                    $2,
                    NOW() 
                   )`;
      let pl = request.payload;
      let values = [pl.list_name, pl.list_creator_id];

      try {
        let res = await Db.query(query, values);
        if(res && res.rowCount === 1) { 
          return {
            success: true,
          };
        } else {
          return {
            success: false,
          };
        }
      } catch(err) {
        console.log(err.stack);
        return {
          success: false,
        };
      }
    },
  },
]
