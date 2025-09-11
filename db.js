import { MongoClient } from 'mongodb';
import 'dotenv/config';
const uri = process.env.MONGO_URI; 
const client = new MongoClient(uri);

let db;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db('post_comments'); 
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

function getDB() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export { connectToDB, getDB };
