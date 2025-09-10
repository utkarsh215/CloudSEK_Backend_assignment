import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

class Post {
	constructor({ title, content, authorId }) {
		this.title = title;
		this.content = content;
		this.authorId = new ObjectId(authorId);
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	async save() {
		const db = getDB();
		return await db.collection('posts').insertOne(this);
	}

	static async findById(id) {
		const db = getDB();
		return await db.collection('posts').findOne({ _id: new ObjectId(id) });
	}

	static async findAll({ skip = 0, limit = 20 } = {}) {
		const db = getDB();
		return await db.collection('posts').find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
	}

	static async updateById(id, update) {
		const db = getDB();
		update.updatedAt = new Date();
		return await db.collection('posts').findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: update },
			{ returnDocument: 'after' }
		);
	}

	static async deleteById(id) {
		const db = getDB();
		return await db.collection('posts').deleteOne({ _id: new ObjectId(id) });
	}
}

export default Post;
