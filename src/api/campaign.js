import gql from "graphql-tag";

// TODO: rename phoneNumbers to messagingServiceNumbers or something like that
export const schema = gql`
  input CampaignsFilter {
    isArchived: Boolean
    campaignId: Int
    campaignIds: [Int]
    listSize: Int
    pageSize: Int
    searchString: String
  }

  type TexterUIConfig {
    options: String
    sideboxChoices: [String]
  }

  input TexterUIConfigInput {
    options: String
    sideboxChoices: [String]
  }

  type ErrorStat {
    code: String!
    count: Int!
    link: String
    description: String
  }

  type CampaignStats {
    sentMessagesCount: Int
    receivedMessagesCount: Int
    optOutsCount: Int
    needsMessageCount: Int
    needsResponseCount: Int
    unassignedNeedsMessageCount: Int
    unassignedNeedsResponseCount: Int
    errorCounts: [ErrorStat]
  }

  type CampaignCompletionStats {
    assignedCount: Int
    contactsCount: Int
    errorCount: Int
    messagedCount: Int
    needsResponseCount: Int
  }

  type IngestMethod {
    name: String!
    displayName: String
    clientChoiceData: String
    success: Boolean
    result: String
    reference: String
    contactsCount: Int
    deletedOptouts: Int
    deletedDupes: Int
    updatedAt: Date
  }

  type JobRequest {
    id: String
    jobType: String
    assigned: Boolean
    status: Int
    resultMessage: String
  }

  type ActionChoice {
    name: String!
    details: String!
  }

  type Action {
    name: String
    displayName: String
    instructions: String
    clientChoiceData: [ActionChoice]
  }

  type CampaignPhoneNumberCount {
    areaCode: String!
    count: Int!
  }

  input CampaignPhoneNumberInput {
    areaCode: String!
    count: Int!
  }

  type SubmitAction {
    action: String
    actionData: String
  }

  type Campaign {
    id: ID
    organization: Organization
    title: String
    description: String
    joinToken: String
    batchSize: Int
    responseWindow: Float
    dueBy: Date
    isStarted: Boolean
    isArchived: Boolean
    isArchivedPermanently: Boolean
    creator: User
    texters: [User]
    assignments(assignmentsFilter: AssignmentsFilter): [Assignment]
    interactionSteps: [InteractionStep]
    contacts: [CampaignContact]
    contactsCount: Int
    hasUnassignedContacts: Boolean
    hasUnassignedContactsForTexter: Boolean
    hasUnsentInitialMessages: Boolean
    customFields: [String]
    cannedResponses(userId: String): [CannedResponse]
    texterUIConfig: TexterUIConfig
    stats: CampaignStats
    completionStats: CampaignCompletionStats
    pendingJobs: [JobRequest]
    ingestMethodsAvailable: [IngestMethod]
    ingestMethod: IngestMethod
    availableActions: [Action]
    useDynamicAssignment: Boolean
    introHtml: String
    primaryColor: String
    logoImageUrl: String
    editors: String
    cacheable: Boolean
    overrideOrganizationTextingHours: Boolean
    textingHoursEnforced: Boolean
    textingHoursStart: Int
    textingHoursEnd: Int
    timezone: String
    messageserviceSid: String
    useOwnMessagingService: Boolean
    phoneNumbers: [String]
    vanDatabaseMode: Int
    inventoryPhoneNumberCounts: [CampaignPhoneNumberCount]
    firstReplyAction: SubmitAction
  }

  type CampaignsList {
    campaigns: [Campaign]
  }

  union CampaignsReturn = PaginatedCampaigns | CampaignsList

  type PaginatedCampaigns {
    campaigns: [Campaign]
    pageInfo: PageInfo
  }
`;
