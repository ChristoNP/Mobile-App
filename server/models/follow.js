const { ObjectId } = require('mongodb')
const { db } = require('../config/mongodb')

class Follow {
    static col() {
        return db.collection('follows')
    }

    static async getFollowing(userId) {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
        if (!user) throw new Error('User not found')
        const pipeline = []
        pipeline.push({
            $match: {
                followerId: user._id
            }
        })
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "followingId",
                foreignField: "_id",
                as: "user"
            }
        })
        pipeline.push({
            $unwind: {
                path: "$user"
            }
        })
        const userFollowing = await this.col().aggregate(pipeline).toArray()
        return userFollowing
    }

    static async getFollowers(userId) {
        const user = await this.col().findOne({ _id: new ObjectId(userId) })
        if (!user) throw new Error('User not found')
        const userFollowers = await this.col().find({ _id: { $in: user.followers } }).toArray()
        return userFollowers
    }

    static async followUser(newFollow) {
        const result = await this.col().insertOne(newFollow)
        return {
            ...newFollow,
            _id: result.insertedId
        }
    }
}

module.exports = Follow