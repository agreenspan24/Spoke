import { mapFieldsToModel } from "./lib/utils";
import { CannedResponse, CannedResponseAction, cacheableData } from "../models";

export const resolvers = {
  CannedResponse: {
    ...mapFieldsToModel(["id", "title", "text"], CannedResponse),
    isUserCreated: cannedResponse => cannedResponse.user_id !== "",
    actions: async (cannedResponse, _, { user }) => {
      const campaignCannedResponses = await cacheableData.cannedResponse.query({
        campaignId: cannedResponse.campaign_id
      });

      const cachedCannedResponse = campaignCannedResponses.find(
        c => c.id === cannedResponse.id
      );

      return cachedCannedResponse.actions;
    }
  },
  CannedResponseAction: {
    ...mapFieldsToModel(["action", "actionData"], CannedResponseAction)
  }
};

CannedResponse.ensureIndex("campaign_id");
