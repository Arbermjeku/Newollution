require('dotenv').config()

const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./src/generated/prisma-client");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { static } = require("express");
const path = require("path");

const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
const Routine = require("./resolvers/Routines");
const Category = require("./resolvers/Category");
const User = require("./resolvers/User");
const Goal = require("./resolvers/Goal");
const HighPriority = require("./resolvers/HighPriority");

if (!fs.existsSync("./public/file")) {
  fs.mkdirSync("./public/file");
}

const resolvers = {
  Mutation,
  Query,
  Routine,
  Category,
  User,
  Goal,
  HighPriority,
};

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers,
  context: (request) => {
    return {
      ...request,
      prisma,
    };
  },
  uploades: false,
});

server.express.use("/public", static(path.join(__dirname, "public")));
server.express.use(bodyParser.json({ limit: "10mb" }));
server.express.use(bodyParser.urlencoded({ extended: true }));
server.express.use(cors());
server.start({ port: 3000 }, () =>
  console.log("Server is running on http://localhost:3000!")
);
