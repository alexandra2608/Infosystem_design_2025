const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
    });

    const { url } = await startStandaloneServer(server, {
        listen: { port: 4001 },
    });

    console.log(`Books Service ready at ${url}`);
}

startServer();
