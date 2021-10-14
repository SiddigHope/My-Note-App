import React, { Component } from "react";
import { StatusBar, BackHandler, Alert, PermissionsAndroid } from 'react-native';
import { Box, Text } from "react-native-design-utility";
import OnboardingLogo from '../commons/OnboardingLogo';
import RNFetchBlob from 'rn-fetch-blob'
import { setColor } from "../config/colorConfig";

class SplashScreen extends Component {
    state = {}

    componentDidMount() {
        setColor()
        this.checkAuth()
    }

    checkAuth = () => {
        setTimeout(() => {
            this.props.navigation.navigate('Tabs', {navigation: this.props.navigation})
        }, 3000)
    }
    
    render() {
        return (
            <Box style={{ width: '100%' }} f={1} center>
                <StatusBar backgroundColor="#FFF" />
                <OnboardingLogo />
            </Box>
        );
    }
}

export default SplashScreen;