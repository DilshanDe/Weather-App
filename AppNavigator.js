import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';


const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          options={{ headerShown: false }} 
          component={HomeScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

