const { comparePassword } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const User = require('../models/user')

const userTypeDefs = `#graphql
    type User {
        _id: String
        name: String
        username: String
        email: String
    }


    type Query {
        users: [User]
        loginUser: User
        usersById: detailResponse
        usersByUsername(username: String!): User
        usersByName(name: String!): User
    }

    type detailResponse {
        user: User
        followers: [User]
        followings: [User]
    }

    input userForm {
        name: String
        username: String!
        email: String!
        password: String!   
    }

    type loginResponse {
        accessToken: String
        _id: String
        username: String
    }

    type Mutation {
        register(form: userForm): User
        login(username: String!, password: String!): loginResponse
        updateUser(id: String!, form: userForm): User
        deleteUser(id: String!): String
    }
`

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
}

const userResolvers = {
    Query: {
        loginUser: async (parent, args, contextValue) => {
            const user = await contextValue.authentication()
            return user.user
        },
        users: async (parent, args, contextValue) => {
            await contextValue.authentication()
            const result = await User.findAll()
            return result
        },
        usersByUsername: async (parent, args, contextValue) => {
            await contextValue.authentication()
            return await User.findByUsername(args.username)
        },
        usersByName: async (parent, args, contextValue) => {
            await contextValue.authentication()
            return await User.findByName(args.name)
        },
        usersById: async (parent, args, contextValue) => {
            const user = await contextValue.authentication()
            
            const result = await User.findByPk(user.user._id)
            return result
        },
    },
    Mutation: {
        register: async (parent, { form }) => {
            if (!form.username) {
                throw new Error('Username required')
            }
            if (!form.email) {
                throw new Error('Email required')
            }
            if (!validateEmail(form.email)) {
                throw new Error('Invalid email format')
            }
            if (!form.password) {
                throw new Error('Password required')
            }
            if (form.password.length < 5) {
                throw new Error('Password must be at least 5 characters long.')
            }
            const user = await User.findOne({ email: form.email })
            if (user) {
                throw new Error('Email already exist')
            }
            const result = await User.create(form)
            return result
        },
        login: async (parent, args) => {
            const { username, password } = args
            if (!username) {
                throw new Error('Invalid username/password')
            }
            if (!password) {
                throw new Error('Invalid username/password')
            }
            const user = await User.findOne({ username: username })
            if (!user) {
                throw new Error('Invalid username/password')
            }
            const isPasswordValid = comparePassword(password, user.password)
            if (!isPasswordValid) {
                throw new Error('Invalid username/password')
            }

            return {
                _id: user._id,
                username: user.username,
                accessToken: signToken({ _id: user._id })
            }
        },
        updateUser: async (parent, { id, form }, contextValue) => {
            contextValue.authentication()
            if (!id) {
                throw new Error('User Not Found')
            }
            if (!form.username) {
                throw new Error('Username required')
            }
            if (!form.email) {
                throw new Error('Email required')
            }
            if (!form.password) {
                throw new Error('Password required')
            }
            if (form.password.length < 5) {
                throw new Error('Password must be at least 5 characters long')
            }
            const result = await User.update(id, form)
            return result
        },
        deleteUser: async (parent, args, contextValue) => {
            contextValue.authentication()
            const { id } = args
            if (!id) {
                throw new Error('User Not Found')
            }
            await User.deleteById(id)
            return "User successfully Deleted"
        }
    }
}

module.exports = {
    userTypeDefs,
    userResolvers
}