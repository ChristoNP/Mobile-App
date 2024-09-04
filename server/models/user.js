const { ObjectId } = require('mongodb')
const { db } = require('../config/mongodb')
const { hashPassword } = require('../helpers/bcrypt')

class User {
    static col() {
        return db.collection('users')
    }

    static async findAll() {
        const result = await this.col().find().toArray()
        return result
    }

    static async findByPk(id) {
        const user = await this.col().findOne({_id: new ObjectId(id)})
        if (!user) {
            throw new Error('User not found')
        }
        let followings = []
        let followers = []
        let follower = await db.collection('follows').aggregate([
            {
                $match: {
                    followingId: user._id,
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followerId",
                    foreignField: "_id",
                    as: "Follower"
                }
            },
            {
                $unwind: {
                    path: "$Follower"
                }
            }
        ]).toArray()
        let following = await db.collection('follows').aggregate([
            {
                $match: {
                    followerId: user._id,
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "followingId",
                    foreignField: "_id",
                    as: "Following"
                }
            },
            {
                $unwind: {
                    path: "$Following"
                }
            }
        ]).toArray()

        follower.map(el => {
            followers.push(el.Follower)
        })
        following.map(el => {
            followings.push(el.Following)
        })
    
        return {
            user,
            followers,
            followings,
        }
    }

    static async findOne(filter) {
        const result = await this.col().findOne(filter)
        return result
    }

    static async findByUsername(username) {
        const result = await this.col().findOne({username: username})
        if (!result) {
            throw new Error('User not found')
        }
        return result
    }
    static async findByName(name) {
        const result = await this.col().findOne({name: name})
        if (!result) {
            throw new Error('User not found')
        }
        return result
    }

    static async login(registeredUser) {
        const result = await this.col().findOne({username: registeredUser.username})
        if (!result) {
            throw new Error('User Unregistered')
        }
        if (registeredUser.password !== result.password) {
            throw new Error('Invalid Username/Password')
        }
        return result
    }

    static async create(newUser) {
        newUser.password = hashPassword(newUser.password)
        const result = await this.col().insertOne(newUser)
        delete newUser.password
        return {
            ...newUser,
            _id: result.insertedId
        }
    }

    static async update(id, updateUser) {
        const result = await this.col().updateOne({_id: new ObjectId(id)}, {
            $set: {
                ...updateUser
            }
        })
        return {
            ...updateUser,
            _id: id
        }
    }

    static async deleteById(id) {
        await this.col().deleteOne({
            _id: new ObjectId(id)
        })
    }
}

module.exports = User