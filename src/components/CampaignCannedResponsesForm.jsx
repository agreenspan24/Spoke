import type from "prop-types";
import React from "react";
import CampaignCannedResponseForm from "./CampaignCannedResponseForm";
import FlatButton from "material-ui/FlatButton";
import Form from "react-formal";
import GSForm from "./forms/GSForm";
import { List, ListItem } from "material-ui/List";
import Divider from "material-ui/Divider";
import CampaignFormSectionHeading from "./CampaignFormSectionHeading";
import DeleteIcon from "material-ui/svg-icons/action/delete";
import CreateIcon from "material-ui/svg-icons/content/create";
import IconButton from "material-ui/IconButton";
import yup from "yup";
import theme from "../styles/theme";
import { StyleSheet, css } from "aphrodite";
import { dataTest } from "../lib/attributes";
import { parseCannedResponseCsv } from "../lib";
import RaisedButton from "material-ui/RaisedButton";

const styles = StyleSheet.create({
  formContainer: {
    ...theme.layouts.greenBox,
    maxWidth: "100%",
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
    paddingLeft: 10,
    marginTop: 15,
    textAlign: "left"
  },
  form: {
    backgroundColor: theme.colors.white,
    padding: 10
  },
  exampleImageInput: {
    cursor: "pointer",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: "100%",
    opacity: 0
  }
});

export default class CampaignCannedResponsesForm extends React.Component {
  state = {
    showForm: false,
    formButtonText: "",
    responseId: null,
    uploading: false,
    uploadError: null
  };

  formSchema = yup.object({
    cannedResponses: yup.array().of(
      yup.object({
        title: yup.string(),
        text: yup.string(),
        actions: yup.array().of(
          yup.object({
            label: yup.string(),
            value: yup.string()
          })
        )
      })
    )
  });

  getCannedResponseId = () => {
    return Math.random()
      .toString(36)
      .replace(/[^a-zA-Z1-9]+/g, "");
  };

  clearCannedResponses = () => {
    this.props.onChange({
      cannedResponses: []
    });
  };

  handleUpload = event => {
    event.preventDefault();

    const file = event.target.files[0];
    const availableActions = this.props.availableActions;

    if (!file) return;

    this.setState({ uploading: true, uploadError: null }, () => {
      parseCannedResponseCsv(
        file,
        availableActions,
        ({ error, cannedResponses }) => {
          if (error) {
            this.setState({
              uploading: false,
              uploadError: error
            });
          } else {
            this.props.onChange({
              cannedResponses: this.props.formValues.cannedResponses.concat(
                cannedResponses.map(r => ({
                  ...r,
                  id: this.getCannedResponseId()
                }))
              )
            });

            this.setState({
              uploading: false
            });
          }
        }
      );
    });
  };

  showAddForm() {
    const handleCloseAddForm = () => {
      this.setState({ showForm: false });
    };

    if (this.state.showForm) {
      return (
        <div className={css(styles.formContainer)}>
          <div className={css(styles.form)}>
            <CampaignCannedResponseForm
              defaultValue={
                this.props.formValues.cannedResponses.find(
                  res => res.id === this.state.responseId
                ) || {}
              }
              formButtonText={this.state.formButtonText}
              handleCloseAddForm={handleCloseAddForm}
              onSaveCannedResponse={ele => {
                const newVals = this.props.formValues.cannedResponses.slice(0);
                const newEle = {
                  ...ele
                };
                if (!this.state.responseId) {
                  newEle.id = this.getCannedResponseId();
                  newVals.push(newEle);
                } else {
                  const resToEditIndex = newVals.findIndex(
                    res => res.id === this.state.responseId
                  );
                  newVals[resToEditIndex] = newEle;
                }
                this.props.onChange({
                  cannedResponses: newVals
                });
                this.setState({ showForm: false });
              }}
              customFields={this.props.customFields}
              availableActions={this.props.availableActions}
            />
          </div>
        </div>
      );
    }
    return (
      <FlatButton
        {...dataTest("newCannedResponse")}
        secondary
        label="Add new canned response"
        icon={<CreateIcon />}
        onClick={() =>
          this.setState({
            showForm: true,
            responseId: null,
            formButtonText: "Add Response"
          })
        }
      />
    );
  }

  listItems(cannedResponses) {
    const availableActions = this.props.availableActions;

    const listItems = cannedResponses.map(response => (
      <ListItem
        {...dataTest("cannedResponse")}
        value={response.text}
        key={response.id}
        primaryText={response.title}
        secondaryText={
          <div>
            {response.actions && response.actions.length ? (
              <div>
                {`Actions: ${response.actions
                  .map(a => {
                    const parsed = JSON.parse(a.actionData).label;
                    const action = availableActions.find(
                      x => x.name == a.action
                    );
                    return `${(action || {}).displayName}${
                      parsed ? ` (${parsed})` : ""
                    }`;
                  })
                  .join(", ")}`}
              </div>
            ) : (
              ""
            )}
            <div>{response.text}</div>
          </div>
        }
        rightIconButton={
          <span>
            <IconButton
              onClick={() =>
                this.setState({
                  showForm: true,
                  responseId: response.id,
                  formButtonText: "Edit Response"
                })
              }
            >
              <CreateIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                const newVals = this.props.formValues.cannedResponses
                  .map(responseToDelete => {
                    if (responseToDelete.id === response.id) {
                      return null;
                    }
                    return responseToDelete;
                  })
                  .filter(ele => ele !== null);

                this.props.onChange({
                  cannedResponses: newVals
                });
              }}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        }
        secondaryTextLines={2}
      />
    ));
    return listItems;
  }

  render() {
    const { formValues, availableActions } = this.props;
    const cannedResponses = formValues.cannedResponses;
    const list =
      cannedResponses.length === 0 ? null : (
        <List>
          {this.listItems(cannedResponses)}
          <Divider />
        </List>
      );

    return (
      <GSForm
        schema={this.formSchema}
        value={formValues}
        onChange={this.props.onChange}
        onSubmit={this.props.onSubmit}
      >
        <CampaignFormSectionHeading
          title="Canned responses for texters"
          subtitle="Save some scripts for your texters to use to answer additional FAQs that may come up outside of the survey questions and scripts you already set up."
        />
        <div>
          <RaisedButton
            label={
              this.state.uploading
                ? "Uploading..."
                : cannedResponses.length
                ? "Clear Canned Responses"
                : "Upload Canned Responses"
            }
            labelPosition="before"
            disabled={this.state.uploading}
            onClick={() =>
              cannedResponses.length
                ? this.clearCannedResponses()
                : this.uploadButton.click()
            }
          />
          <input
            id="canned-response-upload"
            ref={input => input && (this.uploadButton = input)}
            type="file"
            className={css(styles.exampleImageInput)}
            onChange={this.handleUpload}
            accept=".csv"
            style={{ display: "none" }}
          />
          <div style={{ marginTop: 12, color: theme.colors.red }}>
            {this.state.uploadError}
          </div>
          <div style={{ margin: "12px 0px" }}>
            Upload a CSV with column headers including Title and Script.
            {availableActions
              ? " An Actions column is optional, with comma-delimited actions."
              : ""}
            {availableActions && availableActions.length > 1
              ? ' Since there are multiple possible action types, please specify the action type and data in the format of "action - actionChoice, action - actionChoice"'
              : ""}
          </div>
        </div>
        {list}
        {this.showAddForm()}
        <Form.Button
          type="submit"
          disabled={this.props.saveDisabled}
          label={this.props.saveLabel}
        />
      </GSForm>
    );
  }
}

CampaignCannedResponsesForm.propTypes = {
  saveLabel: type.string,
  saveDisabled: type.bool,
  onSubmit: type.func,
  onChange: type.func,
  formValues: type.object,
  customFields: type.array,
  availableActions: type.array
};
