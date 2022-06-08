interface EnvironmentConfig {
  MONGO_CONNECTION_STRING: string;
  JWT_TOKEN_SECRET: string;
  GOOGLE_AUTH_CLIENT_ID: string;
}

// keep private
const getEnvironmentVariables = (): EnvironmentConfig => {
  // TODO
  if (process.env.NODE_ENV === 'production') {
    //
  }

  if (process.env.NODE_ENV === 'development') {
    //
  }

  return {
    GOOGLE_AUTH_CLIENT_ID:
      '423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com',
    JWT_TOKEN_SECRET: 'afajdslfwk1@lkkasdfl21ASDF!2',
    MONGO_CONNECTION_STRING:
      'mongodb+srv://default:M9iZXokJlZpN4KLX@cluster0.mkuqa.mongodb.net/default?retryWrites=true&w=majority',
  };
};

const environmentVariables: EnvironmentConfig = getEnvironmentVariables();
export default environmentVariables;
