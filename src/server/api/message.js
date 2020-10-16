import { mapFieldsToModel } from "./lib/utils";
import { Message } from "../models";

const errorDescriptions = {
  // Internal (Twilio) Failure
  12400: "An error occurred while sending your message. Please try again.",
  // Invalid 'To' Phone Number
  21211: "Phone number unreachable. Please skip this conversation.",
  // Message body is required
  21602: "Message text was not included. Please try again.",
  // Attempt to send to unsubscribed recipient
  21610: "Phone number unreachable. Please skip this conversation.",
  // Source number has exceeded max number of queued messages
  21611: "An error occurred while sending your message. Please try again.",
  // Unreachable via SMS or MMS
  21612: "Phone number unreachable. Please skip this conversation.",
  // Invalid mobile number
  21614: "Phone number unreachable. Please skip this conversation.",
  // Queue overflow
  30001: "An error occurred while sending your message. Please try again.",
  // Account suspended
  30002: "Phone number unreachable. Please skip this conversation.",
  // Unreachable destination handset
  30003: "Phone number unreachable. Please skip this conversation.",
  // Message blocked
  30004: "Phone number unreachable. Please skip this conversation.",
  // Unknown destination handset
  30005: "Phone number unreachable. Please skip this conversation.",
  // Landline or unreachable carrier
  30006: "Phone number unreachable. Please skip this conversation.",
  // "Message Delivery - Carrier violation"
  30007: "Phone number unreachable. Please skip this conversation.",
  // "Message Delivery - Unknown error"
  30008: "Phone number unreachable. Please skip this conversation.",
  // "Internal: Message blocked due to text match trigger (profanity-tagger)",
  "-166": "Invalid content in message. Please change content and try again.",
  // Internal: Initial message altered (initialtext-guard)
  "-167": "Internal: Initial message altered (initialtext-guard)"
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
    errorMessage: msg => {
      if (!msg.error_code) return null;

      return msg.error_code in errorDescriptions
        ? errorDescriptions[msg.error_code]
        : "An error occurred while sending";
    }
  }
};
