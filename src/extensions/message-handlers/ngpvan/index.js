import { getConfig } from "../../../server/api/lib/config";
const Van = require("../../../extensions/action-handlers/ngpvan-action");

import { getActionChoiceData } from "../../../extensions/action-handlers";
import { cacheableData } from "../../../server/models";

export const DEFAULT_NGP_VAN_INITIAL_TEXT_CANVASS_RESULT = "Texted";

export const serverAdministratorInstructions = () => {
  return {
    description: `
      Update the contact in VAN with a status of Texted
      when the initial message is sent to the contact
      for a campaign.
    `,
    setupInstructions: `
      This message handler is dependent on the ngpvan-action Action Handler.
      Follow its setup instructions.
    `,
    environmentVariables: []
  };
};

export const available = organization =>
  !!getConfig("NGP_VAN_API_KEY", organization) &&
  !!getConfig("NGP_VAN_APP_NAME", organization);

// export const preMessageSave = async () => {};

export const postMessageSave = async ({ contact, organization }) => {
  if (!available(organization)) {
    return {};
  }

  const initialReplyCanvassResult = getConfig(
    "NGP_VAN_INITIAL_REPLY_CANVASS_RESULT",
    organization
  );

  let canvassResult;
  if (contact.message_status === "needsMessage") {
    canvassResult =
      getConfig("NGP_VAN_INITIAL_TEXT_CANVASS_RESULT", organization) ||
      DEFAULT_NGP_VAN_INITIAL_TEXT_CANVASS_RESULT;
  } else if (
    initialReplyCanvassResult &&
    contact.message_status === "needsResponse"
  ) {
    const messages =
      (await cacheableData.message.query({ campaignContactId: contact.id })) ||
      [];

    // First message not from the contact will be initial text, the second is the initial reply since the user can only send one initial text.
    if (messages.filter(m => !m.is_from_contact).length === 2) {
      console.log({ initialReplyCanvassResult });
      canvassResult = initialReplyCanvassResult;
    }
  }

  if (!canvassResult) return {};

  const clientChoiceData = await getActionChoiceData(
    Van,
    organization,
    campaign
  );

  const texted = clientChoiceData.find(ccd => ccd.name === canvassResult);
  const body = JSON.parse(texted.details);

  return Van.postCanvassResponse(contact, organization, body)
    .then(() => {})
    .catch(caughtError => {
      // eslint-disable-next-line no-console
      console.error(
        "Encountered exception in ngpvan.postMessageSave",
        caughtError
      );
      return {};
    });
};
