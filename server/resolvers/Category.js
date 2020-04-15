const addedBy = async (parent, args, context, info) => {
  return await context.prisma.category({ id: parent.id }).addedBy();
};

const routines = async (parent, args, context, info) => {
  return await context.prisma.routines({where: { category: { id: parent.id }}})
}

module.exports = {
  addedBy,
  routines,

};
