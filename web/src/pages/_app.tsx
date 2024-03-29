import { ChakraProvider } from '@chakra-ui/react'
import { cacheExchange, Cache, QueryInput, query } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import { createClient, Provider, dedupExchange, fetchExchange } from 'urql';
import theme from '../theme'
import { AppProps } from 'next/app'

function betterUpdateQuery<Result, Query>(
  cache: Cache, 
  qi: QueryInput, 
  result: any, 
  fn: (r: Result, q: Query) => Query) {
    return cache.updateQuery(qi, data => fn(result, data as any) as any)
}

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include'
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        login: (_result, args, cache, info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
              cache, 
              { query: MeDocument}, 
              _result,
              (result, query) => {
                if(result.login.errors) {
                  return query
                }
                return {me: result.login.user }
              }
          )
        },
        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
              cache, 
              { query: MeDocument}, 
              _result,
              (result, query) => {
                if(result.register.errors) {
                  return query
                }
                return {me: result.register.user }
              }
          )
        }
      }
    }
  }), fetchExchange],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider value={client}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
