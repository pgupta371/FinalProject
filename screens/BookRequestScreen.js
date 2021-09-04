import React, { Component } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,
  Image,
} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import { RFValue } from 'react-native-responsive-fontsize';
import { SearchBar, ListItem, Input } from 'react-native-elements';

import MyHeader from '../components/MyHeader';

export default class BookRequestScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      jobName: '',
      reasonToRequest: '',
      IsJobRequestActive: '',
      requestedJobName: '',
      jobStatus: '',
      requestId: '',
      userDocId: '',
      docId: '',
      Imagelink: '#',
      dataSource: '',
      requestedImageLink: '',
      showFlatlist: false,
    };
  }

  createUniqueId() {
    return Math.random().toString(36).substring(7);
  }

  addPost = async (jobName, description) => {
    var userId = this.state.userId;
    var randomRequestId = this.createUniqueId();

    db.collection('requested_jobs').add({
      user_id: userId,
      job_name: jobName,
      description: description,
      request_id: randomRequestId,
      job_status: 'requested',
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await this.getJobPost();
    db.collection('users')
      .where('email_id', '==', userId)
      .get()
      .then()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection('users').doc(doc.id).update({
            IsJobRequestActive: true,
          });
        });
      });

    this.setState({
      jobName: '',
      description: '',
      requestId: randomRequestId,
    });

    return alert('Job Posted Successfully');
  };

  receivedJobs = (jobName) => {
    var userId = this.state.userId;
    var requestId = this.state.requestId;
    db.collection('received_jobs').add({
      user_id: userId,
      job_name: jobName,
      request_id: requestId,
      jobStatus: 'received',
    });
  };

  getIsJobRequestActive() {
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            IsJobRequestActive: doc.data().IsJobRequestActive,
            userDocId: doc.id,
          });
        });
      });
  }

  getJobPost = () => {
    var jobRequest = db
      .collection('requested_jobs')
      .where('user_id', '==', this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().job_status !== 'received') {
            this.setState({
              requestId: doc.data().request_id,
              requestedJobName: doc.data().job_name,
              jobStatus: doc.data().job_status,
              requestedImageLink: doc.data().image_link,
              docId: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    //to get the first name and last name
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().first_name;
          var lastName = doc.data().last_name;

          db.collection('all_notifications')
            .where('request_id', '==', this.state.requestId)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorId = doc.data().donor_id;
                var jobName = doc.data().job_name;

                //targert user id is the donor id to send notification to the user
                db.collection('all_notifications').add({
                  targeted_user_id: donorId,
                  message:
                    name +
                    ' ' +
                    lastName +
                    ' received the job post of ' +
                    jobName,
                  notification_status: 'unread',
                  job_name: jobName,
                });
              });
            });
        });
      });
  };

  componentDidMount() {
    this.getJobPost();
    this.getIsJobRequestActive();
  }

  updateJobRequestStatus = () => {
    db.collection('requested_jobs').doc(this.state.docId).update({
      job_status: 'received',
    });

    //getting the  doc id to update the users doc
    db.collection('users')
      .where('email_id', '==', this.state.userId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          //updating the doc
          db.collection('users').doc(doc.id).update({
            IsJobRequestActive: false,
          });
        });
      });
  };

  renderItem = ({ item, i }) => {
    let obj = {
      title: item.volumeInfo.title,
      selfLink: item.selfLink,
      buyLink: item.saleInfo.buyLink,
      imageLink: item.volumeInfo.imageLinks,
    };

    return (
      <TouchableHighlight
        style={styles.touchableopacity}
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={() => {
          this.setState({
            showFlatlist: false,
            jobName: item.volumeInfo.title,
          });
        }}
        bottomDivider>
        <Text> {item.volumeInfo.title} </Text>
      </TouchableHighlight>
    );
  };

  render() {
    if (this.state.IsJobRequestActive === true) {
      return (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 0.1,
            }}>
            <MyHeader title="Job Status" navigation={this.props.navigation} />
          </View>

          <View style={styles.bookstatus}>
            <Text
              style={{
                fontSize: RFValue(20),
              }}>
              Job Name:
            </Text>
            <Text style={styles.requestedbookName}>
              {this.state.requestedJobName}
            </Text>
            <Text style={styles.status}>Status</Text>
            <Text style={styles.bookStatus}>{this.state.jobStatus}</Text>
          </View>
          <View style={styles.buttonView}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.sendNotification();
                this.updateJobRequestStatus();
                this.receivedJobs(this.state.requestedJobName);
              }}>
              <Text style={styles.buttontxt}>Applicants Recived</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.1 }}>
          <MyHeader title="Post Job" navigation={this.props.navigation} />
        </View>

        <View style={{ flex: 0.9 }}>
          <Input
            style={styles.formTextInput}
            label={'Job Name'}
            placeholder={'Job Name'}
            containerStyle={{ marginTop: RFValue(60) }}
            value={this.state.jobName}
            onChangeText={(text) => {
              this.setState({
                jobName: text,
              });
            }}
          />
          {this.state.showFlatlist ? (
            <FlatList
              data={this.state.dataSource}
              renderItem={this.renderItem}
              enableEmptySections={true}
              style={{ marginTop: RFValue(10) }}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Input
                style={styles.formTextInput}
                containerStyle={{ marginTop: RFValue(15) }}
                multiline
                numberOfLines={5}
                label={'Description'}
                placeholder={'Job Requirements and Qualifications'}
                onChangeText={(text) => {
                  this.setState({
                    description: text,
                  });
                }}
                value={this.state.description}
              />
            </View>
          )}
          <TouchableOpacity
            style={[styles.button, { marginTop: RFValue(30) }]}
            onPress={() => {
              this.addPost(this.state.jobName, this.state.description);
            }}>
            <Text style={styles.requestbuttontxt}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTextInput: {
    width: '75%',
    height: RFValue(30),
    borderWidth: 1,
    padding: 10,
  },
  ImageView: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  imageStyle: {
    height: RFValue(150),
    width: RFValue(150),
    alignSelf: 'center',
    borderWidth: 5,
    borderRadius: RFValue(10),
  },
  bookstatus: {
    flex: 0.4,
    alignItems: 'center',
  },
  requestedbookName: {
    fontSize: RFValue(30),
    fontWeight: '500',
    padding: RFValue(10),
    fontWeight: 'bold',
    alignItems: 'center',
    marginLeft: RFValue(60),
  },
  status: {
    fontSize: RFValue(20),
    marginTop: RFValue(30),
  },
  bookStatus: {
    fontSize: RFValue(30),
    fontWeight: 'bold',
    marginTop: RFValue(10),
  },
  buttonView: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttontxt: {
    fontSize: RFValue(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  touchableopacity: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: '90%',
  },
  requestbuttontxt: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    width: '75%',
    height: RFValue(60),
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: RFValue(50),
    backgroundColor: '#32867d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    alignItems: 'center',
  },
});
