'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO master_conversation_types ("name")
      VALUES
        ('DIRECT_MESSAGE'),
        ('PRIVATE_GROUP_MESSAGE'),
        ('PUBLIC_GROUP_MESSAGE'),
        ('STRANGER_MESSAGE')
      ON CONFLICT ("name") DO NOTHING;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM master_conversation_types
      WHERE "name" IN (
        'DIRECT_MESSAGE',
        'PRIVATE_GROUP_MESSAGE', 
        'PUBLIC_GROUP_MESSAGE',
        'STRANGER_MESSAGE'
      );
    `);
  }
};
