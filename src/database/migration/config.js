// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

const config = {
  production: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: process.env.DB_SCHEMA,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true',
    },
  },
  development: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: process.env.DB_SCHEMA,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true',
    },
  },
  test: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    schema: process.env.DB_SCHEMA,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true',
    },
  },
};

module.exports = config;