import React, { useState } from 'react';
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
  TouchableOpacity,
  Linking,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';

type Props = {
  navigation: NavigationProp<any>;
};

const Signup = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subscribe, setSubscribe] = useState(false);

  const handleSubmit = async () => {
    const userInfo = { username, email, password1: password, password2: password };
    
    try {
      if (!subscribe) {
        Alert.alert('You must agree to KVKK to continue!');
      } else {
        const response = await fetch('http://10.0.2.2:8000/signup/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        });
  
        const json = await response.json();
        if (response.ok) {
          Alert.alert('User saved successfully!');
          setTimeout(() => {
            navigation.navigate('QuestionList', { username });
          }, 2000);
        } else {
          Alert.alert(json.error || 'Failed to save user.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Failed to save user.');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const openKVKKTerms = () => {
    Linking.openURL('https://www.resmigazete.gov.tr/eskiler/2018/03/20180310-5.htm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Create New Account</Text>
        </View>
        <Text style={styles.loginText}>
          Already registered?
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.signupButton}> Log in here.</Text>
          </TouchableOpacity>
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#9E9E9E"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9E9E9E"
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
            placeholderTextColor="#9E9E9E"
          />
        </View>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setSubscribe(!subscribe)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View
              style={[
                styles.checkbox,
                { backgroundColor: subscribe ? '#00BFFF' : 'transparent' },
              ]}
            />
            <Text style={{ marginLeft: 8 }}>
              I agree to the{' '}
              <Text style={styles.linkText} onPress={openKVKKTerms}>
                KVKK terms
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableHighlight onPress={handleSubmit} activeOpacity={0.6} underlayColor="#ADD8E6">
            <View style={styles.button}>
              <Text style={styles.buttonText}>SUBMIT</Text>
            </View>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  titleText: {
    color: '#00BFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loginText: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: '#555',
    fontSize: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00BFFF',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#00BFFF',
  },
  linkText: {
    color: '#00BFFF',
    textDecorationLine: 'underline',
  },
  signupButton: {
    color: '#00BFFF',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
});

export default Signup;
