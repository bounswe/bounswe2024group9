import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';

type Props = {
  navigation: NavigationProp<any>;
  route: any;
};

const InterestPage = ({ navigation, route }: Props) => {
  const { user_id, username } = route.params;

  const [interests, setInterests] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);


  useEffect(() => {
    setInterests(['Machine Learning', 'Computer Vision', 'NLP', 'Web Development', 'Data Science', 'Recursion']);
    setLanguages(['C++', 'Python', 'Java', 'HTML', 'CSS']);
  }, []);

  const toggleSelection = (item: string, list: string[], setList: Function) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async () => {
    const userInfo = {
      user_id,
      interested_topics: selectedInterests,
      known_languages: selectedLanguages,
    };

    try {
      const response = await fetch('http://10.0.2.2:8000/interested_languages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      const json = await response.json();
      if (response.ok) {
        Alert.alert('Preferences saved successfully!');
        navigation.navigate('QuestionList', { user_id, username });
      } else {
        Alert.alert(json.error || 'Failed to save preferences.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Failed to save preferences.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Select Your Interests</Text>
        <View style={styles.listContainer}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.item,
                selectedInterests.includes(interest) ? styles.selectedItem : null,
              ]}
              onPress={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
            >
              <Text style={styles.itemText}>{interest}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.title}>Select Known Languages</Text>
        <View style={styles.listContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language}
              style={[
                styles.item,
                selectedLanguages.includes(language) ? styles.selectedItem : null,
              ]}
              onPress={() => toggleSelection(language, selectedLanguages, setSelectedLanguages)}
            >
              <Text style={styles.itemText}>{language}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00BFFF',
    marginBottom: 10,
  }, 
  listContainer: {
    marginBottom: 20,
  },
  item: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#00BFFF',
  },
  itemText: {
    fontSize: 16,
    color: '#555',
  },
  submitButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BFFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InterestPage;
