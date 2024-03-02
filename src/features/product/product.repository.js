import { ObjectId } from 'mongodb';
import { getDB } from '../../config/mongodb.js';
import ApplicationError from '../../errorHandler/applicationError.js';
import mongoose from 'mongoose';
import { productSchema } from './product.schema.js';
import { reviewSchema } from './review.schema.js';

const ProductModel = mongoose.model('products', productSchema);
const ReviewModel = mongoose.model('Review', reviewSchema);

class ProductRepository {
  constructor() {
    this.collection = 'products';
  }

  async add(newProduct) {
    try {
      // 1. Get the DB
      const db = getDB();
      const collection = db.collection(this.collection);
      collection.insertOne(newProduct);
      return newProduct;
    } catch (err) {
      console.log(err);
      throw new ApplicationError('Something went wrong with database', 500);
    }
  }

  async getAll() {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.find().toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError('Something went wrong with database', 500);
    }
  }

  async get(id) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      return await collection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      console.log(err);
      throw new ApplicationError('Something went wrong with database', 500);
    }
  }

  async filter(minPrice, maxPrice, category) {
    try {
      const db = getDB();
      const collection = db.collection(this.collection);
      let filterExpression = {};
      if (minPrice) {
        filterExpression.price = { $gte: parseFloat(minPrice) };
      }
      if (maxPrice) {
        filterExpression.price = {
          ...filterExpression.price,
          $lte: parseFloat(maxPrice),
        };
      }
      if (category) {
        filterExpression.category = category;
      }
      return await collection.find(filterExpression).toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError('Something went wrong with database', 500);
    }
  }

  async rate(userID, productID, rating) {
    try {
      // 1. Check if product exists
      const productToUpdate = await ProductModel.findById(productID);
      if (!productToUpdate) {
        throw new Error('Product Not Found');
      }
      // Find Existing Review
      const userReview = await ReviewModel.findOne({
        product: new ObjectId(productID),
        user: new ObjectId(userID),
      });
      if (userReview) {
        userReview.rating = rating;
        await userReview.save();
      } else {
        const newReview = new ReviewModel({
          product: new ObjectId(productID),
          user: new ObjectId(userID),
          rating: rating,
        });
        newReview.save();
      }
    } catch (err) {
      console.log(err);
      throw new ApplicationError('Something went wrong with database', 500);
    }
  }

  async averageProductPriceCategory() {
    try {
      const db = getDB();
      return await db
        .collection(this.collection)
        .aggregate([
          {
            // Stage 1: Get Average Price Per Category
            $group: {
              _id: '$category',
              averagePrice: { $avg: '$price' },
            },
          },
        ])
        .toArray();
    } catch (err) {
      console.log(err);
      throw new ApplicationError('Something went wrong with database', 500);
    }
  }
}

export default ProductRepository;
