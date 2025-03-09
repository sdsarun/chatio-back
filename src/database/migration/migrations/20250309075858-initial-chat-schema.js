'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Create master_user_types table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS master_user_types (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(128) UNIQUE NOT NULL
        );
      `, { transaction });

      // Create master_conversation_types table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS master_conversation_types (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(128) UNIQUE NOT NULL
        );
      `, { transaction });

      // Create users table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(128) UNIQUE NOT NULL,
          user_type_id UUID,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          deleted_at timestamptz,
          FOREIGN KEY (user_type_id) REFERENCES master_user_types(id) ON DELETE SET NULL
        );
      `, { transaction });

      // Create conversations table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_type_id UUID,
          created_at TIMESTAMPTZ DEFAULT now(),
          deleted_at TIMESTAMPTZ,
          FOREIGN KEY (conversation_type_id) REFERENCES master_conversation_types(id) ON DELETE SET NULL
        );
      `, { transaction });

      // Create conversation_participants table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS conversation_participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID,
          user_id UUID,
          joined_at TIMESTAMPTZ DEFAULT now(),
          left_at TIMESTAMPTZ,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `, { transaction });

      // Create messages table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sender_id UUID,
          conversation_id UUID,
          content TEXT NOT NULL,
          sent_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          deleted_at TIMESTAMPTZ,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
        );
      `, { transaction });

      // Create message_reads table
      await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS message_reads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id UUID,
          user_id UUID,
          read_at TIMESTAMPTZ,
          FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );
      `, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Drop tables in reverse order to avoid foreign key dependency issues
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS message_reads CASCADE;`, { transaction });
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS messages CASCADE;`, { transaction });
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS conversation_participants CASCADE;`, { transaction });
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS conversations CASCADE;`, { transaction });
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS users CASCADE;`, { transaction });
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS master_conversation_types CASCADE;`, { transaction });
      await queryInterface.sequelize.query(`DROP TABLE IF EXISTS master_user_types CASCADE;`, { transaction });
    });
  }
};
