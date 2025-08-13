import express from 'express';
import { userRouter } from './routes/auth.routes';
import cors from 'cors'
const app = express();


app.use(cors({
  origin: '*', // autorise le frontend
  credentials: true // si on veut envoyer des cookies plus tard
}))

app.get('/', (req, res) => res.send('API LAMAISON fonctionne'));
app.use(express.json())
app.use('/auth', userRouter)
app.listen(5000, () => console.log('Serveur démarre sur le port 5000'));
export default app