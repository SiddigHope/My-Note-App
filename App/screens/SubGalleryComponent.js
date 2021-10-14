import React, { Component } from 'react';
import { Pressable, Image, View, Text, Alert, ToastAndroid, TextInput, StyleSheet, Modal, TouchableOpacity, StatusBar } from 'react-native';
import RNFetchBlob from "rn-fetch-blob";
import { Container, Header, Left, Right, Button, Fab, Body } from 'native-base';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/FontAwesome";
import Icon3 from "react-native-vector-icons/Ionicons";
import ImagePicker from 'react-native-image-picker'
import GalleryComponent from '../Components/GalleryComponent';
import AsyncStorage from '@react-native-community/async-storage';
import _ from "lodash"
import OptionsMenu from "react-native-options-menu";
import ListGalleryComponent from '../Components/ListGalleryComponent';
import { defColor } from '../config/colorConfig';


export default class SubGalleryComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            moved: '',
            showModal: false,
            album: this.props.route.params.name,
            albums: [],
            categories: [],
            category: this.props.route.params.cat,
            imgNote: '',
            active: false,
            imgData: '',
            allImages: [],
            change: false,
            showSearch: false,
            password: '',
            passwordModal: false
        };
    }

    componentDidMount() {
        // AsyncStorage.removeItem("images")
        this.checkPassword()
        this.loadFiles()
        const navigation = this.props.navigation
        navigation.addListener('focus', () => {
            this.loadFiles()
        })
    }

    componentWillUnmount() {
        const navigation = this.props.navigation
        navigation.removeListener('focus')
    }

    sortFiles = async (type, files) => {
        if (type == "latest") {
            this.setState({ allImages: this.state.allImages.reverse() })
        } else if (type == "alpha") {
            // console.log("alpha")
            this.setState({
                allImages: this.state.allImages.sort((a, b) => {
                    console.log(a)
                    a = a.label.toLowerCase();
                    b = b.label.toLowerCase();

                    return (a < b) ? -1 : (a > b) ? 1 : 0;
                })
            })
        } else if (type == "largest") {
            const img = await AsyncStorage.getItem("images")
            this.setState({
                allImages: this.state.allImages.sort((a, b) => {
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

    async loadFiles() {
        try {
            const img = await AsyncStorage.getItem("images")
            let string = '[]'
            let filtered = JSON.parse(string)
            // console.log(item==item)
            const data = _.filter(JSON.parse(img), obj => {
                // console.log(obj)
                if (obj.album == this.props.route.params.name) {
                    // console.log(item.item.icon)
                    // console.log(obj.icon)
                    filtered.push(obj)
                    // console.log("11111111111")
                    return true
                }
                // console.log("000000000")
                return false
            })
            // console.log(filtered)
            this.setState({ allImages: filtered })
        } catch (error) {
            console.log(error);
        }
    }

    saveImage = async () => {
        const { moved, category, imgNote, album } = this.state
        const catToAdd = { label: category, value: category, date: Date.now(), icon: moved, note: imgNote, album }
        // console.log(catToAdd)
        const catToAddArray = [{ label: category, value: category, date: Date.now(), icon: moved, note: imgNote, album }]
        // if (category != '') {
        if (moved != '' && category != '') {
            const cats = await AsyncStorage.getItem("images")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)
                AsyncStorage.setItem("images", JSON.stringify(catsJson))
                this.loadFiles()
                this.setState({
                    moved: '',
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
            } else {
                console.log("not found")
                AsyncStorage.setItem("images", JSON.stringify(catToAddArray))
                this.loadFiles()
                this.setState({
                    moved: '',
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }

    selectVideo = async () => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        ImagePicker.launchCamera({
            mediaType: 'video',
        }, (res) => {
            RNFetchBlob.fs.exists(noteDir).then(async (exists) => {
                if (exists) {
                    RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                        if (isDir) {
                            let filename = res.path.split('/')[res.path.split('/').length - 1];
                            // create an empty file fisrt
                            let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                            // then you can move it or move it like
                            RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                this.setState({ moved: noteDir + filename })
                                this.saveImage()
                            }).catch((e) => { console.log('حدث خطأ ما اعد المحاولة من جديد'); });
                        } else {
                            console.log('حدث خطأ ما اعد المحاولة من جديد');
                        }
                    }).catch((e) => { console.log("Checking Directory Error : " + e.message); })
                } else {
                    RNFetchBlob.fs.mkdir(noteDir).then(() => {
                        let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + '.nomedia', '', 'base64');
                        RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                            if (isDir) {
                                let filename = res.path.split('/')[res.path.split('/').length - 1];
                                // create an empty file fisrt
                                let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                                // then you can move it or move it like
                                RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                    this.setState({ moved: noteDir + filename })
                                    this.saveImage()
                                }).catch((e) => { console.log("حدث خطأ ما اعد المحاولة من جديد") });
                            } else {
                                console.log('حدث خطأ ما اعد المحاولة من جديد');
                            }
                        }).catch((e) => { console.log("Checking Directory Error : " + e.message); });
                    }).catch((e) => { console.log("Directory Creating Error : " + e.message); });
                }
            });
        });
    };

    selectImage = async () => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        ImagePicker.launchCamera({
            mediaType: 'photo',
        }, (res) => {
            RNFetchBlob.fs.exists(noteDir).then(async (exists) => {
                if (exists) {
                    RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                        if (isDir) {
                            let filename = res.path.split('/')[res.path.split('/').length - 1];
                            // create an empty file fisrt
                            let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                            // then you can move it or move it like
                            RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                this.setState({ moved: noteDir + filename })
                                this.saveImage()
                            }).catch((e) => { console.log('حدث خطأ ما اعد المحاولة من جديد'); });
                        } else {
                            console.log('حدث خطأ ما اعد المحاولة من جديد');
                        }
                    }).catch((e) => { console.log("Checking Directory Error : " + e.message); })
                } else {
                    RNFetchBlob.fs.mkdir(noteDir).then(() => {
                        let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + '.nomedia', '', 'base64');
                        RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                            if (isDir) {
                                let filename = res.path.split('/')[res.path.split('/').length - 1];
                                // create an empty file fisrt
                                let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                                // then you can move it or move it like
                                RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                    this.setState({ moved: noteDir + filename })
                                    this.saveImage()
                                }).catch((e) => { console.log("حدث خطأ ما اعد المحاولة من جديد") });
                            } else {
                                console.log('حدث خطأ ما اعد المحاولة من جديد');
                            }
                        }).catch((e) => { console.log("Checking Directory Error : " + e.message); });
                    }).catch((e) => { console.log("Directory Creating Error : " + e.message); });
                }
            });
        });
    };

    galleryLib = async () => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        ImagePicker.launchImageLibrary({
            mediaType: 'mixed',
        }, (res) => {
            RNFetchBlob.fs.exists(noteDir).then(async (exists) => {
                if (exists) {
                    RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                        if (isDir) {
                            let filename = res.path.split('/')[res.path.split('/').length - 1];
                            // create an empty file fisrt
                            let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                            // then you can move it or move it like
                            RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                this.setState({ moved: noteDir + filename })
                                this.saveImage()
                            }).catch((e) => { console.log('حدث خطأ ما اعد المحاولة من جديد'); });
                        } else {
                            console.log('حدث خطأ ما اعد المحاولة من جديد');
                        }
                    }).catch((e) => { console.log("Checking Directory Error : " + e.message); })
                } else {
                    RNFetchBlob.fs.mkdir(noteDir).then(() => {
                        let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + '.nomedia', '', 'base64');
                        RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
                            if (isDir) {
                                let filename = res.path.split('/')[res.path.split('/').length - 1];
                                // create an empty file fisrt
                                let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                                // then you can move it or move it like
                                RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                                    this.setState({ moved: noteDir + filename })
                                    this.saveImage()
                                }).catch((e) => { console.log("حدث خطأ ما اعد المحاولة من جديد") });
                            } else {
                                console.log('حدث خطأ ما اعد المحاولة من جديد');
                            }
                        }).catch((e) => { console.log("Checking Directory Error : " + e.message); });
                    }).catch((e) => { console.log("Directory Creating Error : " + e.message); });
                }
            });
        });
    };

    handleSearch = (keyWord) => {
        if (keyWord == '') {
            console.log("restoring default")
            this.loadFiles()
        }
        const { allImages } = this.state
        const back = allImages

        let string = '[]'
        let filtered = JSON.parse(string)

        const data = _.filter(back, obj => {
            if (obj.icon.includes(keyWord)) {
                filtered.push(obj)
            }
        })
        this.setState({ allImages: filtered })
    }

    checkPassword = async () => {
        const lockAlbums = await AsyncStorage.getItem("lockAlbums")
        const lockPassword = await AsyncStorage.getItem("lockPassword")
        if(lockAlbums != null){
            if (lockAlbums.includes(this.props.route.params.name ? this.props.route.params.name : '00000000000') && this.state.password == '') {
                this.setState({ passwordModal: true })
            } else {
                if (lockAlbums.includes(this.props.route.params.name ? this.props.route.params.name : '00000000000')) {
                    if (lockPassword == this.state.password) {
                        this.setState({ passwordModal: false })
                    } else {
                        ToastAndroid.show("خطأ, اعد المحاولة مرة اخرى", ToastAndroid.LONG)
                    }
                }
            }
        }

    }

    render() {
        const myIcon = (<Icon name="dots-vertical" style={{ marginRight: 10 }} color="#FFF" size={25} />)
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
                            <Text style={styles.modalTitle}> {"اضف التصنيف المناسب"} </Text>
                            <Text style={styles.text}> {"التصنيف"} </Text>
                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                defaultValue={this.props.route.params.cat}
                                editable={false}
                                onChangeText={(category) => this.setState({ category, })}
                            />

                            <Text style={styles.text}> {"الالبوم"} </Text>
                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                defaultValue={this.props.route.params.name}
                                editable={false}
                                onChangeText={(album) => this.setState({ album, })}
                            />

                            <Text style={styles.text}> اضافة تعليق </Text>

                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                onChangeText={(imgNote) => this.setState({ imgNote, })}
                            />
                            <TouchableOpacity
                                onPress={() => this.saveImage()}
                                style={styles.btn}>
                                <Icon name="check" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> اضافة </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Header style={{ backgroundColor: defColor }}>
                    <Left style={{ flex: 1, flexDirection: 'row' }}>
                        <Pressable style={{ marginLeft: 10 }} onPress={() => this.setState({ change: !this.state.change })}>
                            <Icon name={this.state.change ? "grid-large" : "view-list-outline"} size={25} color="#FFF" />
                        </Pressable>
                        <Icon3
                            onPress={() => this.setState({ showSearch: !this.state.showSearch })}
                            style={{ marginLeft: 10 }}
                            name="ios-search-outline"
                            size={25}
                            color="#e3e3e3"
                        />

                    </Left>
                    <Body style={styles.headerBody}>
                        <Text style={styles.appName}> {this.props.route.params.name} </Text>
                    </Body>
                    <Right style={{ flex: 1 }}>
                        <Icon
                            onPress={() => this.galleryLib()}
                            name="camera-image"
                            style={{ marginRight: 5 }}
                            size={25} color="#eee"
                        />
                        <Icon
                            onPress={() => this.selectImage()}
                            name="camera"
                            style={{ marginRight: 10 }}
                            size={25} color="#e3e3e3"
                        />
                        <OptionsMenu
                            customButton={myIcon}
                            destructiveIndex={1}
                            options={["الاحدث"]}
                            actions={[() => this.sortFiles("latest", this.state.categories)]} />
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
                        <GalleryComponent files={this.state.allImages} navigation={this.props.navigation} />
                    ) : (
                        <ListGalleryComponent files={this.state.allImages} navigation={this.props.navigation} />
                    )}

                    <Fab
                        active={this.state.active}
                        direction="up"
                        containerStyle={{}}
                        style={{ backgroundColor: defColor }}
                        position="bottomRight"
                        onPress={() => this.selectVideo()}>
                        <Icon2 name="video-camera" />
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
        fontFamily: 'Tajawal-Regular'
    },
    modalContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: "center",
        justifyContent: "center"
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