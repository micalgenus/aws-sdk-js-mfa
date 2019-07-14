# aws-sdk-js-mfa

[![TravisCI](https://travis-ci.org/micalgenus/aws-sdk-js-mfa.svg?branch=master)](https://travis-ci.org/micalgenus/aws-sdk-js-mfa)
[![npm version](https://img.shields.io/npm/v/@micalgenus/aws-sdk-js-mfa.svg)](https://www.npmjs.com/package/@micalgenus/aws-sdk-js-mfa)
[![npm total downloads](https://img.shields.io/npm/dt/@micalgenus/aws-sdk-js-mfa.svg?style=flat)](https://www.npmjs.com/package/@micalgenus/aws-sdk-js-mfa)

MFA login with [AWS SDK](https://github.com/aws/aws-sdk-js)

## Install

```sh
yarn add @micalgenus/aws-sdk-js-mfa

or

npm install --save @micalgenus/aws-sdk-js-mfa
```

## Usage

```javascript
const loginAwsWithMFA = require('@micalgenus/aws-sdk-js-mfa');

// synchronous function.
// waiting for login before create AWS instance
loginAwsWithMFA();
```
