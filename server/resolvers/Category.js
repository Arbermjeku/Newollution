const { getUserId } = require("../utils");

const addedBy = async (parent, args, context, info) => {
  return await context.prisma.category({ id: parent.id }).addedBy();
};

const routines = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return await context.prisma.routines({
    where: {
      category: { id: parent.id },
      addedBy: { id: userId },
    },
  });
};

const goals = async (parent, args, context, info) => {
  const userId = await getUserId(context);
  return await context.prisma.goals({
    where: {
      category: { id: parent.id },
      addedBy: { id: userId },
    },
  });
};

module.exports = {
  addedBy,
  routines,
  goals,
};
