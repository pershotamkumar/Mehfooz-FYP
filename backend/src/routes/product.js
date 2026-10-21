
import express from 'express';

import {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  fetchCategories,
} from '../controllers/product.js';

import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

// ========================================
// PUBLIC ROUTES
// ========================================

// Get all products (supports keyword, category, page, limit)
router.get('/', getProducts);

// Get all product categories
router.get('/categories', fetchCategories);


// ========================================
// PROTECTED SELLER ROUTES
// ========================================

// Get logged-in seller's products
router.get('/my-products', protect, getMyProducts);

// Create product
router.post('/add', protect, createProduct);

// Update product (owner or admin check in controller)
router.put('/:id', protect, updateProduct);

// Delete product (owner or admin check in controller)
router.delete('/:id', protect, deleteProduct);
// Get single product by ID
router.get('/:id', getProductById);

export default router;
