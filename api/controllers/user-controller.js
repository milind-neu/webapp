const userService = require('../services/user-service');
const logger = require('../../logger.js');
const statsd_config = require('../../statsd_config');
const logError = require('../../log_error')

const bcrypt = require("bcrypt");
var validator = require("email-validator");
var passwordValidator = require('password-validator');

var schema = new passwordValidator();
schema
  .is().min(6) // Min password length should be 6
  .is().max(100) // Max password length should be 100
  .has().uppercase() // Must contain atleast 1 uppercase letter
  .has().lowercase() // Must contain atleast 1 lowercase letter
  .has().digits() // Must have atleast 1 digit
  .has().not().spaces(); // Should not contain any spaces

    const setErrorResponse = (error, response) => {
        logger.error(`500: ${error}`);
        response.status(500);
        response.json(error);
        return response
    }
    
    const setSuccessResponse = (obj, response) => {
        return response.status(201).json({
            "id": obj.id, 
            "first_name": obj.first_name, 
            "last_name": obj.last_name, 
            "username": obj.username, 
            "account_created": obj.account_created, 
            "account_updated": obj.account_updated
        });
    }

    const getUser = async (request, response) => {
    statsd_config.statsd.increment('api.user.http.get.count');
    try {

        const {passwordValid, data} = await authorizeAndGetUser(request, response)
        if (passwordValid) {
            const obj = data
            logger.info(`200: User retrieved with id: ${obj.id}`);
            return response.status(200).json({
                "id": obj.id, 
                "first_name": obj.first_name, 
                "last_name": obj.last_name, 
                "username": obj.username, 
                "account_created": obj.account_created, 
                "account_updated": obj.account_updated
            });
        } else {
            return data
        }

    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const createUser = async (request, response) => {
    statsd_config.statsd.increment('api.user.http.post.count');
    try {
        const {
            first_name,
            last_name,
            username,
            password
          } = request.body;
        
          if (!first_name || !last_name || !username || !password) {
            return logError.setAndLogError(400, "Field is missing", response)
          } else {
            if (validator.validate(username) && schema.validate(password)) {
                var hashPwd = await bcrypt.hash(password, 10);
                request.body.password = hashPwd

                const reqUser = {
                    first_name: first_name,
                    last_name: last_name,
                    username: username,
                    password: hashPwd
                }
                
                data = await (userService.createUser(reqUser))
                if (data.hasOwnProperty("err")) {
                    if (data["err"].original.code == "23505" && data["err"].original.constraint == "Users_username_key") {
                        return logError.setAndLogError(400, "Email already exists", response)
                    }
                } else {
                    logger.info(`User created successfully with id: ${data.id}`);
                    return setSuccessResponse(data, response);
                }

                
              } else {
                return logError.setAndLogError(400, "Invalid Email or password", response)
              }
          }

          
    } catch (error) {
        return setErrorResponse(error, response);
    }

}

const updateUser = async (request, response) => {
    statsd_config.statsd.increment('api.user.http.put.count');
    try {

        if (request.body.id || request.body.createdAt || request.body.updatedAt) {
            return logError.setAndLogError(400, "Bad request", response)
        }

        if (!request.body.username) {
            return logError.setAndLogError(400, "Username field is required", response)
        }

        const {passwordValid, data} = await authorizeAndGetUser(request, response)

        if (passwordValid) {

            if (request.body.username != data.username) {
                return logError.setAndLogError(400, "Username cannot be modified", response)
            }
    
            const {
                first_name,
                last_name,
                password
              } = request.body;

              if (first_name == "" || last_name == "" || password == "") {
                return logError.setAndLogError(400, "Field cannot contain null values", response)
              } else {
                if (password) {
                    if (schema.validate(password)) {
                        var hashPwd = await bcrypt.hash(password, 10);
                        request.body.password = hashPwd
                      } else {
                        return logError.setAndLogError(401, "Invalid password", response)
                      }
                }
                const updatedUser = await (userService.updateUser(data.id, request.body))
                    const obj = updatedUser[1]
                    logger.info(`204: User updated`);
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

        const id = request.params.id;

        if(isNaN(id)) {
            return logError.setAndLogError(400, "Invalid id provided", response)
        }

        // check for basic auth header
        if (!request.headers.authorization || request.headers.authorization.indexOf('Basic ') === -1) {
            return logError.setAndLogError(401, "Missing Authorization Header", response)
        }

        // verify auth credentials
        const base64Credentials = request.headers.authorization.split(' ')[1];
        console.log(base64Credentials)
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, passwordForAuth] = credentials.split(':');

        data = await userService.getUser(id);
        if (!data) {
            return logError.setAndLogError(404, "User not found", response)
        }

        const userFromEmail = await userService.getUserByEmail(email);
        
        if (!userFromEmail) {
            return logError.setAndLogError(401, "Authorization failed", response)
        }
        
        const db_password = userFromEmail.password;
        const passwordValid = await bcrypt.compare(passwordForAuth, db_password)
            if (!passwordValid) {
                return logError.setAndLogError(401, "Authorization failed", response)
            } else {

                if (userFromEmail.id != id) {
                    return logError.setAndLogError(403, "Access denied", response)
                }

                return {
                    passwordValid: passwordValid,
                    data: data,
                }
            }

    } catch (error) {
        return {data: setErrorResponse(error, response)};
    }

}

module.exports = {
  getUser,
  createUser,
  updateUser
}