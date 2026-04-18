const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error && dotenvResult.error.code !== 'ENOENT') {
  console.error(`Failed to load environment variables from ${envPath}`);
  console.error(dotenvResult.error);
}

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const courierRoutes = require('./routes/courierRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const { initDatabase, databasePath } = require('./db');
const { authenticateToken, authorizeRoles } = require('./middlewares/authMiddleware');
const { getAllCouriersController, deleteCourierController, deleteStoreController } = require('./controllers/adminController');

const app = express();
app.use(cors({ origin: true }));
app.options('*', cors({ origin: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Kargo system backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/store', authenticateToken, storeRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/payments', authenticateToken, paymentRoutes);
app.use('/api/courier', authenticateToken, courierRoutes);
app.get('/api/couriers', authenticateToken, authorizeRoles('admin'), getAllCouriersController);
app.delete('/api/couriers/:id', authenticateToken, authorizeRoles('admin'), deleteCourierController);
app.delete('/api/stores/:id', authenticateToken, authorizeRoles('admin'), deleteStoreController);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Daxili server xətası' });
});

const port = process.env.PORT || 4000;

async function startServer() {
  try {
    await initDatabase();

    console.log(`SQLite database ready at ${databasePath}`);

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Database initialization failed');
    console.error(error);

    process.exit(1);
  }
}

startServer();
