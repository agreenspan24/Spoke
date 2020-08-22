// Tasks are lightweight, fire-and-forget functions run in the background.
// Unlike Jobs, tasks are not tracked in the database.
// See src/extensions/job-runners/README.md for more details
import serviceMap from "../server/api/lib/services";
import * as ActionHandlers from "../extensions/action-handlers";
import { log } from "../lib";
import { cacheableData, CannedResponseSubmission } from "../server/models";

export const Tasks = Object.freeze({
  SEND_MESSAGE: "send_message",
  ACTION_HANDLER_QUESTION_RESPONSE: "action_handler:question_response",
  ACTION_HANDLER_TAG_UPDATE: "action_handler:tag_update",
  ACTION_HANDLER_CANNED_RESPONSE: "action_handler:canned_response",
  CAMPAIGN_START_CACHE: "campaign_start_cache"
});

const sendMessage = async ({
  message,
  contact,
  trx,
  organization,
  campaign
}) => {
  const service = serviceMap[message.service];
  if (!service) {
    throw new Error(`Failed to find service for message ${message}`);
  }

  await service.sendMessage(message, contact, trx, organization, campaign);
};

const questionResponseActionHandler = async ({
  name,
  organization,
  questionResponse,
  interactionStep,
  campaign,
  contact,
  wasDeleted,
  previousValue
}) => {
  const handler = await ActionHandlers.rawActionHandler(name);

  if (!wasDeleted) {
    // TODO: clean up processAction interface
    return handler.processAction({
      action: (interactionStep || {}).answer_actions,
      action_data: (interactionStep || {}).answer_actions_data,
      campaignContactId: contact.id,
      contact,
      campaign,
      organization,
      previousValue
    });
  } else if (
    handler.processDeletedQuestionResponse &&
    typeof handler.processDeletedQuestionResponse === "function"
  ) {
    return handler.processDeletedQuestionResponse({
      questionResponse,
      interactionStep,
      campaignContactId: contact.id,
      contact,
      campaign,
      organization,
      previousValue
    });
  }
};

const cannedResponseActionHandler = async ({
  organization,
  cannedResponse,
  campaign,
  contact
}) => {
  CannedResponseSubmission.save({
    campaign_contact_id: contact.id,
    campaign_id: campaign.id,
    organization_id: organization.id,
    title: cannedResponse.title,
    text: cannedResponse.text,
    actions: JSON.stringify(cannedResponse.actions)
  });

  for (var i in cannedResponse.actions) {
    const action = cannedResponse.actions[i];

    const handler = await ActionHandlers.rawActionHandler(action.action);

    handler.processAction({
      action: action.action,
      action_data: action.actionData,
      campaignContactId: contact.id,
      contact,
      campaign,
      organization
    });
  }
};

const tagUpdateActionHandler = async ({
  name,
  tags,
  contact,
  campaign,
  organization,
  texter
}) => {
  const handler = await ActionHandlers.rawActionHandler(name);
  await handler.onTagUpdate(tags, contact, campaign, organization, texter);
};

const startCampaignCache = async ({ campaign, organization }) => {
  // Refresh all the campaign data into cache
  // This should refresh/clear any corruption
  const loadAssignments = cacheableData.campaignContact.updateCampaignAssignmentCache(
    campaign.id
  );
  const loadContacts = cacheableData.campaignContact
    .loadMany(campaign, organization, {})
    .then(() => {
      // eslint-disable-next-line no-console
      console.log("FINISHED contact loadMany", campaign.id);
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      log.error("ERROR contact loadMany", campaign.id, err, campaign);
    });
  const loadOptOuts = cacheableData.optOut.loadMany(organization.id);

  await loadAssignments;
  await loadContacts;
  await loadOptOuts;
};

const taskMap = Object.freeze({
  [Tasks.SEND_MESSAGE]: sendMessage,
  [Tasks.ACTION_HANDLER_QUESTION_RESPONSE]: questionResponseActionHandler,
  [Tasks.ACTION_HANDLER_TAG_UPDATE]: tagUpdateActionHandler,
  [Tasks.ACTION_HANDLER_CANNED_RESPONSE]: cannedResponseActionHandler,
  [Tasks.CAMPAIGN_START_CACHE]: startCampaignCache
});

export const invokeTaskFunction = async (taskName, payload) => {
  if (taskName in taskMap) {
    await taskMap[taskName](payload);
  } else {
    throw new Error(`Task of type ${taskName} not found`);
  }
};
