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
      first_name: {
        allowNull: false,
        notEmpty: true,
        type: Sequelize.STRING
      },
      last_name: {
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
      account_created: {
        allowNull: false,
        type: Sequelize.DATE
      },
      account_updated: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};