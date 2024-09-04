import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import * as SecureStore from "expo-secure-store";

const httpLink = createHttpLink({
    uri: 'https://p3-gc1-server.rollyroller.com'
})

const authLink = setContext(async (_, { headers }) => {
    const token = await SecureStore.getItemAsync('access_token')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    }
})

const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache()
})

export default apolloClient