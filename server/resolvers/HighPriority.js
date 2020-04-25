const { getUserId } = require('../utils')

const goals_count = async (parent, args, context, info) => {
    const userId = await getUserId(context)
    let goals = await context.prisma.goals({
        where: {
            addedBy: { id: userId },
            highPriority: true
        }
    })
    return goals.length
}

const routines_count = async (parent, args, context, info) => {
    const userId = await getUserId(context)
    let routines = await context.prisma.routines({
        where:{
            addedBy: { id: userId },
            highPriority: true
        }
    })
    return routines.length
}

const goals = async (parent, args, context, info) => {
    const userId = await getUserId(context)
    return await context.prisma.goals({
        where: {
            addedBy: { id: userId },
            highPriority: true
        }
    })
}

const routines = async (parent, args, context, info) => {
    const userId = await getUserId(context)
    return await context.prisma.routines({
        where:{
            addedBy: { id: userId },
            highPriority: true
        }
    })
}

module.exports = {
    goals_count,
    routines_count,
    goals,
    routines,
}