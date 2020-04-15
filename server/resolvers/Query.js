const { getUserId, APP_SECRET } = require("../utils");

const routines = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.routines({ where: { addedBy: { id: userId } } });
};

const categories = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return context.prisma.categories({ where: { addedBy: { id: userId } } });
};

module.exports = {
  routines,
  categories
};
