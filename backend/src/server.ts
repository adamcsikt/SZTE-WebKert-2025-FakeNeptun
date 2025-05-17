import http from 'http';
import app from './app/app';

const port = process.env.PORT || 5000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error: any): void {
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

function onListening(): void {
   const addr = server.address();

   if (typeof addr === 'string') {
      console.log(`Listening on pipe ${addr}`);
   } else if (addr && typeof addr === 'object') {
      console.log(`Listening on port ${addr.port}`);
   }
}
