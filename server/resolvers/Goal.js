const addedBy = (parent, args, context, info) => {
    return context.prisma.goal({ id: parent.id }).addedBy()
}

const category = (parent, args, context, info) => {
    return context.prisma.goal({ id: parent.id }).category()
}

module.exports =  {
    addedBy,
    category,
}