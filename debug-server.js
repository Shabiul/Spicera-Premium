import { createServer } from './server/index.js';
import 'dotenv/config';

console.log('Starting server debug...');

(async () => {
  try {
    console.log('Creating server...');
    const serverApp = await createServer();
    console.log('Server created successfully');
    
    const port = parseInt(process.env.PORT || '5000', 10);
    console.log(`Attempting to start server on port ${port}`);
    
    const server = serverApp.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
})();