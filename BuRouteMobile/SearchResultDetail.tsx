import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Config from 'react-native-config';

const SearchResultDetail = ({ route, navigation }) => {
  const { results, nearby, period } = route.params.result;

  const getLastItem = (thePath) => thePath.substring(thePath.lastIndexOf('/') + 1);

  let mainResult = {};
  let description = '';
  let imageUrl = '';
  let latitude = '';
  let longitude = '';
  let wikipediaLink = '';

  if (results.results.bindings.length > 0) {
    mainResult = results.results.bindings[0];

    try {
      description = mainResult['description'].value;
    } catch (error) {
      console.error("Error retrieving description:", error);
    }

    try {
      imageUrl = mainResult['image'].value;
      console.log(imageUrl);
    } catch (error) {
      console.error("Error retrieving image URL:", error);
    }

    try {
      latitude = mainResult['latitude'].value;
    } catch (error) {
      console.error("Error retrieving latitude:", error);
    }

    try {
      longitude = mainResult['longitude'].value;
    } catch (error) {
      console.error("Error retrieving longitude:", error);
    }

    try {
      wikipediaLink = mainResult['article'].value;
    } catch (error) {
      console.error("Error retrieving Wikipedia link:", error);
    }
  }

  const handleItemClick = async (newContent) => {
    const response = await fetch(Config.REACT_APP_API_URL + '/wiki_search/results/' + getLastItem(newContent['item'].value));
    const data = await response.json();
    navigation.push('SearchResultDetail', { result: data });
  };

  const openWikipediaPage = () => {
    if (wikipediaLink) {
      Linking.openURL(wikipediaLink);
    } else {
      console.log('Wikipedia link not found');
    }
  };

  const renderRecommendations = (sectionData) => {
    if (sectionData && sectionData.results && sectionData.results.bindings.length > 0) {
      return sectionData.results.bindings.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => handleItemClick(item)}>
          <View style={styles.item}>
            <Text>{item['itemLabel'].value}</Text>
          </View>
        </TouchableOpacity>
      ));
    }
    return <Text>No additional data found.</Text>;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location:</Text>
      <Text>Latitude: {latitude}</Text>
      <Text>Longitude: {longitude}</Text>

      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
            />
          )}
          {wikipediaLink && (
            <TouchableOpacity onPress={openWikipediaPage} style={styles.wikipediaButton}>
              <Text style={styles.wikipediaButtonText}>Wikipedia Page</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView style={styles.descriptionContainer}>
          <Text>{description}</Text>
          <Text style={styles.title}>Nearby:</Text>
          <View style={styles.column}>
            {renderRecommendations(nearby)}
          </View>
          <Text style={styles.title}>Historical Periods:</Text>
          <View style={styles.column}>
            {renderRecommendations(period)}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 20,
    position: 'relative',
  },
  image: {
    width: 200,
    height: 200,
  },
  descriptionContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  column: {
    flexDirection: 'column',
    marginTop: 10,
  },
  item: {
    marginTop: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  wikipediaButton: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'blue',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  wikipediaButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SearchResultDetail;
