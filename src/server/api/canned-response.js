import { mapFieldsToModel } from "./lib/utils";
import { CannedResponse, CannedResponseAction } from "../models";
import { r } from "../models";

export const resolvers = {
  CannedResponse: {
    ...mapFieldsToModel(["id", "title", "text"], CannedResponse),
    isUserCreated: cannedResponse => cannedResponse.user_id !== "",
    actions: async (cannedResponse, _, { user }) => {
      return CannedResponseAction.getAll(cannedResponse.id, {
        index: "canned_response_id"
      });
    },
    tagIds: cannedResponse => cannedResponse.tagIds || []
  },
  CannedResponseAction: {
    ...mapFieldsToModel(["action", "actionData"], CannedResponseAction)
  }
};

CannedResponse.ensureIndex("campaign_id");
