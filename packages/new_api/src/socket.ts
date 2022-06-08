export default function InitializeWs(io: any) {
  console.log('initializing web sockets');

  return io
    .use(function (socket: any, next: any) {
      console.log('authenticating user...');

      try {
        // const { token } = socket.handshake.query;
        // console.log(token);

        // verify jwt token with our api secret
        // var decoded: JwtClaims = jwt.verify(token, config.JWT_TOKEN_SECRET);

        // socket.userInfo = decoded;

        next();
      } catch (error) {
        console.error(error);
        next(new Error('WS Authentication Error'));
      }
    })
    .on('connection', (socket: any) => {
      console.log(`connected`, socket.id);
    });
}
