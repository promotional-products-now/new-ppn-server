

  <p align="center">ppn App server.</p>
    <p align="center">


## Project


## Description
The project uses doppler for secrete management and npm for dependency management

## Setup Doppler

- Install Doppler CLI on your computer

Create a file called `.doppler.yaml` in the root directory Add the following
content to the file

```
setup:
  project: ppn
  config: dev
```

See Doppler documentation for how this works.

- Authenticate with doppler by running: `doppler login`

- Setup project with doppler `doppler setup`


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

