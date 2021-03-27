// Update with your config settings.

module.exports = {
  client: 'pg',
  connection: {
    database: 'knowledge',
    user: 'root',
    password: '1234'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
