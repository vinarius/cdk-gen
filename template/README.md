# Your AWS CDK App

## Table of Contents

1.  [Software Requirements](#1-software-requirements)
2.  [App Entry Point](#3-app-entry-point)
3.  [Useful Commands](#6-useful-commands)
4.  [Repository Layout](#7-repository-layout)
5.  [Exporting Values Between Stacks](#8-exporting-values-between-stacks)
6. [Unit Testing](#10-unit-testing)
7. [Architecture Diagram](#11-architecture-diagram)
8. [Useful Links](#12-useful-links)

## 1. Software Requirements
- node v16
- npm v8

I recommend using [nvm](https://github.com/nvm-sh/nvm) to manage your installation(s) of Nodejs. Alternatively, you may [download directly](https://nodejs.org/en/).

## 2. App Entry Point

All AWS CDK applications contain a cdk.json at the root of the CDK project. The cdk.json's app property defines the entry point of the application - infrastructure.ts. The CDK is very flexible and gives complete control over how the code is executed. Whether we run `npm run synth`, `npm run deploy`, or any other command that executes the code, cdk.json.app will be the entry point.

## 3. Useful Commands

- `npm run build` compile typescript to js.
- `npm run deploy` Deploy all stacks to AWS account/region based on current git branch.
- `npm run clean` Recursively removes the dist, cdk.out, coverage directories and removes all non-vital .js files.
- `npm run destroy` Used to easily cleanup feature branch resources. Destroys all resources by default, or takes a STACK environment variable.
    Separate stacks with a space.
- `npm run synth` Emits the synthesized CloudFormation template.
- `npm run diff` Compare deployed stack(s) with the current state.
- `npm run test` Perform the jest unit tests.
- `npm run lint` Run linting on source code.
- `npm run watch` Watch for changes and compile.
- `npm run generate-diagram` Generate a new architecture diagram based on the source code.

## 4. Repository Layout

```
bin/                 # Scripts and functions that can be run directly, or by the package.json
                         scripts. Includes the main cdk app - infrastructure.ts.
lib/                 # Shared helper classes and functions.
models/              # Shared types and runtime validation functions are defined here.
src/                 # Where the code lives for all lambda functions.
stacks/              # Cdk stacks and constructs. Here is where infrastructure resources are
                         defined and configured.
test/                # Tests to run against infrastructure stacks.
.eslintignore        # Defines which files are ignored by eslint.
.eslintrc.js         # Defines the linting strategy used by eslint.
.gitignore           # Defines which files are kept out of the remote repository,
                         such as node_modules.
.npmignore           # Defines which files should be omitted when publishing the package
                         to a registry.
cdk.context.json     # The AWS CDK caches context values retrieved from the AWS account.
                         This practice avoids unexpected changes to the deployments when,
                         for example,a new Amazon Linux AMI is released, changing the
                         Auto Scaling group.
cdk.json             # Defines where the main entry point of the CDK application is, and is
                         used to cache context key-value pairs in addition to cdk.context.json.
config.ts            # Environment/system configuration. Most props passed down to the stacks
                         are defined here.
jest.config.js       # Defines the testing strategy used by Jest. This repository aims for a
                         minimum of 80% code coverage. Use the `npm t -- --silent` command for
                         less verbose console output.
package.json         # Defines the package structure, commands, dependencies, and publishing
                         strategy. Note the scripts section.
README.md            # Defines this guide.
tsconfig.build.json  # An extension of tsconfig.json - defines how TypeScript builds this project.
tsconfig.json        # Defines how Typescript compiles this project.

----------------

cdk.out/             # Auto-generated by the AWS CDK. You can find synthesized, native
                        CloudFormation templates in here from `npm run synth` or `npm run deploy`.
coverage/            # Auto-generated by the Jest testing framework. You can find details on code
                         coverage as of the latest test here.
dist/                # Auto-generated. Where the latest build is found, both source code of the
                         lambdas as well as the lambdaLayer's dependencies.
node_modules/        # Generated by npm when you run `npm install`.
```

Configuration files are stored at the root and code always lives in a folder to promote reusablity and modularization. Runtime code (typically lambda functions) that gets deployed to the cloud lives in `/src`. It gets transpiled using esBuild versus code that is intended to be run locally on the dev box. Code for helping deployment, or for infrastructure is generally split. If the file is intended to be run directly, it lives in `/bin`. If the file is run indirectly (renaming when deploying to aws, for instance) it belongs in `/lib`. Usually this happens when a `/bin` script gets too big and needs to be modularized. The helpers end up being code that is not intended to be called directly from the command line, but also does not get uploaded/run in production.

## 5. Exporting Values Between Stacks
Use the AWS Systems Manager Parameter Store (SSM Parameters) to export your stack values when they are needed among other stacks. Native Cloudformation has a low level import/export feature, but this leads to tearing down consuming stacks when the exported value in the producing stack changes. This can lead to issues when the consuming stack contains stateful resources such as a database or user pool. Using SSM parameters is a much more flexible option that eliminates tearing down stacks. 

## 6. Unit Testing
Running the command `npm t` (short for `npm test` or `npm run test`) will execute bin/test.ts. This spawns a child process with the `jest --coverage` command.

![Coverage Example](docs/coverage-example.png)

This process will generate a code coverage report located in coverage/lcov-report/index.html. You can open this .html file in your browser and navigate to the file in question for a user friendly view on code coverage.

Optionally, you may set the VERBOSE=true and/or WATCH=true environment variables for verbose logging and hot refresh capabilities.

```
1. VERBOSE=true npm t
2. WATCH=true npm t
3. VERBOSE=true WATCH=true npm t
```

## 7. Architecture Diagram
![Architecture Diagram](docs/architecture-diagram.png)

## 8. Useful Links

1. [AWS SDK V3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)
2. [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html)
3. [AWS CLI Documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/index.html)
4. [AWS Cloudformation Reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)

&nbsp;

# [Back To Top](#table-of-contents)