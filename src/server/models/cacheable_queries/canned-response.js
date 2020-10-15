import { r, CannedResponse, CannedResponseAction } from "../../models";

// Datastructure:
// * regular GET/SET with JSON ordered list of the objects {id,title,text}
// * keyed by campaignId-userId pairs -- userId is '' for global campaign records
// Requirements:
// * needs an order
// * needs to get by campaignId-userId pairs

const cacheKey = (campaignId, userId) =>
  `${process.env.CACHE_PREFIX || ""}canned-${campaignId}-${userId || ""}`;

const clearQuery = async ({ campaignId, userId }) => {
  if (r.redis) {
    await r.redis.delAsync(cacheKey(campaignId, userId));
  }
};

const cannedResponseCache = {
  clearQuery: async ({ campaignId, userId }) => {
    await clearQuery({ campaignId, userId });
  },
  query: async ({ campaignId, userId }) => {
    if (r.redis) {
      const cannedData = await r.redis.getAsync(cacheKey(campaignId, userId));
      if (cannedData) {
        return JSON.parse(cannedData);
      }
    }

    const cannedResponses = await r
      .table("canned_response")
      .getAll(campaignId, { index: "campaign_id" })
      .filter({ user_id: userId || "" });

    const responseActions = await r
      .knex("canned_response_action")
      .whereIn(
        "canned_response_id",
        cannedResponses.map(res => res.id)
      )
      .select();

    for (var i in responseActions) {
      const action = responseActions[i];
      const response = cannedResponses.find(
        r => r.id == action.canned_response_id
      );

      if (!response.actions) {
        response.actions = [];
      }

      response.actions.push({
        action: action.action,
        actionData: action.action_data
      });
    }

    if (r.redis) {
      const cacheData = cannedResponses.map(cannedRes => ({
        id: cannedRes.id,
        title: cannedRes.title,
        text: cannedRes.text,
        user_id: cannedRes.user_id,
        actions: cannedRes.actions
      }));

      await r.redis
        .multi()
        .set(cacheKey(campaignId, userId), JSON.stringify(cacheData))
        .expire(cacheKey(campaignId, userId), 43200) // 12 hours
        .execAsync();
    }

    return cannedResponses;
  },
  save: async (cannedResponses, campaignId, userId) => {
    const convertedResponses = [];

    const title_to_actions = {};

    for (let index = 0; index < cannedResponses.length; index++) {
      const response = cannedResponses[index];

      title_to_actions[response.title] = response.actions;
      delete response.actions;

      convertedResponses.push({
        ...response,
        campaign_id: campaignId,
        id: undefined
      });
    }

    // Clear the canned responses in Redis
    await clearQuery({ campaignId, userId });

    // Delete old canned responses
    await r
      .table("canned_response")
      .getAll(campaignId, { index: "campaign_id" })
      .filter({ user_id: "" })
      .delete();

    if (!convertedResponses.length) return;

    // Add responses to database
    const savedResponses = await r
      .knex("canned_response")
      .returning(["id", "title"])
      .insert(convertedResponses);

    // Add response actions to database
    let responseActions = [];

    savedResponses.forEach(r => {
      const actions = title_to_actions[r.title];

      if (!actions) return;

      responseActions = responseActions.concat(
        actions.map(a => ({
          id: undefined,
          canned_response_id: r.id,
          action: a.action,
          action_data: a.actionData
        }))
      );
    });

    CannedResponseAction.save(responseActions);
  }
};

export default cannedResponseCache;
