import express from 'express';
import cors from 'cors';
import connectDB from './server.js';
import userRoute from './src/router/userrouter.js';

const app = express();
app.use(express.json());
const { PORT } = process.env;
app.use(cors());

app.use('/user', userRoute);

app.listen(PORT, () => {
    console.log("listening on port: ", PORT);
    connectDB();
})