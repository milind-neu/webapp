const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()

const userController = require('./api/controllers/user-controller')

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/v1/user/:id', userController.getUser)
app.post('/v1/user', userController.createUser)
app.put('/v1/user/:id', userController.updateUser)

app.get('/', (req, res) => {
    res.send(`<h1>API Works !!!</h1>`)
});

app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})