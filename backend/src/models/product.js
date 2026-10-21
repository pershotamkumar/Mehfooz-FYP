
import mongoose from 'mongoose';

export const PRODUCT_CATEGORIES = [
  'Mobiles & Tablets',
  'Electronics',
  'Computers & Laptops',
  'Mobile Accessories',
  "Men's Fashion",
  "Women's Fashion",
  'Kids & Baby',
  'Shoes & Bags',
  'Watches & Jewelry',
  'Home & Kitchen',
  'Furniture & Decor',
  'Health & Beauty',
  'Grocery & Food',
  'Sports & Fitness',
  'Books & Stationery',
  'Toys & Games',
  'Automotive & Bikes',
  'Tools & Hardware',
  'Pet Supplies',
  'Other',
];

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },

    // Original price
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },

    // Seller discount percentage: 0% to 90%
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [90, 'Discount cannot exceed 90%'],
      validate: {
        validator: Number.isFinite,
        message: 'Discount must be a valid number',
      },
    },

    // Available inventory
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be a whole number',
      },
    },

    // Product category
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: PRODUCT_CATEGORIES,
        message: 'Please select a valid category',
      },
    },

    // Product owner
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Cloudinary image URLs
    // First image is the cover/showcase image
    images: {
      type: [
        {
          type: String,
          trim: true,
          validate: {
            validator: (url) =>
              /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/.+/.test(
                url
              ),
            message: 'Please provide a valid Cloudinary image URL',
          },
        },
      ],
      required: [true, 'Product images are required'],
      validate: {
        validator: (images) =>
          images.length >= 3 && images.length <= 5,
        message: 'A product must have between 3 and 5 images',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate discounted price automatically
productSchema.virtual('discountedPrice').get(function () {
  const discount = this.discountPercentage || 0;

  return Number(
    (this.price * (1 - discount / 100)).toFixed(2)
  );
});

// Include discountedPrice in API JSON responses
productSchema.set('toJSON', {
  virtuals: true,
});

productSchema.set('toObject', {
  virtuals: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
