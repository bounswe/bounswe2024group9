import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NodeCreationPage from './NodeCreationPage';

const WikidataSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQValue, setSelectedQValue] = useState(null);
  const navigation = useNavigation();
  const [isConsistent, setConsistency] = useState(true);
  const [showModal, setShowModal] = useState(false);

  let callTimeout

  const searchWikidata = async () => {
    console.log('making api call with ' + searchTerm)
    try {
      const response = await fetch('http://10.0.2.2:8000/wiki_search/search/' + searchTerm);
      const data = await response.json();
      const results = data.results.bindings.map(result => ({
        itemLabel: result.itemLabel.value,
        description: result.description ? result.description.value : 'No description available',
        totalMatches: parseInt(result.totalMatches.value),
        Q: result.item.value,
      }));
      if (isConsistent) setSearchResults(results);
    } catch (error) {
      console.error('Error searching Wikidata:', error);
    }
  };

  useEffect(() => {
    callTimeout = setTimeout(() => {
      if (searchTerm.trim() !== '') searchWikidata();
      else setSearchResults([]);
      setConsistency(false);
    }, 200);
    return () => {
      clearTimeout(callTimeout);
      setConsistency(true);
    }
  }, [searchTerm]);

  const handleResultClick = async (index) => {
    const selectedItem = searchResults[index];
    const qValue = getLastItem(selectedItem.Q);
    setSelectedQValue(qValue);

    try {
      const response = await fetch('http://10.0.2.2:8000/wiki_search/results/' + qValue);
      const data = await response.json();
      navigation.navigate('SearchResultDetail', { result: data });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const getLastItem = (thePath) => thePath.substring(thePath.lastIndexOf('/') + 1);

  const handleCreatePage = () => {
    setShowModal(true);
  };

  const handleConfirmCreate = () => {
    navigation.navigate('NodeCreationPage');
    console.log('Creating new information page...');
    setShowModal(false);
  };

  const handleCancelCreate = () => {
    setShowModal(false);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Search Wikidata"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {searchResults.length > 0 ? (
        searchResults.map((result, index) => (
          <TouchableOpacity key={index} onPress={() => handleResultClick(index)}>
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>{result.itemLabel}</Text>
              <Text>{result.description}</Text>
              <Text>Total Matches: {result.totalMatches}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Button
          title="Feeling bold?"
          onPress={handleCreatePage}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ marginBottom: 10 }}>Would you like to create a new node?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button title="Cancel" onPress={handleCancelCreate} />
              <Button title="Create" onPress={handleConfirmCreate} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WikidataSearch;
