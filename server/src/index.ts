import express from 'express';
import cors from 'cors';
import productionRouter from './routes/production.js';
import linesRouter from './routes/lines.js';
import equipmentRouter from './routes/equipment.js';
import qualityRouter from './routes/quality.js';
import ordersRouter from './routes/orders.js';
import datasourceRouter from './routes/datasource.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/production', productionRouter);
app.use('/api/lines', linesRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/quality', qualityRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/datasource', datasourceRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
