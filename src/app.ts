import 'dotenv/config'
import type { Application } from "express";
import express from 'express';
import http from 'http';
import router from '@routes/index';


const app: Application = express();
const port = process.env.PORT || '8000';

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', router);
app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('listening', () => console.info(`Server is listening on ${port}`));
