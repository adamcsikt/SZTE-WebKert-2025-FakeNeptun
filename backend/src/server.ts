import http from 'http';
import app from './app/app';

const port = process.env.PORT || 5000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error: any) {
   if (error.syscall !== 'listen') {
      throw error;
   }

   switch (error.code) {
      case 'EACCES':
         console.error('Requires elevated privileges');
         process.exit(1);
         break;
      case 'EADDRINUSE':
         console.error('Port is already in use');
         process.exit(1);
         break;
      default:
         throw error;
   }
}

function onListening() {
   const addr = server.address();
   console.log(`Listening on port ${addr?.port}`);
}
