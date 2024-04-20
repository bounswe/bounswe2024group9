import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text } from 'react-native';

const WikidataSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

    const searchWikidata = async () => {
      try {
        const response = await fetch('http://10.0.2.2:8000/wiki_search/search/' + searchTerm, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (!data.results || !data.results.bindings) {
          throw new Error('Malformed response data');
        }

        const results = data.results.bindings.map(result => ({
          itemLabel: result.itemLabel.value,
          description: result.description ? result.description.value : 'No description available',
          totalMatches: parseInt(result.totalMatches.value)
        }));

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching Wikidata:', error);
      }
    };


  // Call searchWikidata when searchTerm changes or when you want to trigger a search
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      searchWikidata();
    }
  }, [searchTerm]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Search Wikidata"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={searchWikidata} />

      {/* Display search results */}
      {searchResults.map((result, index) => (
        <View key={index} style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>{result.itemLabel}</Text>
          <Text>{result.description}</Text>
          <Text>Total Matches: {result.totalMatches}</Text>
        </View>
      ))}
    </View>
  );
};

export default WikidataSearch;
