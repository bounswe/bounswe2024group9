import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './src/Login';
import Signup from './src/Signup.tsx';
import QuestionList from './src/QuestionList.tsx';
import PostDetail from './src/PostDetail';
import WikiResultDetail from './src/WikiResultDetail';
import CreateQuestion from './src/CreateQuestion'; 
import LabelDetailsScreen from './src/LabelDetailScreen.tsx';
import InterestPage from './src/InterestPage.tsx';
import ProfilePage from './src/ProfilePage.tsx';
import TopContributorsPage from './src/TopContributorsPage.tsx';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="">
        <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
            name="Signup" 
            component={Signup}
            options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
            name="QuestionList" 
            component={QuestionList}
            options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetail} 
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen 
          name="WikiResultDetail" 
          component={WikiResultDetail} 
          options={{ headerShown: false , gestureEnabled: false}}
        />
        <Stack.Screen 
          name="CreateQuestion" 
          component={CreateQuestion} 
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen 
          name="LabelDetails" 
          component={LabelDetailsScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen 
          name="InterestPage" 
          component={InterestPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen 
          name="ProfilePage" 
          component={ProfilePage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen 
          name="TopContributors" 
          component={TopContributorsPage}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;