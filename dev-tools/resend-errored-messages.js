import { sendMessages } from "../src/workers/jobs";

async function main() {
  try {
    await sendMessages(function(mQuery) {
      // messages that were attempted to be sent twenty minutes ago in status=SENDING
      // and also error_code < 0 which means a DNS error.
      // when JOBS_SAME_PROCESS is enabled, the send attempt is done immediately.
      // However, if it's still marked SENDING, then it must have failed to go out.
      // This is OK to run in a scheduled event because we are specifically narrowing on the error_code
      // It's important though that runs are never in parallel
      console.log("getting query");
      const twentyMinutesAgo = new Date(new Date() - 1000 * 60 * 120);
      return mQuery
        .where("created_at", ">", twentyMinutesAgo)
        .where("error_code", "<", 0)
        .where("send_status", "SENDING");
    }, "SENDING");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

main().then(() => process.exit());
