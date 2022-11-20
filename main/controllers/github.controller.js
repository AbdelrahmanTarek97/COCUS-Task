// Controller name
const CONTROLLER_NAME = "Github";
// Controller port
const CONTROLLER_PORT = require("../resources/controller-port-mapper.json")[
  CONTROLLER_NAME
];
// Express framework to be used for server set-up
const express = require("express");
// Require our services
const githubService = require("../services/github.service");
const middlewares = require("../services/middlewares.service");

// Initialize our express app
const app = express();

// Add middlewares required above
middlewares.addPresetMiddlewaresToExpressApp(app);

// Add our endpoint
app.get(
  "/github/:username/repositories",
  middlewares.validateGithubRepositoriesRequest,
  githubService.getUserRepositories
);

// Start server with the provided port and throw an error if there is no provided port
const port = CONTROLLER_PORT;

if (!port) {
  throw Error(
    `${CONTROLLER_NAME} Server does not have a provided port to run on.`
  );
}

app.listen(port, () => {
  console.log(
    `${CONTROLLER_NAME} Server running on port ${port}, open http://localhost:${port}/swagger-ui to try it out!`
  );
});
