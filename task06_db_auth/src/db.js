import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH || "./data.sqlite",
  logging: false
});

export const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true, len: [5, 190] }
  },
  password_hash: { type: DataTypes.STRING, allowNull: false }
});

export const Note = sequelize.define("Note", {
  title: { type: DataTypes.STRING, allowNull: false, validate: { len: [1, 160] } },
  body: { type: DataTypes.TEXT, allowNull: true }
});

User.hasMany(Note, { foreignKey: "userId", onDelete: "CASCADE" });
Note.belongsTo(User, { foreignKey: "userId" });

export async function init() {
  await sequelize.sync();
}
