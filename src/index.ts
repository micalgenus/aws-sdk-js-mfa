import path from 'path';
import fs from 'fs';
import os from 'os';
import AWS from 'aws-sdk';
import ini from 'ini';
import moment from 'moment';
import readlineSync from 'readline-sync';
import { loopWhile } from 'deasync';
import { AssumeRoleParams, AwsConfigOptions } from '../typings';

const CACHE_FILE_PATH = path.resolve(os.homedir(), '.aws/nodejs/cache/credentials.json');
const CACHE_DIRECTORY = path.dirname(CACHE_FILE_PATH);

const checkAwsCliCache = (): AWS.STS.Types.AssumeRoleResponse | null => {
  const cacheFile = process.env.AWS_CACHE_FILE || CACHE_FILE_PATH;

  if (cacheFile && fs.existsSync(cacheFile)) {
    const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    if (cacheData && cacheData.Credentials && moment(cacheData.Credentials.Expiration) > moment()) {
      return cacheData;
    }
  }

  return null;
};

const saveCacheData = (response: AWS.STS.Types.AssumeRoleResponse) => {
  if (CACHE_DIRECTORY && !fs.existsSync(CACHE_DIRECTORY)) {
    fs.mkdirSync(CACHE_DIRECTORY, { recursive: true });
  }

  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(response));
};

const getMfaToken = () => {
  return readlineSync.question('Enter the MFA code: ', {
    hideEchoBack: true,
  });
};

const getLoginToken = (params: AssumeRoleParams): AWS.STS.Types.AssumeRoleResponse => {
  let done = false;
  let data: AWS.STS.Types.AssumeRoleResponse = {};

  const sts = new AWS.STS();
  sts.assumeRole(params, (e, d) => {
    if (e) throw e;
    data = d;
    done = true;
  });

  loopWhile(() => !done);

  return data;
};

export const getAwsConfigOptions = (): AwsConfigOptions => {
  const awsProfile = process.env.AWS_PROFILE || 'default';
  const awsConfigFile = process.env.AWS_CONFIG_FILE || path.resolve(os.homedir(), '.aws/config');
  const defaultRegion = 'ap-northeast-2';

  if (awsConfigFile && fs.existsSync(awsConfigFile)) {
    try {
      const configIni = ini.parse(fs.readFileSync(awsConfigFile, 'utf-8'));
      const config = configIni[awsProfile];
      const region = configIni[awsProfile].region || defaultRegion;

      if (typeof config !== 'object' || !config.role_arn) {
        throw new Error('Invalid configuration for AWS SKD: ' + JSON.stringify(config));
      }

      const cache = checkAwsCliCache();
      if (cache && cache.Credentials) {
        return {
          region,
          credentials: {
            accessKeyId: cache.Credentials.AccessKeyId,
            secretAccessKey: cache.Credentials.SecretAccessKey,
            sessionToken: cache.Credentials.SessionToken,
          },
        };
      }

      const params = {
        RoleArn: config.role_arn,
        RoleSessionName: 'dramaUnitTest',
        DurationSeconds: config.duration_seconds || 600,
        SerialNumber: '',
        TokenCode: '',
      };

      if (config.mfa_serial) {
        const mfaToken = getMfaToken();
        params.SerialNumber = config.mfa_serial;
        params.TokenCode = mfaToken;
      } else {
        delete params.SerialNumber;
        delete params.TokenCode;
      }

      const loginToken = getLoginToken(params);
      if (loginToken && loginToken.Credentials) {
        saveCacheData(loginToken);

        return {
          region,
          credentials: {
            accessKeyId: loginToken.Credentials.AccessKeyId,
            secretAccessKey: loginToken.Credentials.SecretAccessKey,
            sessionToken: loginToken.Credentials.SessionToken,
          },
        };
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    throw new Error('Not exist configuration file: ' + awsConfigFile);
  }
};

export const loginAwsWithMFA = () => {
  AWS.config.update(getAwsConfigOptions());
};

export default loginAwsWithMFA;
module.exports = loginAwsWithMFA;
