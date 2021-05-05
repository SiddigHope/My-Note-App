import React, { Component } from 'react';
import { Alert, View, FlatList, StyleSheet, Image, Text, Modal, TextInput, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import { Container, Content, Fab } from 'native-base';
import RNFetchBlob from "rn-fetch-blob";
import AsyncStorage from '@react-native-community/async-storage';
import _ from "lodash"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from 'react-native-check-box';
import { defColor } from '../config/colorConfig';
import ImagePicker from 'react-native-image-picker'

const { width, height } = Dimensions.get("window")

export default class ListsComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            edit: false,
            showCheckBox: false,
            selectedImages: [],
            showModal: false,
            item: [],
            catName: '',
            catIcon: '',
            catNote: ''
        };
    }

    deleteCat = async () => {
        const img = await AsyncStorage.getItem("category")
        const category = JSON.parse(img)

        let string = '[]'
        let filtered = category
        for (var i = 0; i < this.state.selectedImages.length; i++) {
            const data = _.filter(category, obj => {
                // console.log(category)
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
                        this.setState({ files: filtered, edit: true })
                        AsyncStorage.setItem("category", JSON.stringify(filtered))
                        // this.props.navigation.navigate("Tabs")
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

    deleteAlbum = async () => {
        // console.log(item)
        const img = await AsyncStorage.getItem("albums")
        const albums = JSON.parse(img)

        let string = '[]'
        let filtered = albums
        for (var i = 0; i < this.state.selectedImages.length; i++) {
            const data = _.filter(albums, obj => {
                // console.log(albums)
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
                        // console.log(filtered)
                        this.setState({ files: filtered, edit: true })
                        AsyncStorage.setItem("albums", JSON.stringify(filtered))
                        // this.props.navigation.navigate("Tabs")
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

    deleteItem = async () => {
        if (this.state.selectedImages.length <= 0) {
            return this.setState({ showCheckBox: false })
        }
        if (this.props.page == "category") {
            this.deleteCat()
        } else {
            this.deleteAlbum()
        }
    }

    goToGallery = async (item) => {
        if (this.props.page == "category") {
            this.filterCats(item)
        } else {
            this.filterAlbums(item)
        }
    }

    filterAlbums = async (item) => {
        const img = await AsyncStorage.getItem("images")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = JSON.parse(string)
        // console.log(item.item)
        const data = _.filter(images, obj => {
            // console.log(item.item)
            if (obj.album == item.item.label) {
                // console.log(obj.album +"-----"+ item.item.label)
                // console.log(item.item.item.item.icon)
                // console.log(obj.item.item.icon)
                filtered.push(obj)
                // console.log("11111111111")
                return true
            }
            // console.log("000000000")
            return false
        })
        this.props.navigation.navigate("SubGalleryComponent", { cat: item.item.note, name: item.item.label, files: filtered })
    }

    filterCats = async (item) => {
        const img = await AsyncStorage.getItem("albums")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = JSON.parse(string)
        // console.log(item)
        const data = _.filter(images, obj => {
            // console.log(item.item)
            if (obj.note == item.item.label) {
                // console.log(item.item.item.item.icon)
                // console.log(obj.item.item.icon)
                filtered.push(obj)
                // console.log("11111111111")
                return true
            }
            // console.log("000000000")
            return false
        })
        this.props.navigation.navigate("SubAlbumsComponent", { cat: item.item.note, name: item.item.label, files: filtered })
    }

    checkSelectedImage(uri) {
        let url = uri.item.icon
        if (!url.includes("/mynote/")) {
            url = uri.item.contentUri
        }
        const index = this.state.selectedImages.indexOf(url)
        return index > -1 ? true : false
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
                this.setState({
                    selectedImages: this.state.selectedImages,
                })
                // console.log(this.state.selectedImages)
            } else {
                this.state.selectedImages.push(url)
                this.setState({
                    selectedImages: this.state.selectedImages,
                })
                // console.log(this.state.selectedImages)
            }
        } else {
            const item0 = [url]
            // console.log(item0)
            this.setState({ selectedImages: item0 })
            // console.log("added")
        }
    }

    changeName = () => {
        // var json = [{ "_id": "5078c3a803ff4197dc81fbfb", "email": "user1@gmail.com", "image": "some_image_url", "name": "Name 1" }, { "_id": "5078c3a803ff4197dc81fbfc", "email": "user2@gmail.com", "image": "some_image_url", "name": "Name 2" }];
        // json = JSON.parse(JSON.stringify(json).split('"_id":').join('"id":'));

    }
    _renderItem = (item, index) => {
        const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
        // const itemObj = JSON.parse(item.item)
        // console.log(item.item.icon)
        const check = this.checkSelectedImage(item)
        return (
            <>
                <Pressable
                    onLongPress={() => {
                        this.setState({ showCheckBox: true })
                        console.log("log pressed")
                    }}
                    onPress={() => !this.state.showCheckBox ? this.goToGallery(item) : this.addImageToArray(item)}
                    style={styles.listCont}>
                    <Icon
                        onPress={() => this.setState({
                            showModal: true,
                            item: item.item,
                            catName: item.item.label,
                            catIcon: item.item.icon
                        })}
                        name="pen-plus"
                        style={{ marginLeft: 10 }}
                        size={25} color={defColor} />
                    <View style={styles.details}>
                        <Text style={styles.catName}> {item.item.label} </Text>
                        <Text style={styles.catNote}> {item.item.note} </Text>
                    </View>
                    <View style={styles.imageCont}>
                        <Image source={{ uri: "file://" + item.item.icon }} style={styles.image} />
                    </View>
                    {this.state.showCheckBox ? (
                        <CheckBox
                            checkBoxColor="#e3e3e3"
                            style={{ flex: 1, right: 5, bottom: 10, position: "absolute" }}
                            onClick={() => {
                                this.addImageToArray(item)
                            }}
                            isChecked={check}
                        />
                    ) : (
                        null
                    )}
                </Pressable>
            </>
        )
    }

    _listSeparator = () => {
        return (
            <View style={{ height: 10 }} />
        )
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

    addAlb = async () => {
        // console.log("in album edit")
        const { catIcon, catName, catNote } = this.state
        const name = catName != '' ? catName: this.state.item.label
        const catToAdd = { label: catName != '' ? catName : this.state.item.label, value: catName != '' ? catName : this.state.item.label, icon: catIcon != '' ? catIcon : this.state.item.icon, note: this.state.item.note, password: '' }
        if (name != '') {
            const cats = await AsyncStorage.getItem("albums")
            const images = await AsyncStorage.getItem("images")
            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)
                const data = _.filter(catsJson, obj => {
                    // console.log(albums)
                    if (obj == undefined) {
                        return
                    }else{
                        // console.log("dosn't == undefined")
                    }
                    if (obj.icon == this.state.item.icon) {
                        const index = catsJson.indexOf(obj)
                        if (index > -1) {
                            catsJson.splice(index, 1)
                        }
                        console.log("******match*****")
                    }else{
                        console.log("dosn't match")
                    }
                })
                let json = images !=null? JSON.parse(images.split(`"album":"${this.state.item.label}"`).join(`"album":"${catName != '' ? catName : this.state.item.label}"`)):null;
                // console.log(json)
                if(this.props.show){
                    json = JSON.parse(cats.split(`"note":"${this.props.name}"`).join(`"note":"${this.props.name}"`));
                }
                this.setState({ edit: true, files: catsJson })
                AsyncStorage.setItem("albums", JSON.stringify(catsJson))
                AsyncStorage.setItem("images", JSON.stringify(json))
                // this.loadAlbums()
                this.setState({
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }

    addCat = async () => {
        // console.log("in category edit")
        const { catIcon, catName, catNote } = this.state
        const name = catName != '' ? catName: this.state.item.label
        const catToAdd = { label: catName != '' ? catName : this.state.item.label, value: catName != '' ? catName : this.state.item.label, icon: catIcon != '' ? catIcon : this.state.item.icon, note: catNote }
        if (name != '') {
            const cats = await AsyncStorage.getItem("category")
            const albums = await AsyncStorage.getItem("albums")

            if (cats != null) {
                const catsJson = JSON.parse(cats)
                catsJson.push(catToAdd)

                const data = _.filter(catsJson, obj => {
                    // console.log(albums)
                    if (obj == undefined) {
                        return
                    }
                    if (obj.icon == this.state.item.icon) {
                        const index = catsJson.indexOf(obj)
                        if (index > -1) {
                            catsJson.splice(index, 1)
                        }
                    }
                })
                const json = JSON.parse(albums.split(`"note":"${this.state.item.label}"`).join(`"note":"${catName != '' ? catName : this.state.item.label}"`));
                // console.log(json)
                this.setState({ edit: true, files: catsJson })
                AsyncStorage.setItem("category", JSON.stringify(catsJson))
                AsyncStorage.setItem("albums", JSON.stringify(json))

                this.setState({
                    showModal: false
                })
                console.log("تمت اضافة التصنيف")
            }
        } else {
            console.log("يجب اضافة التصنيف و الصورى الخاصه به")
        }
    }

    render() {
        // console.log(this.props.page)
        return (
            <Container style={styles.container}>
                <Modal
                    transparent={true}
                    onBackdropPress={() => this.setState({ showModal: false })}
                    onSwipeComplete={() => this.setState({ showModal: false })}
                    onRequestClose={() => this.setState({ showModal: false })}
                    visible={this.state.showModal}
                    animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modal, { borderRadius: 10 }]}>
                            <Text style={styles.modalTitle}> {"تعديل الالبوم "} </Text>

                            <Text style={styles.text}> اسم الالبوم </Text>
                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                placeholder={this.state.item.label}
                                onChangeText={(catName) => this.setState({ catName, })}
                            />

                            <Text style={styles.text}> {"صورة للألبوم"} </Text>
                            <Pressable onPress={() => this.selectImage()} style={[{ backgroundColor: "#FFF", justifyContent: 'center' }]}>
                                <View style={styles.imageContainer}>
                                    <Image source={{ uri: "file://" + this.state.item.icon }} style={styles.iconImg} />
                                </View>
                            </Pressable>

                            <TouchableOpacity
                                onPress={() => this.props.page == "category"?this.addCat():this.addAlb()}
                                style={styles.btn}>
                                <Icon name="check" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> اضافة </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                {this.state.showCheckBox ? (
                    <>
                        <Fab
                            active={this.state.showCheckBox}
                            direction="up"
                            style={{ backgroundColor: defColor, zIndex: 1 }}
                            position="bottomLeft"
                            onPress={() => {
                                this.deleteItem()
                                this.setState({ showCheckBox: !this.state.showCheckBox })
                            }}>

                            {this.state.selectedImages.length>0?(
                                <Icon name="trash-can-outline" size={30} color="#FFF" />
                            ):(
                                <Icon name="close" size={30} color="#FFF" />
                            )}
                        </Fab>
                    </>
                ) : (
                    null
                )}
                <Content>
                    <FlatList
                        data={this.state.edit ? this.state.files : this.props.files}
                        ListHeaderComponent={this._listSeparator}
                        ListFooterComponent={this._listSeparator}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={this._listSeparator}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this._renderItem}
                    />
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listCont: {
        backgroundColor: "#FFF",
        height: 100,
        width: width - 20,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center'
    },

    imageCont: {
        height: 90,
        backgroundColor: "#e3e3e3",
        width: "30%",
        borderRadius: 10
    },

    image: {
        height: 90,
        width: '100%',
        borderRadius: 10
    },
    details: {
        flex: 1,
        marginRight: 10
    },
    catName: {
        fontSize: 14,
        marginTop: 10,
        fontFamily: 'Tajawal-Bold',
        marginBottom: 10,
        color: '#444'
    },
    catNote: {
        fontSize: 12,
        fontFamily: 'Tajawal-Regular',
        marginBottom: 10,
        color: 'grey'
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
    imageContainer: {
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
