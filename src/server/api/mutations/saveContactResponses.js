import { cacheableData } from "../../models";

export const saveContactResponses = async (
  _,
  { campaignContactId, responses }
) => {
  const contact = await cacheableData.campaignContact.load(campaignContactId);

  const contactResponses = {
    ...JSON.parse(contact.responses)
  };

  responses.forEach(val => {
    contactResponses[val.field] = val.response;
  });

  await cacheableData.campaignContact.updateResponses(
    campaignContactId,
    contactResponses
  );

  return true;
};
