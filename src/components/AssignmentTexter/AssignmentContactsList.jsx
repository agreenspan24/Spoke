import PropTypes from "prop-types";
import React from "react";
import { List, ListItem } from "material-ui/List";

const AssignmentContactsList = function AssignmentContactsList(props) {
  const { contacts, updateCurrentContactById, currentContact } = props;
  console.log(contacts);
  return (
    <List>
      {contacts.map(contact => (
        <ListItem
          key={contact.id}
          primaryText={`${contact.firstName} ${contact.lastName}`}
          disabled={contact.id === currentContact.id}
          onClick={() => updateCurrentContactById(contact.id)}
        />
      ))}
    </List>
  );
};

AssignmentContactsList.propTypes = {
  contacts: PropTypes.arrayOf(PropTypes.object),
  currentContact: PropTypes.object,
  updateCurrentContactById: PropTypes.func
};

export default AssignmentContactsList;
