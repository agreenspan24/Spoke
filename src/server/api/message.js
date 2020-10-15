import { mapFieldsToModel } from "./lib/utils";
import { Message } from "../models";

const errorDescriptions = {
  "-166": "Invalid content in message. Please remove and try again."
};

export const resolvers = {
  Message: {
    ...mapFieldsToModel(
      ["text", "userNumber", "contactNumber", "createdAt", "isFromContact"],
      Message
    ),
    // cached messages don't have message.id -- why bother
    id: msg => msg.id || `fake${Math.random()}`,
    errorMessage: msg => {
      if (!msg.error_code) {
        return null;
      }

      return (
        errorDescriptions[msg.error_code] ||
        "An error occurred while sending message."
      );
    }
  }
};
