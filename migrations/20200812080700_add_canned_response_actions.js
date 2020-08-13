exports.up = async function up(knex, Promise) {
  if (!(await knex.schema.hasTable("canned_response_action"))) {
    return knex.schema.createTable("canned_response_action", t => {
      t.increments("id");
      t.integer("canned_response_id").notNullable();
      t.text("action");
      t.text("action_data");

      t.index("canned_response_id");
      t.foreign("canned_response_id")
        .references("canned_response.id")
        .onDelete("CASCADE");
    });
  }

  return Promise.resolve();
};

exports.down = function down(knex, Promise) {
  return knex.schema.dropTableIfExists("canned_response_action");
};
