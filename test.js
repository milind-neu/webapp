const chai = require("chai");
const { expect } = require("chai");
const chaiHttp = require("chai-http");
const server = require('./server');

chai.use(chaiHttp);

const userId = '42';
const userEmail = 'sharma.mil@gmail.com';
const userPassword = 'Test@123';

describe("Unit test for Getting a user", function () {
    it("should return Data of a specific user with status code 200", function (done) {

        // Calling get user api with auth for a specific user
        chai
            .request(server)
            .get("/v1/user/" + userId)
            .auth(userEmail, userPassword)
            .end(function (err, res) {
                if (!err) {
                    const attributes = (res).body
                    expect(res.status).to.eql(200);
                    expect(attributes).to.be.a('object');
                    expect(attributes.first_name).to.eql('Milind');
                    expect(attributes.last_name).to.eql('Sharma');
                    done();
                }
            })
    });

});
