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
    }
    
    const setSuccessResponse = (obj, response) => {
        response.status(201).json({
            "id": obj.id, 
            "first_name": obj.firstName, 
            "last_name": obj.lastName, 
            "username": obj.username, 
            "account_created": obj.createdAt, 
            "account_updated": obj.updatedAt
        });
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
            response.status(400).json({
                message: "Field is missing"
              });
          } else {
            if (validator.validate(username) && schema.validate(password)) {
                var hashPwd = await bcrypt.hash(password, 10);
                request.body.password = hashPwd
                data = await (userService.createUser(request.body)).catch(err => {
                    if (err.original.code == "23505" && err.original.constraint == "Users_email_key") {
                        response.status(400).json({
                            message: "Email already exists"
                        });
                    }
                });

                setSuccessResponse(data, response);
                
              } else {
                response.status(401).json({
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

module.exports = {
  createUser
}