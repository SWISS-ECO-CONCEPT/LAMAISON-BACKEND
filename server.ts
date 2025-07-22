import express from 'express';
const app = express();

app.get('/', (req, res) => res.send('API LAMAISON fonctionne'));

app.listen(5000, () => console.log('Serveur démarre sur le port 5000'));
