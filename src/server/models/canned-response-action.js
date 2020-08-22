import thinky from "./thinky";
const type = thinky.type;
import { requiredString, optionalString } from "./custom-types";
import CannedResponse from "./canned-response";

const CannedResponseAction = thinky.createModel(
  "canned_response_action",
  type
    .object()
    .schema({
      id: type.string(),
      canned_response_id: requiredString(),
      action: requiredString(),
      action_data: optionalString()
    })
    .allowExtra(false),
  { noAutoCreation: true }
);

CannedResponseAction.ensureIndex("canned_response_id");

export default CannedResponseAction;
