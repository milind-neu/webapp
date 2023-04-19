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

app.get('/health', (req, res) => {
    statsd_config.statsd.increment('api.health.count');

    return res.status(200).json({
        message: "Server is healthy!!!"
      });
});

app.get('/v2/user/:id', userController.getUser)
app.post('/v2/user', userController.createUser)
app.put('/v2/user/:id', userController.updateUser)

app.get('/v2/product/:id', productController.getProduct)
app.post('/v2/product', productController.createProduct)
app.patch('/v2/product/:id', productController.updateProduct)
app.put('/v2/product/:id', productController.updateProductForPut)
app.delete('/v2/product/:id', productController.deleteProduct)

app.post('/v2/product/:id/image', productImageController.upload.single('fileType'), productImageController.uploadImage)
app.get('/v2/product/:id/image', productImageController.getImagesList)
app.delete('/v2/product/:id/image/:imageId', productImageController.deleteImage)
app.get('/v2/product/:id/image/:imageId', productImageController.getImage)

module.exports = app.listen(port, () => {
    console.log(`Server listening on the port  ${port}`);
    logger.info(`Server is running at ${port}.`);
})