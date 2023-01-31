'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        allowNull: false,
        notEmpty: true,
        type: Sequelize.STRING
      },
      lastName: {
        allowNull: false,
        notEmpty: true,
        type: Sequelize.STRING
      },
      username: {
        allowNull: false,
        unique: true,
        notEmpty: true,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        notEmpty: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};