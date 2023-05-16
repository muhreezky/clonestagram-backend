'use strict';
const {
  Model,
  DataTypes,
} = require('sequelize');
/**
 * 
 * @param {*} sequelize 
 * @param {DataTypes} Sequelize 
 * @returns 
 */
module.exports = (sequelize, Sequelize) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Post.init({
    post_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    caption: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    image_url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    likes: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};