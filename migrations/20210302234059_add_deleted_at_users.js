exports.up = function (knex, Promise) {
  return knex.schema.alterTable('users', (table) => {
    table.timestamp('deleted_at')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('deleted_at')
  })
}
