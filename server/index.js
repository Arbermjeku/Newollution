require('dotenv').config()

const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./src/generated/prisma-client");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { static } = require("express");
const path = require("path");
const jwt = require('jsonwebtoken')
const { APP_SECRET } = require('./utils')

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
server.express.get('/reset/:token', (req,res)=>{
  res.send("done")
})
server.express.get('/confirmation/:token', async (req,res) => {
    const decoded = await jwt.verify(req.params.token, APP_SECRET, (err, decoded) => {
      if (err) return Error("Invalid token");
      return decoded;
    });

    console.log(decoded)

    const user = await prisma.updateUser({
      data: {
        confirmed: true,
      },
      where: { id: decoded.emailVerification },
    });
    console.log(user)

    res.send(`${user.confirmed}`)
})
server.start({ port: 3000 }, () =>
  console.log("Server is running on http://localhost:3000!")
);
