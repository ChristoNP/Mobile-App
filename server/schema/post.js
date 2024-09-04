const { ObjectId } = require('mongodb')
const redis = require('../config/redis')
const Post = require('../models/post')
const postTypeDefs = `#graphql

    type User {
        _id: String
        username: String
    }

    type Comments {
        content: String!
        username: String!
        createdAt: String
        updatedAt: String
    }

    type Likes {
        username: String!
        createdAt: String
        updatedAt: String
    }
    
    type Post {
        _id: String
        content: String!
        tags: [String]
        imgUrl: String
        authorId: String!
        comments: [Comments]
        likes: [Likes]
        author: User
        createdAt: String
        updatedAt: String
    }

    type Query {
        posts: [Post]
        postById(id: String!): Post
    }

    input postForm {
        content: String!
        tags: [String]
        imgUrl: String
    }

    type Mutation {
        addPost(form: postForm): Post
        commentPost(content: String!, postId: String): Comments
        likePost(postId: String!): Likes
    }
`

const postResolvers = {
    Query: {
        posts: async (parent, args, contextValue) => {
            await contextValue.authentication()
            const cachePost = await redis.get('posts:all')
            if (cachePost) {
                return JSON.parse(cachePost)
            }
            const result = await Post.fetchAllPosts()
            await redis.set('posts:all', JSON.stringify(result))
            return result
        },
        postById: async (parent, args, contextValue) => {
            await contextValue.authentication();
            const pipeline = [
                {
                    $match: { _id: new ObjectId(args.id) }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'authorId',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                {
                    $unwind: {
                        path: '$author',
                        preserveNullAndEmptyArrays: true
                    }
                }
            ];
            const result = await Post.col().aggregate(pipeline).toArray();
            if (result.length === 0) {
                throw new Error('Post not found');
            }
            return result[0];
        }
    },
    Mutation: {
        addPost: async (parent, { form }, contextValue) => {
            if (!form.content) throw new Error('Content required')
            const user = await contextValue.authentication()
            form.authorId = user.user._id
            form.author = user.user
            const result = await Post.createPost(form)
            await redis.del('posts:all')
            return result
        },
        commentPost: async (parent, args, contextValue) => {
            const { content, postId } = args
            if (!content) throw new Error('Content required')
            const user = await contextValue.authentication()
            const comment = {
                content,
                username: user.user.username
            }
            const result = await Post.addComment(comment, postId)
            await redis.del('posts:all')
            return result
        },
        likePost: async (parent, args, contextValue) => {
            const { postId } = args
            const user = await contextValue.authentication()
            const result = await Post.addLike(user.user.username, postId)
            await redis.del('posts:all')
            return result
        }
    }
}

module.exports = {
    postTypeDefs,
    postResolvers
}