const productService = require('../services/product-service');
const userService = require('../services/user-service');
const bcrypt = require("bcrypt");

const getProduct = async (request, response) => {
    try {

        const id = request.params.id;

        if(isNaN(id)) {
            return response.status(400).json({
                message: 'Invalid id provided'
            });
        }
        
        const product = await (productService.getProduct(id))

        if (product) {
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
            return response.status(404).json({
                message: 'Product not found'
            });
        }

    } catch (error) {
        return setErrorResponse(error, response);
    }
}

const createProduct = async (request, response) => {
    try {

        if (request.body.id || request.body.date_added || request.body.date_last_updated || request.body.owner_user_id) {
            return response.status(400).json({
                message: "Bad request"
            });
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
            return response.status(400).json({
                message: 'Quantity should be a number'
            });
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
                    return response.status(400).json({
                      message: createdProduct["err"].errors.map(e => e.message)
                    })
                  } else {
                    if (createdProduct["err"].original.constraint == "Products_sku_key") {
                        return response.status(400).json({
                            message: "Product with given sku already exists"
                        });
                    } else {
                        return response.status(400).json({
                            message: "Bad Request"
                          })
                    }
                }

            } else {
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
    try {

        if (request.body.id || request.body.date_added || request.body.date_last_updated || request.body.owner_user_id) {
            return response.status(400).json({
                message: "Bad request"
            });
        }

        const {passwordValid, data} = await authorizeAndGetUser(request, response)

        if (passwordValid) {

            const id = request.params.id;

            if(isNaN(id)) {
                return response.status(400).json({
                    message: 'Invalid id provided'
                });
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
                return response.status(400).json({
                    message: 'Quantity should be a number'
                });
            }
            const previousProduct = await (productService.getProduct(id));

            if (!previousProduct) {
                return response.status(404).json({
                    message: 'Product not found'
                });
            }

            if (data.id != previousProduct.owner_user_id) {
                return {data: response.status(403).json({
                    message: 'Access denied'
                })};
            }

            const updatedProduct = await (productService.updateProduct(id, product))
            if (updatedProduct.hasOwnProperty("err")) {
                if (updatedProduct["err"].name === 'SequelizeValidationError') {
                    return response.status(400).json({
                        message: updatedProduct["err"].errors.map(e => e.message)
                    })
                  } else {
                    if (updatedProduct["err"].original.constraint == "Products_sku_key") {
                        return response.status(400).json({
                            message: "Product with given sku already exists"
                        });
                    } else {
                        return response.status(400).json({
                            message: "Bad Request"
                          })
                    }
                }

            } else {
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
    try {

        const {
            name,
            description,
            sku,
            manufacturer,
            quantity
          } = request.body;

        if (!name || !description || !sku || !manufacturer || !quantity) {
            return response.status(400).json({
                message: "Bad request"
            });
        }
        return updateProduct(request, response);

    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const deleteProduct = async (request, response) => {
    try {

        const {passwordValid, data} = await authorizeAndGetUser(request, response)

        if (passwordValid) {

            const id = request.params.id;

            if(isNaN(id)) {
                return response.status(400).json({
                    message: 'Invalid id provided'
                });
            }

            const product = await (productService.getProduct(id));

            if (!product) {
                return response.status(404).json({
                    message: 'Product not found'
                });
            }

            if (data.id != product.owner_user_id) {
                return {data: response.status(403).json({
                    message: 'Access denied'
                })};
            }

            const deleteData = await (productService.deleteProduct(id));
            console.log("DeletedData = ", deleteData);
            if (deleteData.hasOwnProperty("err")) {
                return response.status(400).json({
                    message: "Bad Request"
                  })
            } else {
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
            return response.status(401).json({
                message: 'Missing Authorization Header'
            });
        }

        // verify auth credentials
        const base64Credentials = request.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, passwordForAuth] = credentials.split(':');

        const userFromEmail = await userService.getUserByEmail(email);
        
        if (!userFromEmail) {
            return { data: response.status(401).json({
                message: 'Authorization failed'
            })}; 
        }
        
        const db_password = userFromEmail.password;
        const passwordValid = await bcrypt.compare(passwordForAuth, db_password)
            if (!passwordValid) {
                return {data: response.status(401).json({
                    message: 'Authorization failed'
                })}; 
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

const setErrorResponse = (error, response) => {
    response.status(500);
    response.json(error);
    return response
}

module.exports = {
    getProduct,
    createProduct,
    updateProduct,
    updateProductForPut,
    deleteProduct
}