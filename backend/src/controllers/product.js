
import Product, {
  PRODUCT_CATEGORIES,
} from '../models/product.js';

// Allowed product fields for create/update
const PRODUCT_FIELDS = [
  'title',
  'description',
  'price',
  'stock',
  'category', 
  'discountPercentage',
  'images',
];

// Helper: validate Cloudinary URLs
const isValidCloudinaryImages = (images) => {
  return (
    Array.isArray(images) &&
    images.length >= 3 &&
    images.length <= 5 &&
    images.every(
      (url) =>
        typeof url === 'string' &&
        /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/.+/.test(
          url
        )
    )
  );
};

// Helper: select only permitted fields
const pickProductFields = (body) => {
  const data = {};

  PRODUCT_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  });

  return data;
};

// 1. Create Product (Seller only)
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      stock,
      category,
      discountPercentage = 0,
      images,
    } = req.body;

    // Required fields
    if (
      !title ||
      !description ||
      price === undefined ||
      price === null ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price and category are required.',
      });
    }

    // Validate category
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid product category.',
        categories: PRODUCT_CATEGORIES,
      });
    }

    // Validate image URLs before saving
    if (!isValidCloudinaryImages(images)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide 3 to 5 valid Cloudinary image URLs.',
      });
    }

    // Validate numeric fields
    const numericPrice = Number(price);
    const numericStock = stock === undefined ? 0 : Number(stock);
    const numericDiscount = Number(discountPercentage);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isFinite(numericStock) ||
      !Number.isInteger(numericStock) ||
      numericStock < 0 ||
      !Number.isFinite(numericDiscount) ||
      numericDiscount < 0 ||
      numericDiscount > 90
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price, stock or discount value.',
      });
    }

    const product = await Product.create({
      title,
      description,
      price: numericPrice,
      stock: numericStock,
      category,
      discountPercentage: numericDiscount,
      images,
      seller: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: product.toJSON(),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get All Products (Public Marketplace)
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (keyword) {
      const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.title = {
        $regex: safeKeyword,
        $options: 'i',
      };
    }

    if (category) {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product category.',
        });
      }

      filter.category = category;
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 20)
    );

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),

      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      products: products.map((product) => product.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get Logged-in Seller Products
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products: products.map((product) => product.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get Single Product by ID (Public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email phone'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      product: product.toJSON(),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 5. Update Product (Owner or Admin)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const isOwner =
      product.seller.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product.',
      });
    }

    const updates = pickProductFields(req.body);

    // Validate category if supplied
    if (
      updates.category !== undefined &&
      !PRODUCT_CATEGORIES.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product category.',
      });
    }

    // Validate Cloudinary URLs if images are being updated
    if (
      updates.images !== undefined &&
      !isValidCloudinaryImages(updates.images)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide 3 to 5 valid Cloudinary image URLs.',
      });
    }

    // Validate numeric values
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);

      if (!Number.isFinite(updates.price) || updates.price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.',
        });
      }
    }

    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);

      if (
        !Number.isInteger(updates.stock) ||
        updates.stock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a non-negative whole number.',
        });
      }
    }

    if (updates.discountPercentage !== undefined) {
      updates.discountPercentage = Number(
        updates.discountPercentage
      );

      if (
        !Number.isFinite(updates.discountPercentage) ||
        updates.discountPercentage < 0 ||
        updates.discountPercentage > 90
      ) {
        return res.status(400).json({
          success: false,
          message: 'Discount must be between 0 and 90 percent.',
        });
      }
    }

    // Apply only permitted updates; seller ID cannot be changed
    Object.assign(product, updates);

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: product.toJSON(),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID or field value.',
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// 6. Delete Product (Owner or Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const isOwner =
      product.seller.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product.',
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
      productId: product._id,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 7. Fetch Product Categories
export const fetchCategories = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: PRODUCT_CATEGORIES.length,
      categories: PRODUCT_CATEGORIES,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories.',
    });
  }
};
