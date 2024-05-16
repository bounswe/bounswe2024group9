import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Button, Alert, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';

interface Node {
  node_id: number;
  name: string;
  latitude: number;
  longitude: number;
  photo: string;
  description?: string;
}

const CreateRoute = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [routeNodes, setRouteNodes] = useState<Node[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (searchTerm.length > 2) {
      const fetchNodes = async () => {
        try {
          const response = await fetch(`${Config.REACT_APP_API_URL}/database_search/nodes/?search=${searchTerm}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Failed to fetch nodes:', error);
        }
      };

      const searchWikidata = async () => {
        try {
          const response = await fetch(`${Config.REACT_APP_API_URL}/wiki_search/search/${searchTerm}`);
          const data = await response.json();
          if (data.results.bindings.length === 0) {
            fetchNodes();
          } else {
            const results = data.results.bindings.map(result => ({
              node_id: parseInt(result.item.value.split('/').pop(), 10), // Ensure node_id is a valid number
              name: result.itemLabel.value,
              latitude: 0,  // Placeholder, as latitude is not provided
              longitude: 0, // Placeholder, as longitude is not provided
              photo: '',    // Placeholder, as photo is not provided
              description: result.description ? result.description.value : 'No description available'
            }));
            setSearchResults(results);
          }
        } catch (error) {
          console.error('Error searching Wikidata:', error);
        }
      };

      const callTimeout = setTimeout(() => {
        searchWikidata();
      }, 500);

      return () => {
        clearTimeout(callTimeout);
      };
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addNodeToRoute = (node: Node) => {
    if (!routeNodes.find(n => n.node_id === node.node_id)) {
      setRouteNodes([...routeNodes, node]);
    } else {
      Alert.alert('Node already added');
    }
  };

  const saveRoute = () => {
    const routeData = {
      title,
      description,
      nodes: routeNodes.map(node => node.node_id),
    };

    fetch(`${Config.REACT_APP_API_URL}/database_search/routes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData),
    })
      .then(response => response.json())
      .then(data => {
        Alert.alert('Success', 'Route saved successfully');
        setTitle('');
        setDescription('');
        setRouteNodes([]);
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Error', 'Failed to save route');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Route</Text>
      <TextInput
        style={styles.input}
        placeholder="Route Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Search POI"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.node_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addNodeToRoute(item)}>
            <View style={styles.searchResult}>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>{item.description || `Latitude: ${item.latitude}, Longitude: ${item.longitude}`}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No search results</Text>}
      />
      <TextInput
        style={styles.input}
        placeholder="Add Description"
        value={description}
        onChangeText={setDescription}
      />
      <View style={styles.routeNodesContainer}>
        <Text style={styles.subTitle}>Selected Points of Interest</Text>
        <FlatList
          data={routeNodes}
          keyExtractor={(item) => item.node_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.routeNode}>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={saveRoute} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  searchResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  routeNodesContainer: {
    marginTop: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  routeNode: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default CreateRoute;
