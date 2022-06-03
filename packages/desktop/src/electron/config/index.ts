interface EnvironmentConfig {
  API_SERVER_URL: string;
}

// keep private
const getEnvironmentVariables = (): EnvironmentConfig => {
  // TODO
  if (process.env.NODE_ENV === 'production') {
    //
    return {
      API_SERVER_URL: 'https://api-a4b4we4n4q-wm.a.run.app/',
    };
  }

  if (process.env.NODE_ENV === 'development') {
    //
    return {
      API_SERVER_URL: 'https://localhost:8080',
    };
  }

  throw Error('No environment variables found!');
};

export const environmentVariables: EnvironmentConfig = getEnvironmentVariables();
