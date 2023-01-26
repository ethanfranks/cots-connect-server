import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : 3306;
const password = process.env.SQL_PASSWORD;

export const dataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: port,
  username: 'root',
  password: password,
  database: 'cots_connect',
  entities: ['src/entity/*.ts'],
  logging: true,
  synchronize: true,
});
