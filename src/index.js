import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
import { engine } from 'express-handlebars';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import { fileURLToPath } from 'url';
import { format } from 'timeago.js';
import soap from 'soap';
import fs from 'fs';
import './config/passport.js';

// Importa tus rutas y helpers
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import './lib/handlebars.js';
import { isAuthenticated, isSeller, isClient } from './middlewares/authMiddleware.js';
import orderRoutes from './routes/orderRoutes.js';


config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Database connection
const pool = createPool({
  host: process.env.MYSQLDB_HOST,
  user: 'root',
  password: process.env.MYSQLDB_ROOT_PASSWORD,
  port: process.env.MYSQLDB_DOCKER_PORT,
  database: process.env.MYSQLDB_DATABASE
});

// Handlebars setup
app.engine('.hbs', engine({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    timeago: (timestamp) => format(timestamp),
    eq: (a, b) => a === b
  }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Necesario para manejar JSON en los endpoints de la API
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/client', clientRoutes);
app.use('/orders', orderRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'cliente') {
      res.redirect('/client/products');
    } else {
      res.redirect('/auth/profile');
    }
  } else {
    res.redirect('/auth/signin');
  }
});

// Endpoint REST para obtener un producto por su ID
app.get('/api/product/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ message: 'Error fetching product data' });
  }
});

// Define SOAP service
const service = {
  InventoryService: {
    InventoryServiceSoapPort: {
      getProduct: async (args, callback) => {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [args.id]);
        if (rows.length > 0) {
          callback(null, {
            product: {
              id: rows[0].id,
              name: rows[0].name,
              price: rows[0].price,
              description: rows[0].description,
              create_at: rows[0].create_at
            }
          });
        } else {
          callback({
            Fault: {
              faultcode: 'Client',
              faultstring: 'Product not found'
            }
          });
        }
      }
    }
  }
};

// Importa WSDL
const wsdl = fs.readFileSync(path.join(__dirname, '..', 'inventoryService.wsdl'), 'utf8');

app.use('/wsdl', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(wsdl);
});

const server = app.listen(process.env.NODE_DOCKER_PORT, () => {
  console.log('Server on port', process.env.NODE_DOCKER_PORT);
  soap.listen(server, '/wsdl', service, wsdl);
});

app.get('/wsdl/product/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ message: 'Error fetching product data' });
  }
});

export { pool };
