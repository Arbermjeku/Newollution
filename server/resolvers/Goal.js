const addedBy = async (parent, args, context, info) => {
    return await context.prisma.goal({ id: parent.id }).addedBy()
}

const category = async (parent, args, context, info) => {
    return await context.prisma.goal({ id: parent.id }).category()
}

module.exports =  {
    addedBy,
    category,
}