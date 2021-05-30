import React, { Component } from 'react';
import { View, Text, Alert, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Modal } from 'react-native';
import { Container, Content, Button, Fab } from 'native-base';
import * as Animatable from "react-native-animatable";
import RNFetchBlob from "rn-fetch-blob";
import { Pressable } from 'react-native';
import { StatusBar } from 'react-native';
import ShowHorizontalImage from './ShowHorizontalImgae';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from "react-native-vector-icons/Ionicons";
import CheckBox from 'react-native-check-box'
import RNPickerSelect from 'react-native-picker-select';
import _ from 'lodash'
import Share from "react-native-share"
import AsyncStorage from '@react-native-community/async-storage';
import { defColor } from '../config/colorConfig';

const { width, height } = Dimensions.get("window")

class AnimatedImage extends Component {
    render() {
        return (
            <Animatable.View
                style={{ alignItems: 'center' }}
                animation="zoomIn"
                delay={this.props.index * 50}
                useNativeDriver={true}
            >{this.props.children}</Animatable.View>
        )
    }
}

export default class GalleryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            item: '',
            width: '',
            height: '',
            showCheckBox: false,
            selectedImages: [],
            active: false,
            base46Array: [],
            albums: [],
            categories: [],
            album: '',
            category: '',
            fromState: false,
            files: []
        };
    }
    // {/* <Thumbnail iconStyle={{ width: 20, height: 20 }} onPress={() => console.log("press")} style={{ flex: 1, height: width / 4, width: width / 4 }} url={RNFetchBlob.fs.dirs.SDCardDir + "/mynote/" + item.item} /> */}

    componentDidMount() {
        this.loadFiles()
    }

    async loadFiles() {
        try {
            const albums = await AsyncStorage.getItem("albums")
            const cats = await AsyncStorage.getItem("category")
            // console.log(img)
            this.setState({ albums: JSON.parse(albums), categories: JSON.parse(cats) })
        } catch (error) {
            console.log(error);
        }
    }

    addImageToArray(uri) {
        let url = uri.item.icon
        if (!url.includes("/mynote/")) {
            url = uri.item.contentUri
        }

        if (this.state.selectedImages.length > 0) {
            // console.log(this.state.selectedImages.length)

            const index = this.state.selectedImages.indexOf(url)
            // console.log(index)

            if (index > -1) {
                this.state.selectedImages.splice(index, 1)
                this.state.base46Array.splice(index, 1)
                this.setState({
                    selectedImages: this.state.selectedImages,
                    base46Array: this.state.base46Array
                })
                // console.log(this.state.selectedImages)
            } else {
                this.state.selectedImages.push(url)
                this.arrayToArray(url)
                this.setState({
                    selectedImages: this.state.selectedImages,
                })
                // console.log(this.state.selectedImages)
            }
        } else {
            const item0 = [url]
            // console.log(item0)
            this.arrayToArray(url)
            this.setState({ selectedImages: item0 })
            // console.log("added")
        }
    }

    async addImageToArrayAll(uri) {

        // const images = await AsyncStorage.getItem("images")

        if (this.state.selectedImages.length > 0) {
            // console.log(this.state.selectedImages.length)
            this.setState({ selectedImages: [], base46Array: [] })
        }
        else {
            const data = _.filter(this.props.files, obj => {
                let url = obj.icon
                console.log(obj)
                if (!url.includes("/mynote/")) {
                    url = obj.contentUri
                }
                this.state.selectedImages.push(url)
                this.arrayToArray(url)
            })
            this.setState({
                selectedImages: this.state.selectedImages,
            })
            // console.log(this.state.selectedImages)
        }
    }

    checkSelectedImage(uri) {

        let url = uri.item.icon
        if (!url.includes("/mynote/")) {
            url = uri.item.contentUri
        }
        const index = this.state.selectedImages.indexOf(url)
        return index > -1 ? true : false
    }

    showImage = (item) => {
        // console.log(item.index)
        this.props.navigation.navigate("ShowHorizontalImage", { index: item.index, files: this.props.files })
    }

    _renderItem = (item, index) => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        // console.log(item.index)
        // console.log(item.item)
        let uri = "file://" + item.item.icon
        if (!uri.includes("mynote/")) {
            uri = item.item.contentUri
        }

        const check = this.checkSelectedImage(item)
        // console.log(item)
        const url = String(item.item.icon)
        return (
            <Pressable onPress={() => !this.state.showCheckBox ? this.showImage(item) : this.addImageToArray(item)}
                onLongPress={() => {
                    this.setState({ showCheckBox: true })
                    console.log("log pressed")
                }} >
                <AnimatedImage index={item.index}>
                    {url.includes(".mp4") ? (
                        <>
                            <Video source={{ uri: "file://" + item.item.icon }}   // Can be a URL or a local file.
                                ref={(ref) => {
                                    this.player = ref
                                }}
                                repeat
                                muted
                                resizeMode="cover"
                                // controls={true}
                                style={{ flex: 1, height: width / 4, width: width / 4 }} />
                            <View style={{
                                position: "absolute",
                                left: "30%",
                                top: "40%",
                            }} >
                                <Icon name="play-circle-outline" size={30} color="#e3e3e3" />
                            </View>
                            {this.state.showCheckBox ? (
                                <CheckBox
                                    checkBoxColor="#e3e3e3"
                                    style={{ flex: 1, right: 5, bottom: 55, position: "absolute" }}
                                    onClick={() => {
                                        this.addImageToArray(item)
                                    }}
                                    isChecked={check}
                                    leftText={"CheckBox"}
                                />
                            ) : (
                                null
                            )}
                        </>
                    ) : (
                        <>
                            <Image source={{ uri: uri }} style={{ flex: 1, height: width / 4, width: width / 4 }} />
                            {this.state.showCheckBox ? (
                                <CheckBox
                                    checkBoxColor="#e3e3e3"
                                    style={{ flex: 1, right: 5, bottom: 55, position: "absolute" }}
                                    onClick={() => {
                                        this.addImageToArray(item)
                                    }}
                                    isChecked={check}
                                    leftText={"CheckBox"}
                                />
                            ) : (
                                null
                            )}
                        </>
                    )}
                </AnimatedImage>
            </Pressable>
        )
    }

    async arrayToArray(uri) {
        const shiftingArray = this.state.base46Array
        const item = String(uri)
        if (item.includes("/mynote/")) {
            RNFetchBlob.fs.readFile(item, 'base64')
                .then((data) => {
                    RNFetchBlob.fs.stat(item)
                        .then((stats) => {
                            if (stats.filename.includes(".mp4")) {
                                shiftingArray.push("data:video/mp4;base64," + data)
                            } else {
                                shiftingArray.push("data:image/jpeg;base64," + data)
                            }
                            this.setState({ base46Array: shiftingArray })
                        }).catch((err) => console.log(err))
                }).catch((err) => console.log(err))
        }
    }

    shareFile = async () => {
        if (this.state.base46Array.length > 0) {
            // console.log(this.state.base46Array)
            const options = {
                urls: this.state.base46Array
            }
            try {
                const response = await Share.open(options)
                console.log(JSON.stringify(response))
            } catch (error) {
                console.log(error)
            }
        }
    }

    saveImage = async () => {
        const { moved, category, imgNote, album } = this.state
        // if (category != '') {
        if (album != '' && category != '') {
            const cats = await AsyncStorage.getItem("images")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                for (var i = 0; i < this.state.selectedImages.length; i++) {
                    // console.log(this.state.selectedImages[i])
                    const catToAdd = { label: category, value: category, date: Date.now(), icon: this.state.selectedImages[i], note: '', album }
                    catsJson.push(catToAdd)
                    // console.log(catToAdd)
                }
                AsyncStorage.setItem("images", JSON.stringify(catsJson))
                this.setState({
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
                this.props.navigation.goBack()
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }

    deleteItemYes = async () => {
        // const icon = item.item.icon
        const img = await AsyncStorage.getItem("images")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = JSON.parse(string)
        const data = _.filter(images, obj => {
            // console.log(obj)
            for (var i = 0; i < this.state.selectedImages.length; i++) {
                if (!obj.icon.match(this.state.selectedImages[i])) {
                    filtered.push(obj)
                }
            }
            this.setState({ showModal: true })
        })
        AsyncStorage.setItem("images", JSON.stringify(filtered))
        this.saveImage()
    }

    deleteItem = async () => {
        // const icon = item.item.icon
        const img = await AsyncStorage.getItem("images")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = images

        for (var i = 0; i < this.state.selectedImages.length; i++) {
            const data = _.filter(images, obj => {
                // console.log(images)
                if (obj == undefined) {
                    return
                }
                if (obj.icon == this.state.selectedImages[i]) {
                    const index = filtered.indexOf(obj)

                    if (index > -1) {
                        filtered.splice(index, 1)
                    }
                }
            })
        }
        Alert.alert(
            "حذف عنصر",
            "هل انت متأكد من حذف هذا العنصر ؟",
            [
                {
                    text: "نعم", onPress: () => {
                        AsyncStorage.setItem("images", JSON.stringify(filtered))
                        this.props.navigation.goBack()
                    }
                },
                {
                    text: "لا",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                }
            ],
            { cancelable: false }
        );
    }

    render() {
        // console.log(imgs.images)
        return (
            <Container>
                <StatusBar translucent={false} />
                {this.state.showCheckBox ? (
                    <>
                        <Fab
                            active={this.state.showCheckBox}
                            direction="up"
                            style={{ backgroundColor: defColor, zIndex: 1 }}
                            position="bottomLeft"
                            onPress={() => {
                                this.setState({ showCheckBox: !this.state.showCheckBox })
                                console.log("djknj")
                            }}>

                            <Icon2 name="settings-outline" size={30} color="#FFF" />

                            <Button onPress={() => this.deleteItem()} style={{ zIndex: 1, backgroundColor: '#e3e3e3', borderRadius: 20, alignSelf: 'center', height: 40, width: 40 }}>
                                <Icon name="trash-can-outline" size={20} color="#444" />
                            </Button>
                            <Button onPress={() => this.deleteItemYes()} style={{ zIndex: 1, backgroundColor: '#e3e3e3', borderRadius: 20, alignSelf: 'center', height: 40, width: 40 }}>
                                <Icon name="folder-move-outline" size={20} color="#444" />
                            </Button>
                            <Button onPress={() => this.shareFile()} style={{ zIndex: 1, backgroundColor: '#e3e3e3', borderRadius: 20, alignSelf: 'center', height: 40, width: 40 }}>
                                <Icon2 name="ios-share-social-outline" size={20} color="#444" />
                            </Button>
                        </Fab>
                        <Fab
                            active={this.state.showCheckBox}
                            // direction="up"
                            style={{ backgroundColor: defColor, zIndex: 1 }}
                            position="topRight"
                            onPress={() => {
                                this.addImageToArrayAll()
                                console.log("djknj")
                            }}>

                            <Icon name="check-box-multiple-outline" size={30} color="#FFF" />
                        </Fab>
                    </>
                ) : (
                    null
                )}
                <Modal
                    transparent={true}
                    onBackdropPress={() => this.setState({ showModal: false })}
                    onSwipeComplete={() => this.setState({ showModal: false })}
                    onRequestClose={() => this.setState({ showModal: false })}
                    visible={this.state.showModal}
                    animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modal, { borderRadius: 10 }]}>
                            <Text style={styles.modalTitle}> {"اضف التصنيف المناسب"} </Text>
                            <Text style={styles.text}> {"التصنيف"} </Text>
                            <View style={[styles.textInput, { justifyContent: 'center' }]}>
                                <RNPickerSelect
                                    useNativeAndroidPickerStyle={false}
                                    style={[styles.textInput]}
                                    style={{ inputAndroid: { color: 'black', fontFamily: "Tajawal-Regular" } }}
                                    placeholder={{ label: 'اختر من هنا', value: 'الخرطوم' }}
                                    onValueChange={(value) => {
                                        this.setState({ category: value })
                                    }}
                                    items={this.state.categories}
                                />
                            </View>
                            <Text style={styles.text}> {"الالبوم"} </Text>
                            <View style={[styles.textInput, { justifyContent: 'center' }]}>
                                <RNPickerSelect
                                    useNativeAndroidPickerStyle={false}
                                    style={[styles.textInput]}
                                    style={{ inputAndroid: { color: 'black', fontFamily: "Tajawal-Regular" } }}
                                    placeholder={{ label: 'اختر من هنا', value: 'الخرطوم' }}
                                    onValueChange={(value) => {
                                        this.setState({ album: value })
                                    }}
                                    items={this.state.albums}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={() => this.saveImage()}
                                style={styles.btn}>
                                <Icon name="check" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> اضافة </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Content>
                    <FlatList
                        data={this.props.files}
                        numColumns={4}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this._renderItem}
                    />
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        height: height,
        width: width,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: "center",
        justifyContent: "center"
    },
    bigImage: {
        height: '100%',
        width: '100%',
    },
    modal: {
        backgroundColor: '#FFF',
        // height: '50%',
        width: '90%',
        borderRadius: 30,
        padding: 20,
    },
    modalTitle: {
        fontSize: 14,
        fontFamily: "Tajawal-Regular",
        color: defColor,
        marginBottom: 10
    },
    textInput: {
        backgroundColor: "#FFF",
        marginHorizontal: 1,
        borderRadius: 10,
        paddingHorizontal: 20,
        height: 50,
        elevation: 5
    },
    text: {
        fontSize: 16,
        fontFamily: 'Tajawal-Regular',
        textAlign: 'right',
        marginVertical: 10
    },
    textBtn: {
        color: "#FFF",
        fontFamily: "Tajawal-Regular",
        fontSize: 14
    },
    btn: {
        flexDirection: 'row',
        marginTop: 10,
        width: "40%",
        backgroundColor: "#66bb6a",
        marginHorizontal: 1,
        height: 50,
        elevation: 5,
        borderRadius: 20,
        marginBottom: 10,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center'
    },
})