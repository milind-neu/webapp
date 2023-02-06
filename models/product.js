'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    name: {
        validate: {
          notEmpty: {
            args: true,
            msg: "Name cannot be empty"
          }
      },
      type: DataTypes.STRING
    },
    description: {
         validate: {
          notEmpty: {
            args: true,
            msg: "Description cannot be empty"
          }
      },
      type: DataTypes.STRING
    },
    sku: {
        validate: {
          notEmpty: {
            args: true,
            msg: "Sku cannot be empty"
          }
      },
      type: DataTypes.STRING
    },
    manufacturer: {
        validate: {
          notEmpty: {
            args: true,
            msg: "Manufacturer cannot be empty"
          }
      },
      type: DataTypes.STRING
    },
    quantity: {
      validate: {
        notEmpty: {
          args: true,
          msg: "Quantity cannot be empty"
        },
        min: {
          args: [0],
          msg: "Quanitiy cannot be less than 0"
        },
        max: {
          args: [100],
          msg: "Quanitiy cannot be greater than 100"
        }
      },
      type: DataTypes.INTEGER
    },
    date_added: DataTypes.DATE,
    date_last_updated: DataTypes.DATE,
    owner_user_id: DataTypes.INTEGER,
    
    createdAt: {
      type: DataTypes.DATE,
      field: 'date_added'
     },
    
    updatedAt: {
      type: DataTypes.DATE,
      field: 'date_last_updated'
    },
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};