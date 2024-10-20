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
    const userInfo = { username, name: '', email, password, is_superuser: false };
    try {
      if (!subscribe) {
        Alert.alert('You must agree to KVKK to continue!');
      } else {
        const response = await fetch('/django_app/signup/', {
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
            navigation.navigate('Feed', { username });
          }, 2000);
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
      <Text style={styles.titleText}>Create New Account</Text>
      <Text style={styles.loginText}>
        Already registered?
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.signupButton}> Log in here.</Text>
        </TouchableOpacity>
      </Text>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
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
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setSubscribe(!subscribe)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View
              style={[
                styles.checkbox,
                { backgroundColor: subscribe ? '#00BFFF' : 'transparent' }, // Light blue when checked
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#00BFFF',
    fontSize: 50,
    textAlign: 'center',
    marginTop: 60,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#00BFFF',
    marginBottom: 20,
  },
  scrollView: {
    width: '100%',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 10,
    alignSelf: 'center',
  },
  label: {
    marginBottom: 2,
    color: '#00BFFF',
    textAlign: 'left',
  },
  signupButton: {
    color: '#00BFFF',
    textDecorationLine: 'underline',
    marginBottom: -3,
  },
  input: {
    textAlign: 'left',
    height: 50,
    borderColor: '#00BFFF',
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#F0F8FF',
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
    backgroundColor: '#00BFFF',
    borderColor: '#00BFFF',
  },
  buttonText: {
    color: 'white',
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
});

export default Signup;
