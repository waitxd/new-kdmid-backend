const mongoose = require("mongoose");
const request = require("supertest-as-promised");
const httpStatus = require("http-status");
const chai = require("chai"); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require("../../index");

chai.config.includeStack = true;

/**
 * root level hooks
 */
after(done => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe("## DS-160 APIs", () => {
  let application = {
    email: "test@test.com",
    completed: false,
    step_index: 2,
    data: {
      interview_location: 'ALBANIA-TIRANA',
      b_agreement_2_1: false,
      b_agreement_2_2: false,
      purpose_of_trip: undefined,
    }
  };

  describe("# POST /api/ds-160", () => {
    it("should create a new ds-160 application", done => {
      request(app)
        .post("/api/ds-160")
        .send(application)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal(application.email);
          expect(res.body.completed).to.equal(application.completed);
          expect(res.body.step_index).to.equal(application.step_index);
          application = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/ds-160/:applicationId", () => {
    it("should get ds-160 application details", done => {
      request(app)
        .get(`/api/ds-160/${application._id}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal(application.email);
          expect(res.body.completed).to.equal(application.completed);
          expect(res.body.step_index).to.equal(application.step_index);
          done();
        })
        .catch(done);
    });

    it("should report error with message - Not found, when ds-160 application does not exists", done => {
      request(app)
        .get("/api/ds-160/56c787ccc67fc16ccc1a5e92")
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.message).to.equal("Not Found");
          done();
        })
        .catch(done);
    });
  });

  describe("# PUT /api/ds-160/:applicationId", () => {
    it("should update ds-160 application details", done => {
      application.email = "other@test.com";
      request(app)
        .put(`/api/ds-160/${application._id}`)
        .send(application)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal("other@test.com");
          done();
        })
        .catch(done);
    });
  });

  describe("# GET /api/ds-160/", () => {
    it("should get all ds-160 applications", done => {
      request(app)
        .get("/api/ds-160")
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an("array");
          done();
        })
        .catch(done);
    });

    it("should get all ds-160 applications (with limit and skip)", done => {
      request(app)
        .get("/api/ds-160")
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an("array");
          done();
        })
        .catch(done);
    });
  });

  describe("# DELETE /api/ds-160/", () => {
    it("should delete ds-160 application", done => {
      request(app)
        .delete(`/api/ds-160/${application._id}`)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.email).to.equal("other@test.com");
          done();
        })
        .catch(done);
    });
  });
});
