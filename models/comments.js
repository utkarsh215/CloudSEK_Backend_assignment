import { ObjectId } from 'mongodb';
import { getDB } from '../db.js';

class Comment {
	constructor({ postId, authorId, text, richText = null, parentCommentId = null }) {
		this.postId = new ObjectId(postId);
		this.authorId = new ObjectId(authorId);
		this.text = text; // plain text
		this.richText = richText; // optional rich text (JSON or HTML)
		
		this.parentCommentId = parentCommentId ? new ObjectId(parentCommentId) : null;
		this.createdAt = new Date();
		this.updatedAt = new Date();
	}

	async save() {
		const db = getDB();
		return await db.collection('comments').insertOne(this);
	}

	static async findById(id) {
		const db = getDB();
		return await db.collection('comments').findOne({ _id: new ObjectId(id) });
	}

	static async findByPostId(postId, { skip = 0, limit = 50 } = {}) {
		const db = getDB();
		return await db
			.collection('comments')
			.find({ postId: new ObjectId(postId), parentCommentId: null })
			.sort({ createdAt: 1 })
			.skip(skip)
			.limit(limit)
			.toArray();
	}

	static async findReplies(parentCommentId, { skip = 0, limit = 50 } = {}) {
		const db = getDB();
		return await db
			.collection('comments')
			.find({ parentCommentId: new ObjectId(parentCommentId) })
			.sort({ createdAt: 1 })
			.skip(skip)
			.limit(limit)
			.toArray();
	}

	static async updateById(id, update) {
		const db = getDB();
		update.updatedAt = new Date();
		return await db.collection('comments').findOneAndUpdate(
			{ _id: new ObjectId(id) },
			{ $set: update },
			{ returnDocument: 'after' }
		);
	}

	static async deleteById(id) {
		const db = getDB();
		return await db.collection('comments').deleteOne({ _id: new ObjectId(id) });
	}
}

export default Comment;
