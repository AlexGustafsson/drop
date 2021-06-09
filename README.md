<p align="center">
  <img src=".github/logo.png" alt="Logo">
</p>
<p align="center">
  <a href="https://github.com/AlexGustafsson/drop/blob/master/go.mod">
    <img src="https://shields.io/github/go-mod/go-version/AlexGustafsson/drop" alt="Go Version" />
  </a>
  <a href="https://github.com/AlexGustafsson/drop/releases">
    <img src="https://flat.badgen.net/github/release/AlexGustafsson/drop" alt="Latest Release" />
  </a>
  <br>
  <strong><a href="#quickstart">Quick Start</a> | <a href="#contribute">Contribute</a> </strong>
</p>

# Drop
### A self-hosted, end-to-end encrypted personal file sharing service

Note: Drop is currently being actively developed. Until it reaches v1.0.0 breaking changes may occur in minor versions.

Drop is a new service for letting people easily upload end-to-end encrypted files from any device right to your own cluster, swarm or Raspberry Pi. It's design with two primary goals in mind:

1. The service must be user-friendly. A computer-novice should be able to receive a link and use the service on their own on their device of choice.
2. The service must be secure. The server must have minimal knowledge of the files shared - encryption is not optional.

Beyond these primary goals, there are two secondary goals.

1. The service must be easily self-hosted, be it on a Raspberry Pi, using Docker or running in a Kubernetes cluster.
2. The service must be performant and scalable. The web-based client should easily handle uploads of hundreds of megabytes within seconds and the server must be able to handle the load shared over one or more instances.

## Quickstart
<a name="quickstart"></a>

Upcoming.

## Table of contents

[Quickstart](#quickstart)<br/>
[Features](#features)<br />
[Installation](#installation)<br />
[Usage](#usage)<br />
[Contributing](#contributing)

<a id="features"></a>
## Features

* Non-optional end-to-end streaming file encryption
* Several supported state and storage backends
* Support for all the latest browsers (Chrome, Edge, Firefox, Safari)
* API-first to support third-party clients

<a id="installation"></a>
## Installation

### Using Docker

Upcoming.

### Using Homebrew

Upcoming.

```sh
brew install alexgustafsson/tap/drop
```

### Downloading a pre-built release

Download the latest release from [here](https://github.com/AlexGustafsson/drop/releases).

### Build from source

Clone the repository.

```sh
git clone https://github.com/AlexGustafsson/drop.git && cd drop
```

Optionally check out a specific version.

```sh
git checkout v0.1.0
```

Build the application.

```sh
make build
```

## Usage
<a name="usage"></a>

_Note: This project is still actively being developed. The documentation is an ongoing progress._

```
Usage: drop [global options] command [command options] [arguments]

A service for securely transferring files

Version: v0.1.0, build 19df17a. Built Wed Jun  9 11:29:18 CEST 2021 using go version go1.16 darwin/amd64

Options:
  --verbose   Enable verbose logging (default: false)
  --help, -h  show help (default: false)

Commands:
  decrypt  Decrypt a file
  serve    Serve the application
  token    Create a token
  version  Show the application's version
  help     Shows a list of commands or help for one command

Run 'drop help command' for more information on a command.
```

## Documentation

Upcoming.

### API

The API is documented in `api.yml` using OpenAPI 3.0.

You may use tools such as the open source [Insomnia](https://github.com/Kong/insomnia) to easily work with the API, or Swagger UI to explore the API.

## Security

Security is one of the core features of Drop and therefore it's taken very seriously. At the time of writing, Drop is not ready for production use. When it is, it will provide confidentiality via end-to-end encryption, integrity via the use of authenticated cryptography and availability by being horizontally scalable, offloading the data and state to highly available stores.

This section will be extended to provide information on how to disclose security issues, what considerations should be made when deploying and using Drop, as well as security features and limitations.

## Contributing
<a name="contributing"></a>

Any help with the project is more than welcome. The project is still in its infancy and not recommended for production.

### Development

```sh
# Clone the repository
https://github.com/AlexGustafsson/drop.git && cd drop

# Show available commands
make help

# Build the project for the native target
make build
```

#### Frontend

The frontend is written entirely in TypeScript without using any framework (it's a single page). The app uses a web worker to handle the encryption and uploading of files in the background. The entire source is found in the `frontend` directory.

The only top-level build command available for the frontend is `make build/frontend`, which builds the frontend and outputs it to the `build/frontend` directory. For development, it's recommended to use the available commands via yarn or NPM instead.

```sh
cd frontend

# Install dependencies
yarn install

## Building

# Build for production
yarn build
# Build in watch mode (builds on change)
yarn build:watch

## Serving

# Serve the application using the Python 3 http.server module
yarn serve

# Build in watch mode and serve the application
yarn dev

## Testing

# Run tests available in Node
yarn test:node
# Build browser-based tests in watch mode
yarn build:test
# Build browser-based tests in watch mode and serve them
# Visit http://localhost/dist/test/ to run the tests
yarn dev:test
```

It's often easiest to build the frontend in watch mode using `yarn build:watch` and then use the server to serve the application with `./build/drop serve`.

#### Server

The server is written entirely in Go, using the [Fiber](https://gofiber.io) web framework. Its source is scattered in the `cmd` and `internal` directories.

```sh
## Building

# Build the server
make build/drop

## Code quality

# Format code
make format
# Lint code
make lint
# Vet the code
make vet

## Testing

# Run tests
make test
```

_Note: due to a bug (https://gcc.gnu.org/bugzilla/show_bug.cgi?id=93082, https://bugs.llvm.org/show_bug.cgi?id=44406, https://openradar.appspot.com/radar?id=4952611266494464), clang is required when building for macOS. GCC cannot be used._
