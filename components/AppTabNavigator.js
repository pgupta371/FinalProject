import React from 'react'
import { Image } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { AppStackNavigator } from './AppStackNavigator'
import BookRequestScreen from '../screens/BookRequestScreen';


export const AppTabNavigator = createBottomTabNavigator({
  JobsAvailable : {
    screen: AppStackNavigator,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/unnamed.png")} style={{width:30, height:20}}/>,
      tabBarLabel : "Jobs Available",
    }
  },
  AddAJobPost: {
    screen: BookRequestScreen,
    navigationOptions :{
      tabBarIcon : <Image source={require("../assets/11.png")} style={{width:20, height:20}}/>,
      tabBarLabel : "Add a Job Post",
    }
  }
});
