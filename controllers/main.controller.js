import mongoose from 'mongoose';
import { sendSuccessResponse } from '../utils/success.js';

async function getCollectionStats() {
    const collections = await mongoose.connection.db.collections();
    let data = [];
  
    for (const collection of collections) {
      const stats = await collection.stats();
      data.push({
        collection: stats.ns,
        count: stats.count,
        storageSize: stats.storageSize
      });
    }
  
    return data;
  }
  
export const home = async (req, res, next) => {
    try {
      const data = await getCollectionStats(); // Call the function to get data
      return res.status(201).json(sendSuccessResponse(201, "Data retrieved successfully", data));
    } catch (error) {
      next(error);
    }
  };