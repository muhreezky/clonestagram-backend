'use strict';
const {
  Model,
  DataTypes
} = require('sequelize');

/**
 * 
 * @param {*} sequelize 
 * @param {DataTypes} Sequelize
 * @returns 
 */
module.exports = (sequelize, Sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_id: {
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    bio: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    fullname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profile_pic: {
      type: Sequelize.STRING,
      defaultValue: `http://localhost:${process.env.PORT}/images/avatars/default-avatar.png`
    },
    verify_token: {
      type: Sequelize.STRING,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    reset_token: {
      type: Sequelize.STRING,
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};