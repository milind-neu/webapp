const userService = require('../services/user-service');

const bcrypt = require("bcrypt");
var validator = require("email-validator");
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
schema
  .is().min(6) // Min password length 8
  .is().max(100) // Max password length 100
  .has().uppercase() // Must contain atleast 1 uppercase letter
  .has().lowercase() // Must contain atleast 1 lowercase letter
  .has().digits() // Must have atleast 1 digit
  .has().not().spaces();

    const setErrorResponse = (error, response) => {
        response.status(500);
        response.json(error);
        return response
    }
    
    const setSuccessResponse = (obj, response) => {
        return response.status(201).json({
            "id": obj.id, 
            "first_name": obj.firstName, 
            "last_name": obj.lastName, 
            "username": obj.username, 
            "account_created": obj.createdAt, 
            "account_updated": obj.updatedAt
        });
    }
    
const getUser = async (request, response) => {
    try {

        const {passwordValid, data} = await authorizeAndGetUser(request, response)
        // console.log("DATA ", data)
        // console.log("USER ",user)
        console.log(passwordValid)
        console.log(data)
        if (passwordValid) {
            const obj = data
            return response.status(200).json({
                "id": obj.id, 
                "first_name": obj.firstName, 
                "last_name": obj.lastName, 
                "username": obj.username, 
                "account_created": obj.createdAt, 
                "account_updated": obj.updatedAt
            });
        } else {
            return data
        }

    } catch (error) {
        console.log(error)
        setErrorResponse(error, response);
    }

}

const createUser = async (request, response) => {
    try {
        const {
            firstName,
            lastName,
            username,
            password
          } = request.body;
        
          if (!firstName || !lastName || !username || !password) {
            return response.status(400).json({
                message: "Field is missing"
              });
          } else {
            if (validator.validate(username) && schema.validate(password)) {
                var hashPwd = await bcrypt.hash(password, 10);
                request.body.password = hashPwd
                data = await (userService.createUser(request.body))
                if (data.hasOwnProperty("err")) {
                    if (data["err"].original.code == "23505" && data["err"].original.constraint == "Users_username_key") {
                        console.log("rrrr")
                        return response.status(400).json({
                            message: "Email already exists"
                        });
                    }
                } else {
                    return setSuccessResponse(data, response);
                }

                
              } else {
                return response.status(401).json({
                  message: "Invalid Email or password..!!",
                  "password_guidelines: ": ["Minimum length 8", "Maximum length 100", "Must have uppercase letters",
                    "Must have lowercase letters", "Must have digits", "Should not have spaces"
                  ]
                });
              }
          }

          
    } catch (error) {
        console.log(error)
        setErrorResponse(error, response);
    }

}

const updateUser = async (request, response) => {
    try {
        const {passwordValid, data} = await authorizeAndGetUser(request, response)
        if (passwordValid) {

            const {
                firstName,
                lastName,
                password
              } = request.body;
            
              if (!firstName || !lastName || !password) {
                return response.status(400).json({
                    message: "Field is missing"
                  });
              } else {
                if (schema.validate(password)) {
                    var hashPwd = await bcrypt.hash(password, 10);
                    request.body.password = hashPwd
                    const updatedUser = await (userService.updateUser(data.id, request.body))
                    const obj = updatedUser[1]
                    return response.status(200).json({
                        "id": obj.id, 
                        "first_name": obj.firstName, 
                        "last_name": obj.lastName, 
                        "username": obj.username, 
                        "account_created": obj.createdAt, 
                        "account_updated": obj.updatedAt
                    });
                    
                  } else {
                    return response.status(401).json({
                      message: "Invalid password..!!",
                      "password_guidelines: ": ["Minimum length 8", "Maximum length 100", "Must have uppercase letters",
                        "Must have lowercase letters", "Must have digits", "Should not have spaces"
                      ]
                    });
                  }
              }

        } else {
            return data
        }

    } catch (error) {
        console.log(error)
        return setErrorResponse(error, response);
    }

}

const authorizeAndGetUser = async (request, response) => {
    try {

        const id = request.params.id;

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
  
        data = await userService.getUser(id);
        const db_password = data.password;
        if (email != data.username) {
            return {data: response.status(401).json({
                message: 'Authorization failed'
            })}; 
        } else {
            const passwordValid = await bcrypt.compare(passwordForAuth, db_password)
            if (!passwordValid) {
                return {data: response.status(401).json({
                    message: 'Authorization failed'
                })}; 
            } else {
                return {
                    passwordValid: passwordValid,
                    data: data,
                }
            }
        }

    } catch (error) {
        console.log(error)
        return {data: setErrorResponse(error, response)};
    }

}

module.exports = {
  getUser,
  createUser,
  updateUser
}