'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO master_user_roles ("name")
      VALUES 
        ('REGISTERED'),
        ('GUEST')
      ON CONFLICT ("name") DO NOTHING;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM master_user_roles
      WHERE "name" IN ('REGISTERED', 'GUEST');
    `);
  },
};
