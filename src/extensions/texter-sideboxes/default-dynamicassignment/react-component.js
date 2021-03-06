import type from "prop-types";
import React from "react";
import yup from "yup";
import Form from "react-formal";
import Badge from "material-ui/Badge";
import RaisedButton from "material-ui/RaisedButton";
import { withRouter } from "react-router";
import gql from "graphql-tag";
import Toggle from "material-ui/Toggle";
import loadData from "../../../containers/hoc/load-data";
import { inlineStyles } from "../../../components/AssignmentSummary";

export const displayName = () => "Dynamic Assignment Controls";

export const showSidebox = ({
  contact,
  campaign,
  assignment,
  texter,
  navigationToolbarChildren,
  messageStatusFilter,
  finished
}) => {
  // Return anything False-y to not show
  // Return anything Truth-y to show
  // Return 'popup' to force a popup on mobile screens (instead of letting it hide behind a button)
  if (
    finished &&
    campaign.useDynamicAssignment &&
    (assignment.hasUnassignedContactsForTexter ||
      messageStatusFilter === "needsMessage" ||
      assignment.unmessagedCount ||
      assignment.hasUnassignedRepliesForTexter) &&
    (messageStatusFilter === "needsMessage" ||
      messageStatusFilter === "needsResponse")
  ) {
    return "popup";
  }
};

export const showSummary = ({ campaign, assignment, settingsData }) =>
  campaign.useDynamicAssignment &&
  (assignment.hasUnassignedContactsForTexter ||
    assignment.hasUnassignedRepliesForTexter) &&
  !assignment.unmessagedCount &&
  assignment.maxContacts !== 0;

export class TexterSideboxClass extends React.Component {
  requestNewContacts = async () => {
    const { assignment, messageStatusFilter, campaign } = this.props;
    const didAddContacts = (
      await this.props.mutations.findNewCampaignContact(campaign.batchSize)
    ).data.findNewCampaignContact;

    console.log(
      "default-dynamicassignment:requestNewContacts added?",
      didAddContacts
    );

    if (didAddContacts && didAddContacts.found) {
      if (messageStatusFilter !== "needsMessage") {
        this.gotoInitials();
      } else {
        this.props.refreshData();
      }
    }
  };

  requestNewReplies = async () => {
    const { messageStatusFilter } = this.props;
    const didAddContacts = (
      await this.props.mutations.findNewCampaignContact(75, "needsResponse")
    ).data.findNewCampaignContact;

    if (didAddContacts && didAddContacts.found) {
      if (messageStatusFilter === "needsResponse") {
        this.props.refreshData();
      } else {
        this.gotoReplies();
      }
    }
  };

  gotoInitials = () => {
    const { campaign, assignment } = this.props;
    this.props.router.push(
      `/app/${campaign.organization.id}/todos/${assignment.id}/text`
    );
  };

  gotoReplies = () => {
    const { campaign, assignment } = this.props;
    this.props.router.push(
      `/app/${campaign.organization.id}/todos/${assignment.id}/reply`
    );
  };

  gotoTodos = () => {
    const { campaign } = this.props;
    this.props.router.push(`/app/${campaign.organization.id}/todos`);
  };

  render() {
    // request new batch (only if )
    // if new messageStatusFilter==needsResponse, then we should redirect to needsMessage
    //    so maybe just *always*
    // goto replies link: when finished and in needsMessage but NOT hasUnassignedContactsForTexter
    // return to Todos (only if in contact finish view)
    const {
      campaign,
      assignment,
      contact,
      settingsData,
      messageStatusFilter
    } = this.props;
    // need to see whether they have already texted anyone and if there are replies
    const nextBatchMessage =
      assignment.allContactsCount === 0
        ? "Start texting with your first batch"
        : settingsData.dynamicAssignmentRequestMoreMessage ||
          "Finished sending all your messages, and want to send more?";
    const nextBatchMoreLabel =
      assignment.allContactsCount === 0
        ? "Start texting"
        : settingsData.dynamicAssignmentRequestMoreLabel || "Send more texts";

    const headerStyle = messageStatusFilter ? { textAlign: "center" } : {};
    return (
      <div style={headerStyle}>
        {assignment.hasUnassignedContactsForTexter &&
        !settingsData.dynamicAssignmentAssignRepliesOnly ? (
          <div style={{ marginBottom: "8px", paddingLeft: "12px" }}>
            <h3>{nextBatchMessage}</h3>
            <RaisedButton
              label={nextBatchMoreLabel}
              primary
              onClick={this.requestNewContacts}
            />
          </div>
        ) : null}
        {assignment.hasUnassignedRepliesForTexter &&
        settingsData.dynamicAssignmentAssignRepliesOnly ? (
          <div style={{ marginBottom: "8px", paddingLeft: "12px" }}>
            <h3>
              Get a batch of up to 75 unassigned conversations that need a reply
            </h3>
            <RaisedButton
              label="Send Unanswered Replies"
              primary
              onClick={this.requestNewReplies}
            />
          </div>
        ) : null}
        {messageStatusFilter === "needsMessage" && assignment.unrepliedCount ? (
          <div style={{ marginBottom: "8px", paddingLeft: "12px" }}>
            <Badge
              badgeStyle={{ ...inlineStyles.badge }}
              badgeContent={assignment.unrepliedCount}
              primary={true}
              secondary={false}
            >
              <RaisedButton label="Go To Replies" onClick={this.gotoReplies} />
            </Badge>
          </div>
        ) : null}
        {messageStatusFilter &&
        messageStatusFilter !== "needsMessage" &&
        assignment.unmessagedCount ? (
          <div style={{ marginBottom: "8px", paddingLeft: "12px" }}>
            <Badge
              badgeStyle={{ ...inlineStyles.badge }}
              badgeContent={assignment.unmessagedCount}
              primary={true}
              secondary={false}
            >
              <RaisedButton
                label="Send first texts"
                onClick={this.gotoInitials}
              />
            </Badge>
          </div>
        ) : null}
        {contact /*the empty list*/ ? (
          <div style={{ marginBottom: "8px" }}>
            <RaisedButton label="Back To Todos" onClick={this.gotoTodos} />
          </div>
        ) : null}
      </div>
    );
  }
}

TexterSideboxClass.propTypes = {
  router: type.object,
  mutations: type.object,

  // data
  contact: type.object,
  campaign: type.object,
  assignment: type.object,
  texter: type.object,

  // parent state
  navigationToolbarChildren: type.object,
  messageStatusFilter: type.string
};

export const mutations = {
  findNewCampaignContact: ownProps => (numberContacts, messageStatus) => ({
    mutation: gql`
      mutation findNewCampaignContact(
        $assignmentId: String!
        $numberContacts: Int!
        $messageStatus: String
      ) {
        findNewCampaignContact(
          assignmentId: $assignmentId
          numberContacts: $numberContacts
          messageStatus: $messageStatus
        ) {
          found
          assignment {
            id
            hasUnassignedContactsForTexter
            hasUnassignedRepliesForTexter
          }
        }
      }
    `,
    variables: {
      assignmentId: ownProps.assignment.id,
      numberContacts,
      messageStatus
    }
  })
};

export const TexterSidebox = loadData({ mutations })(
  withRouter(TexterSideboxClass)
);

// This is a bit of a trick
// Normally we'd want to implement a separate component,
// but we have crafted it to work in both contexts.
// If you make changes, make sure you test in both!
export const SummaryComponent = TexterSidebox;

export const adminSchema = () => ({
  dynamicAssignmentAssignRepliesOnly: yup.boolean(),
  dynamicAssignmentRequestMoreLabel: yup.string(),
  dynamicAssignmentRequestMoreMessage: yup.string()
});

export class AdminConfig extends React.Component {
  render() {
    return (
      <div>
        <Toggle
          label="Assign Replies Only"
          toggled={this.props.settingsData.dynamicAssignmentAssignRepliesOnly}
          onToggle={(toggler, val) =>
            this.props.onToggle("dynamicAssignmentAssignRepliesOnly", val)
          }
        />
        <Form.Field
          name="dynamicAssignmentRequestMoreLabel"
          label="Request More Label"
          fullWidth
          hintText="default: Send more texts"
        />
        <Form.Field
          name="dynamicAssignmentRequestMoreMessage"
          label="Request More Top Message"
          fullWidth
          hintText="default: Finished sending all your messages, and want to send more?"
        />
      </div>
    );
  }
}

AdminConfig.propTypes = {
  settingsData: type.object,
  onToggle: type.func
};
