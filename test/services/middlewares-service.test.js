const middlewaresService = require("../../main/services/middlewares.service");
const errors = require("../../main/resources/errors.json");
const config = require("../../main/resources/config.json");
const { assert } = require("chai");

describe("Middlewares Service Unit Tests", () => {
  it("Should call next() function  and modify wrong query params if the header 'accept' is application/json.", () => {
    let req = {
      headers: {
        accept: "application/json",
      },
      query: {
        query: {
          page: 1,
          reposPerPage: -4,
          branchesPerRepo: 0,
        },
      },
    };
    let res = {
      status: (undefined) => {
        return res;
      },
      send: (obj) => {
        return obj;
      },
    };
    let next = () => {
      return "Called Next Function";
    };

    let result = middlewaresService.validateGithubRepositoriesRequest(
      req,
      res,
      next
    );

    assert.equal(result, "Called Next Function");
    assert.equal(req.query.reposPerPage, config.REPOSITORIES_PER_PAGE_DEFAULT);
    assert.equal(
      req.query.branchesPerRepo,
      config.BRANCHES_PER_REPOSITORY_DEFAULT
    );
  });

  it("Should return a 406 error if the header 'accept' is application/xml.", () => {
    let req = {
      headers: {
        accept: "application/xml",
      },
      query: {
        page: 1,
        reposPerPage: -4,
        branchesPerRepo: 0,
      },
    };
    let res = {
      status: (undefined) => {
        return res;
      },
      send: (obj) => {
        return obj;
      },
    };
    let next = () => {
      return "Called Next Function";
    };

    let result = middlewaresService.validateGithubRepositoriesRequest(
      req,
      res,
      next
    );

    assert.equal(result.status, errors.ACCEPT_HEADER_ERROR.status);
    assert.equal(result.message, errors.ACCEPT_HEADER_ERROR.message);
  });
});
