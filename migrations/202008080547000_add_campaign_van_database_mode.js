// Add van_database_mode column to campaign
exports.up = function(knex) {
  return knex.schema.alterTable("campaign", table => {
    table.integer("van_database_mode").nullable();
  });
};

// Drop van_database_mode column from campaign
exports.down = function(knex) {
  return knex.schema.alterTable("campaign", table => {
    table.dropColumn("van_database_mode");
  });
};
