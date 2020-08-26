exports.up = async function up(knex, Promise) {
  if (!(await knex.schema.hasTable("canned_response_submission"))) {
    return knex.schema.createTable("canned_response_submission", t => {
      t.increments("id");
      t.text("campaign_contact_id");
      t.text("campaign_id");
      t.text("organization_id");
      t.text("title");
      t.text("text");
      t.text("actions");
    });
  }

  return Promise.resolve();
};

exports.down = function down(knex, Promise) {
  return knex.schema.dropTableIfExists("canned_response_submission");
};
