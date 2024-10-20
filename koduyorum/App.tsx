import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WikidataSearch from './src/WikidataSearch';
import SearchResultDetail from './src/SearchResultDetail';
import Login from './src/Login';
import Signup from './src/Signup.tsx';
import QuestionList from './src/QuestionList.tsx';
import Feed from './src/Feed.tsx';
import QuestionCard from './src/QuestionCard.tsx';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="">
        <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Signup" 
            component={Signup}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;