import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors);
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello COTS Connect!');
});

app.listen(port, () => {
  return console.log(`app listening at http://localhost:${port}`);
});
