// Add van_is_my_campaign column to campaign
exports.up = function(knex) {
  return knex.schema.alterTable("campaign", table => {
    table.boolean("van_is_my_campaign").nullable();
  });
};

// Drop van_is_my_campaign column from campaign
exports.down = function(knex) {
  return knex.schema.alterTable("campaign", table => {
    table.dropColumn("van_is_my_campaign");
  });
};
