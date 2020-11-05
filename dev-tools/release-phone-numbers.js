const parseArgs = require("minimist");
const twilio = require("twilio")(
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_AUTH_TOKEN
);
import { r } from "../src/server/models";

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * Search for phone numbers available for purchase
 */
async function searchForNumbersToRelease(areaCode, limit) {
  const phoneNumbersToRelease = await r
    .knex("owned_phone_number")
    .where("area_code", areaCode)
    .limit(limit);

  console.log({ phoneNumbersToRelease });

  return phoneNumbersToRelease;
}

/**
 * Buy a phone number
 */
async function releaseNumber(phoneNumber) {
  const response = await twilio
    .incomingPhoneNumbers(phoneNumber.service_id)
    .remove();

  if (response.error) {
    throw new Error(`Error releasing twilio number: ${response.error}`);
  }

  console.log(`Released number ${phoneNumber.phone_number} [${response.sid}]`);
  return response.sid;
}

/**
 * Add bought phone number to a messging service
 */
async function deleteNumberInDatabase(phone_number) {
  await r
    .knex("owned_phone_number")
    .where("phone_number", phone_number)
    .delete();

  if (process.env.EXPERIMENTAL_STICKY_SENDER) {
    await r
      .knex("contact_user_number")
      .where("user_number", phone_number)
      .delete();
  }
}

async function main() {
  try {
    const { areaCode, limit } = parseArgs(process.argv, {
      default: {
        limit: 1
      }
    });

    // VALIDATIONS
    if (typeof areaCode !== "number" || areaCode > 999) {
      console.error(`Invalid area code: ${areaCode}`);
      process.exit();
    }

    if (limit < 1 && limit > 200) {
      console.error("Limit should be between 1 and 200");
      process.exit();
    }

    const phoneNumbers = await searchForNumbersToRelease(areaCode, limit);

    await asyncForEach(phoneNumbers, async phoneNumber => {
      await releaseNumber(phoneNumber);
      await deleteNumberInDatabase(phoneNumber.phone_number);
    });
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

main().then(() => process.exit());
