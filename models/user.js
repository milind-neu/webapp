'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
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
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,

    account_created: DataTypes.DATE,
    account_updated: DataTypes.DATE,
    
    createdAt: {
      type: DataTypes.DATE,
      field: 'account_created'
     },
    
    updatedAt: {
      type: DataTypes.DATE,
      field: 'account_updated'
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};