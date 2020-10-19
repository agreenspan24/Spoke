import { cacheableData } from "../../models";

export const saveContactResponses = async (
  _,
  { campaignContactId, responses }
) => {
  const contact = await cacheableData.campaignContact.load(campaignContactId);

  // Keep all the old responses and only overwrite the new ones
  const contactResponses = {
    ...JSON.parse(contact.responses)
  };

  // Transform array into a lookup object to save
  responses.forEach(val => {
    contactResponses[val.field] = val.response;
  });

  await cacheableData.campaignContact.updateResponses(
    campaignContactId,
    contactResponses
  );

  return true;
};
