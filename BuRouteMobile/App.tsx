import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';
import { DisplayResults } from './SearchResults.tsx'


const WikidataSearch = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  // timeout mechanism for search results
  const prevSearchTerm = useRef('')

  const changePage = () => {
  // placeholder function
    Alert.alert(
    'Change page',
    'Change page'
    )
  }

    const searchWikidata = async () => {
    console.log("doing api call")
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

        if (searchTerm.trim() !== '') setSearchResults(results);
      } catch (error) {
        console.error('Error searching Wikidata:', error);
      }
    };


  // Call searchWikidata when searchTerm changes or when you want to trigger a search
  useEffect(() => {
    if (searchTerm.trim() !== '' && prevSearchTerm.current.trim() !== '') {
          searchWikidata();
          prevSearchTerm.current = searchTerm
        }
    else setSearchResults([]);
  }, [searchTerm]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Search Wikidata"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title='Clear' onPress={() => {setSearchResults([])}} />
{searchResults.map((result, index) => (
        <View key={index} style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={changePage}>
          <Text style={{ fontWeight: 'bold' }}>{result.itemLabel}</Text>
          <Text>{result.description}</Text>
          <Text>Total Matches: {result.totalMatches}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default WikidataSearch;
