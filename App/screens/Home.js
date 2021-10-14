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


export default class Home extends Component {
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
      SharedFiles: []
    };
  }

  componentDidMount() {
    console.log(this.props.route.params.files.contentUri)
    if(this.props.route.params.files != null){
      this.setState({SharedFiles:this.props.route.params.files, moved: this.props.route.params.files.contentUri, showModal: true})
    }
    // AsyncStorage.removeItem("images")
    this.handleDownloads()
    this.loadFiles()
    const navigation = this.props.navigation
    navigation.addListener('focus', () => {
      this.handleDownloads()
      this.loadFiles()
    })
}

componentWillUnmount() {
    const navigation = this.props.navigation
    navigation.removeListener('focus')
}

  saveImage = async () => {
    const { moved, category, imgNote, album } = this.state
    const catToAdd = { label: category, value: category, icon: moved, note: imgNote ,album }
    const catToAddArray = [{ label: category, value: category, icon: moved, note: imgNote ,album }]
    // if (category != '') {
    if (moved != '' && category != '') {
      const cats = await AsyncStorage.getItem("images")
      if (cats != null) {
        const catsJson = JSON.parse(cats)
        catsJson.push(catToAdd)
        AsyncStorage.setItem("images", JSON.stringify(catsJson))
        this.handleDownloads()
        this.loadFiles()
        this.setState({
          moved: '',
          category: '',
          imgNote: '',
          showModal: false
        })
        console.log("تمت اضافة التصنيف")
      } else {
        console.log("not found")
        AsyncStorage.setItem("images", JSON.stringify(catToAddArray))
        this.handleDownloads()
        this.loadFiles()
        this.setState({
          moved: '',
          category: '',
          imgNote: '',
          showModal: false
        })
        console.log("تمت اضافة التصنيف")
      }
    } else {
      console.log("يجب اضافة التصنيف و الصورى الخاصه به")
    }
  }

  async loadFiles() {
    try {
      const albums = await AsyncStorage.getItem("albums")
      const cats = await AsyncStorage.getItem("category")

      const img = await AsyncStorage.getItem("images")
      
      // console.log(img)
      this.setState({ albums: JSON.parse(albums), categories: JSON.parse(cats), allImages: JSON.parse(img) })
    } catch (error) {
      console.log(error);
    }
  }

  async handleDownloads() {
    try {
      const files = await RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.SDCardDir + "/mynote/");
      this.setState({ files })
    } catch (error) {
      console.log(error);
    }
  }

  selectVideo = async () => {
    const noteDir = RNFetchBlob.fs.dirs.SDCardDir + "/mynote/"
    ImagePicker.showImagePicker({
      title: '',
      cancelButtonTitle: "إلغاء",
      // chooseWhichLibraryTitle:
      takePhotoButtonTitle: "استخدام الكاميرا",
      chooseFromLibraryButtonTitle: "اختر من المعرض",
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
                    this.setState({ moved: noteDir + filename, showModal: true, imgData: res.data})
                    
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
                  this.setState({ moved: noteDir + filename, showModal: true, imgData: res.data})
                  
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
                  // create an empty file fisrt
                  let createEmptyFile = RNFetchBlob.fs.createFile(noteDir + filename, '', 'base64');
                  // then you can move it or move it like
                  RNFetchBlob.fs.mv(res.path, noteDir + filename).then(() => {
                    this.setState({ moved: noteDir + filename, showModal: true, imgData: res.data})
                    
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
                  this.setState({ moved: noteDir + filename, showModal: true, imgData: res.data})
                  
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

  render() {
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
          </View>
        </Modal>

        <Header style={{ backgroundColor: "#2196f3" }}>
          <Body style={styles.headerBody}>
            <Text style={styles.appName}> {"My Note"} </Text>
          </Body>
        </Header>
        <StatusBar backgroundColor="#2196f3" />
        <View style={{ flex: 1 }}>
          <GalleryComponent files={this.state.allImages} navigation={this.props.navigation} />
          {/* <Thumbnail onPress={() => console.log("press")} url="https://www.youtube.com/watch?v=fzeNNkutcyU" /> */}
          <Fab
            active={this.state.active}
            direction="up"
            containerStyle={{}}
            style={{ backgroundColor: '#2196f3' }}
            position="bottomRight"
            onPress={() => this.setState({active: !this.state.active})}>
            <Icon name="plus" />
            <Button onPress={()=> this.selectVideo()} style={{ backgroundColor: '#e3e3e3', borderRadius: 20, alignSelf: 'center', height: 40, width: 40 }}>
              <Icon2 name="video-camera" size={20} color="#444" />
            </Button>
            <Button onPress={()=> this.selectImage()} style={{ backgroundColor: '#e3e3e3', borderRadius: 20, alignSelf: 'center', height: 40, width: 40 }}>
              <Icon name="camera-image" size={20}  color="#444"/>
            </Button>
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
    fontFamily:'Tajawal-Regular'
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
    color: '#2196f3',
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