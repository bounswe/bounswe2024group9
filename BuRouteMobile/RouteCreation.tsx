import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, Button, Alert, FlatList, StyleSheet } from 'react-native';

interface Node {
  node_id: number;
  name: string;
  latitude: number;
  longitude: number;
  photo: string;
  description?: string;
}

const CreateRoute = ({ route }) => {
  const { currentUser } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [routeNodes, setRouteNodes] = useState<Node[]>([]);

      const getLastItem = (thePath) => {
        if (thePath.endsWith('/')) {
          thePath = thePath.slice(0, -1);
        }
        const numericPart = thePath.replace(/\D/g, '');
        return numericPart;
      };

  useEffect(() => {
    if (searchTerm.length > 2) {
      const searchWikidata = async () => {
        try {
          const response = await fetch(`http://10.0.2.2:8000/wiki_search/search/${searchTerm}`);
          const data = await response.json();
          const results = data.results.bindings.map(result => ({
            node_id: getLastItem(result.item.value),
            name: result.itemLabel.value,
            latitude: 0,
            longitude: 0,
            photo: '',
            description: result.description ? result.description.value : 'No description available'
          }));
          setSearchResults(results);
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

  const saveRoute = async () => {
    if (routeNodes.length === 0) {
      Alert.alert('Please add at least one node to the route.');
      return;
    }

    const postData = {
      title,
      description,
      photos: [],
      rating: 0, // Update this if you want to include rating functionality
      likes: 0,
      comments: [],
      saves: 0,
      node_ids: routeNodes.map(node => node.node_id).join(', '),
      node_names: routeNodes.map(node => node.name).join(', '),
      duration: [],
      duration_between: [],
      mapView: 'Your Map View URL',
      user: currentUser.user_id,
    };

    try {
      const response = await fetch('http://10.0.2.2:8000/database_search/create_route/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Route saved successfully');
        setTitle('');
        setDescription('');
        setRouteNodes([]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error posting route:', error);
      Alert.alert('Error', 'Failed to save route');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Route</Text>
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
        data={searchResults.slice(0, 3)} // Limit to 3 search results
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
