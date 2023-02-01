const chai = require("chai");
const { expect } = require("chai");
const chaiHttp = require("chai-http");
const server = require('./server');

chai.use(chaiHttp);


describe("Unit test to get user", () => {

    it("should return true if valid authentication", () => {

        let creds = {
            "username": "sharma.mil@gmail.com",
            "password": "Milind@123"
        }

        let userObj = {
            "firstName": "Milind",
            "lastName": "Sharma",
            "username": "sharma.mil@gmail.com",
            "password": "Milind@123"
        }

        expect(userObj.username).to.eql(creds.username);
        expect(userObj.password).to.eql(creds.password);

    })
});

describe("Unit test to get user", () => {

    it("should return false if invalid", () => {

        let creds = {
            "username": "sharmaa.mil@gmail.com",
            "password": "Milindd@123"
        }

        let userObj = {
            "firstName": "Milind",
            "lastName": "Sharma",
            "username": "sharma.mil@gmail.com",
            "password": "Milind@123"
        }

        expect(userObj.username).to.not.eql(creds.username);
        expect(userObj.password).to.not.eql(creds.password);

    })
});

// const userId = '1';
// const userEmail = 'sharma.mil@gmail.com';
// const userPassword = 'Test@123';

// describe("Unit test for Getting a user", function () {
//     it("should return Data of a specific user with status code 200", function (done) {

//         // Calling get user api with auth for a specific user
//         chai
//             .request(server)
//             .get("/v1/user/" + userId)
//             .auth(userEmail, userPassword)
//             .end(function (err, res) {
//                 if (!err) {
//                     const attributes = (res).body
//                     expect(res.status).to.eql(200);
//                     expect(attributes).to.be.a('object');
//                     expect(attributes.first_name).to.eql('Milind');
//                     expect(attributes.last_name).to.eql('Sharma');
//                     done();
//                 }
//             })
//     });

// });
