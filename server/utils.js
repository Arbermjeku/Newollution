const jwt = require("jsonwebtoken");
const APP_SECRET = process.env.APP_SECRET || "Newollution-App";

const getUserId = async context => {
  const Authorization = await context.request.get("Authorization");
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "");
    const { userId } = jwt.verify(token, APP_SECRET);
    return userId;
  }
  throw new Error("Not authenticated");
};

module.exports = {
  getUserId,
  APP_SECRET
};
