import React, { Component } from 'react';
import { View, Text, Alert, TextInput, StyleSheet, Modal, TouchableOpacity, StatusBar } from 'react-native';
import RNFetchBlob from "rn-fetch-blob";
import { Container, Header, Button, Fab, Body } from 'native-base';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/FontAwesome";
import ImagePicker from 'react-native-image-picker'
import GalleryComponent from '../Components/GalleryComponent';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-community/async-storage';
import { Image } from 'react-native';
import { defColor } from '../config/colorConfig';

export default class ShareScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            moved: '',
            showModal: false,
            album: "",
            albums: [],
            categories: [],
            category: "",
            imgNote: '',
            allImages: [],
            imgData: '',
            active: false,
            SharedFiles: [],
            image64:'',
        };
    }

    componentDidMount() {
        this.loadFiles()
        // console.log(this.props.route.params.files[0])
        this.setState({ moved: this.props.route.params.files[0].contentUri })
        // this.cpFile()
    }

    async loadFiles() {
        try {
            const albums = await AsyncStorage.getItem("albums")
            const cats = await AsyncStorage.getItem("category")
            // console.log(img)
            this.setState({ albums: JSON.parse(albums), categories: JSON.parse(cats) })

            RNFetchBlob.fs.readFile(this.state.moved, 'base64')
            // files will an array contains filenames
            .then((files) => {
                this.setState({ image64: files })
                console.log('files')
                // console.log(files)
            })
        } catch (error) {
            console.log(error);
        }
    }

    async cpFile() {
        const url = this.props.route.params.files[0].contentUri
        if (url.startsWith('content://')) {
            const uriComponents = url.split('/')
            const fileNameAndExtension = uriComponents[uriComponents.length - 1]
            console.log(fileNameAndExtension)
            console.log(url)
            // const destPath = `${RNFS.TemporaryDirectoryPath}/${fileNameAndExtension}`
            // await RNFS.copyFile(uri, destPath)
        }
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        RNFetchBlob.fs.isDir(noteDir).then((isDir) => {
            if (isDir) {
                let filename = "shared-" + this.props.route.params.files[0].fileName;
                // create an empty file fisrt
                let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                // then you can move it or move it like
                RNFetchBlob.fs.cp(this.props.route.params.files[0].contentUri, noteDir + filename).then(() => {
                    this.setState({ moved: noteDir + filename })

                }).catch((e) => { console.log(e); });
            } else {
                console.log('حدث خطأ ما اعد المحاولة من جديد');
            }
        }).catch((e) => { console.log("Checking Directory Error : " + e.message); })
    }

    saveImage = async () => {
        // this.cpFile()
        console.log('this.state.image64')
        // console.log(this.state.image64)

        const fileName = this.props.route.params.files[0].fileName
        const { moved, category, imgNote, album, image64 } = this.state
        // mimeType
        const imageBase64 = 'data:'+this.props.route.params.files[0].mimeType+';base64,'+image64
        const catToAdd = { label: category, value: category, date: Date.now(), icon: fileName, contentUri: image64 != ''? imageBase64:moved, note: imgNote, album }
        const catToAddArray = [{ label: category, value: category, icon: fileName, date: Date.now(), contentUri: image64 != ''? imageBase64:moved, note: imgNote, album }]
        // if (category != '') {
        if (moved != '' && category != '') {
            const cats = await AsyncStorage.getItem("images")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)
                AsyncStorage.setItem("images", JSON.stringify(catsJson))
                this.props.navigation.goBack()
                console.log("تمت اضافة التصنيف")
            } else {
                console.log("not found")
                AsyncStorage.setItem("images", JSON.stringify(catToAddArray))
                console.log("تمت اضافة التصنيف")
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }

    render() {
        return (
            <>
                <View style={styles.container}>
                    <Image source={{ uri: this.props.route.params.files[0].contentUri }} style={styles.image} />
                    {this.props.route.params.files[0].fileName.includes(".mp4") ? (
                        <View style={{
                            position: "absolute",
                            alignSelf: 'center'
                        }} >
                            <Icon name="play-circle-outline" size={30} color="#e3e3e3" />
                        </View>
                    ) : (
                        null
                    )}
                </View>
                <View style={styles.subCont}>
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
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: "40%",
        backgroundColor: "#eee",
        alignItems: 'center',
        justifyContent: 'center'
    },
    subCont: {
        backgroundColor: "#eee",
        width: "90%",
        alignSelf: 'center',
    },
    image: {
        backgroundColor: "#eee",
        width: "80%",
        height: "80%",
        alignSelf: 'center'
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