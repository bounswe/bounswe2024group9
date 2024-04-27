import React, { useState } from 'react';
import { View, TextInput, Button, Image } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const NodeCreationPage = ({ navigation }) => {
  const [nodeName, setNodeName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleChoosePhoto = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      console.log('Response = ', response); // Debug: log the full response

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri }; // Accessing the first asset for its URI
        console.log('Selected image URI:', source.uri); // Debug: log the selected image URI
        setSelectedImage(source);
      } else {
        console.log('No assets found or error in response');
      }
    });
  };

const handleCreateNode = async () => {
    if (!selectedImage || !nodeName || !latitude || !longitude) {
        console.log('All fields are required');
        return;
    }

    const formData = new FormData();
    formData.append('name', nodeName);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);

    const photo = {
      uri: selectedImage.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    };

    formData.append('photo', photo);

    console.log('Sending data...');

    try {
        const response = await fetch('http://10.0.2.2:8000/database_search/create_node/', {
                                        method: 'POST',
                                        body: formData,
                                        headers: {
                                             'Content-Type': 'multipart/form-data',
                                        },
        });

        const responseJson = await response.json();
        if (response.status === 200) {
            console.log('Node creation success:', responseJson);
            navigation.goBack();
        } else {
            console.log('Node creation failed:', responseJson);
        }
    } catch (error) {
        console.error('Error posting node:', error);
    }
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
      <Button title="Choose Photo" onPress={handleChoosePhoto} />
      {selectedImage && (
        <Image source={selectedImage} style={{ width: 200, height: 200, marginTop: 10, borderRadius: 5 }} />
      )}
      <Button title="Create Node" onPress={handleCreateNode} />
    </View>
  );
};

export default NodeCreationPage;
