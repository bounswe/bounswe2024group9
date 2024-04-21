import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WikidataSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQValue, setSelectedQValue] = useState(null);
  const navigation = useNavigation();

  const searchWikidata = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/wiki_search/search/' + searchTerm);
      const data = await response.json();
      const results = data.results.bindings.map(result => ({
        itemLabel: result.itemLabel.value,
        description: result.description ? result.description.value : 'No description available',
        totalMatches: parseInt(result.totalMatches.value),
        Q: result.item.value,
      }));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching Wikidata:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      searchWikidata();
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

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Search Wikidata"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {searchResults.map((result, index) => (
        <TouchableOpacity key={index} onPress={() => handleResultClick(index)}>
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>{result.itemLabel}</Text>
            <Text>{result.description}</Text>
            <Text>Total Matches: {result.totalMatches}</Text>
          </View>
        </TouchableOpacity>
      ))}
      {selectedQValue && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Selected Q Value:</Text>
          <Text>{selectedQValue}</Text>
        </View>
      )}
    </View>
  );
};

export default WikidataSearch;
