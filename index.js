import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = 5173;

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, 'src/index.html'))
});

app.use(express.static('public'));

// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/html'})
//   fs.readFile('src/index.html', function(error, data) {
//     if (error) {
//       res.writeHead(404);
//       res.write('404 Error: File Not Found')
//     } else {
//       res.write(data);
//     }
//     res.end();
//   })
// });

app.listen(port, (error) => {
  if (error) {
    console.log('Something went wrong', error)
    return;
  }
  
  console.log('Server is now listening\n');
  console.log('%s\x1b[36m%s\x1b[0m', 'Localhost: ', 'http://localhost:' + port);
});
