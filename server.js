require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const userController = require('./api/controllers/user-controller')

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/v1/user/:id', userController.getUser)
app.post('/v1/user', userController.createUser)
app.put('/v1/user/:id', userController.updateUser)

app.get('/healthz', (req, res) => {
    return res.status(200).json({
        message: "Server is healthy!!!"
      });
});

module.exports = app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
})