# cocus-task

## Details to keep in mind while using/assessing the app

- The app makes use of caching (Cache has a transient memory of around 60 seconds, so repeated requests within the same minute do not hit the rate-limit).
- The app has pagination on 2 levels (Max Repos per page, and Max branches shown for each repo)
- The app has extensive logging to keep track of all invoked functions.
- Logging is suppressed during tests so not to disrupt mocha's test logs.
- I know you've been looking at a screen all day so it makes sense to make things easier for you, the app makes use of swagger so you can easily try it out!
  [http://localhost:3000/swagger-ui](http://localhost:3000/swagger-ui)
- You can change the Accept header by selecting the drop down menu at the bottom right of the input swagger component that has the GET request.
- The testing code of the github service is a bit lengthy but it had to be in one file because of synchronization reasons that would have been an overkill to solve, but tests are small and readable.
- Functions in code are as small as possible, so their names suffice and minimal comments are needed.

## Types of Responses

- Successful Response

```javascript
{
  "pagination": {
    "page": 0,
    "repositoriesCount": 0,
    "maxBranchesShownPerRepository": 0
  },
  "username": "string",
  "repositories": [
    {
      "name": "string",
      "branches": [
        {
          "name": "string",
          "lastCommitSha": "string"
        }
      ]
    }
  ]
}
```

- Not Found
  `{ "status": "404", "message": "..." }`

- Github's Rate Limit Exceeded
  `{ "status": "429", "message": "..." }`

- Unexpected Errors
  `{ "status": "500", "message": "..." }`

## Run the app using

`npm i`

then

`npm start`

### Run tests using

`npm test`

## And for the schema and making requests please open swagger at

[http://localhost:3000/swagger-ui](http://localhost:3000/swagger-ui)

- App is dockerized as well, feel free to run
  `npm run build`
