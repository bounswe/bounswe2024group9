import React from 'react';
import { View, Text, Image } from 'react-native';

const SearchResultDetail = ({ route }) => {
  const { results } = route.params.result;

  console.log(results);

  const description = results.results.bindings[0]['description'].value;
  const imageUrl = results.results.bindings[0]['image'].value; // Assuming this is the URL of the image

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>{description}</Text>
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 200, height: 200 }} // Adjust the width and height as needed
      />
    </View>
  );
};
export default SearchResultDetail;
