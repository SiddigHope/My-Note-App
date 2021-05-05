import React, { PureComponent } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, DevSettings, FlatList, Modal, TextInput, Alert } from 'react-native';
import { Container, Header, Fab, Right, Left, Body } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import { defColor } from '../config/colorConfig';
import { ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SelectMultiple from 'react-native-select-multiple'
import CheckBox from 'react-native-check-box'
import { ToastAndroid } from 'react-native';


const { width, height } = Dimensions.get("window")
const colors = [
    "#757575",
    "#ef5350",
    "#2196f3",
    "#ab47bc",
    "#66bb6a",
]

const app = {
    label: 'قفل التطبيق',
    value: 'قفل التطبيق'
}

export default class Settings extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            albums: [],
            album: {},
            password: '',
            selected: [],
            selectedItems: [],
            appPass: false,
            showModal: false
        };
    }
    componentDidMount() {
        // DevSettings.reload()
        this.loadAlbums()
        this.loadCheckboxes()

        const navigation = this.props.navigation
        navigation.addListener('focus', () => {
            this.loadAlbums()
            this.loadCheckboxes()

        })
    }

    componentWillUnmount() {
        const navigation = this.props.navigation
        navigation.removeListener('focus')
    }

    async loadAlbums() {
        try {
            const albums = await AsyncStorage.getItem("albums")
            // console.log(albums)
            this.setState({ albums: JSON.parse(albums) })
        } catch (error) {
            console.log(error);
        }
    }

    async loadCheckboxes() {
        try {
            const lockApp = await AsyncStorage.getItem("lockApp")
            const lockAlbumsSelected = await AsyncStorage.getItem("lockAlbumsSelected")
            // console.log(albums)
            if (lockApp == 'true') {
                this.setState({
                    appPass: true
                })
            }
            if (lockApp == "false") {
                this.setState({
                    appPass: false
                })
            }
            if (lockAlbumsSelected != null) {
                console.log(lockAlbumsSelected)
                this.setState({
                    selectedItems: JSON.parse(lockAlbumsSelected)
                })
            }
        } catch (error) {
            console.log(error);
        }
    }

    async setTheme(color) {
        // console.log(color)
        const prev = await AsyncStorage.getItem("color")
        if (prev != color) {
            console.log(prev)
            console.log(color)
            AsyncStorage.setItem("color", color)
            DevSettings.reload()
        }
    }

    async setAppPassword() {
        const { selected, appPass, password, selectedItems } = this.state
        if (password != '') {
            if (appPass) {
                AsyncStorage.setItem("lockApp", "true")
            } else {
                AsyncStorage.setItem("lockApp", "false")
            }
            if (selected.length > 0) {
                AsyncStorage.setItem("lockAlbums", String(selected))
                AsyncStorage.setItem("lockAlbumsSelected", JSON.stringify(selectedItems))
            } else {
                AsyncStorage.setItem("lockAlbums", "")
                AsyncStorage.setItem("lockAlbumsSelected", JSON.stringify(selectedItems))
            }
            AsyncStorage.setItem("lockPassword", password)
            this.setState({ showModal: false })
            DevSettings.reload()
        } else {
            ToastAndroid.show("يجب ادخال كلمة مرور", ToastAndroid.LONG)
        }
    }

    _renderItem = (item, index) => {
        // console.log(item)
        return (
            <TouchableOpacity onPress={() => this.setTheme(item.item)} >
                <>
                    <View style={{ flex: 1, height: width / 5.5, width: width / 5.5, backgroundColor: item.item }} />
                </>
            </TouchableOpacity>
        )
    }

    renderLabel = (item) => {
        // console.log(style)
        return (
            <View style={{ marginRight: 10 }}>
                <Text style={{ fontFamily: 'Tajawal-Regular' }} >{item}</Text>
            </View>
        )
    }

    onSelectionsChange = (select) => {

        const { selected, selectedItems } = this.state
        const arr = []
        select.forEach(element => {
            // console.log(element.value)
            // if (selected.length > 0) {
            //     let index = selected.indexOf(element.value)
            //     if (index > -1) {
            //         return false
            //     } else {
                    arr.push(element.value)
            //     }
            // } else {
            //     selected.push(element.value)
            // }
        });
        this.setState({ selected: arr, selectedItems: select })
        console.log(arr)
    }

    render() {
        return (
            <View style={styles.container}>
                <Header style={{ backgroundColor: defColor }} androidStatusBarColor={defColor}>
                    <Left style={{ flex: 1, }}>

                    </Left>
                    <Body style={[styles.headerBody, { flex: 1 }]}>
                        <Text style={styles.appName}> {"الإعدادت"} </Text>
                    </Body>
                    <Right style={{ flex: 1 }}>

                    </Right>
                </Header>

                <Modal
                    transparent={true}
                    onBackdropPress={() => this.setState({ showModal: false })}
                    onSwipeComplete={() => this.setState({ showModal: false })}
                    onRequestClose={() => this.setState({ showModal: false })}
                    visible={this.state.showModal}
                    animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={[styles.modal, { borderRadius: 10 }]}>
                            <Text style={styles.modalTitle}> {"اكتب كلمة المرور"} </Text>

                            <TextInput
                                textAlign='right'
                                style={styles.textInput}
                                onChangeText={(password) => this.setState({ password, })}
                            />

                            <TouchableOpacity
                                onPress={() => this.setAppPassword()}
                                style={[styles.btn, { marginTop: 10, marginRight: 0 }]}>
                                <Icon name="lock" size={15} color="#FFF" />
                                <Text style={styles.textBtn}> تأكيد </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <ScrollView>
                    <View style={[{ marginTop: 20, width: '90%', alignSelf: 'center' }]} >
                        <Text style={{ marginBottom: 10, fontFamily: "Tajawal-Regular", color: defColor, fontSize: 16 }}> {"تغيير الالوان الرئيسية بالتطبيق"} </Text>

                        <FlatList
                            data={colors}
                            numColumns={5}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this._renderItem}
                        />
                    </View>
                    <View style={[{ marginTop: 50, width: '90%', alignSelf: 'center' }]} >
                        <Text style={{ marginBottom: 10, fontFamily: "Tajawal-Regular", color: defColor, fontSize: 16 }}> {"ضع كلمة مرور"} </Text>
                        <CheckBox
                            // checkBoxColor="#e3e3e3"
                            style={{ backgroundColor: "#FFF", borderBottomColor: '#4444', paddingRight: 20, borderBottomWidth: 1, height: 55, justifyContent: 'center' }}
                            leftTextStyle={{ marginRight: 10, fontFamily: 'Tajawal-Regular' }}
                            onClick={() => {
                                this.setState({ appPass: !this.state.appPass })
                            }}
                            isChecked={this.state.appPass}
                            leftText={app.value}
                        />
                        <SelectMultiple
                            items={this.state.albums ? this.state.albums : []}
                            style={{ marginBottom: 20, borderRadius: 10 }}
                            rowStyle={{ flexDirection: 'row-reverse' }}
                            renderLabel={this.renderLabel}
                            selectedItems={this.state.selectedItems}
                            onSelectionsChange={(items) => this.onSelectionsChange(items)} />

                    </View>
                    <TouchableOpacity onPress={() => {
                        this.setState({ showModal: !this.state.showModal })
                    }}
                        style={[styles.btn]}
                    >
                        <Icon name="lock" size={30} color="#e3e3e3" />
                        <Text style={styles.textBtn}> {"قفل"} </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
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
    btn: {
        marginRight: 20,
        flexDirection: 'row',
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
    textBtn: {
        color: "#FFF",
        fontFamily: "Tajawal-Regular",
        fontSize: 14
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
    modalContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: "center",
        justifyContent: "center"
    },
})