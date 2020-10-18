import { mapFieldsToModel } from "./lib/utils";
import { CannedResponse, CannedResponseAction } from "../models";

export const resolvers = {
  CannedResponse: {
    ...mapFieldsToModel(["id", "title", "text"], CannedResponse),
    isUserCreated: cannedResponse => cannedResponse.user_id !== "",
    actions: async cannedResponse => {
      if (cannedResponse.hasOwnProperty("actions")) {
        return cannedResponse.actions;
      }

      return CannedResponseAction.getAll(cannedResponse.id, {
        index: "canned_response_id"
      });
    }
  },
  CannedResponseAction: {
    ...mapFieldsToModel(["action", "actionData"], CannedResponseAction)
  }
};

CannedResponse.ensureIndex("campaign_id");
