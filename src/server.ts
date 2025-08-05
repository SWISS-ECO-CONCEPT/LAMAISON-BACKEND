import express from 'express';
import { userRouter } from './routes/auth.routes';
const app = express();


app.get('/', (req, res) => res.send('API LAMAISON fonctionne'));
app.use(express.json())
app.use('/auth', userRouter)
app.listen(5000, () => console.log('Serveur démarre sur le port 5000'));
export default app