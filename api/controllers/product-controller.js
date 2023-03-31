const productService = require('../services/product-service');
const userService = require('../services/user-service');
const productImagesService = require('../services/product-image-service');
const bcrypt = require("bcrypt");
const s3 = require('./s3-config').s3;
const statsd_config = require('../../statsd_config');
const logError = require('../../log_error')
const logger = require('../../logger.js');

const deleteS3Directory = async (bucketName, directoryKey) => {
    try {
      const listParams = {
        Bucket: bucketName,
        Prefix: directoryKey,
      };

      const listedObjects = await s3.listObjectsV2(listParams).promise();
      const deleteParams = {
        Bucket: bucketName,
        Delete: { Objects: [] },
      };

      listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
      });

      await s3.deleteObjects(deleteParams).promise();
      return true;

    } catch (err) {
        
      console.error(err);
      return false;
    }
  };

const getProduct = async (request, response) => {
    statsd_config.statsd.increment('api.product.http.get.count');

    try {

        const id = request.params.id;

        if(isNaN(id)) {
            return logError.setAndLogError(400, "Invalid id provided", response)
        }
        
        const product = await (productService.getProduct(id))

        if (product) {
            logger.info(`200: Product retrieved with id: ${product.id}`);
            return response.status(200).json({
                "id": product.id, 
                "name": product.name, 
                "description": product.description, 
                "sku": product.sku, 
                "manufacturer": product.manufacturer, 
                "quantity": product.quantity,
                "date_added": product.date_added,
                "date_last_updated": product.date_last_updated,
                "owner_user_id": product.owner_user_id
            });
        } else {
            return logError.setAndLogError(404, "Product not found", response)
        }

    } catch (error) {
        return setErrorResponse(error, response);
    }
}

const createProduct = async (request, response) => {
    statsd_config.statsd.increment('api.product.http.post.count');
    try {

        if (request.body.id || request.body.date_added || request.body.date_last_updated || request.body.owner_user_id) {
            return logError.setAndLogError(400, "Bad request", response)
        }

        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
          } = request.body;


          const product = {
            name: name,
            description: description,
            sku: sku,
            manufacturer: manufacturer,
            quantity: quantity
        }

        if (quantity && typeof quantity != "number") {
            return logError.setAndLogError(400, "Quantity should be a number", response)
        }
            const {passwordValid, data} = await authorizeAndGetUser(request, response)
            if (passwordValid) {
                product["owner_user_id"] = data.id
            } else {
                return data
            }
            const createdProduct = await (productService.createProduct(product))
            
            if (createdProduct.hasOwnProperty("err")) {
                if (createdProduct["err"].name === 'SequelizeValidationError') {
                    return logError.setAndLogError(400, createdProduct["err"].errors.map(e => e.message), response)
                  } else {
                    if (createdProduct["err"].original.constraint == "Products_sku_key") {
                        return logError.setAndLogError(400, "Product with given sku already exists", response)
                    } else {
                        return logError.setAndLogError(400, "Bad Request", response)
                    }
                }

            } else {
                logger.info(`201: Product created successfully with id: ${createdProduct.id}`);
                return response.status(201).json({
                    "id": createdProduct.id,
                    "name": createdProduct.name,
                    "description": createdProduct.description,
                    "sku": createdProduct.sku,
                    "manufacturer": createdProduct.manufacturer,
                    "quantity": createdProduct.quantity,
                    "date_added": createdProduct.date_added,
                    "date_last_updated": createdProduct.date_last_updated,
                    "owner_user_id": createdProduct.owner_user_id
                });
            }

          
    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const updateProduct = async (request, response) => {
    statsd_config.statsd.increment('api.product.http.patch.count');
    try {

        if (request.body.id || request.body.date_added || request.body.date_last_updated || request.body.owner_user_id) {
            return logError.setAndLogError(400, "Bad request", response)
        }

        const {passwordValid, data} = await authorizeAndGetUser(request, response)

        if (passwordValid) {

            const id = request.params.id;

            if(isNaN(id)) {
                return logError.setAndLogError(400, "Invalid id provided", response)
            }

            const {
                name,
                description,
                sku,
                manufacturer,
                quantity
              } = request.body;

            const product = {
                name: name,
                description: description,
                sku: sku,
                manufacturer: manufacturer,
                quantity: quantity
            }

            if (quantity && typeof quantity != "number") {
                return logError.setAndLogError(400, "Quantity should be a number", response)
            }
            const previousProduct = await (productService.getProduct(id));

            if (!previousProduct) {
                return logError.setAndLogError(404, "Product not found", response)
            }

            if (data.id != previousProduct.owner_user_id) {
                return logError.setAndLogError(403, "Access denied", response)
                return {data: response.status(403).json({
                    message: 'Access denied'
                })};
            }

            const updatedProduct = await (productService.updateProduct(id, product))
            if (updatedProduct.hasOwnProperty("err")) {
                if (updatedProduct["err"].name === 'SequelizeValidationError') {
                    return logError.setAndLogError(400, updatedProduct["err"].errors.map(e => e.message), response)
                  } else {
                    if (updatedProduct["err"].original.constraint == "Products_sku_key") {
                        return logError.setAndLogError(400, "Product with given sku already exists", response)
                    } else {
                        return logError.setAndLogError(400, "Bad Request", response)
                    }
                }

            } else {
                logger.info(`204: Product updated successfully with id: ${id}`);
                return response.status(204).json({
                });
            }

        } else {
            return data
        }

    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const updateProductForPut = async (request, response) => {
    statsd_config.statsd.increment('api.product.http.put.count');
    try {

        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
          } = request.body;

        if (!name || !description || !sku || !manufacturer || !quantity) {
            return logError.setAndLogError(400, "Bad request", response)
        }
        return updateProduct(request, response);

    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const deleteProduct = async (request, response) => {
    statsd_config.statsd.increment('api.product.http.delete.count');
    try {

        const {passwordValid, data} = await authorizeAndGetUser(request, response)

        if (passwordValid) {

            const id = request.params.id;

            if(isNaN(id)) {
                return logError.setAndLogError(400, "Invalid id provided", response)
            }

            const product = await (productService.getProduct(id));
            if (!product) {
                return logError.setAndLogError(404, "Product not found", response)
            }

            if (data.id != product.owner_user_id) {
                return logError.setAndLogError(403, "Access denied", response)
            }

            const images = await (productImagesService.getImagesByProduct(id));

            await (deleteS3Directory(process.env.S3_BUCKET_NAME, `Product ${id}/`));
            await Promise.all(images.map((image) => productImagesService.deleteImage(image.id)));
            
            const deleteData = await (productService.deleteProduct(id));
            console.log("DeletedData = ", deleteData);
            if (deleteData.hasOwnProperty("err")) {
                return logError.setAndLogError(400, "Bad Request", response)
            } else {
                logger.info(`204: Product deleted successfully with id: ${id}`);
                return response.status(204).json({
                });
            }

        } else {
            return data
        }

    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const authorizeAndGetUser = async (request, response) => {
    try {

        // check for basic auth header
        if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
            return logError.setAndLogError(401, "Missing Authorization Header", response)
        }

        // verify auth credentials
        const base64Credentials = request.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, passwordForAuth] = credentials.split(':');

        const userFromEmail = await userService.getUserByEmail(email);
        
        if (!userFromEmail) {
            return logError.setAndLogError(401, "Authorization failed", response)
        }
        
        const db_password = userFromEmail.password;
        const passwordValid = await bcrypt.compare(passwordForAuth, db_password)
            if (!passwordValid) {
                return logError.setAndLogError(401, "Authorization failed", response)
            } else {
                return {
                    passwordValid: passwordValid,
                    data: userFromEmail,
                }
            }

    } catch (error) {
        console.log(error)
        return {data: setErrorResponse(error, response)};
    }

}

const getProductByUser = async (request, response) => {
    try {

        const productId = request.params.id;
  
        if (isNaN(productId)) {
          return logError.setAndLogError(400, "Invalid Product ID", response)
        }
      
    
      const {passwordValid, data} = await authorizeAndGetUser(request, response)
            if (passwordValid) {
                const product = await productService.getProduct(productId);
                if (!product) {
                    return logError.setAndLogError(404, "Product not found", response)
                
                } else if (product.owner_user_id != data.id) {
                    return logError.setAndLogError(403, "Access denied", response)
                
                } else {
                    return { 
                        product
                    };
                    
                }
            } else {
                return {data};
            }
    } catch (error) {
      return {data: setErrorResponse(error, response)};
    }
  };

const setErrorResponse = (error, response) => {
    logger.error(`500: ${error}`);
    response.status(500);
    response.json(error);
    return response
}

module.exports = {
    getProduct,
    createProduct,
    updateProduct,
    updateProductForPut,
    deleteProduct,
    getProductByUser
}