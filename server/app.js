const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const { userTypeDefs, userResolvers } = require('./schema/user')
const { postTypeDefs, postResolvers } = require('./schema/post')
const { followTypeDefs, followResolvers } = require('./schema/follow')
const { verifyToken } = require('./helpers/jwt')
const User = require('./models/user')
const PORT = process.env.PORT || 3000

const server = new ApolloServer({
    typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
    resolvers: [userResolvers, postResolvers, followResolvers],
    introspection: true
})

startStandaloneServer(server, {
    listen: { port: PORT },
    context: ({ req }) => {
        async function authentication() {
            const authentication = req.headers.authorization || ''
            if (!authentication) throw new Error('Invalid Token')
            const [type, token] = authentication.split(' ')
            if (type !== 'Bearer') throw new Error('Invalid Token')
            const payload = verifyToken(token)
            const user = await User.findByPk(payload._id)
            return user
        }
        return {
            authentication
        }
    },
    introspection: true,
}).then(({ url }) => {
    console.log(`server ready at: ${url}`)
})