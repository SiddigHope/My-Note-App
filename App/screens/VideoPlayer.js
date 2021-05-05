import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';

const {width, height} = Dimensions.get("screen")

export default class VideoPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <Video source={{ uri: this.props.route.params.source }}   // Can be a URL or a local file.
                            ref={(ref) => {
                                this.player = ref
                            }}
                            resizeMode="contain"
                            controls={true}
                            style={{ height: height - 70, width: width }} />
        );
    }
}
