import { mapFieldsToModel } from "./lib/utils";
import { Message } from "../models";

const errorDescriptions = {
  "-166": "Invalid content in message. Please change content and try again."
};

export const resolvers = {
  Message: {
    ...mapFieldsToModel(
      [
        "text",
        "userNumber",
        "contactNumber",
        "createdAt",
        "isFromContact",
        "errorCode"
      ],
      Message
    ),
    // cached messages don't have message.id -- why bother
    id: msg => msg.id || `fake${Math.random()}`,
    errorMessage: msg => msg.error_code && errorDescriptions[msg.error_code]
  }
};
