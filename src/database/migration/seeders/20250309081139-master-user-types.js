'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO master_user_types ("name")
      VALUES 
        ('SUPER_ADMIN_USER'),
        ('REGISTERED_USER'),
        ('GUEST_USER')
      ON CONFLICT ("name") DO NOTHING;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM master_user_types
      WHERE "name" IN ('SUPER_ADMIN_USER', 'REGISTERED_USER', 'GUEST_USER');
    `);
  },
};
