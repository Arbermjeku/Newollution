const { getUserId, APP_SECRET } = require("../utils");

const routines = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return await context.prisma.user({ id: userId }).routines();
};

const goals = async (parent, args, context, info) => {
  const userId = getUserId(context);
  return await context.prisma.user({ id: parent.id }).goals();
};

const user_avatar = async (parent, args, context, info) => {
  return await context.prisma.user({ id: parent.id }).user_avatar()
}

module.exports = {
  routines,
  goals,
  user_avatar,
};
