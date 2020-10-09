import PropTypes from "prop-types";
import React from "react";
import { List, ListItem } from "material-ui/List";
import { Tabs, Tab } from "material-ui/Tabs";
import SearchBar from "material-ui-search-bar";
import theme from "../../styles/theme";
import moment from "moment";

const inlineStyles = {
  contactsListParent: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "100%"
  },
  contactListScrollContainer: {
    overflow: "hidden scroll"
  },
  contactsListSearch: {
    marginTop: 10
  },
  updatedAt: {
    fontSize: 12,
    width: "auto",
    top: "auto",
    margin: "0 4px"
  }
};

class AssignmentContactsList extends React.Component {
  constructor(props) {
    super(props);

    const { currentContact } = this.props;

    this.state = {
      search: "",
      messageStatus: currentContact.messageStatus
    };
  }

  getContactListItemId(id) {
    return `switch-to-contact-id-${id}`;
  }

  componentDidMount() {
    const { currentContact } = this.props;

    const node = document.getElementById(
      this.getContactListItemId(currentContact.id)
    );

    // Scroll the list item element to center if possible, so it's always displayed in the sidebar
    if (node) {
      node.scrollIntoView({
        block: "center"
      });
    }
  }

  render() {
    const { contacts, updateCurrentContactById, currentContact } = this.props;

    // Filter contacts by message status and search
    const filteredContacts = contacts.filter(
      c =>
        `${c.firstName} ${c.lastName}`
          .toLowerCase()
          .includes(this.state.search.toLowerCase()) &&
        c.messageStatus === this.state.messageStatus
    );

    moment.updateLocale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%ds",
        ss: "%ds",
        m: "%dm",
        mm: "%dm",
        h: "%dh",
        hh: "%dh",
        d: "%dd",
        dd: "%dd",
        w: "%dw",
        ww: "%dw",
        M: "%dmo",
        MM: "%dmo",
        y: "%dy",
        yy: "%dy"
      }
    });

    return (
      <div style={inlineStyles.contactsListParent}>
        <Tabs
          value={this.state.messageStatus}
          onChange={messageStatus => this.setState({ messageStatus })}
        >
          <Tab label="Respond" value="needsResponse" />
          <Tab label="Past" value="convo" />
          <Tab label="Skipped" value="closed" />
        </Tabs>
        <SearchBar
          onChange={search => this.setState({ search: search || "" })}
          onRequestSearch={() => undefined}
          value={this.state.search}
          style={inlineStyles.contactsListSearch}
        />
        <List style={inlineStyles.contactListScrollContainer}>
          {filteredContacts.map(contact => (
            <ListItem
              key={contact.id}
              id={this.getContactListItemId(contact.id)}
              primaryText={`${contact.firstName} ${contact.lastName}`}
              rightIcon={
                <span style={inlineStyles.updatedAt}>
                  {moment.utc(contact.updated_at).fromNow()}
                </span>
              }
              disabled={contact.id === currentContact.id}
              onClick={() => updateCurrentContactById(contact.id)}
              style={{
                color: theme.colors.coreTextColor,
                backgroundColor:
                  contact.id === currentContact.id
                    ? theme.colors.coreBackgroundColorDisabled
                    : null
              }}
            />
          ))}
        </List>
      </div>
    );
  }
}

AssignmentContactsList.propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.object),
  currentContact: PropTypes.object,
  updateCurrentContactById: PropTypes.func
};

export default AssignmentContactsList;
