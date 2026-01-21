import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', router); // Basic prefix

app.get('/', (req, res) => {
    res.send('EduLogin API is running 🚀');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
