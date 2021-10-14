import React, { Component } from 'react';
import { View, Text, BackHandler, StyleSheet, StatusBar, Alert, Image, Modal, TouchableOpacity, TextInput, Pressable } from 'react-native';
import RNFetchBlob from "rn-fetch-blob";
import { Container, Header, Fab, Body, Left, Right } from 'native-base';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/Ionicons";
import ImagePicker from 'react-native-image-picker'
import ListsComponent from '../Components/ListsComponent';
import AsyncStorage from '@react-native-community/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import _ from "lodash"
import GridsComponent from '../Components/GridsComponent';
import OptionsMenu from "react-native-options-menu";
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import { defColor } from '../config/colorConfig';
import { ToastAndroid } from 'react-native';

export default class Albums extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            showModal: false,
            catIcon: '',
            catName: '',
            catNote: '',
            albums: [],
            categories: [],
            change: true,
            showSearch: false,
            passwordModal: false,
            password: '',
        };
    }

    componentDidMount() {
        // To get All Recived Urls
        ReceiveSharingIntent.getReceivedFiles(files => {
            // files returns as JSON Array example
            // console.log(files)
            // this.setState({ data: files, share: true })
            this.props.navigation.navigate("ShareScreen", { files: files, })
            //[{ filePath: null, text: null, weblink: null, mimeType: null, contentUri: null, fileName: null, extension: null }]
        },
            (error) => {
                console.log(error);
            },
            'ShareMedia' // share url protocol (must be unique to your app, suggest using your apple bundle id)
        );

        // To clear Intents
        ReceiveSharingIntent.clearReceivedFiles();
        // AsyncStorage.removeItem("images")
        this.loadAlbums()
        this.checkPassword()
        const navigation = this.props.navigation
        navigation.addListener('focus', () => {
            this.loadAlbums()
        })
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    checkPassword = async () => {
        const lockApp = await AsyncStorage.getItem("lockApp")
        const lockPassword = await AsyncStorage.getItem("lockPassword")
        if(lockApp != null && lockPassword != null){
            if (lockApp == "true" && this.state.password == '') {
                this.setState({ passwordModal: true })
            } else {
                if (lockPassword == this.state.password ) {
                    this.setState({ passwordModal: false })
                } else if(lockPassword != this.state.password && lockApp == "true") {
                    ToastAndroid.show("خطأ, اعد المحاولة مرة اخرى", ToastAndroid.LONG)
                }
            } 
        }

    }

    componentWillUnmount() {
        const navigation = this.props.navigation
        navigation.removeListener('focus')
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {

        if (this.props.navigation.isFocused()) {
            Alert.alert(
                "إنهاء التطبيق",
                "هل حقاً تريد إنهاء التطبيق",
                [
                    { text: "نعم", onPress: () => BackHandler.exitApp() },
                    {
                        text: "لا",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    }
                ],
                { cancelable: false }
            );
            return true;
        }

        // return true;  // Do nothing when back button is pressed
    }

    async loadAlbums() {
        try {
            const albums = await AsyncStorage.getItem("albums")
            const images = await AsyncStorage.getItem("images")
            const cats = await AsyncStorage.getItem("category")
            console.log(JSON.parse(images))
            this.setState({ albums: JSON.parse(albums), categories: JSON.parse(cats) })
        } catch (error) {
            console.log(error);
        }
    }

    addCat = async () => {
        const { catIcon, catName, catNote } = this.state
        const catToAdd = { label: catName, value: catName, icon: catIcon, note: catNote, password: '' }
        const catToAddArray = [{ label: catName, value: catName, icon: catIcon, note: catNote, password: '' }]
        console.log(catToAdd)
        if (catIcon != '' && catName != '') {
            const cats = await AsyncStorage.getItem("albums")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)
                AsyncStorage.setItem("albums", JSON.stringify(catsJson))
                this.loadAlbums()
                this.setState({
                    catIcon: '',
                    catName: '',
                    catNote: '',
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
            } else {
                console.log("not found")
                AsyncStorage.setItem("albums", JSON.stringify(catToAddArray))
                this.loadAlbums()
                this.setState({
                    catIcon: '',
                    catName: '',
                    catNote: '',
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }

    sortFiles = async (type, files) => {
        if (type == "latest") {
            this.setState({ albums: this.state.albums.reverse() })
        } else if (type == "alpha") {
            // console.log("alpha")
            this.setState({
                albums: this.state.albums.sort((a, b) => {
                    // console.log(a)
                    a = a.label.toLowerCase();
                    b = b.label.toLowerCase();

                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                })
            })
        } else if (type == "largest") {
            const img = await AsyncStorage.getItem("images")
            this.setState({
                albums: this.state.albums.sort((a, b) => {
                    let acount = 0
                    let bcount = 0
                    const data = _.filter(JSON.parse(img), obj => {
                        if (obj.album.match(a.label)) {
                            acount += 1
                            return true
                        } else if (obj.album.match(b.label)) {
                            bcount += 1
                            return true
                        }
                        return false
                    })
                    // console.log(acount + "--" + bcount)
                    // console.log(acount > bcount)
                    return (acount > bcount) ? -1 : (acount < bcount) ? 1 : 0;
                })
            })
        }
    }

    selectImage = async () => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        ImagePicker.showImagePicker({
            title: '',
            cancelButtonTitle: "إلغاء",
            // chooseWhichLibraryTitle:
            takePhotoButtonTitle: "استخدام الكاميرا",
            chooseFromLibraryButtonTitle: "اختر من المعرض",
            mediaType: 'photo',
        }, (res) => {
            RNFetchBlob.fs.exists(noteDir).then(async (exists) => {
                if (exists) {
                    RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                        if (isDir) {
                            let filename = res.path.split('/')[res.path.split('/').length - 1];
                            // console.log(filename)
                            // create an empty file fisrt
                            let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                            // then you can move it or move it like
                            RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                this.setState({ catIcon: noteDir + filename })
                                // this.loadAlbums()
                            }).catch((e) => { console.log('حدث خطأ ما اعد المحاولة من جديد'); });
                        } else {
                            console.log('حدث خطأ ما اعد المحاولة من جديد');
                        }
                    }).catch((e) => { console.log("Checking Directory Error : " + e.message); })
                } else {
                    RNFetchBlob.fs.mkdir(noteDir).then(() => {
                        RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                            if (isDir) {
                                let filename = res.path.split('/')[res.path.split('/').length - 1];
                                // console.log(filename)
                                // create an empty file fisrt
                                let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                                // then you can move it or move it like
                                RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                    this.setState({ catIcon: noteDir + filename })
                                    // this.loadAlbums()
                                }).catch((e) => { console.log("حدث خطأ ما اعد المحاولة من جديد") });
                            } else {
                                console.log('حدث خطأ ما اعد المحاولة من جديد');
                            }
                        }).catch((e) => { console.log("Checking Directory Error : " + e.message); });
                    }).catch((e) => { console.log("Directory Creating Error : " + e.message); });
                }
            });
            // console.log(res)
        });
    };

    handleSearch = async (keyWord) => {
        // console.log(keyWord)
        if (keyWord == '') {
            // console.log("restoring default")
            this.loadAlbums()
        }
        const { albums } = this.state
        const back = albums

        let string = '[]'
        let filtered = JSON.parse(string)

        const data = _.filter(back, obj => {
            if (obj.label.includes(keyWord)) {
                filtered.push(obj)
            }
        })
        this.setState({ albums: filtered })
    }

    render() {
        const myIcon = (<Icon name="dots-vertical" style={{ marginRight: 20 }} color="#FFF" size={20} />)
        return (
            <Container>
                <Modal
                    transparent={true}
                    visible={this.state.passwordModal}
                    animationType="fade">
                    <View style={styles.passModalContainer}>
                        <View style={[styles.passModal, { borderRadius: 10 }]}>
                            <View style={{ flex: 1, marginTop: 50 }}>
                                <Image source={require('../Assets/GallerySplash.png')} style={{ alignSelf: 'center', borderRadius: 20, width: 200, height: 200 }} />
                            </View>

                            <View style={{ flex: 1 }}>
                                <TextInput
                                    textAlign='right'
                                    style={styles.textInput}
                                    placeholder="اكتب كلمة المرور"
                                    onChangeText={(password) => this.setState({ password, })}
                                />


                                <TouchableOpacity
                                    onPress={() => this.checkPassword()}
                                    style={[styles.btn, { marginTop: 20, marginRight: 0, width: "100%" }]}>
                                    <Icon name="lock-open-variant" size={15} color="#FFF" />
                                    <Text style={[styles.textBtn]}> تأكيد </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <Modal
                    transparent={true}
                    onBackdropPress={() => this.setState({ showModal: false })}
                    onSwipeComplete={() => this.setState({ showModal: false })}
                    onRequestClose={() => this.setState({ showModal: false })}
                    visible={this.state.showModal}
                    animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modal, { borderRadius: 10 }]}>
                            <Text style={styles.modalTitle}> {"اضافة البوم جديد"} </Text>

                            <Text style={styles.text}> اسم الالبوم </Text>
                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                onChangeText={(catName) => this.setState({ catName, })}
                            />

                            <Text style={styles.text}> {"التصنيف"} </Text>
                            <View style={[styles.textInput, { justifyContent: 'center' }]}>
                                <RNPickerSelect
                                    useNativeAndroidPickerStyle={false}
                                    style={[styles.textInput]}
                                    style={{ inputAndroid: { color: 'black', fontFamily: "Tajawal-Regular" } }}
                                    placeholder={{ label: 'اختر من هنا', value: 'الخرطوم' }}
                                    onValueChange={(value) => {
                                        this.setState({ catNote: value })
                                    }}
                                    items={this.state.categories?this.state.categories:[]}
                                />
                            </View>

                            <Text style={styles.text}> {"صورة للألبوم"} </Text>
                            <Pressable onPress={() => this.selectImage()} style={[{ backgroundColor: "#FFF", justifyContent: 'center' }]}>
                                <View style={styles.imageCont}>
                                    {this.state.catIcon == '' ? (
                                        <Icon name="camera-plus" size={40} color="#444" />
                                    ) : (
                                        <Image source={{ uri: "file://" + this.state.catIcon }} style={styles.iconImg} />
                                    )}
                                </View>
                            </Pressable>

                            <TouchableOpacity
                                onPress={() => this.addCat()}
                                style={styles.btn}>
                                <Icon name="check" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> اضافة </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Header style={{ backgroundColor: defColor }}>
                    <Left style={{ flex: 1, }}>
                        <Pressable style={{ marginLeft: 20 }} onPress={() => this.setState({ change: !this.state.change })}>
                            <Icon name={this.state.change ? "grid-large" : "view-list-outline"} size={25} color="#FFF" />
                        </Pressable>
                    </Left>
                    <Body style={[styles.headerBody, { flex: 1 }]}>
                        <Text style={styles.appName}> {"الألبومات"} </Text>
                    </Body>
                    <Right style={{ flex: 1, }}>
                        <Icon2
                            onPress={() => this.setState({ showSearch: !this.state.showSearch })}
                            style={{ marginRight: 10 }}
                            name="ios-search-outline"
                            size={25}
                            color="#e3e3e3"
                        />
                        <OptionsMenu
                            customButton={myIcon}
                            destructiveIndex={1}
                            options={["الاحدث", "الأكثر صور", "أ - ي"]}
                            actions={[() => this.sortFiles("latest", this.state.albums), () => this.sortFiles("largest", this.state.albums), () => this.sortFiles("alpha", this.state.albums)]} />
                    </Right>
                </Header>
                <StatusBar backgroundColor={defColor} />
                <View style={{ flex: 1 }}>

                    {this.state.showSearch ? (
                        <View>
                            <Icon
                                onPress={() => this.setState({ showSearch: false })}
                                style={{ position: 'absolute', top: 25, left: 15, zIndex: 1 }}
                                name="close-circle"
                                size={20}
                                color="grey"
                            />
                            <TextInput
                                style={[styles.textInput, { elevation: 0, borderRadius: 20, paddingHorizontal: 20, borderColor: '#bdbdbd', borderWidth: .5, marginTop: 10, width: '95%', alignSelf: 'center', fontFamily: 'Tajawal-Regular' }]}
                                placeholder={"بحث"}
                                onChangeText={(keyWord) => this.handleSearch(keyWord)}
                                textAlign="right"
                            />
                        </View>
                    ) : null}

                    {this.state.change ? (
                        <ListsComponent page={"albums"} files={this.state.albums} navigation={this.props.navigation} />
                    ) : (
                        <GridsComponent page={"albums"} files={this.state.albums} navigation={this.props.navigation} />
                    )}

                    <Fab
                        active={this.state.active}
                        direction="up"
                        containerStyle={{}}
                        style={{ backgroundColor: defColor }}
                        position="bottomRight"
                        onPress={() => this.setState({ showModal: !this.state.showModal })}>
                        <Icon name="camera-burst" />
                    </Fab>
                </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#eee",
    },
    headerBody: {
        alignItems: 'center', justifyContent: 'center', marginTop: 10
    },
    appName: {
        color: "#FFF",
        fontSize: 20,
        fontFamily: "Tajawal-Regular"
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
    passModalContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.9)',
        alignItems: "center",
        justifyContent: "center"
    },
    passModal: {
        backgroundColor: defColor,
        height: '90%',
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
        elevation: 5,
        fontFamily: 'Tajawal-Regular'
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
    imageCont: {
        backgroundColor: "#FFF",
        marginHorizontal: 1,
        borderRadius: 10,
        height: 100,
        width: 100,
        // alignSelf: 'flex-end',
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconImg: {
        height: 100,
        width: 100,
        borderRadius: 10,
    }
})