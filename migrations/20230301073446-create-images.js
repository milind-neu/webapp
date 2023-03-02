'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        readOnly: true,
        type: Sequelize.INTEGER
      },
      image_id: {
        type: Sequelize.UUID,
        readOnly: true
      },
      product_id: {
        type: Sequelize.INTEGER,
        readOnly: true,
        references: { model: "Products", key: "id" },
      },
      file_name: {
        type: Sequelize.STRING,
        readOnly: true
      },
      s3_bucket_path: {
        type: Sequelize.TEXT,
        readOnly: true
      },
      date_created: {
        readOnly: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Images');
  }
};