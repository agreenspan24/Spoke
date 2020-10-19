import type from "prop-types";
import React from "react";
import yup from "yup";
import Form from "react-formal";
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";
import CircularProgress from "material-ui/CircularProgress";
import { css, StyleSheet } from "aphrodite";
import {
  flexStyles,
  inlineStyles
} from "../../../components/AssignmentTexter/StyleControls";

export const displayName = () => "Popup Page Link";

export const showSidebox = ({ contact, messageStatusFilter, settingsData }) =>
  contact &&
  messageStatusFilter !== "needsMessage" &&
  settingsData.popupPageButtonText &&
  settingsData.popupPageIframeUrl;

const styles = StyleSheet.create({
  dialog: {
    paddingTop: 0,
    zIndex: 5000
  },
  dialogContentStyle: {
    width: "100%" // Still exists a maxWidth of 768px
  },
  iframe: {
    height: "80vh",
    width: "100%",
    border: "none"
  },
  loader: {
    paddingTop: 50,
    paddingLeft: "calc(50% - 25px)"
  }
});

export class TexterSidebox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      iframeLoading: true
    };
  }

  openDialog = () => {
    this.setState({
      dialogOpen: true
    });
  };

  closeDialog = () => {
    this.setState({
      dialogOpen: false,
      iframeLoading: true
    });
  };

  buildUrlParamString = urlParams => {
    return _.map(
      urlParams,
      (val, key) => `${key}=${encodeURIComponent(val)}`
    ).join("&");
  };

  render() {
    const { settingsData } = this.props;
    const popupPageIframeUrl = this.props.getMessageTextFromScript(
      settingsData.popupPageIframeUrl
    );

    return (
      <div>
        <FlatButton
          label={settingsData.popupPageButtonText}
          onClick={() => this.setState({ dialogOpen: true })}
          className={css(flexStyles.flatButton)}
          labelStyle={inlineStyles.flatButtonLabel}
        />
        <Dialog
          actions={[
            <FlatButton
              label="Cancel"
              primary={true}
              onClick={this.closeDialog}
            />
          ]}
          open={this.state.dialogOpen}
          onRequestClose={this.closeDialog}
          className={css(styles.dialog)}
          contentClassName={css(styles.dialogContentStyle)}
        >
          {this.state.iframeLoading ? (
            <CircularProgress size={50} className={css(styles.loader)} />
          ) : (
            ""
          )}
          <iframe
            className={css(styles.iframe)}
            src={encodeURI(popupPageIframeUrl)}
            onLoad={() => this.setState({ iframeLoading: false })}
            style={{
              display: this.state.iframeLoading ? "none" : "block"
            }}
          />
        </Dialog>
      </div>
    );
  }
}

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
  popupPageButtonText: yup.string(),
  popupPageIframeUrl: yup.string()
});

export class AdminConfig extends React.Component {
  render() {
    return (
      <div>
        <Form.Field
          name="popupPageButtonText"
          label="Set the button text for your popup page"
          fullWidth
        />
        <Form.Field
          type="script"
          name="popupPageIframeUrl"
          label="Set the url for your popup page. Please add any custom contact fields you need."
          fullWidth
        />
      </div>
    );
  }
}

AdminConfig.propTypes = {};
