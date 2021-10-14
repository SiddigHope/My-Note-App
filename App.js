import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Text,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStackNavigator } from '@react-navigation/stack';
import Tabs from './App/config/router';
import SplashScreen from './App/screens/SplashScreen';
import ShowHorizontalImage from './App/Components/ShowHorizontalImgae';
import SubGalleryComponent from './App/screens/SubGalleryComponent';
import SubAlbumsComponent from './App/screens/SubAlbumsComponent';
import SubCatAlbums from './App/screens/SubCatAlbums';
import VideoPlayer from './App/screens/VideoPlayer';
import Home from './App/screens/Home';
import ShareScreen from './App/screens/ShareScreen';

console.disableYellowBox = true
// disableYellowBox=true

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      share: false
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#2196f3" />
        <SplashScreen navigation={this.props.navigation} />
      </View>
    );
  }
}

const Stack = createStackNavigator();

function Stacks() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="App"
        component={App}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ShowHorizontalImage"
        component={ShowHorizontalImage}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayer}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SubGalleryComponent"
        component={SubGalleryComponent}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SubAlbumsComponent"
        component={SubAlbumsComponent}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SubCatAlbums"
        component={SubCatAlbums}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ShareScreen"
        component={ShareScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

function MainScreen() {
  return (
    <NavigationContainer>
      <Stacks />
    </NavigationContainer>
  );
}

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#000',
    fontWeight: 'bold',
  },
  logo: {
    height: 220,
    width: '100%',
    marginBottom: 40,
    marginTop: 20,
  },
  btn: {
    width: '60%',
    height: 50,
    borderRadius: 20,
    backgroundColor: '#ff5b77',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    elevation: 15,
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});