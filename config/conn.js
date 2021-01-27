var mysql = require('mysql');

module.exports = conn = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "wissenaire_ca21"
  });