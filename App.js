import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './app/screens/HomeScreen';
import LoginScreen from './app/screens/LoginScreen';
import RegisterTypeScreen from './app/screens/RegisterTypeScreen';
import UserRegistrationScreen from './app/screens/UserRegistrationScreen';
import TechnicianRegistrationScreen from './app/screens/TechnicianRegistrationScreen';
import InterfaceScreen from './app/screens/InterfaceScreen';
import ProfileScreen from './app/screens/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home" 
        screenOptions={{
          headerStyle: {
            backgroundColor: '#004581', // Màu nền của header
          },
          headerTintColor: '#8CC7DC', // Màu chữ trong header
          headerTitleStyle: {
            color: '#8CC7DC', // Màu chữ tiêu đề trong header
          },
          
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterType" component={RegisterTypeScreen} />
        <Stack.Screen name="UserRegistration" component={UserRegistrationScreen} />
        <Stack.Screen name="TechnicianRegistration" component={TechnicianRegistrationScreen} />
        <Stack.Screen name="Interface" component={InterfaceScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
