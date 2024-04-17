import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Button } from 'react-native';

// Function to generate random initial values (for demonstration)
const getRandomEmail = () => `user${Math.floor(Math.random() * 1000)}@example.com`;
const getRandomUsername = () => `user${Math.floor(Math.random() * 1000)}`;
const getRandomPassword = () => `password${Math.floor(Math.random() * 1000)}`;

function App() {
  const [email, setEmail] = useState(getRandomEmail());
  const [username, setUsername] = useState(getRandomUsername());
  const [password, setPassword] = useState(getRandomPassword());

    const handleSubmit = async () => {
      const userInfo = { email, username, password };
      try {
        const response = await fetch('http://10.0.2.2:8000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        });
        const json = await response.json();
        console.log('Success:', json);
        alert('User saved successfully!');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to save user.');
      }
    };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" />
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholder="Enter your username" />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry={true}
        />
        <Button title="Submit" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default App;
