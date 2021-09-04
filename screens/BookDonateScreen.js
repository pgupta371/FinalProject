import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from 'firebase';
import db from '../config';
import MyHeader from '../components/MyHeader';

export default class BookDonateScreen extends Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      requestedJobsList: [],
    };
    this.requestRef = null;
  }

  getRequestedJobsList = () => {
    this.requestRef = db.collection('requested_jobs').onSnapshot((snapshot) => {
      var requestedJobsList = snapshot.docs.map((doc) => doc.data());
      this.setState({
        requestedJobsList: requestedJobsList,
      });
    });
  };

  componentDidMount() {
    this.getRequestedJobsList();
  }

  componentWillUnmount() {
    this.requestRef();
  }

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, i }) => {
    return (
      <ListItem
        key={i}
        title={item.job_name}
        subtitle={item.description}
        titleStyle={{ color: 'black', fontWeight: 'bold' }}
        leftElement={
          <Image
            style={{ height: 60, width: 80 }}
            source={require('../assets/unnamed.png')}
          />
        }
        rightElement={
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.props.navigation.navigate('RecieverDetails', {
                details: item,
              });
            }}>
            <Text style={{ color: '#ffff' }}>View</Text>
          </TouchableOpacity>
        }
        bottomDivider
      />
    );
  };

  render() {
    return (
      <View style={styles.view}>
        <MyHeader title="Job Posts" navigation={this.props.navigation} />
        <View style={{ flex: 1 }}>
          {this.state.requestedJobsList.length === 0 ? (
            <View style={styles.subContainer}>
              <Text style={{ fontSize: 20 }}>List Of All Job Posts</Text>
            </View>
          ) : (
            <FlatList
              keyExtractor={this.keyExtractor}
              data={this.state.requestedJobsList}
              renderItem={this.renderItem}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 100,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#32867d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
  view: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
