import minilog from "minilog";
import { isClient } from "./is-client";
const Rollbar = require("rollbar");
let logInstance = null;

if (isClient()) {
  minilog.enable();
  logInstance = minilog("client");
  const existingErrorLogger = logInstance.error;
  logInstance.error = (...err) => {
    const errObj = err;
    if (window.Rollbar) {
      window.Rollbar.error(...errObj);
    }
    existingErrorLogger.call(...errObj);
  };
} else {
  let rollbar = null;

  if (
    // process.env.NODE_ENV === "production" &&
    process.env.ROLLBAR_ACCESS_TOKEN
  ) {
    rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
      endpoint: "https://api.rollbar.com/api/1/item"
    });
  }

  minilog.suggest.deny(
    /.*/,
    process.env.NODE_ENV === "development" ? "debug" : "debug"
  );

  minilog
    .enable()
    .pipe(minilog.backends.console.formatWithStack)
    .pipe(minilog.backends.console);

  const miniLogInstance = minilog("backend");

  logInstance = {
    debug: (...msg) => {
      miniLogInstance.debug(...msg);
    },
    info: (...msg) => {
      miniLogInstance.info(...msg);
    },
    log: (...msg) => {
      miniLogInstance.log(...msg);
    },
    warn: (...msg) => {
      miniLogInstance.warn(...msg);
    },
    error: (...msg) => {
      const [err] = msg;

      if (rollbar) {
        rollbar.error(...msg);
      }

      miniLogInstance.error(err && err.stack ? err.stack : err);
    }
  };
}

const log = process.env.LAMBDA_DEBUG_LOG ? console : logInstance;

export { log };
