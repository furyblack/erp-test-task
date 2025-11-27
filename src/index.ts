import routes from './routes/routes';
import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/', routes);

//start db and server
AppDataSource.initialize()
    .then(() => {
        console.log('Data Source has been initialized, Mysql is connected ');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });
