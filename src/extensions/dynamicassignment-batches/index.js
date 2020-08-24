import { getConfig } from "../../server/api/lib/config";
import { log } from "../../lib";

export const getDynamicAssignmentBatchPolicy = ({ organization, campaign }) => {
  const handlerKey = "DYNAMICASSIGNMENT_BATCHES";
  const name =
    getConfig(handlerKey, campaign, { onlyLocal: true }) ||
    getConfig(handlerKey, organization) ||
    "finished-replies";
  let handler = null;
  try {
    handler = require(`./${name}/index.js`);
  } catch (err) {
    log.error(`${handlerKey} failed to load message handler ${name} -- ${err}`);
  }
  return handler;
};
