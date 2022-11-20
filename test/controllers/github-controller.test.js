require("../../main/controllers/github.controller");
const portMapper = require("../../main/resources/controller-port-mapper.json");
const request = require("supertest")(`http://localhost:${portMapper.Github}`);
const errors = require("../../main/resources/errors.json");
const mockingResponses = require("../resources/mocking-responses.json");
const config = require("../resources/config.json");
const nock = require("nock");
const { assert } = require("chai");

describe("Github Integration Tests", () => {
  beforeEach(() => {
    // Mock the needed endpoints
    let nockObject = nock(config.MOCKING_BASE_URL);
    nockObject
      .get((uri) => uri.includes(config.MOCKING_URL_GET_REPOS_OK.path))
      .reply(
        config.MOCKING_URL_GET_REPOS_OK.status,
        mockingResponses.GET_USER_REPOS_200_OK
      );
    nockObject
      .get((uri) => uri.includes(config.MOCKING_URL_GET_REPOS_NOT_FOUND.path))
      .reply(config.MOCKING_URL_GET_REPOS_NOT_FOUND.status, {});
    nockObject
      .get((uri) =>
        uri.includes(config.MOCKING_URL_GET_REPOS_RATE_LIMIT_EXCEEDED.path)
      )
      .reply(config.MOCKING_URL_GET_REPOS_RATE_LIMIT_EXCEEDED.status, {});

    nockObject
      .get((uri) => uri.includes(config.MOCKING_URL_GET_BRANCHES_OK.path))
      .reply(
        config.MOCKING_URL_GET_BRANCHES_OK.status,
        mockingResponses.GET_REPO_BRANCHES_200_OK
      );
    nockObject
      .get((uri) =>
        uri.includes(config.MOCKING_URL_GET_BRANCHES_NOT_FOUND.path)
      )
      .reply(config.MOCKING_URL_GET_BRANCHES_NOT_FOUND.status, {});
    nockObject
      .get((uri) =>
        uri.includes(config.MOCKING_URL_GET_BRANCHES_RATE_LIMIT_EXCEEDED.path)
      )
      .reply(config.MOCKING_URL_GET_BRANCHES_RATE_LIMIT_EXCEEDED.status, {});
  });

  it("Should call the get /github/:username/repositories and get a 200 OK response with the expected response body", async () => {
    let response = await request
      .get("/github/testUserNameSuccess/repositories")
      .query({ page: 1, reposPerPage: 2, branchesPerRepo: 2 })
      .set("Accept", "application/json");

    assert.equal(response.status, 200);
    assert.equal(response.body.pagination.page, 1);
    assert.equal(response.body.pagination.repositoriesCount, 1);
    assert.equal(response.body.pagination.maxBranchesShownPerRepository, 2);
    assert.equal(response.body.username, "testUserNameSuccess");
    assert.equal(
      response.body.repositories[0].name,
      mockingResponses.GET_USER_REPOS_200_OK[0].name
    );
    assert.equal(
      response.body.repositories[0].branches[0].name,
      mockingResponses.GET_REPO_BRANCHES_200_OK[0].name
    );
    assert.equal(
      response.body.repositories[0].branches[0].lastCommitSha,
      mockingResponses.GET_REPO_BRANCHES_200_OK[0].commit.sha
    );
    assert.equal(
      response.body.repositories[0].branches[1].name,
      mockingResponses.GET_REPO_BRANCHES_200_OK[1].name
    );
    assert.equal(
      response.body.repositories[0].branches[1].lastCommitSha,
      mockingResponses.GET_REPO_BRANCHES_200_OK[1].commit.sha
    );
  });

  it("Should call the get /github/:username/repositories and get a 404 NOT FOUND response with the expected response body", async () => {
    let response = await request
      .get("/github/testUserNameNotFound/repositories")
      .query({ page: 1, reposPerPage: 2, branchesPerRepo: 2 })
      .set("Accept", "application/json");

    assert.equal(response.status, errors.USER_NOT_FOUND.status);
    assert.equal(response.body.status, errors.USER_NOT_FOUND.status);
    assert.equal(response.body.message, errors.USER_NOT_FOUND.message);
  });

  it("Should call the get /github/:username/repositories and get a 406 Wrong Accept Header response with the expected response body", async () => {
    let response = await request
      .get("/github/testUserNameSuccess/repositories")
      .query({ page: 1, reposPerPage: 2, branchesPerRepo: 2 })
      .set("Accept", "application/xml");

    assert.equal(response.status, errors.ACCEPT_HEADER_ERROR.status);
    assert.equal(response.body.status, errors.ACCEPT_HEADER_ERROR.status);
    assert.equal(response.body.message, errors.ACCEPT_HEADER_ERROR.message);
  });

  it("Should call the get /github/:username/repositories and get a 429 Exceeded Rate Limit response with the expected response body", async () => {
    let response = await request
      .get("/github/testUserNameRateLimitExceeded/repositories")
      .query({ page: 1, reposPerPage: 2, branchesPerRepo: 2 })
      .set("Accept", "application/json");

    assert.equal(response.status, errors.EXCEEDED_RATE_LIMIT.status);
    assert.equal(response.body.status, errors.EXCEEDED_RATE_LIMIT.status);
    assert.equal(response.body.message, errors.EXCEEDED_RATE_LIMIT.message);
  });
});
