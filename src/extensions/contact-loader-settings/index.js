export function getContactLoaderSettingsEnabled(organization) {
  const contactLoaderSettingsEnabled = (
    getConfig("CONTACT_LOADER_SETTINGS", organization) || ""
  ).split(",");

  return contactLoaderSettingsEnabled.reduce((settings, name) => {
    try {
      const c = require(`./${name}.js`);
      settings[name] = c;
    } catch (err) {
      log.error(
        `CONTACT_LOADER_SETTINGS failed to load setting for ${name} -- ${err}`
      );
    }
  }, {});
}
