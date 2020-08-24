import thinky from "./thinky";
const type = thinky.type;
import { requiredString, optionalString } from "./custom-types";

const CannedResponseSubmission = thinky.createModel(
  "canned_response_submission",
  type
    .object()
    .schema({
      id: type.string(),
      campaign_contact_id: requiredString(),
      campaign_id: requiredString(),
      organization_id: requiredString(),
      title: optionalString(),
      text: optionalString(),
      actions: optionalString()
    })
    .allowExtra(false),
  { noAutoCreation: true }
);

export default CannedResponseSubmission;
