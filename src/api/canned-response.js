export const schema = `
  input CannedResponseActionInput {
    action: String
    actionData: String
  }

  type CannedResponseAction {
    action: String
    actionData: String
  }

  input CannedResponseInput {
    id: String
    title: String
    text: String
    campaignId: String
    userId: String
    actions: [CannedResponseActionInput]
  }

  type CannedResponse {
    id: ID
    title: String
    text: String
    isUserCreated: Boolean
    actions: [CannedResponseAction]
  }
`;
