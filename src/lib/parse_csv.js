import Papa from "papaparse";
import _ from "lodash";
import { getFormattedPhoneNumber, getFormattedZip, log } from "../lib";

export const requiredUploadFields = ["firstName", "lastName", "cell"];
const topLevelUploadFields = [
  "firstName",
  "lastName",
  "cell",
  "zip",
  "external_id"
];

const getValidatedData = data => {
  let validatedData;
  let result;
  // For some reason destructuring is not working here
  result = _.partition(data, row => !!row.cell);
  validatedData = result[0];
  const missingCellRows = result[1];

  validatedData = _.map(validatedData, row =>
    _.extend(row, {
      cell: getFormattedPhoneNumber(
        row.cell,
        process.env.PHONE_NUMBER_COUNTRY || "US"
      )
    })
  );
  result = _.partition(validatedData, row => !!row.cell);
  validatedData = result[0];
  const invalidCellRows = result[1];

  const count = validatedData.length;
  validatedData = _.uniqBy(validatedData, row => row.cell);
  const dupeCount = count - validatedData.length;

  validatedData = _.map(validatedData, row =>
    _.extend(row, {
      zip: row.zip ? getFormattedZip(row.zip) : null
    })
  );
  const zipCount = validatedData.filter(row => !!row.zip).length;

  return {
    validatedData,
    validationStats: {
      dupeCount,
      invalidCellCount: invalidCellRows.length,
      missingCellCount: missingCellRows.length,
      zipCount
    }
  };
};

export const organizationCustomFields = (contacts, customFieldsList) => {
  return contacts.map(contact => {
    const customFields = {};
    const contactInput = {
      cell: contact.cell,
      first_name: contact.firstName,
      last_name: contact.lastName,
      zip: contact.zip || "",
      external_id: contact.external_id || ""
    };
    customFieldsList.forEach(key => {
      if (contact.hasOwnProperty(key)) {
        customFields[key] = contact[key];
      }
    });
    contactInput.custom_fields = JSON.stringify(customFields);
    return contactInput;
  });
};

export const parseCSV = (file, onCompleteCallback, options) => {
  // options is a custom object that currently supports two properties
  // rowTransformer -- a function that gets called on each row in the file
  //   after it is parsed. It takes 2 parameters, an array of fields and
  //   the object that results from parsing the row. It returns an object
  //   after transformation. The function can do lookups, field mappings,
  //   remove fields, add fields, etc. If it adds fields, it should push
  //   them onto the fields array in the first parameter.
  // headerTransformer -- a function that gets called once after the
  //   header row is parsed. It takes one parameter, the header name, and
  //   returns the header that should be used for the column. An example
  //   would be to transform first_name to firstName, which is a required
  //   field in Spoke.
  const { rowTransformer, headerTransformer } = options || {};
  Papa.parse(file, {
    header: true,
    ...(headerTransformer && { transformHeader: headerTransformer }),
    skipEmptyLines: true,
    // eslint-disable-next-line no-shadow, no-unused-vars
    complete: ({ data: parserData, meta, errors }, file) => {
      const fields = meta.fields;
      const missingFields = [];

      let data = parserData;
      let transformerResults = {
        rows: [],
        fields: []
      };
      if (rowTransformer) {
        transformerResults = parserData.reduce((results, originalRow) => {
          const { row, addedFields } = rowTransformer(fields, originalRow);
          results.rows.push(row);
          addedFields.forEach(field => {
            if (!fields.includes(field)) {
              fields.push(field);
            }
          });
          return results;
        }, transformerResults);
        data = transformerResults.rows;
      }

      for (const field of requiredUploadFields) {
        if (fields.indexOf(field) === -1) {
          missingFields.push(field);
        }
      }

      let hasVanIdCol = false;
      let hasContactsPhoneCol = false;
      for (const field of fields) {
        const van_id_fields = [
          "VanID",
          "vanid",
          "van_id",
          "myc_van_id",
          "myv_van_id"
        ];
        const contacts_phone_id_fields = [
          "contactsPhoneId",
          "contacts_phone_id",
          "contactsphoneid",
          "phone_id",
          "phoneid"
        ];

        if (van_id_fields.indexOf(field) > -1) {
          hasVanIdCol = true;
        }

        if (contacts_phone_id_fields.indexOf(field) > -1) {
          hasContactsPhoneCol = true;
        }
      }

      if (!hasVanIdCol) {
        missingFields.push("van_id");
      }

      if (!hasContactsPhoneCol) {
        missingFields.push("contacts_phone_id");
      }

      if (missingFields.length > 0) {
        const error = `Missing fields: ${missingFields.join(", ")}`;
        onCompleteCallback({ error });
      } else {
        const { validationStats, validatedData } = getValidatedData(data);

        const customFields = fields.filter(
          field => topLevelUploadFields.indexOf(field) === -1
        );

        const contactsWithCustomFields = organizationCustomFields(
          validatedData,
          customFields
        );

        onCompleteCallback({
          customFields,
          validationStats,
          contacts: contactsWithCustomFields
        });
      }
    }
  });
};

export const parseCannedResponseCsv = (
  file,
  availableActions,
  onCompleteCallback,
  options
) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    // eslint-disable-next-line no-shadow, no-unused-vars
    complete: ({ data: parserData, meta, errors }, file) => {
      const requiredFields = ["Title", "Script"];

      const missingFields = requiredFields.filter(
        f => meta.fields.indexOf(f) == -1
      );

      if (missingFields.length) {
        onCompleteCallback({
          error: "Missing fields: " + missingFields.join(", ")
        });

        return;
      }

      let cannedResponseRows = parserData;

      const titleLabel = meta.fields.find(f => f.toLowerCase() == "title");
      const scriptLabel = meta.fields.find(f => f.toLowerCase() == "script");
      const actionsLabel = meta.fields.find(f => f.toLowerCase() == "actions");

      const cannedResponses = [];

      // Loop through canned responses in CSV
      for (var i in cannedResponseRows) {
        const response = cannedResponseRows[i];

        // Get basic details of canned response
        const newCannedResponse = {
          title: response[titleLabel].trim(),
          text: response[scriptLabel].trim()
        };

        if (!newCannedResponse.title || !newCannedResponse.text) {
          continue;
        }

        // If there are actions and an action provided, add them
        if (availableActions.length && actionsLabel && response[actionsLabel]) {
          const actionsString = response[actionsLabel];
          const responseActions = [];

          // Split the actions by comma
          const actionsArray = actionsString
            .split(",")
            .map(a => a.trim())
            .filter(a => !!a);

          if (actionsArray.length > 3) {
            onCompleteCallback({
              error: `Too many actions for canned response '${newCannedResponse.title}.`
            });

            return;
          }

          // Loop through actions in CSV row
          for (var j in actionsArray) {
            let action = availableActions[0];
            let actionDataLabel =
              actionsArray[j] && actionsArray[j].trim().toLowerCase();

            // If multiple actions, find the one they were referring to.
            // (You don't need to provide an action if there's only one)
            if (availableActions.length > 1) {
              const actionDetails = actionsArray[j]
                .split("-")
                .map(t => t.trim().toLowerCase());

              action = availableActions.find(
                a =>
                  a.displayName.toLowerCase() == actionDetails[0] ||
                  a.name.toLowerCase() == actionDetails[0]
              );

              // Set the actionDataLabel to the correct value if it was specified
              actionDataLabel = actionDetails[1];
            }

            if (action) {
              const newAction = {};

              if (action.clientChoiceData && action.clientChoiceData.length) {
                // If action requires client choice data, check that a choice was provided
                if (actionDataLabel) {
                  newAction.action = action.name;

                  const actionData = action.clientChoiceData.find(
                    c => c.name.toLowerCase() == actionDataLabel
                  );

                  if (actionData) {
                    newAction.actionData = JSON.stringify({
                      label: actionData.name,
                      value: actionData.details
                    });
                  } else {
                    onCompleteCallback({
                      error: `Action ${actionDataLabel} for response ${newCannedResponse.title} could not be mapped.`
                    });

                    return;
                  }
                } else {
                  log.error({ action, actionDataLabel }, actionsArray[j]);
                  onCompleteCallback({
                    error: `Actions for canned response "${newCannedResponse.title}" are incomplete. Action: ${action.name}.`
                  });

                  return;
                }
              } else {
                // If action does not require client choice data
                newAction.action = action.name;
              }

              if (newAction.action) {
                responseActions.push(newAction);
              }
            }
          }

          newCannedResponse.actions = responseActions;
        }

        cannedResponses.push(newCannedResponse);
      }

      onCompleteCallback({
        error: null,
        cannedResponses
      });
    }
  });
};
