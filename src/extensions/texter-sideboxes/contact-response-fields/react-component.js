import type from "prop-types";
import React from "react";
import yup from "yup";
import Form from "react-formal";
import GSTextField from "../../../components/forms/GSTextField";
import GSForm from "../../../components/forms/GSForm";
import { withRouter } from "react-router";
import loadData from "../../../containers/hoc/load-data";
import gql from "graphql-tag";

export const displayName = () => "Contact Response Fields";

export const showSidebox = ({ contact, messageStatusFilter, settingsData }) => {
  // Return anything False-y to not show
  // Return anything Truth-y to show
  // Return 'popup' to force a popup on mobile screens (instead of letting it hide behind a button)
  return (
    contact &&
    settingsData.contactResponseFields &&
    settingsData.contactResponseFields.length &&
    messageStatusFilter !== "needsMessage"
  );
};

const schema = yup.object({
  responses: yup.array().of(
    yup.object({
      field: yup.string(),
      response: yup.string()
    })
  )
});

class TexterSideboxClass extends React.Component {
  constructor(props) {
    super(props);

    const { contact, settingsData } = props;
    const { contactResponseFields } = settingsData;
    const savedResponses =
      (contact.responses && JSON.parse(contact.responses)) || {};

    const defaultValues = contactResponseFields.map(f => ({
      field: f,
      response: savedResponses[f] || ""
    }));

    // Track the responses that are currently saved, so we can know if the Save button should be enabled.
    this.state = {
      savedResponses: defaultValues,
      formValues: { responses: defaultValues }
    };
  }

  saveContactResponseFields = async formValues => {
    await this.props.mutations.saveContactResponses(formValues.responses);

    // After saving, update the current saved responses
    this.setState({
      savedResponses: formValues.responses
    });
  };

  shouldDisableButton = () => {
    for (var i in this.state.savedResponses) {
      const currentResponse = this.state.formValues.responses.find(
        r => r.field === this.state.savedResponses[i].field
      );

      if (currentResponse.response !== this.state.savedResponses[i].response) {
        return false;
      }
    }

    return true;
  };

  render() {
    const { contactResponseFields } = this.props.settingsData;

    return (
      <GSForm
        schema={schema}
        onSubmit={this.saveContactResponseFields}
        value={this.state.formValues}
        onChange={formValues => this.setState({ formValues })}
      >
        {contactResponseFields &&
          contactResponseFields.map((field, index) => (
            <div key={index}>
              {/* Hidden Field for Field Name */}
              <Form.Field
                style={{ display: "none" }}
                name={`responses[${index}].field`}
              />
              <Form.Field
                label={field}
                name={`responses[${index}].response`}
                fullWidth
              />
            </div>
          ))}
        <Form.Button
          type="submit"
          label="Save"
          disabled={this.shouldDisableButton()}
          fullWidth
        />
      </GSForm>
    );
  }
}

export const mutations = {
  saveContactResponses: ownProps => responses => ({
    mutation: gql`
      mutation saveContactResponses(
        $campaignContactId: String!
        $responses: [ContactResponse]
      ) {
        saveContactResponses(
          campaignContactId: $campaignContactId
          responses: $responses
        )
      }
    `,
    variables: {
      campaignContactId: ownProps.contact.id,
      responses
    }
  })
};

export const TexterSidebox = loadData({ mutations })(
  withRouter(TexterSideboxClass)
);

TexterSidebox.propTypes = {
  // data
  contact: type.object,
  campaign: type.object,
  assignment: type.object,
  texter: type.object,

  // parent state
  disabled: type.bool,
  navigationToolbarChildren: type.object,
  messageStatusFilter: type.string
};

export const adminSchema = () => ({
  contactResponseFields: yup.array().of(yup.string())
});

export class AdminConfig extends React.Component {
  // This function creates a dynamic set of inputs, where if an input is cleared, it disappears
  updateResponseFields(index, val) {
    const { contactResponseFields } = this.props.settingsData;

    let newResponseFields = contactResponseFields
      ? contactResponseFields.slice(0)
      : [];
    newResponseFields[index] = val;

    // Filter out empty fields
    newResponseFields = newResponseFields.filter(f => !!f);

    this.props.onToggle("contactResponseFields", newResponseFields);
  }

  render() {
    const { settingsData } = this.props;
    const { contactResponseFields } = settingsData;

    const contactResponseFieldsWithExtra = contactResponseFields
      ? contactResponseFields.slice(0)
      : [];

    // We always want to show one extra input, so you can start a new one
    contactResponseFieldsWithExtra.push("");

    return (
      <div>
        {contactResponseFieldsWithExtra &&
          contactResponseFieldsWithExtra.map((field, index) => (
            <GSTextField
              key={index}
              value={field}
              onChange={val => this.updateResponseFields(index, val)}
              fullWidth
              hintText="Field Name"
            />
          ))}
      </div>
    );
  }
}

AdminConfig.propTypes = {
  settingsData: type.object,
  onToggle: type.func
};
