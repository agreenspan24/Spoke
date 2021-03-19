import React from "react";
import GSSelectField from "../../components/forms/GSSelectField";
import type from "prop-types";

export const additionalRequiredFields = ["VanID", "vanPhoneId"];

export class ContactLoaderSettings extends React.Component {
  render() {
    return (
      <GSSelectField
        name="contactLoaderSettingsVanDatabaseMode"
        floatingLabelText="NGP VAN Database Mode"
        default={this.props.campaign.vanDatabaseMode}
        placeholder={`Default is ${"TODO"}`}
        type="select"
        choices={[
          { value: 0, label: "My Voters" },
          { value: 1, label: "My Campaign" }
        ]}
      />
    );
  }
}

ContactLoaderSettings.propTypes = {
  onChange: type.func,
  campaign: type.object
};
