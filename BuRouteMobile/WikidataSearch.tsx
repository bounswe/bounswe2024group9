import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Modal, Button, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NodeCreationPage from './NodeCreationPage';
import Config from 'react-native-config';

const WikidataSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedQValue, setSelectedQValue] = useState(null);
  const [isConsistent, setConsistency] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const [selectedMode, setSelectedMode] = useState('Places'); // Default to Places

  let callTimeout;

  const fetchNodes = async () => {
    try {
      const response = await fetch(Config.REACT_APP_API_URL+'/database_search/nodes/');
      const jsonData = await response.json();
      console.log("JSON Data:", jsonData);

      if (!Array.isArray(jsonData)) {
        console.error('Expected an array but received:', jsonData);
        return;
      }

      const transformedNodes = jsonData.map(item => ({
        id: item.pk,
        name: item.fields.name,
        photo: item.fields.photo,
        latitude: parseFloat(item.fields.latitude),
        longitude: parseFloat(item.fields.longitude)
      }));

      console.log("Transformed Nodes:", transformedNodes); // Debugging: Log the transformed nodes
      setNodes(transformedNodes);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    }
  };

  const searchWikidata = async () => {
    console.log('making api call with ' + searchTerm);
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    try {
      const lowercaseTerm = searchTerm.toLowerCase(); 
      const response = await fetch(Config.REACT_APP_API_URL+'/wiki_search/search/' + lowercaseTerm);
      const data = await response.json();
      if (data.results.bindings.length === 0) {
        fetchNodes();
      } else {
        const results = data.results.bindings.map(result => ({
          itemLabel: result.itemLabel.value,
          description: result.description ? result.description.value : 'No description available',
          totalMatches: parseInt(result.totalMatches.value),
          Q: result.item.value,
        }));
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching Wikidata:', error);
    }
  };

  useEffect(() => {
    callTimeout = setTimeout(() => {
      searchWikidata();
    }, 500);

    return () => {
      clearTimeout(callTimeout);
    }
  }, [searchTerm]);
  const getLastItem = (thePath) => thePath.substring(thePath.lastIndexOf('/') + 1);

  const handleResultClick = async (index) => {
    const selectedItem = searchResults[index];
    const qValue = getLastItem(selectedItem.Q);
    setSelectedQValue(qValue);
    console.log(qValue);
    try {
      const response = await fetch(Config.REACT_APP_API_URL+'/wiki_search/results/' + qValue);
      const data = await response.json();
      navigation.navigate('SearchResultDetail', { result: data });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleCustomNodeClick = (node) => {
    navigation.navigate('NodeDetails', { result: node });
  };

  const handleConfirmCreate = () => {
    navigation.navigate('NodeCreationPage');
    console.log('Creating new information page...');
    setShowModal(false);
  };

  const handleCancelCreate = () => {
    setShowModal(false);
  };

  const handleCreatePage = () => {
    setShowModal(true);
  };
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    // Trigger search when mode changes
    searchWikidata();
  };

return (
  <ScrollView style={{ flex: 1, padding: 20 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
    <Button title="Places" onPress={() => handleModeChange('Places')} color={selectedMode === 'Places' ? 'green' : 'black'} />
    <Button title="Routes" onPress={() => handleModeChange('Routes')} color={selectedMode === 'Routes' ? 'green' : 'black'} />
    </View>
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
          </View>
        </TouchableOpacity>
      ))
    ) : (
      nodes.map((node, index) => (
        <TouchableOpacity key={index} onPress={() => handleCustomNodeClick(node)}>
          <View style={{ marginTop: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}>
            <Text style={{ fontWeight: 'bold' }}>Node Name: {node.name}</Text>
            <Text>Photo: {node.photo}</Text>
            <Text>Latitude: {node.latitude}</Text>
            <Text>Longitude: {node.longitude}</Text>
          </View>
        </TouchableOpacity>
      ))
    )}
    {searchResults.length === 0 && (
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
  </ScrollView>
);
};

export default WikidataSearch;
