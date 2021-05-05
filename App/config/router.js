import React, { useState, useEffect } from 'react'
import { Text, TouchableOpacity, View, StyleSheet, Dimensions, Image } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home';
import _ from 'lodash'
import Albums from '../screens/Albums';
import Categories from '../screens/Categories';
import Settings from '../screens/Settings';
import { defColor } from './colorConfig';

const { width, height } = Dimensions.get('window')

const Tab = createBottomTabNavigator();

function Tabs({ navigation }) {

  return (
    <>
      <Tab.Navigator
        initialRouteName="Albums"
        tabBarOptions={{
          inactiveTintColor: 'gray',
          activeTintColor: defColor,
          showLabel: false,
          tabStyle: {
            backgroundColor: '#fff',
            height: 60,
            paddingBottom: 12,
            elevation: 15
          },
        }}>
        <Tab.Screen
          name="Albums"
          component={Albums}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <>
                <Icon
                  name={focused ? 'camera-burst' : 'camera-burst'}
                  size={28}
                  color={color}
                />
                <Text style={{ color: focused ? defColor : 'grey', fontFamily: 'Tajawal-Regular', }}> {'الالبومات'} </Text>
              </>
            ),
          }}
        />
        {/* <Tab.Screen
          name="Home"
          component={Home}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <>
                <Icon
                  name={focused ? 'tooltip-image' : 'tooltip-image-outline'}
                  size={28}
                  color={color}
                />
                <Text style={{ color: focused ? defColor : 'grey', fontFamily: 'Tajawal-Regular', }}> {'كل الملفات'} </Text>
              </>
            ),
          }}
        /> */}
        <Tab.Screen
          name="Categories"
          component={Categories}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <>
                <Icon
                  name={focused ? 'view-list' : 'view-list-outline'}
                  size={28}
                  color={color}
                />
                <Text style={{ color: focused ? defColor : 'grey', fontFamily: 'Tajawal-Regular', }}> {'التصنيفات'} </Text>
              </>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <>
                <Icon1
                  name={focused ? 'ios-settings' : 'ios-settings-outline'}
                  size={28}
                  color={color}
                />
                <Text style={{ color: focused ? defColor : 'grey', fontFamily: 'Tajawal-Regular', }}> {'الإعدادات'} </Text>
              </>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

export default Tabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    // height: height
  },
  title: {
    fontSize: 24,
    fontFamily: 'Tajawal-Regular',
    // fontWeight: 'bold',
    color: '#e3e3e3',
    marginLeft: 15,
  },
  tabStyle: {
    backgroundColor: defColor,
  },
  active: {
    fontFamily: 'Tajawal-Regular',
    // backgroundColor: defColor, 
    backgroundColor: defColor,
  },
  text: {
    fontFamily: 'Tajawal-Regular',
    color: '#e3e3e3'
  },
  imgBack: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  iconBack: {
    marginHorizontal: 5,
    height: 20,
    width: 20,
    borderRadius: 10,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  img: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  dataContainer: {
    paddingHorizontal: 10,
    width: width - 160,
    // backgroundColor: 'red',
    justifyContent: "center"
  },
  songtitle: {
    // backgroundColor: 'red',
    maxHeight: 20,
    fontFamily: 'Tajawal-Regular',
    fontSize: 16,
    color: '#444',
    marginBottom: 3
  }
});