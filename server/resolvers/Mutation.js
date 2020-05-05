const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserId, APP_SECRET } = require("../utils");
const { processUpload } = require("../fileUpload/fileUpload");
const api_key = process.env.API_KEY;
const domain = process.env.DOMAIN;
const mailgun = require("mailgun-js")({ apiKey: api_key, domain: domain });

const saltRounds = 10;

const signup = async (parent, args, context, info) => {
  if (!args.email || !args.password || !args.name || !args.job) {
    return Error("Please fill all the required fields!");
  }

  let user_profile_image = await processUpload(args.user_avatar);

  const hashed = await bcrypt.hash(args.password, saltRounds);

  const user = await context.prisma.createUser(
    {
      ...args,
      user_avatar: { create: user_profile_image },
      password: hashed,
    },
    `{ id name job email }`
  );

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    user,
    token,
    expiresIn: "1d",
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
    expiresIn: 1,
  };
};

const forgotPassword = async (parent, args, context, info) => {
  const email = args.email;
  if (!args.email) {
    return Error("You must provide an email!");
  }
  let user = await context.prisma.user({ email: email });
  if (!user) {
    return Error("No user found with that email");
  }

  const token = jwt.sign(
    {
      forgotPassword: user.id,
    },
    APP_SECRET
  );

  const data = {
    from: "Arber <arbermjeku4@gmail.com>",
    to: `${user.name} <${email}>`,
    subject: "Reset Password",
    text: `Go to this link ${`localhost:3000/reset/${token}`}`,
  };

  mailgun.messages().send(data, function(error, body) {
    if (error) {
      console.log(error);
    }
  });

  return {
    success: true,
    message: "The email was sent successfuly!",
  };
};

const verifyForgotPassword = async (root, args, context) => {
  if (!args.token) {
    throw new Error("Token can't be empty");
  }
  const token = args.token.replace("Bearer ", "");
  return await jwt.verify(token, APP_SECRET, (err, decoded) => {
    if (!err == true) {
      return {
        success: !err,
        message: "Valid token!",
      };
    }
    return {
      success: false,
      message: "Invalid token!",
    };
  });
};

const resetPassword = async (root, args, context) => {
  if (!args.token || !args.new_password || !args.confirm_new_password) {
    throw new Error(
      "All the fields are requiered! You must provide a token a new Password and confirm new Password."
    );
  }
  if (!(args.new_password === args.confirm_new_password)) {
    return {
      success: false,
      message:
        "New Password does not match with the confirm Password! They must be the same.",
    };
  }
  const decoded = await jwt.verify(args.token, APP_SECRET, (err, decoded) => {
    if (err) return Error("Invalid token");
    return decoded;
  });

  if (decoded.message) {
    return {
      success: false,
      message: decoded.message,
    };
  }
  try {
    const user = await context.prisma.updateUser({
      data: {
        password: await bcrypt.hash(args.new_password, saltRounds),
      },
      where: { id: decoded.forgotPassword },
    });
  } catch (error) {
    return { success: false, message: error };
  }
  return {
    success: true,
    message: "Password has been successfuly updated! You can go and login now.",
  };
};

const routine = async (parent, args, context, info) => {
  const userId = await getUserId(context);

  let { startDate, endDate } = args;

  startDate = new Date(startDate);
  endDate = new Date(endDate);

  if (startDate == "Invalid Date") throw new Error("Invalid start_date");
  if (endDate == "Invalid Date") throw new Error("Invalid end_date");
  if (startDate > endDate)
    throw new Error("End date is earlier than start date");

  data = { ...args };

  let categories = await context.prisma.categories({
    where: { addedBy: { id: userId } },
  });

  if (categories.length == 0) {
    args.category = {
      create: {
        name: data.category,
        addedBy: { connect: { id: userId } },
      },
    };
  } else {
    for (let i = 0; i < categories.length; i++) {
      if (data.category == categories[i].name) {
        args.category = {
          connect: {
            id: categories[i].id,
          },
        };
        break;
      } else if (data.category !== categories[i].name) {
        args.category = {
          create: {
            name: data.category,
            addedBy: { connect: { id: userId } },
          },
        };
      }
    }
  }

  const routine = await context.prisma.createRoutine({
    ...args,
    days: { set: args.days.map((x) => x) },
    addedBy: { connect: { id: userId } },
    category: args.category,
  });
  return routine;
};

const goal = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  let { goal_deadline } = args;
  goal_deadline = new Date(goal_deadline);

  data = { ...args };

  let categories = await context.prisma.categories({
    where: { addedBy: { id: userId } },
  });

  if (categories.length == 0) {
    args.category = {
      create: {
        name: data.category,
        addedBy: { connect: { id: userId } },
      },
    };
  } else {
    for (let i = 0; i < categories.length; i++) {
      if (data.category == categories[i].name) {
        args.category = {
          connect: {
            id: categories[i].id,
          },
        };
        break;
      } else if (data.category !== categories[i].name) {
        args.category = {
          create: {
            name: data.category,
            addedBy: { connect: { id: userId } },
          },
        };
      }
    }
  }

  const goal = await context.prisma.createGoal({
    ...args,
    category: args.category,
    addedBy: {
      connect: { id: userId },
    },
  });
  return goal;
};

const updateUser = async (parent, args, context, info) => {
  const userId = await getUserId(context);

  let uploadString = args.user_avatar;

  if (uploadString) {
    let file = await processUpload(uploadString);
    args.user_avatar = {
      create: file,
    };
  }

  return context.prisma.updateUser({
    data: {
      ...args,
    },
    where: {
      id: userId,
    },
  });
};

const updateRoutine = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  if (args.days) {
    args.days = { set: args.days.map((x) => x) };
  }
  let categories = await context.prisma.categories({
    where: { addedBy: { id: userId } },
  });

  let categoryName = args.category;
  console.log(categoryName);

  if (args.category) {
    for (let i = 0; i < categories.length; i++) {
      if (categoryName == categories[i].name) {
        console.log("Yesss it is!");
        args.category = {
          connect: {
            id: categories[i].id,
          },
        };
        break;
      } else if (categoryName !== categories[i].name) {
        args.category = {
          create: {
            name: categoryName,
            addedBy: { connect: { id: userId } },
          },
        };
      }
    }
  }

  return context.prisma.updateRoutine({
    data: {
      title: args.title,
      description: args.description,
      days: args.days,
      failFee: args.failFee,
      startDate: args.startDate,
      endDate: args.endDate,
      alertTime: args.alertTime,
      highPriority: args.highPriority,
      category: args.category,
    },
    where: { id: args.routineId },
  });
};

const updateGoal = async (parent, args, context, info) => {
  const userId = await getUserId(context);

  let categories = await context.prisma.categories({
    where: { addedBy: { id: userId } },
  });

  let categoryName = args.category;
  if (args.category) {
    for (let i = 0; i < categories.length; i++) {
      if (categoryName == categories[i].name) {
        args.category = {
          connect: { id: categories[i].id },
        };
        break;
      } else if (categoryName !== categories[i].name) {
        args.category = {
          create: {
            name: categoryName,
            addedBy: { connect: { id: userId } },
          },
        };
      }
    }
  }

  return context.prisma.updateGoal({
    data: {
      title: args.title,
      description: args.description,
      goal_deadline: args.goal_deadline,
      fee: args.fee,
      snooze_fee: args.snooze_fee,
      status: args.status,
      category: args.category,
      highPriority: args.highPriority,
    },
    where: { id: args.goalId },
  });
};

const updateCategory = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.updateCategory({
    data: {
      name: args.name,
    },
    where: { id: args.categoryId },
  });
};

const deleteRoutine = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.deleteRoutine({
    id: args.routineId,
  });
};

const deleteGoal = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.deleteGoal({
    id: args.goalId,
  });
};

const deleteCategory = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.deleteCategory({
    id: args.categoryId,
  });
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  routine,
  goal,
  updateUser,
  updateRoutine,
  updateGoal,
  updateCategory,
  deleteGoal,
  deleteRoutine,
  deleteCategory,
};
