import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Picker,
  Dimensions,
  AsyncStorage,
  Alert
} from 'react-native';
import { Spinner } from 'native-base';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
import LZString from 'lz-string';

const widthPage = Dimensions.get('window').width;

const options = {
  title: 'Opções',
  cancelButtonTitle: 'Cancelar',
  chooseFromLibraryButtonTitle: 'Escolha uma imagem da sua galeria',
  takePhotoButtonTitle: 'Tire uma foto',
  mediaType: 'photo',
  maxWidth: 800,
  quality: 1
};

export default class AddSpotted extends Component {

  constructor(props) {
    super();
    this.state = {
      course: null,
      location: null,
      text: null,
      image: null,
      sendImage: null,
      sending: false,
      textWarning: false
    };
  }

  selectPhoto = () => {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.error) {
        alert('Algo de errado aconteceu');
      } else {
        const source = { uri: response.uri };
        let sourceData = 'data:image/jpeg;base64,' + response.data;
        //sourceData = LZString.compress(sourceData);
        this.setState({ image: source, sendImage: sourceData });
      }
    });
  }

  submitSpotted = async () => {
    try {
      if (this.state.text.trim().length != 0) {
        this.setState({ sending: true, textWarning: false });
        await fetch('https://api-spotted.herokuapp.com/api/spotted', {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            location: this.state.location,
            course: this.state.course,
            text: this.state.text,
            image: this.state.sendImage
          })
        }).then(async res => {
          if (res.status == 200) {
            await AsyncStorage.setItem('newSpotted', 'true');
            Actions.pop();
          } else {
            const showAlert = () => { Alert.alert('Não foi possível adicionar a nova postagem', 'Por favor, verifique sua conexão com a internet e tente novamente.')};
            showAlert();
            this.setState({ sending: false });
          }
        });
      } else {
        this.setState({ textWarning: true });
      }
    } catch (error) {
      this.setState({ sending: false, textWarning: true });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Adicionar spotted</Text>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Local em que foi visto(a)</Text>
              <TextInput
                placeholder='BG, CAA, CIA, Praça de Alimentação...'
                style={styles.input}
                onChangeText={(location) => this.setState({ location })}
                value={this.state.location}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Curso</Text>
              <TouchableOpacity style={styles.course} activeOpacity={0.8}>
                <Picker
                  selectedValue={this.state.course}
                  style={{ height: 40, width: 320, color: 'gray' }}
                  onValueChange={(itemValue, itemIndex) => this.setState({ course: itemValue })}>
                  <Picker.Item label="Desconhecido" value="Desconhecido" />
                  <Picker.Item label="Ciência da Computação" value="Ciência da Computação" />
                  <Picker.Item label="Eng. Elétrica" value="Eng. Elétrica" />
                </Picker>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Mensagem</Text>
              <TextInput
                placeholder='Abra seu coração'
                keyboardType="default"
                autoCorrect={true}
                underlineColorAndroid="transparent"
                numberOfLines={4}
                multiline={true}
                style={styles.textArea}
                onChangeText={(text) => this.setState({ text })}
                value={this.state.text}
              />
              <Text style={styles.label}>{this.state.textWarning ? 'Esse campo não pode ser vazio' : null}</Text>
              <View style={{ alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                <Image style={styles.imagePreview} source={this.state.image != null ? this.state.image : null} />
              </View>
            </View>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          {this.state.sending ? <Spinner style={{ alignSelf: 'center', position: 'absolute', bottom: 8, }} color={'#EC5D73'} /> :
          <View style={{ margin: 10, flexDirection: 'row', position: 'absolute', bottom: 0 }}>
            <View style={styles.row}>
              <View>
                <TouchableOpacity
                  style={styles.submit}
                  onPress={this.selectPhoto}
                  activeOpacity={0.8}>
                  <Text style={styles.text}>
                    adicionar imagem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.submit}
                onPress={this.submitSpotted}
                activeOpacity={0.8}
                disabled={this.state.sending}>
                <Text style={styles.text}>
                  enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e2ebef'
  },
  title: {
    fontFamily: 'ProductSans',
    fontSize: 22,
    color: 'white'
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2
  },
  row: {
    flex: 1,
    margin: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  label: {
    color: '#EC5D73',
    fontSize: 17,
    fontFamily: 'ProductSans',
    marginLeft: 5,
    margin: 3
  },
  text: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'ProductSans',
    margin: 3
  },
  course: {
    height: 40,
    width: widthPage - 20,
    borderRadius: 10,
    backgroundColor: 'white',
    color: 'gray',
    fontSize: 17,
    fontFamily: 'ProductSans',
    elevation: 3,
    borderColor: '#e7e7e7',
    borderWidth: 2,
    margin: 5
  },
  input: {
    color: 'gray',
    alignItems: 'center',
    fontSize: 17,
    fontFamily: 'ProductSans',
    backgroundColor: 'white',
    borderColor: '#e7e7e7',
    borderWidth: 2,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    margin: 5,
    width: widthPage - 20,
    height: 40,
  },
  textArea: {
    color: 'gray',
    fontSize: 17,
    fontFamily: 'ProductSans',
    backgroundColor: 'white',
    borderColor: '#e7e7e7',
    borderWidth: 2,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    margin: 5,
    width: widthPage - 20,
    height: 120,
  },
  submit: {
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 20,
    fontFamily: 'ProductSans',
    backgroundColor: '#EC5D73',
    borderColor: 'white',
    borderWidth: 1.5,
    borderRadius: 30,
    elevation: 3,
    width: 160,
    height: 40,
    margin: 3
  },
  image: {
    height: 150,
    margin: 150,
    borderRadius: 30,
    margin: 5
  },
  header: {
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#EC5D73', 
    width: widthPage, 
    height: 50,
    marginBottom: 15
  }
});
