# CSYE 6225 - Spring 2023

## Personal Information

| Name | NEU ID | Email Address |  
| Milind Sharma | 001090358 | sharma.mil@northeastern.edu |  


## Tech Stack

### Backend: Node.js
### Database: PostgresSQL
## Build Instructions

1. Clone the forked repository `git@github.com:milind-neu/webapp.git` 
2. Configure `.env` with your database details
3. Run `npm install` to install deps
4. Run `db-migrate` using `npx sequelize-cli db:migrate`
5. Run the app using `npm start`
6. Go to Postman and run all apis like `healthz`, `getUser`, `createUser` and `updateUser`

## Deploy Instructions

## Running Tests
1. Open another terminal and then run the command `npm test` to launch unit test for `healthz` endpoint.

## CI
1. Github Actions workflow will be triggered when a PR is raised from the fork repo to the organization repo.
2. GitHub Repository has branch protection configured to prevent PRs from merging when a workflow fails.

## Libraries used:
1. bcryptjs
2. chai
3. chai-http
4. email-validator
5. password-validator
6. mocha
7. express
8. pg
9.  save
10. nodemon
11. should
12. superters
13. sequelize.
