exports.up = function(knex) {
  return knex.schema.table("campaign_contact", table => {
    table
      .text("responses")
      .notNullable()
      .defaultTo("{}");
  });
};

exports.down = function(knex) {
  return knex.schema.table("campaign", table => {
    table.dropColumn("responses");
  });
};
