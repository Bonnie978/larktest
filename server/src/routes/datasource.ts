import { Router } from 'express';
import { dataSources } from '../mock/datasource.js';

const router = Router();

router.get('/', (_req, res) => {
  const metadata = dataSources.map(ds => ({
    id: ds.id,
    name: ds.name,
    description: ds.description,
    fields: ds.fields,
  }));
  res.json({ code: 0, data: metadata, message: 'success' });
});

router.get('/:id/data', (req, res) => {
  const { id } = req.params;
  const dataSource = dataSources.find(ds => ds.id === id);
  
  if (!dataSource) {
    return res.status(404).json({ code: 404, data: null, message: 'Data source not found' });
  }
  
  res.json({ code: 0, data: dataSource.data, message: 'success' });
});

export default router;
