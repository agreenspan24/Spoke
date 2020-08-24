import type from "prop-types";
import React from "react";
import { StyleSheet, css } from "aphrodite";
import yup from "yup";
import GSForm from "./forms/GSForm";
import Form from "react-formal";
import FlatButton from "material-ui/FlatButton";
import { dataTest } from "../lib/attributes";
import theme from "../styles/theme";
import IconButton from "material-ui/IconButton";
import HelpIconOutline from "material-ui/svg-icons/action/help-outline";
import RaisedButton from "material-ui/RaisedButton";
import DeleteIcon from "material-ui/svg-icons/action/delete";

const styles = StyleSheet.create({
  buttonRow: {
    marginTop: 12,
    marginRight: 12,
    display: "inline-block"
  },
  infoMessage: {
    color: theme.colors.darkGray
  },
  errorMessage: {
    color: theme.colors.red
  },
  pullRight: {
    float: "right",
    position: "relative",
    top: "10px",
    icon: "pointer"
  },
  flex: {
    display: "flex"
  },
  actionColumn: {
    marginRight: 24,
    flexGrow: 1
  },
  buttonAlign: {
    verticalAlign: "bottom"
  }
});

class CannedResponseForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      formValues: {
        ...props.defaultValue,
        actions: props.defaultValue.actions
          ? props.defaultValue.actions.map(a => ({
              action: a.action,
              actionData:
                typeof a.actionData === "string"
                  ? JSON.parse(a.actionData)
                  : a.actionData
            }))
          : []
      }
    };
  }

  handleSave = formValues => {
    const { onSaveCannedResponse } = this.props;

    onSaveCannedResponse({
      ...formValues,
      actions: formValues.actions.map(a => ({
        action: a.action,
        actionData:
          typeof a.actionData !== "string"
            ? JSON.stringify(a.actionData)
            : a.actionData
      }))
    });
  };

  handleFormChange = formValues => {
    this.setState({
      formValues: {
        ...this.state.formValues,
        ...formValues
      }
    });
  };

  addAction = () => {
    const actions = this.state.formValues.actions.slice(0);
    actions.push({
      action: this.props.availableActions[0].name
    });

    this.setState({
      formValues: {
        ...this.state.formValues,
        actions: actions
      }
    });
  };

  deleteAction = index => {
    const actions = this.state.formValues.actions.slice(0);

    actions.splice(index, 1);

    this.setState({
      formValues: {
        ...this.state.formValues,
        actions: actions
      }
    });
  };

  renderActionRow = (action, index) => {
    const { availableActions } = this.props;

    const selectedAction = this.props.availableActions.find(
      x => x.name == action.action
    );

    let clientChoiceData;
    let instructions;

    if (selectedAction) {
      clientChoiceData = selectedAction.clientChoiceData;
      instructions = selectedAction.instructions;
    }

    return (
      <div key={index} className={css(styles.flex)}>
        <div className={css(styles.actionColumn)}>
          <Form.Field
            {...dataTest("selectedAction")}
            floatingLabelText="Action handler"
            name={`actions[${index}].action`}
            type="select"
            choices={availableActions.map(action => ({
              value: action.name,
              label: action.displayName
            }))}
          />
          <IconButton
            className={css(styles.buttonAlign)}
            tooltip="An action is something that is triggered by this answer being chosen, often in an outside system"
          >
            <HelpIconOutline />
            <div></div>
          </IconButton>
          {instructions ? (
            <div className={css(styles.infoMessage)}>{instructions}</div>
          ) : null}
        </div>
        {clientChoiceData && clientChoiceData.length ? (
          <div className={css(styles.actionColumn)}>
            <Form.Field
              {...dataTest("selectedActionData")}
              hintText="Start typing to search for the data to use with the answer action"
              floatingLabelText="Answer Action Data"
              name={`actions[${index}].actionData`}
              type="autocomplete"
              choices={clientChoiceData.map(item => ({
                value: item.details,
                label: item.name
              }))}
              fullWidth
            />
            {!action.actionData ? (
              <div className={css(styles.errorMessage)}>
                Action requires additional data. Please select something.
              </div>
            ) : null}
          </div>
        ) : null}
        <IconButton
          className={css(styles.pullRight)}
          onClick={() => this.deleteAction(index)}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    );
  };

  render() {
    const modelSchema = yup.object({
      title: yup.string().required(),
      text: yup.string().required(),
      actions: yup.array().of(
        yup.object({
          action: yup.string(),
          actionData: yup.object({
            value: yup.string(),
            label: yup.string()
          })
        })
      )
    });

    const {
      customFields,
      handleCloseAddForm,
      formButtonText,
      availableActions
    } = this.props;

    const actions = this.state.formValues.actions;

    return (
      <div>
        <GSForm
          ref="form"
          schema={modelSchema}
          onChange={this.handleFormChange}
          onSubmit={this.handleSave}
          value={this.state.formValues}
        >
          <Form.Field
            {...dataTest("title")}
            name="title"
            autoFocus
            fullWidth
            label="Title"
          />
          <Form.Field
            {...dataTest("editorResponse")}
            customFields={customFields}
            name="text"
            type="script"
            label="Script"
            multiLine
            fullWidth
          />
          {this.state.formValues.actions && this.state.formValues.actions.length
            ? this.state.formValues.actions.map((a, idx) =>
                this.renderActionRow(a, idx)
              )
            : ""}

          <div>
            <FlatButton
              {...dataTest("addResponse")}
              label={formButtonText}
              backgroundColor={theme.colors.green}
              labelStyle={{ color: "white" }}
              className={css(styles.buttonRow)}
              onClick={() => {
                this.refs.form.submit();
              }}
            />
            {availableActions && availableActions.length && (
              <RaisedButton
                {...dataTest("addAction")}
                label="+ Add Action"
                onClick={this.addAction}
                className={css(styles.buttonRow)}
                disabled={actions && actions.length >= 3}
              />
            )}
            <FlatButton
              label="Cancel"
              onTouchTap={handleCloseAddForm}
              className={css(styles.buttonRow)}
            />
          </div>
        </GSForm>
      </div>
    );
  }
}

CannedResponseForm.propTypes = {
  onSaveCannedResponse: type.func,
  handleCloseAddForm: type.func,
  customFields: type.array,
  formButtonText: type.string,
  defaultValue: type.object,
  availableActions: type.array
};

export default CannedResponseForm;
