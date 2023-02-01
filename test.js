const chai = require("chai");
const { expect } = require("chai");
const chaiHttp = require("chai-http");
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');

const userController = require('./api/controllers/user-controller');
const userService = require('./api/services/user-service');

chai.use(chaiHttp);

describe("UserService", function() {
    describe("getUser", function() {
    let status, json, res;
    beforeEach(() => {
      status = sinon.stub();
      json = sinon.spy();
      res = { json, status };
      status.returns(res);
    });
      it("should return a user that matches the provided id", async function() {
        const stubValue = {
          id: parseInt(faker.random.numeric(1)),
          firstName: faker.name.findName(),
          lastName: faker.name.findName(),
          username: faker.internet.email(),
          password: faker.internet.password(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.past()
        };
        const req = {
            body: {
                id: stubValue.id,
                firstName: stubValue.firstName,
                lastName: stubValue.lastName,
                username: stubValue.username,
                password: stubValue.password
            }
          };
        const stub = sinon.stub(userService, "createUser").returns(stubValue);
        const user = await userController.createUser(req, res);
        expect(status.calledOnce).to.be.true;
        expect(stub.calledOnce).to.be.true;
      });
    });
  });