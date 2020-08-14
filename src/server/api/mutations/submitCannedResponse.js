import { log } from "../../../lib";
import { assignmentRequiredOrAdminRole } from "../errors";
import { cacheableData } from "../../models";
import { jobRunner } from "../../../extensions/job-runners";
import { Tasks } from "../../../workers/tasks";

const ActionHandlers = require("../../../extensions/action-handlers");

export const submitCannedResponse = async (
  _,
  { cannedResponse, campaignContactId },
  { user }
) => {
  console.log(
    "submitCannedResponseDispatch",
    cannedResponse,
    campaignContactId
  );
  const contact = await cacheableData.campaignContact.load(campaignContactId);
  const campaign = await cacheableData.campaign.load(contact.campaign_id);
  const organization = await cacheableData.organization.load(
    campaign.organization_id
  );

  await assignmentRequiredOrAdminRole(
    user,
    campaign.organization_id,
    contact.assignment_id,
    contact
  );

  // TODO: consider saving responses

  try {
    const actionHandlersConfigured =
      Object.keys(ActionHandlers.rawAllActionHandlers()).length > 0;

    if (actionHandlersConfigured) {
      return jobRunner.dispatchTask(Tasks.ACTION_HANDLER_CANNED_RESPONSE, {
        organization,
        cannedResponse,
        campaign,
        contact
      });
    }
  } catch (e) {
    log.error("Dispatching submitted canned response failed");
  }

  return contact.id;
};
