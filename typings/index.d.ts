declare namespace AwsSdkJsMfa {
  interface AssumeRoleParams {
    RoleArn: any;
    RoleSessionName: string;
    DurationSeconds: any;
    SerialNumber: string;
    TokenCode: string;
  }

  interface AwsConfigOptions {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
      sessionToken: string;
    };
  }
}

export = AwsSdkJsMfa;
