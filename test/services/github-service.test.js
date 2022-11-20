const githubService = require("../../main/services/github.service");
const githubApiService = require("../../main/services/github-api.service");
const errors = require("../../main/resources/errors.json");
const mockingResponses = require("../resources/mocking-responses.json");
const config = require("../resources/config.json");
const nock = require("nock");
const { assert } = require("chai");

describe("Github Service Tests", () => {
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

  after(() => {
    nock.restore();
  });

  describe("github-service-api.makeGithubApiCall function Tests", () => {
    it("Should return response if its status is 200 OK.", async () => {
      let response = await githubApiService.makeGithubApiCall(
        "https://api.github.com/users/testUserNameSuccess/repos"
      );
      assert.equal(response.status, 200);
      assert.sameDeepMembers(
        response.body,
        mockingResponses.GET_USER_REPOS_200_OK
      );

      response = await githubApiService.makeGithubApiCall(
        "https://api.github.com/repos/testUserNameSuccess/testRepoSuccess/branches"
      );
      assert.equal(response.status, 200);
      assert.sameDeepMembers(
        response.body,
        mockingResponses.GET_REPO_BRANCHES_200_OK
      );
    });

    it("Should return error 404 if user or repository is not found.", async () => {
      let firstFailure = false;
      let secondFailure = false;

      try {
        await githubApiService.makeGithubApiCall(
          "https://api.github.com/users/testUserNameNotFound/repos",
          1
        );
      } catch (error) {
        firstFailure = true;
        assert.equal(error.status, 404);
      }

      try {
        await githubApiService.makeGithubApiCall(
          "https://api.github.com/repos/testUserNameNotFound/testRepoNotFound/branches",
          1
        );
      } catch (error) {
        secondFailure = true;
        assert.equal(error.status, 404);
      }

      assert.equal(
        firstFailure && secondFailure,
        true,
        "One of the endpoints returned a valid response when it should have thrown an error."
      );
    });

    it("Should return error 403 if rate limit has been exceeded.", async () => {
      let firstFailure = false;
      let secondFailure = false;

      try {
        await githubApiService.makeGithubApiCall(
          "https://api.github.com/users/testUserNameRateLimitExceeded/repos",
          1
        );
      } catch (error) {
        firstFailure = true;
        assert.equal(error.status, 403);
      }

      try {
        await githubApiService.makeGithubApiCall(
          "https://api.github.com/repos/testUserNameRateLimitExceeded/testRepoRateLimitExceeded/branches",
          1
        );
      } catch (error) {
        secondFailure = true;
        assert.equal(error.status, 403);
      }

      assert.equal(
        firstFailure && secondFailure,
        true,
        "One of the endpoints returned a valid response when it should have thrown an error."
      );
    });
  });

  describe("github-service-api.callGetRepoBranchesPage function Tests", () => {
    it("Should return response", async () => {
      let response = await githubApiService.callGetRepoBranchesPage(
        "testUserNameSuccess",
        "testRepoSuccess",
        1,
        1
      );
      assert.sameDeepMembers(
        response.body,
        mockingResponses.GET_REPO_BRANCHES_200_OK
      );
    });
  });

  describe("github-service-api.callGetUserReposPage function Tests", () => {
    it("Should return response", async () => {
      let response = await githubApiService.callGetUserReposPage(
        "testUserNameSuccess",
        1,
        1
      );
      assert.sameDeepMembers(
        response.body,
        mockingResponses.GET_USER_REPOS_200_OK
      );
    });
  });

  describe("github-service-api.getAndProcessOnePageOfBranches function Tests", () => {
    it("Should return processed page of branches", async () => {
      let result = await githubApiService.getAndProcessOnePageOfBranches(
        "testUserNameSuccess",
        "testRepoSuccess",
        1,
        1
      );
      assert.sameDeepMembers(
        [result],
        [
          {
            count: 2,
            branches: [
              {
                name: "master",
                lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
              },
              {
                name: "dev",
                lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
              },
            ],
          },
        ]
      );
    });
  });

  describe("github-service-api.getRepositoryBranchesData function Tests", () => {
    it("Should return branches data", async () => {
      let result = await githubApiService.getRepositoryBranchesData(
        "testUserNameSuccess",
        "testRepoSuccess",
        1
      );
      assert.sameDeepMembers(result, [
        {
          name: "master",
          lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
        },
        {
          name: "dev",
          lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
        },
      ]);
    });
  });

  describe("github-service-api.getAndProcessOnePageOfRepositories function Tests", () => {
    it("Should return processed repos page", async () => {
      let result = await githubApiService.getAndProcessOnePageOfRepositories(
        "testUserNameSuccess",
        1,
        2
      );
      assert.sameDeepMembers(result.repositories, [
        {
          name: "testRepoSuccess",
        },
      ]);
    });
  });

  describe("github-service-api.addBranchesData function Tests", () => {
    it("Should add branch data to repository page", async () => {
      let result = await githubApiService.addBranchesData(
        "testUserNameSuccess",
        [
          {
            name: "testRepoSuccess",
          },
        ],
        2
      );
      assert.sameDeepMembers(result, [
        {
          name: "testRepoSuccess",
          branches: [
            {
              lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
              name: "master",
            },
            {
              lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
              name: "dev",
            },
          ],
        },
      ]);
    });
  });

  describe("github-service-api.getUserRepositoriesWithBranchesData function Tests", () => {
    it("Should add branch data to repository page", async () => {
      let result = await githubApiService.getUserRepositoriesWithBranchesData(
        "testUserNameSuccess",
        1,
        1,
        2
      );
      assert.sameDeepMembers(
        [result],
        [
          [
            {
              name: "testRepoSuccess",
              branches: [
                {
                  lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
                  name: "master",
                },
                {
                  lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
                  name: "dev",
                },
              ],
            },
          ],
        ]
      );
    });
  });

  describe("github-service.getUserRepositories function Tests", () => {
    it("Should return a 200 OK response", async () => {
      let req = {
        headers: {
          accept: "application/json",
        },
        params: {
          username: "testUserNameSuccess",
        },
        query: {
          page: 1,
          reposPerPage: 1,
          branchesPerRepo: 2,
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
      let response = await githubService.getUserRepositories(req, res);
      assert.sameDeepMembers(
        [response],
        [
          {
            pagination: {
              page: 1,
              repositoriesCount: 1,
              maxBranchesShownPerRepository: 2,
            },
            username: "testUserNameSuccess",
            repositories: [
              {
                name: "testRepoSuccess",
                branches: [
                  {
                    lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
                    name: "master",
                  },
                  {
                    lastCommitSha: "c5b97d5ae6c19d5c5df71a34c7fbeeda2479ccbc",
                    name: "dev",
                  },
                ],
              },
            ],
          },
        ]
      );
    });

    it("Should return a 404 Not Found response", async () => {
      let req = {
        headers: {
          accept: "application/json",
        },
        params: {
          username: "testUserNameNotFound",
        },
        query: {
          page: 1,
          reposPerPage: 1,
          branchesPerRepo: 2,
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
      let response = await githubService.getUserRepositories(req, res);
      assert.equal(response.status, errors.USER_NOT_FOUND.status);
      assert.equal(response.message, errors.USER_NOT_FOUND.message);
    });

    it("Should return a 429 Exceeded Rate Limit response", async () => {
      let req = {
        headers: {
          accept: "application/json",
        },
        params: {
          username: "testUserNameExceededRateLimit",
        },
        query: {
          page: 1,
          reposPerPage: 1,
          branchesPerRepo: 2,
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
      let response = await githubService.getUserRepositories(req, res);
      assert.equal(response.status, errors.USER_NOT_FOUND.status);
      assert.equal(response.message, errors.USER_NOT_FOUND.message);
    });
  });
});
