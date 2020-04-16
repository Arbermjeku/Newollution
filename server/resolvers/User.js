const { getUserId, APP_SECRET } = require("../utils");

const routines = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.user({ id: userId }).routines();
};

const goals = async (parent, args, context, info) => {
  const userId = getUserId(context);
  return context.prisma.user({ id: parent.id }).goals();
};

module.exports = {
  routines,
  goals,
};
