import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = new Date();
  }

  async save() {
    const db = getDB();
    return await db.collection('users').insertOne(this);
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  }
}

export default User;