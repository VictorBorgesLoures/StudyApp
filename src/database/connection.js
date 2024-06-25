var mysql = require('mysql2');

var config = {
  connectionLimit: 10,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  port: process.env.DB_PORT
}

var pool = mysql.createPool(config);

module.exports.query = function (query, keys) {
  return new Promise(resolve => {
    try {

      pool.getConnection((err, connection) => {
        if (err) {
          console.log(err);
          resolve({ error: { status: 500, message: ['Error on database connection'] } });
        }
        else {
          connection.query(query, keys, function (error, results, fields) {
            connection.release();
            if (error) {
              resolve({error});
            }
            else {
              resolve({ error: null, results });
            }

          });
        }
      });

    } catch (e) {
      console.log(e);
      resolve({ error: { status: 500, message: ['An unexpected error occours'] } });
    }
  })
}
