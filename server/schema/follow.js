const { ObjectId } = require("mongodb")
const Follow = require("../models/follow")

const followTypeDefs = `#graphql
    type User {
        _id: String
        name: String
        username: String
        email: String
    }

    type Follow {
        _id: String
        followingId: String
        followerId: String
        createdAt: String
        updatedAt: String
        user: User
    }

    input followForm {
        followingId: String
    }

    type Mutation {
        followUser(followingId: String): Follow
    }
`

const followResolvers = {
    Mutation: {
        followUser: async (parent, {followingId}, contextValue) => {
            const user = await contextValue.authentication()
            const follow = {
                followingId: new ObjectId(followingId),
                followerId: user.user._id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                user: {
                    _id: user.user._id,
                    name: user.user.name,
                    username: user.user.username,
                    email: user.user.email,
                }
            }
            
            return await Follow.followUser(follow)
        }
    }
}

module.exports = {
    followTypeDefs,
    followResolvers
}