import React, { Component } from 'react';
import { View, Alert, TextInput, Text, FlatList, StyleSheet, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { Container, Content } from 'native-base';
import RNFetchBlob from "rn-fetch-blob";
import { Pressable } from 'react-native';
import ImageModal from 'react-native-image-modal';
import { StatusBar } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import _ from "lodash";
import Share from "react-native-share"
import RNPickerSelect from 'react-native-picker-select';
import { defColor } from '../config/colorConfig';

const { width, height } = Dimensions.get("window")

export default class ShowHorizontalImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            item: '',
            width: '',
            height: '',
            files: [],
            showFrame: true,
            sharedData: '',
            index: 0,
            albums: [],
            categories: [],
            moved: [],
            category: '',
            album: "",
            imgNote: '',
            comment: '',
            noteModal: false,
            paused: false
        };
    }

    componentDidMount() {
        this.setFiles()
        this.loadFiles()
        const navigation = this.props.navigation
        navigation.addListener('focus', () => {
            this.setFiles()
            // console.log("fouced")
        })
    }

    componentWillUnmount() {
        const navigation = this.props.navigation
        navigation.removeListener('focus')
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

    saveImage = async () => {
        const { moved, category, imgNote, album, comment } = this.state
        let catToAdd = {}
        let catToAddArray = []
        if (comment != '') {
            catToAdd = { label: category, value: category, icon: moved.item.icon, date: Date.now(), note: comment, album }
            catToAddArray = [{ label: category, value: category, icon: moved.item.icon, date: Date.now(), note: comment, album }]
        } else {
            catToAdd = { label: category, value: category, icon: moved.item.icon, date: Date.now(), note: moved.item.note, album }
            catToAddArray = [{ label: category, value: category, icon: moved.item.icon, date: Date.now(), note: imgNote, album }]
        }
        // if (category != '') {
        if (moved != '' && category != '') {
            const cats = await AsyncStorage.getItem("images")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)
                AsyncStorage.setItem("images", JSON.stringify(catsJson))
                this.setState({
                    moved: '',
                    category: '',
                    imgNote: '',
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
                this.props.navigation.goBack()
            } else {
                console.log("not found")
                AsyncStorage.setItem("images", JSON.stringify(catToAddArray))
                this.setState({
                    moved: '',
                    category: '',
                    imgNote: '',
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
                this.props.navigation.goBack()
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }


    shareFile = async (item) => {
        let prefix = ''

        let uri = item.item.icon

        if (!uri.includes("mynote/")) {
            uri = item.item.contentUri
        }

        // console.log(uri)

        RNFetchBlob.fs.readFile(uri, 'base64')
            .then((data) => {
                RNFetchBlob.fs.stat(uri)
                    .then((stats) => {
                        // console.log(stats)
                        if (stats.filename.includes(".mp4")) {
                            prefix = "data:video/mp4;base64,"
                        } else {
                            prefix = "data:image/jpeg;base64,"
                        }
                        // console.log(prefix)
                        this.setState({ sharedData: data })
                        return data
                    }).then(async (data) => {
                        if (this.state.sharedData != '') {
                            const options = {
                                url: prefix + data
                            }
                            try {
                                const response = await Share.open(options)
                                // console.log(JSON.stringify(response))
                            } catch (error) {
                                console.log(error)
                            }
                        }
                    })
                    .catch((err) => console.log(err))
            }).catch((err) => console.log(err))
    }


    setFiles = () => {
        this.setState({ files: this.props.route.params.files, index: this.props.route.params.index })
    }

    handleBackPress = () => {

        if (this.props.navigation.isFocused()) {
            Alert.alert(
                "إنهاء التطبيق",
                "هل حقاً تريد إنهاء التطبيق",
                [
                    {
                        text: "لا",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    { text: "نعم", onPress: () => BackHandler.exitApp() }
                ],
                { cancelable: false }
            );
            return true;
        }

        // return true;  // Do nothing when back button is pressed
    }

    deleteItemYes = async (item) => {
        const icon = item.item.icon
        const img = await AsyncStorage.getItem("images")
        const images = JSON.parse(img)
        // console.log('itemitemitem')
        // console.log(this.state.comment)

        let string = '[]'
        let filtered = images

        const data = _.filter(images, obj => {
            // console.log(albums)
            if (obj == undefined) {
                return
            }
            if (obj.icon == item.item.icon) {
                const index = filtered.indexOf(obj)

                if (index > -1) {
                    filtered.splice(index, 1)
                }
            }
        })

        AsyncStorage.setItem("images", JSON.stringify(filtered))
        if (this.state.comment != '') {
            this.setState({ category: item.item.label, imgNote: this.state.comment, album: item.item.album })
            this.saveImage()
        } else {
            this.saveImage()
        }
    }

    deleteItem = async (item) => {
        const icon = item.item.icon
        const img = await AsyncStorage.getItem("images")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = JSON.parse(string)
        // console.log(item==item)
        const data = _.filter(images, obj => {
            console.log(obj)
            if (!obj.icon.match(item.item.icon)) {
                // console.log(item.item.icon)
                // console.log(obj.item.icon)
                filtered.push(obj)
                // console.log("11111111111")
                return true
            }
            // console.log("000000000")
            return false
        })
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

    _onPlaybackRateChange = (event) => {
        console.log("events")
        console.log("_onPlaybackRateChange : " + event.playbackRate)
    };

    _renderItem = (item, index) => {
        let uri = "file://" + item.item.icon
        if (!uri.includes("mynote/")) {
            uri = item.item.contentUri
        }

        // console.log(uri)
        return (
            <View style={styles.cont}>
                {item.item.icon.includes(".mp4") ? (
                    <>
                        <Video source={{ uri: uri }}   // Can be a URL or a local file.
                            ref={(ref) => {
                                this.player = ref
                            }}
                            paused={this.state.paused}
                            muted
                            onProgress={(response) => {
                                if(response.currentTime > 5 ){
                                    this.setState({paused:true})
                                }
                            }}
                            resizeMode="contain"
                            // onPlaybackRateChange={(event) => this._onPlaybackRateChange(event)}
                            controls={!this.state.showFrame}
                            style={{ height: height, width: width, alignContent: 'center' }} />
                        {this.state.showFrame ? (
                            <>
                                <Pressable
                                    onPress={() => this.props.navigation.navigate("VideoPlayer", { source: uri })}
                                    style={{
                                        position: "absolute",
                                        alignSelf: 'center'
                                    }} >
                                    <Icon name="play-circle-outline" size={50} color="#e3e3e3" />
                                </Pressable>
                                <View style={styles.textCont}>
                                    <Text style={styles.text}> {item.item.note} </Text>
                                </View>
                                <View style={styles.iconCont}>
                                    <Pressable onPress={() => this.shareFile(item)}>
                                        <Icon2 name="share-social-outline" size={25} color="#444" />
                                    </Pressable>
                                    <Pressable onPress={() => this.setState({ showModal: true, moved: item })}>
                                        <Icon name="folder-move-outline" size={25} color={defColor} />
                                    </Pressable>
                                    <Pressable onPress={() => this.deleteItem(item)}>
                                        <Icon name="trash-can" size={25} color="#ef5350" />
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            null
                        )}
                    </>
                ) : (
                    <>
                        <ImageModal
                            // isTranslucent
                            resizeMode="contain"
                            imageBackgroundColor="#FFF"
                            source={{ uri: uri }}
                            style={{ height: height, width: width }}

                        />
                        {item.item.note != '' ? (
                            <View style={styles.textCont}>
                                <Text style={styles.text}> {item.item.note} </Text>
                            </View>
                        ) : (
                            null
                        )}

                        <View style={styles.iconCont}>
                            <Pressable onPress={() => this.shareFile(item)}>
                                <Icon2 name="share-social-outline" size={25} color="#444" />
                            </Pressable>
                            <Pressable onPress={() => this.setState({ showModal: true, moved: item })}>
                                <Icon name="folder-move-outline" size={25} color={defColor} />
                            </Pressable>
                            {item.item.note == '' ? (
                                <>
                                    <Icon onPress={() => this.setState({ noteModal: true, moved: item })} name="pen-plus" color="#e3e3e3" size={20} />
                                </>
                            ) : (
                                null
                            )}
                            <Pressable onPress={() => this.deleteItem(item)}>
                                <Icon name="trash-can" size={25} color="#ef5350" />
                            </Pressable>
                        </View>
                        {/* <Image source={{ uri: "file://" + RNFetchBlob.fs.dirs.SDCardDir + "/mynote/" + item.item }} style={{ flex: 1, height: width / 4, width: width / 4 }} /> */}
                    </>
                )}
            </View>
        )
    }

    handleMarker = index => {
        this._carousel.current.snapToItem(index);
    }

    getItemLayout = (data, index) => {
        return {
            index,
            length: width, // itemHeight is a placeholder for your amount
            offset: index * width,
        }
    }

    render() {
        // console.log(imgs.images)
        // this.handleMarker(this.props.route.params.index)
        return (
            <Container style={styles.container}>
                {/* <StatusBar backgroundColor="#FFF" /> */}
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
                                onPress={() => this.deleteItemYes(this.state.moved)}
                                style={styles.btn}>
                                <Icon name="check" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> اضافة </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    transparent={true}
                    onBackdropPress={() => this.setState({ noteModal: false })}
                    onSwipeComplete={() => this.setState({ noteModal: false })}
                    onRequestClose={() => this.setState({ noteModal: false })}
                    visible={this.state.noteModal}
                    animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modal, { borderRadius: 10 }]}>
                            <Text style={styles.modalTitle}> {"اضف تعليق"} </Text>

                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                onChangeText={(comment) => this.setState({ comment, })}
                            />

                            <TouchableOpacity
                                onPress={() => this.deleteItemYes(this.state.moved)}
                                style={styles.btn}>
                                <Icon name="check" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> اضافة </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <FlatList
                    ref={(c) => { this._carousel = c; }}
                    data={this.props.route.params.files}
                    horizontal
                    // disableVirtualization={true}
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={this.props.route.params.index}
                    keyExtractor={(item, index) => index.toString()}
                    getItemLayout={this.getItemLayout}
                    renderItem={this._renderItem}
                    onScrollToIndexFailed={info => {
                        const wait = new Promise(resolve => setTimeout(resolve, 100));
                        wait.then(() => {
                            this._carousel.current.scrollToIndex({ index: info.index });
                        });
                    }}
                    pagingEnabled
                />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        // backgroundColor: 'rgba(0,0,0,0.6)',
        backgroundColor: '#FFF',
        alignItems: "center",
        justifyContent: "center",
        // paddingTop: 100

    },
    bigImage: {
        height: '100%',
        width: '100%',
    },
    cont: {
        height: height,
        width: width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textCont: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        bottom: 0,
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
        paddingHorizontal: 20
    },
    text: {
        color: "#FFF",
        fontFamily: "Tajawal-Regular",
        fontSize: 14
    },
    iconCont: {
        // backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        top: 0,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 60,
        paddingHorizontal: 30
    },
    modalContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: "center",
        justifyContent: "center"
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