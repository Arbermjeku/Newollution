const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserId, APP_SECRET } = require("../utils");

const saltRounds = 10;

const signup = async (parent, args, context, info) => {
  if (!args.email || !args.password || !args.name || !args.job) {
    return Error("Please fill all the required fields!");
  }

  const hashed = await bcrypt.hash(args.password, saltRounds);

  const user = await context.prisma.createUser(
    {
      ...args,
      password: hashed
    },
    `{ id name job email }`
  );

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    user,
    token,
    expiresIn: "1d"
  };
};

const login = async (parent, args, context, info) => {
  if (!args.email || !args.password) {
    return Error("Fill all the required fields!");
  }

  const user = await context.prisma.user({ email: args.email });

  if (!user) {
    return Error("The user with that email does not exists!");
  }

  const valid = bcrypt.compareSync(args.password, user.password);

  if (!valid) {
    return Error("Incorrect Password!");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    user,
    token,
    expiresIn: 1
  };
};

const routine = async (parent, args, context, info) => {
  const userId = await getUserId(context);

  data = { ...args };

  let categories = await context.prisma.categories({
    where: { addedBy: { id: userId } }
  });

  for (let i = 0; i < categories.length; i++) {
    if (data.category == categories[i].name) {
      args.category = {
        connect: {
          id: categories[i].id
        }
      };
      break;
    }else if (data.category !== categories[i].name) {
      args.category = {
        create: {
          name: data.category,
          addedBy: { connect: { id: userId } }
        }
      };
    }
  }

  const routine = await context.prisma.createRoutine({
    ...args,
    days: { set: args.days.map(x => x) },
    addedBy: { connect: { id: userId } },
    category: args.category
  });
  return routine;
};

module.exports = {
  signup,
  login,
  routine
};
