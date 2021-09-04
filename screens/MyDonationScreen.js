import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Card, Icon, ListItem } from 'react-native-elements';
import MyHeader from '../components/MyHeader.js';
import firebase from 'firebase';
import db from '../config.js';

export default class MyDonationScreen extends Component {
  constructor() {
    super();
    this.state = {
      posterId: firebase.auth().currentUser.email,
      posterName: '',
      allJobPosts: [],
    };
    this.requestRef = null;
  }

  static navigationOptions = { header: null };

  getPosterDetails = (posterId) => {
    db.collection('users')
      .where('email_id', '==', posterId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            posterName: doc.data().first_name + ' ' + doc.data().last_name,
          });
        });
      });
  };

  getAllJobs = () => {
    this.requestRef = db
      .collection('all_jobs')
      .where('poster_id', '==', this.state.posterId)
      .onSnapshot((snapshot) => {
        var alljobs = [];
        snapshot.docs.map((doc) => {
          var job = doc.data();
          job['doc_id'] = doc.id;
          alljobs.push(job);
        });
        this.setState({
          allJobPosts: alljobs,
        });
      });
  };

  setAnInterview = (jobDetails) => {
    if (jobDetails.request_status === 'sent') {
      var requestStatus = 'Poster Interested';
      db.collection('all_jobs').doc(jobDetails.doc_id).update({
        request_status: 'Poster Interested',
      });
      this.sendNotification(jobDetails, requestStatus);
    } else {
      var requestStatuss = 'sent';
      db.collection('all_jobs').doc(jobDetails.doc_id).update({
        request_status: 'sent',
      });
      this.sendNotification(jobDetails, requestStatuss);
    }
  };

  sendNotification = (jobDetails, requestStatus) => {
    var requestId = jobDetails.request_id;
    var posterId = jobDetails.poster_id;
    db.collection('all_notifications')
      .where('request_id', '==', requestId)
      .where('poster_id', '==', posterId)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var message = '';
          if (requestStatus === 'sent') {
            message = this.state.posterName + 'wants to interview you!';
          } else {
            message =
              this.state.posterName +
              ' has shown interest in interviewing you.';
          }
          db.collection('all_notifications').doc(doc.id).update({
            message: message,
            notification_status: 'unread',
            date: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
      });
  };

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => (
    <ListItem
      key={i}
      title={item.job_name}
      subtitle={
        'Requested By : ' +
        item.requested_by +
        '\nStatus : ' +
        item.request_status
      }
      leftElement={<Icon name="book" type="font-awesome" color="#696969" />}
      titleStyle={{ color: 'black', fontWeight: 'bold' }}
      rightElement={
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                item.request_status === 'sent' ? 'green' : '#ff5722',
            },
          ]}
          onPress={() => {
            this.sendInterview(item);
          }}>
          <Text style={{ color: '#ffff' }}>
            {item.request_status === 'sent' ? 'sent' : 'send'}
          </Text>
        </TouchableOpacity>
      }
      bottomDivider
    />
  );

  componentDidMount() {
    this.getPosterDetails(this.state.posterId);
    this.getAllJobs();
  }

  componentWillUnmount() {
    this.requestRef();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MyHeader
          navigation={this.props.navigation}
          title="All Job Applications"
        />
        <View style={{ flex: 1 }}>
          {this.state.allJobPosts.length === 0 ? (
            <View style={styles.subtitle}>
              <Text style={{ fontSize: 20 }}>List of all Job Applied for</Text>
            </View>
          ) : (
            <FlatList
              keyExtractor={this.keyExtractor}
              data={this.state.allJobPosts}
              renderItem={this.renderItem}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 100,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 16,
  },
  subtitle: {
    flex: 1,
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
