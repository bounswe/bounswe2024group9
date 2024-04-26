/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  TouchableHighlight,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  Alert,
  View,
  Text,
} from 'react-native';

// Function to generate random initial values (for demonstration)
const getRandomEmail = () =>
  `user${Math.floor(Math.random() * 1000)}@example.com`;
const getRandomUsername = () => `user${Math.floor(Math.random() * 1000)}`;
const getRandomPassword = () => `password${Math.floor(Math.random() * 1000)}`;

function App() {
  const [email, setEmail] = useState(getRandomEmail());
  const [username, setUsername] = useState(getRandomUsername());
  const [password, setPassword] = useState(getRandomPassword());

  const handleSubmit = async () => {
    const userInfo = {email, username, password};
    const isValidUsername = /^[a-zA-Z0-9]{5,16}$/.test(username);

    if (!(isValidUsername || username === '')) {
      console.log('invalid username');
      Alert.alert('Failed to save user.');
    } else {
      try {
        //console.log(email, username, password);
        const response = await fetch('https://10.0.2.2:8000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        });
        const json = await response.json();
        console.log('Success:', json);
        Alert.alert('User saved successfully!');
      } catch (error) {
        console.error('Error:', error);
        Alert.alert('Failed to save user.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text
        style={{
          color: 'black',
          fontSize: 60,
          textAlign: 'center',
          marginTop: 60,
          fontWeight: 'bold',
        }}>
        Create New Account
      </Text>
      <Text
        style={{
          color: 'black',
          marginBottom: 20,
        }}>
        Already registered? Log in here.
      </Text>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={true}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight
            onPress={handleSubmit}
            activeOpacity={0.6}
            underlayColor="#DDDDDD">
            <View style={styles.button}>
              <Text style={styles.buttonText}>SUBMIT</Text>
            </View>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 10,
    alignSelf: 'center', // Center the input container horizontally
  },
  label: {
    marginBottom: 2,
    color: 'black',
    textAlign: 'left',
  },
  scrollView: {
    width: '100%',
  },
  input: {
    textAlign: 'left',
    height: 50,
    borderColor: 'gray',
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#e0eaFF',
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 58,
    borderRadius: 17,
    borderWidth: 2,
    backgroundColor: '#e0eaFF',
  },
  buttonText: {
    color: 'black',
  },
});

export default App;
