import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SectionList, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import dummyContacts from './dummyContacts';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState({
    givenName: '',
    familyName: '',
    phoneNumbers: [],
  });
  const [editedContact, setEditedContact] = useState({
    givenName: '',
    familyName: '',
    phoneNumbers: [],
  });

  useEffect(() => {
    fetchContacts();
  }, [searchText]);

  const fetchContacts = async () => {
    const filteredContacts = dummyContacts.filter((contact) => {
      const fullName = `${contact.firstName} ${contact.lastName}`;
      return fullName.toLowerCase().includes(searchText.toLowerCase());
    });

    const sortedContacts = filteredContacts.sort((a, b) =>
      a.firstName.localeCompare(b.firstName)
    );

    const sections = createSections(sortedContacts);
    setContacts(sections);
  };

  const createSections = (sortedContacts) => {
    const sections = [];
    let currentLetter = '';

    sortedContacts.forEach((contact) => {
      const firstLetter = contact.firstName.charAt(0).toUpperCase();
      if (firstLetter !== currentLetter) {
        currentLetter = firstLetter;
        sections.push({ title: currentLetter, data: [contact] });
      } else {
        sections[sections.length - 1].data.push(contact);
      }
    });

    return sections;
  };

  const renderItem = ({ item }) => {
    const { firstName, lastName, phoneNumbers } = item;

    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => showDialog(firstName, lastName, phoneNumbers)}
      >
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <FontAwesome name="user-circle" size={24} color="white" style={styles.contactIcon} />
            <View>
              <Text style={styles.contactName}>{`${firstName} ${lastName}`}</Text>
              {phoneNumbers && phoneNumbers.length > 0 && (
                <Text style={styles.contactPhone}>{phoneNumbers[0].number}</Text>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editContact(firstName, lastName, phoneNumbers)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteContact(firstName, lastName)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const showDialog = (firstName, lastName, phoneNumbers) => {
    setSelectedContact({ givenName: firstName, familyName: lastName, phoneNumbers });
    setEditedContact({ givenName: firstName, familyName: lastName, phoneNumbers });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setSelectedContact({ givenName: '', familyName: '', phoneNumbers: [] });
    setEditedContact({ givenName: '', familyName: '', phoneNumbers: [] });
  };

  const editContact = (firstName, lastName, phoneNumbers) => {
    setSelectedContact({ givenName: firstName, familyName: lastName, phoneNumbers });
    setEditedContact({ givenName: firstName, familyName: lastName, phoneNumbers });
    setDialogVisible(true);
  };

  const updateContact = () => {
    const updatedContacts = contacts.map((section) => {
      const updatedData = section.data.map((contact) => {
        if (
          contact.firstName === selectedContact.givenName &&
          contact.lastName === selectedContact.familyName
        ) {
          return { ...contact, phoneNumbers: editedContact.phoneNumbers };
        }
        return contact;
      });
      return { ...section, data: updatedData };
    });

    setContacts(updatedContacts);
    hideDialog();
  };

  const deleteContact = (firstName, lastName) => {
    // Implement the delete functionality here
    // Remove the contact from the contacts state
    const updatedContacts = contacts.map((section) => {
      const filteredData = section.data.filter(
        (contact) =>
          contact.firstName !== firstName || contact.lastName !== lastName
      );
      return { ...section, data: filteredData };
    });
    setContacts(updatedContacts);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <SectionList
        sections={contacts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />

      <Modal isVisible={dialogVisible} onBackdropPress={hideDialog}>
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>Contact Details</Text>
          <TextInput
            style={styles.dialogInput}
            placeholder="First Name"
            value={editedContact.givenName}
            onChangeText={(text) => setEditedContact({ ...editedContact, givenName: text })}
          />
          <TextInput
            style={styles.dialogInput}
            placeholder="Last Name"
            value={editedContact.familyName}
            onChangeText={(text) => setEditedContact({ ...editedContact, familyName: text })}
          />
          <TextInput
            style={styles.dialogInput}
            placeholder="Phone Number"
            value={editedContact.phoneNumbers[0]?.number}
            onChangeText={(text) =>
              setEditedContact({
                ...editedContact,
                phoneNumbers: [{ number: text }],
              })
            }
          />
          <TouchableOpacity style={styles.updateButton} onPress={updateContact}>
            <Text style={styles.updateButtonText}> Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dismissButton} onPress={hideDialog}>
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#222',
  },
  sectionHeader: {
    backgroundColor: '#222',
    padding: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  contactIcon: {
    marginRight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    backgroundColor: '#444',
  },
  contactInfo: {
    flex: 1,
    marginRight: 10,
    color: '#fff',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  contactPhone: {
    fontSize: 14,
    color: '#bbb',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#222',
  },
  searchInput: {
    backgroundColor: '#555',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
  },
  dialogContainer: {
    backgroundColor: '#444',
    padding: 20,
    borderRadius: 8,
  },
  dialogTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    color: '#fff',
  },
  dialogInput: {
    backgroundColor: '#555',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: '#55ACEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
    width: '15%',
  },
  updateButtonText: {
    color: '#fff',
  },
  dismissButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#55ACEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 10,
  },
  editButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
  },
});
