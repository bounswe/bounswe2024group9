import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const NodeCreationPage = ({ navigation }) => {
  const [nodeName, setNodeName] = useState('');
  const [nodeDescription, setNodeDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [inceptionYear, setInceptionYear] = useState('');

  const handleCreateNode = () => {
    console.log('Creating node with the following data:');
    console.log('Node Name:', nodeName);
    console.log('Node Description:', nodeDescription);
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    console.log('Inception Year:', inceptionYear);

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Node Name"
        value={nodeName}
        onChangeText={setNodeName}
      />
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Node Description"
        value={nodeDescription}
        onChangeText={setNodeDescription}
      />
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Latitude"
        value={latitude}
        onChangeText={setLatitude}
      />
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Longitude"
        value={longitude}
        onChangeText={setLongitude}
      />
      <TextInput
        style={{ marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 }}
        placeholder="Inception Year"
        value={inceptionYear}
        onChangeText={setInceptionYear}
      />
      <Button title="Create Node" onPress={handleCreateNode} />
    </View>
  );
};

export default NodeCreationPage;
