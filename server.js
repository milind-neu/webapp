require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('./api/controllers/user-controller')
const productController = require('./api/controllers/product-controller')
const productImageController = require('./api/controllers/product-image-controller')
const statsd_config = require('./statsd_config');

const logger = require('./logger');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/healthz', (req, res) => {
    statsd_config.statsd.increment('api.healthz.count');

    return res.status(200).json({
        message: "Server is healthy!!!"
      });
});

app.get('/v1/user/:id', userController.getUser)
app.post('/v1/user', userController.createUser)
app.put('/v1/user/:id', userController.updateUser)

app.get('/v1/product/:id', productController.getProduct)
app.post('/v1/product', productController.createProduct)
app.patch('/v1/product/:id', productController.updateProduct)
app.put('/v1/product/:id', productController.updateProductForPut)
app.delete('/v1/product/:id', productController.deleteProduct)

app.post('/v1/product/:id/image', productImageController.upload.single('fileType'), productImageController.uploadImage)
app.get('/v1/product/:id/image', productImageController.getImagesList)
app.delete('/v1/product/:id/image/:imageId', productImageController.deleteImage)
app.get('/v1/product/:id/image/:imageId', productImageController.getImage)

module.exports = app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
    logger.info(`Server is running at ${port}.`);
})