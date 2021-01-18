var mysql = require('mysql');

module.exports = conn = mysql.createConnection({
    host: "localhost",
    user: "wissenaire_sudheer",
    password: "sudheer@wissenaire",
    database: "wissenaire_ca21"
  });