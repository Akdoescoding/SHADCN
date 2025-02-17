const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5001;

app.use(bodyParser.json());
app.use(cors());

let products = [
  // Example product data
  { id: 1, name: 'Product 1', supplier: 'Supplier 1', price: 100, stock: 10, image: 'product1.jpg' },
  { id: 2, name: 'Product 2', supplier: 'Supplier 2', price: 200, stock: 5, image: 'product2.jpg' },
  // Add more products as needed
];

// Serve static files from the "assets" directory
app.use('/assets', express.static('assets'));

// Get all products
app.get('/product', (req, res) => {
  res.json(products);
});

// Update product stock
app.put('/product/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { stock } = req.body;

  const product = products.find(p => p.id === productId);
  if (product) {
    product.stock = stock;
    res.status(200).json({ message: 'Stock updated successfully' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});