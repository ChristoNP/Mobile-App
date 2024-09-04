const { ObjectId } = require('mongodb')
const { db } = require('../config/mongodb')

class Post {
    static col() {
        return db.collection('posts')
    }

    static async fetchAllPosts() {
        const pipeline = []
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                as: "author"
            }
        })
        pipeline.push({
            $sort: {
                _id: -1
            }
        })
        pipeline.push({
            $unwind: {
                path: "$author",
            }
        })
        const result = await this.col().aggregate(pipeline).toArray()
        return result
    }

    static async findByPk(id) {
        const result = await this.col().findOne({ _id: new ObjectId(id) })
        if (!result) {
            throw new Error('Post not found')
        }
        return result
    }

    static async createPost(newPost) {
        newPost.comments = []
        newPost.likes = []
        newPost.createdAt = newPost.updatedAt = new Date().toISOString()
        const result = await this.col().insertOne(newPost)
        return {
            ...newPost,
            _id: result.insertedId
        }
    }

    static async addComment(comment, postId) {
        if (!postId) throw new Error('Post not found')
        comment.createdAt = comment.updatedAt = new Date().toISOString()
        await this.col().updateOne(
            { _id: new ObjectId(postId) },
            { $push: { comments: comment } }
        )
        return comment
    }

    static async addLike(username, postId) {     
        if (!postId) throw new Error('Post not found');
        if (!username) throw new Error('Username required pak');
        const post = await this.col().findOne({
            _id: new ObjectId(postId),
            "likes.username": username
        })
        if (post) {
            throw new Error('Post already liked');
        }
        const like = {
            username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        await this.col().updateOne(
            { _id: new ObjectId(postId) },
            { $push: { likes: like } }
        )
        return like;
    }

}

module.exports = Post