import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Header, Icon } from 'react-native-elements';
import firebase from 'firebase';
import { RFValue } from 'react-native-responsive-fontsize';
import db from '../config.js';

export default class RecieverDetailsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: firebase.auth().currentUser.email,
      userName: '',
      recieverId: this.props.navigation.getParam('details')['user_id'],
      requestId: this.props.navigation.getParam('details')['request_id'],
      jobName: this.props.navigation.getParam('details')['job_name'],
      jobImage: '#',
      description: this.props.navigation.getParam('details')['description'],
      recieverName: '',
      recieverContact: '',
      recieverAddress: '',
      recieverRequestDocId: '',
    };
  }

  getRecieverDetails() {
    db.collection('users')
      .where('email_id', '==', this.state.recieverId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            recieverName: doc.data().first_name,
            recieverContact: doc.data().contact,
            recieverAddress: doc.data().address,
          });
        });
      });

    db.collection('requested_jobs')
      .where('request_id', '==', this.state.requestId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            recieverRequestDocId: doc.id,
            jobImage: doc.data().image_link,
          });
        });
      });
  }

  getUserDetails = (userId) => {
    db.collection('users')
      .where('email_id', '==', userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            userName: doc.data().first_name + ' ' + doc.data().last_name,
          });
        });
      });
  };

  updateJobStatus = () => {
    db.collection('all_jobs').add({
      job_name: this.state.jobName,
      request_id: this.state.requestId,
      requested_by: this.state.recieverName,
      person_id: this.state.userId,
      request_status: 'Interested',
    });
  };

  addNotification = () => {
    var message =
      this.state.userName + ' has shown interest in applying for this Job';
    db.collection('all_notifications').add({
      targeted_user_id: this.state.recieverId,
      donor_id: this.state.userId,
      request_id: this.state.requestId,
      job_name: this.state.jobName,
      date: firebase.firestore.FieldValue.serverTimestamp(),
      notification_status: 'unread',
      message: message,
    });
  };

  componentDidMount() {
    this.getRecieverDetails();
    this.getUserDetails(this.state.userId);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1 }}>
          <Header
            leftComponent={
              <Icon
                name="arrow-left"
                type="feather"
                color="#ffffff"
                onPress={() => this.props.navigation.goBack()}
              />
            }
            centerComponent={{
              text: 'Jobs',
              style: {
                color: '#ffffff',
                fontSize: RFValue(20),
                fontWeight: 'bold',
              },
            }}
            backgroundColor="#32867d"
          />
        </View>
        <View style={{ flex: 0.9 }}>
          <View
            style={{
              flex: 0.3,
              flexDirection: 'row',
              paddingTop: RFValue(30),
              paddingLeft: RFValue(10),
            }}>
            <View style={{ flex: 0.4 }}>
              <Image
                style={{ height: 100, width: 150, marginTop: 20 }}
            source={require('../assets/unnamed.png')}
              />
            </View>
            <View
              style={{
                flex: 0.6,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: RFValue(25),
                  textAlign: 'center',
                }}>
                {this.state.jobName}
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: RFValue(15),
                  textAlign: 'center',
                  marginTop: RFValue(15),
                }}>
                {this.state.description}
              </Text>
            </View>
          </View>
          <View
            style={{
              flex: 0.7,
              padding: RFValue(20),
            }}>
            <View
              style={{
                flex: 0.7,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: RFValue(50),
                borderWidth: 1,
                borderColor: '#deeedd',
                padding: RFValue(10),
              }}>
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: RFValue(30),
                }}>
                Reciever Information
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: RFValue(20),
                  marginTop: RFValue(30),
                }}>
                Name : {this.state.recieverName}
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: RFValue(20),
                  marginTop: RFValue(30),
                }}>
                Contact: {this.state.recieverContact}
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: RFValue(20),
                  marginTop: RFValue(30),
                }}>
                Address: {this.state.recieverAddress}
              </Text>
            </View>
            <View
              style={{
                flex: 0.3,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {this.state.recieverId !== this.state.userId ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    this.updateJobStatus();
                    this.addNotification();
                    this.props.navigation.navigate('MyJobApplications');
                  }}>
                  <Text>I want to Apply</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '60%',
    height: RFValue(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RFValue(60),
    backgroundColor: '#ff5722',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 16,
  },
});
