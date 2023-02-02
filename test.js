const chai = require("chai");
const { expect } = require("chai");
const chaiHttp = require("chai-http");
const server = require('./server');

chai.use(chaiHttp);

describe("Test for healthy server endpoint", () => {
    
  it("If the server is healthy, should return 200 OK", (done) => {
    
    chai
      .request(server)
      .get("/healthz")
      .end((err, res) => {
        if (!err) {
          expect(res.status).to.eql(200);
          expect(res.body.message).to.eql("Server is healthy!!!");
          done();
        }
      });
  });
});