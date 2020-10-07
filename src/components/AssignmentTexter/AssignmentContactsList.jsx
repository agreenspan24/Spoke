import PropTypes from "prop-types";
import React from "react";
import { List, ListItem } from "material-ui/List";
import { Tabs, Tab } from "material-ui/Tabs";
import SearchBar from "material-ui-search-bar";
import theme from "../../styles/theme";

class AssignmentContactsList extends React.Component {
  constructor(props) {
    super(props);

    const { currentContact } = this.props;

    this.state = {
      search: "",
      messageStatus: currentContact.messageStatus
    };
  }

  componentDidMount() {
    const { currentContact } = this.props;

    setTimeout(() => {
      document
        .getElementById(`switch-to-contact-id-${currentContact.id}`)
        .scrollIntoView({
          block: "center"
        });
    }, 0);
  }

  render() {
    const { contacts, updateCurrentContactById, currentContact } = this.props;

    // Get the currently selected conversation and put it first
    let filteredContacts = [];

    // Filter the rest of the conversations based on matching the search and message status
    filteredContacts = filteredContacts.concat(
      contacts.filter(
        c =>
          `${c.firstName} ${c.lastName}`
            .toLowerCase()
            .includes(this.state.search.toLowerCase()) &&
          c.messageStatus === this.state.messageStatus
      )
    );

    return (
      <div
        style={{ display: "flex", flexDirection: "column", maxHeight: "100%" }}
      >
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
          style={{ marginTop: 10 }}
        />
        <List style={{ overflow: "hidden scroll" }} ref="contactListContainer">
          {filteredContacts.map(contact => (
            <ListItem
              key={contact.id}
              id={`switch-to-contact-id-${contact.id}`}
              primaryText={`${contact.firstName} ${contact.lastName}`}
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
