const { ApolloServer } = require('@apollo/server');
const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');
const { startStandaloneServer } = require('@apollo/server/standalone');

const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
            { name: 'books', url: 'http://localhost:4001/graphql' },
            { name: 'members', url: 'http://localhost:4002/graphql' },
            { name: 'loans', url: 'http://localhost:4003/graphql' },
        ],
    }),
});

const server = new ApolloServer({
    gateway,
    introspection: true,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`Gateway ready at ${url}`);
});
