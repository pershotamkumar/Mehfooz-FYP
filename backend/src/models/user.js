//   // import mongoose from "mongoose";

//   // const userSchema = new mongoose.Schema({
//   //   name: { type: String, required: true, trim: true },
//   //   email: { type: String, required: true, unique: true, lowercase: true },
//   //   password: { type: String, required: true },
//   //   role: { 
//   //     type: String, 
//   //     enum: ["customer", "seller", "admin"], 
//   //     default: "customer" 
//   //   },
//   //   phone: { type: String },
//   //   isVerified: { type: Boolean, default: false }, // Seller/Customer verification
//   //   addresses: [{
//   //     street: String,
//   //     city: String,
//   //     state: String,
//   //     zipCode: String,
//   //     country: String,
//   //     isDefault: { type: Boolean, default: false }
//   //   }]
//   // }, { timestamps: true });

//   // export default mongoose.model("User", userSchema);
  
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },

//   role: {
//     type: String,
//     enum: ["customer", "seller", "admin"],
//     default: "customer"
//   },

//   phone: { type: String },
//   isVerified: { type: Boolean, default: false },

//   addresses: [{
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: String,
//     isDefault: { type: Boolean, default: false }
//   }],

//   // Optional Seller Store Details
//   store: {
//     storeName: { type: String, trim: true },
//     storeDescription: { type: String },
//     storeLogo: { type: String },
//     storeBanner: { type: String },
//     storeCategory: { type: String },

//     businessName: { type: String },
//     businessEmail: { type: String, lowercase: true },
//     businessPhone: { type: String },

//     businessAddress: {
//       street: { type: String },
//       city: { type: String },
//       state: { type: String },
//       zipCode: { type: String },
//       country: { type: String }
//     },

//     taxNumber: { type: String },
//     returnPolicy: { type: String },
//     shippingPolicy: { type: String },

//     isStoreVerified: { type: Boolean, default: false },
//     isStoreActive: { type: Boolean, default: true }
//   }

// }, { timestamps: true });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Firebase handles passwords for new accounts.
    // Optional password supports legacy accounts.
    password: {
      type: String,
      select: false,
    },

    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },

    phone: {
      type: String,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    addresses: [
      {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    store: {
      storeName: { type: String, trim: true },
      storeDescription: String,
      storeLogo: String,
      storeBanner: String,
      storeCategory: String,

      businessName: String,
      businessEmail: {
        type: String,
        lowercase: true,
        trim: true,
      },
      businessPhone: String,

      businessAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },

      taxNumber: String,
      returnPolicy: String,
      shippingPolicy: String,

      isStoreVerified: {
        type: Boolean,
        default: false,
      },

      isStoreActive: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
