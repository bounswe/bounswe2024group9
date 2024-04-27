import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const NodeDetails = ({ route }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Node Details</Text>
      <Image source={{ uri: route.params.result.photo }} style={styles.image} />
      <Text style={styles.label}>Name: {route.params.result.name}</Text>
      <Text style={styles.label}>Latitude: {route.params.result.latitude}</Text>
      <Text style={styles.label}>Longitude: {route.params.result.longitude}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20
  },
  label: {
    fontSize: 18,
    marginBottom: 10
  }
});

export default NodeDetails;
