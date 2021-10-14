import React from "react";
import { Image, StyleSheet, View } from "react-native";
import * as Animatable from 'react-native-animatable';


const zoomIn = {
    0: {
        scale: 0,
    },
    0.5: {
        scale: 0.5,
    },
    1: {
        scale: 1,
    },
};

const OnboardingLogo = () => (

    <View center style={{ width: '100%', height: '100%', flex: 1, justifyContent: "center", alignItems: "center"}}>
        <View style={{width: '100%', height: '50%', alignItems: "center", justifyContent: "center"}}>
                <Animatable.Image
                    animation = {zoomIn}
                    source={require('./../Assets/GallerySplash.png')}
                    style={styles.image}
                />
        </View>
    </View>

);

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
        borderRadius:150
    }
})

export default OnboardingLogo