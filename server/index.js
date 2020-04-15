const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./src/generated/prisma-client");
const cors = require("cors");
const bodyParser = require("body-parser");

const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const Routine = require("./resolvers/Routines");
const Category = require("./resolvers/Category");

const resolvers = {
  Mutation,
  Query,
  Routine,
  Category
};

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
  context: request => {
    return {
      ...request,
      prisma
    };
  },
  uploades: false
});

server.express.use(bodyParser.urlencoded({ extended: true }));
server.express.use(cors());
server.start({ port: 3000 }, () =>
  console.log("Server is running on http://localhost:3000!")
);
