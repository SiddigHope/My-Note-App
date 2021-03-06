import React, { Component } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Modal, TouchableOpacity, TextInput, Pressable } from 'react-native';
import RNFetchBlob from "rn-fetch-blob";
import { Container, Header, Fab, Body, Left, Right } from 'native-base';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImagePicker from 'react-native-image-picker'
import ListsComponent from '../Components/ListsComponent';
import AsyncStorage from '@react-native-community/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import _ from "lodash"
import GridsComponent from '../Components/GridsComponent';
import SubCategories from '../Components/SubCategories';
import OptionsMenu from "react-native-options-menu";
import { defColor } from '../config/colorConfig';


export default class SubAlbumsComponent extends Component {
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
            change: false,
            showCatModal: false,
            cats: []
        };
    }

    componentDidMount() {
        // AsyncStorage.removeItem("subCats")
        this.loadAlbums()
        this.getSubCats()
    }

    async getSubCats() {
        try {
            const cats = await AsyncStorage.getItem("subCats")
            
            let string = '[]'
            let filtered = JSON.parse(string)
            const data = _.filter(JSON.parse(cats), obj => {
                if(obj.note == this.props.route.params.name){
                    filtered.push(obj)
                    return true
                }
                return false
            })
            this.setState({ cats: filtered.reverse() })
        } catch (error) {
            console.log(error);
        }
    }

    async loadAlbums() {
        try {
            const albums = await AsyncStorage.getItem("albums")
            const cats = await AsyncStorage.getItem("category")
            console.log(albums)
            this.setState({ albums: this.props.route.params.files, categories: JSON.parse(cats) })
        } catch (error) {
            console.log(error);
        }
    }

    sortFiles = async (type, files) => {
        if (type == "latest") {
            this.setState({ albums: this.state.albums.reverse() })
        } else if (type == "alpha") {
            console.log("alpha")
            this.setState({
                albums: this.state.albums.sort((a, b) => {
                    console.log(a)
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
                    console.log(acount + "--" + bcount)
                    // console.log(acount > bcount)
                    return (acount > bcount) ? -1 : (acount < bcount) ? 1 : 0;
                })
            })
        }
    }

    addCat = async () => {
        const { catIcon, catName, catNote } = this.state
        const catToAdd = { label: catName, value: catName, icon: catIcon, date: Date.now(), note: this.props.route.params.name }
        const catToAddArray = [{ label: catName, value: catName, icon: catIcon, date: Date.now(), note: this.props.route.params.name }]
        // if (catName != '') {
        if (catIcon != '' && catName != '') {
            const cats = await AsyncStorage.getItem("albums")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)
                this.state.albums.push(catToAdd)
                AsyncStorage.setItem("albums", JSON.stringify(catsJson))
                this.setState({
                    catIcon: '',
                    catName: '',
                    catNote: '',
                    albums: this.state.albums,
                    showModal: false
                })
                console.log("?????? ?????????? ??????????????")
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
                console.log("?????? ?????????? ??????????????")
            }
        } else {
            console.log("?????? ?????????? ?????????????? ?? ???????????? ???????????? ????")
        }
    }

    selectImage = async () => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        ImagePicker.showImagePicker({
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
                            }).catch((e) => { console.log('?????? ?????? ???? ?????? ???????????????? ???? ????????'); });
                        } else {
                            console.log('?????? ?????? ???? ?????? ???????????????? ???? ????????');
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
                                }).catch((e) => { console.log("?????? ?????? ???? ?????? ???????????????? ???? ????????") });
                            } else {
                                console.log('?????? ?????? ???? ?????? ???????????????? ???? ????????');
                            }
                        }).catch((e) => { console.log("Checking Directory Error : " + e.message); });
                    }).catch((e) => { console.log("Directory Creating Error : " + e.message); });
                }
            });
            // console.log(res)
        });
    };

    render() {
        const myIcon = (<Icon name="dots-vertical" style={{ marginRight: 20 }} color="#FFF" size={20} />)
        return (
            <Container>
                <Modal
                    transparent={true}
                    onBackdropPress={() => this.setState({ showModal: false })}
                    onSwipeComplete={() => this.setState({ showModal: false })}
                    onRequestClose={() => this.setState({ showModal: false })}
                    visible={this.state.showModal}
                    animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modal, { borderRadius: 10 }]}>
                            <Text style={styles.modalTitle}> {"?????????? ?????????? ????????"} </Text>

                            <Text style={styles.text}> ?????? ?????????????? </Text>
                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                onChangeText={(catName) => this.setState({ catName, })}
                            />

                            <Text style={styles.text}> {"??????????????"} </Text>
                            <TextInput
                                textAlign='right'
                                value={this.props.route.params.name}
                                style={styles.textInput}
                                editable={false}
                                onChangeText={(catName) => this.setState({ catName, })}
                            />

                            <Text style={styles.text}> {"???????? ??????????????"} </Text>
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
                                <Text style={styles.textBtn}> ?????????? </Text>
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
                        <Text style={styles.appName}> {"??????????????????"} </Text>
                    </Body>
                    <Right style={{ flex: 1 }}>
                        <OptionsMenu
                            customButton={myIcon}
                            destructiveIndex={1}
                            options={["????????????", "???????????? ??????????????", "?? - ??"]}
                            actions={[() => this.sortFiles("latest", this.state.categories), () => this.sortFiles("largest", this.state.categories), () => this.sortFiles("alpha", this.state.categories)]} />
                    </Right>
                </Header>
                <StatusBar backgroundColor={defColor} />
                <View style={{ flex: 1 }}>

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