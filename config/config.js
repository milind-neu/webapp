require('dotenv').config(); // this is important!
module.exports = {
"development": {
    "username": process.env.DB_USER,
    "password": process.env.PASSWORD,
    "database": process.env.DB,
    "host": process.env.HOST,
    "dialect": "postgres"
}
};
