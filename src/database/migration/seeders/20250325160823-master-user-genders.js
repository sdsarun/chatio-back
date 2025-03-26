'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      INSERT INTO master_user_genders ("name")
      VALUES
        ('MALE'),
        ('FEMALE'),
        ('RATHER_NOT_SAY')
      ON CONFLICT ("name") DO NOTHING;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM master_user_genders
      WHERE "name" IN ('MALE', 'FEMALE', 'RATHER_NOT_SAY');
    `);
  }
};
