import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Text,
    FlatList,
    Dimensions,
    ImageBackground,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import _ from "lodash"
import CheckBox from 'react-native-check-box';
import { Fab } from 'native-base';
import { defColor } from '../config/colorConfig';

const { width, height } = Dimensions.get('window');

class GridsComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,
            files: [],
            edit: false,
            selectedImages: [],
            showCheckBox: false,
        }
    }

    componentDidMount() {
        this.setState({ files: this.props.files })
        const navigation = this.props.navigation
        navigation.addListener('focus', () => {
            this.setState({ files: this.props.files })
        })
    }

    componentWillUnmount() {
        const navigation = this.props.navigation
        navigation.removeListener('focus')
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

    filterAlbums = async (item) => {
        const img = await AsyncStorage.getItem("images")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = JSON.parse(string)
        // console.log(item)
        const data = _.filter(images, obj => {
            // console.log(item)
            if (obj.album == item.label) {
                // console.log(item.item.icon)
                // console.log(obj.item.icon)
                filtered.push(obj)
                // console.log("11111111111")
                return true
            }
            // console.log("000000000")
            return false
        })
        this.props.navigation.navigate("SubGalleryComponent", { cat: item.note, name: item.label, files: filtered })
    }

    filterCats = async (item) => {
        const img = await AsyncStorage.getItem("albums")
        const images = JSON.parse(img)

        let string = '[]'
        let filtered = JSON.parse(string)
        // console.log(item)
        const data = _.filter(images, obj => {
            // console.log(item)
            if (obj.note == item.label) {
                // console.log(item.item.icon)
                // console.log(obj.item.icon)
                filtered.push(obj)
                // console.log("11111111111")
                return true
            }
            // console.log("000000000")
            return false
        })
        this.props.navigation.navigate("SubAlbumsComponent", { cat: item.note, name: item.label, files: filtered })
    }

    goToGallery = async (item) => {
        if (this.props.page == "category") {
            this.filterCats(item)
        } else {
            this.filterAlbums(item)
        }
    }

    deleteItem = async () => {
        if(this.state.selectedImages.length <= 0){
            return this.setState({showCheckBox: false})
        }
        if (this.props.page == "category") {
            this.deleteCat()
        } else {
            this.deleteAlbum()
        }
    }

    _listFooter = () => {
        return (
            <View style={{ height: 10 }} />
        )
    }

    checkSelectedImage(uri) {
        let url = uri.icon
        if (!url.includes("/mynote/")) {
            url = uri.contentUri
        }
        const index = this.state.selectedImages.indexOf(url)
        return index > -1 ? true : false
    }

    addImageToArray(uri) {
        let url = uri.icon
        if (!url.includes("/mynote/")) {
            url = uri.contentUri
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


    render() {
        return (
            <View style={styles.container}>
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

                            <Icon name="trash-can-outline" size={30} color="#FFF" />
                        </Fab>
                    </>
                ) : (
                    null
                )}
                <FlatList
                    data={this.state.edit ? this.state.files : this.props.files}
                    numColumns={2}
                    ListFooterComponent={this._listFooter}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={this._listFooter}
                    renderItem={({ item, index }) => {
                        // console.log(item)
                        const image = { uri: "file://" + item.icon }
                        const check = this.checkSelectedImage(item)

                        return (
                            <TouchableWithoutFeedback
                                onLongPress={() => {
                                    this.setState({ showCheckBox: true })
                                    console.log("log pressed")
                                }}
                                onPress={() => !this.state.showCheckBox ? this.goToGallery(item) : this.addImageToArray(item)}
                            >
                                <Surface style={styles.surface}>
                                    <ImageBackground
                                        source={image}
                                        style={styles.img}
                                    >
                                        <View style={{ justifyContent: 'space-evenly' }}>
                                            <View style={{ alignItems: 'flex-start' }}>
                                                {/* <TouchableOpacity onPress={() => { this.deleteItem(item) }}>
                                                    <Icon
                                                        name="trash-can"
                                                        color="#ef5350"
                                                        size={25}
                                                        style={{ marginRight: 5 }}
                                                    />
                                                </TouchableOpacity> */}
                                            </View>
                                        </View>
                                        <Text style={styles.name}>{item.label}</Text>
                                    </ImageBackground>
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
                                </Surface>
                            </TouchableWithoutFeedback>
                        );
                    }}
                />
            </View>
        );
    }
}

export default GridsComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 5,
        marginBottom: 10
    },
    title: {
        fontFamily: 'Tajawal-Regular',
        fontSize: 18,
        // fontWeight: 'bold',
        color: '#075D54',
        margin: 5,
        marginRight: 15,
    },
    surface: {
        elevation: 5,
        height: 150,
        marginTop: 5,
        width: 150,
        borderRadius: 10,
        marginRight: 10,
        marginLeft: 15,
        overflow: 'hidden',
        backgroundColor: '#e3e3e3'
    },
    img: {
        height: 150,
        width: 150,
        borderRadius: 10,
        padding: 10,
        alignItems: 'flex-end'
    },
    name: {
        textAlign: "center",
        backgroundColor: "rgba(33,150,243,.5)",//(33,150,243)
        width: (width * 40) / 100,
        fontFamily: 'Tajawal-Regular',
        position: 'absolute',
        bottom: 10,
        left: 7,
        borderRadius: 5,
        color: '#FFF',
        // fontWeight: 'bold',
        fontSize: 16,
    },
    footerContainer: { marginRight: 10, alignSelf: 'center', height: 145, backgroundColor: '#FFF', elevation: 5, paddingHorizontal: 10, marginTop: 5, alignItems: "center", justifyContent: "center", borderRadius: 5 },
    footerText: { color: '#e3e3e3', fontFamily: 'Tajawal-Regular', fontSize: 16 }

});