/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  FlatList
} from 'react-native';

import { ReactNativeSuperSwiper } from 'react-native-super-swiper';
const { width, height } = Dimensions.get('window');

export default class MyApp extends Component {
  state = { 
    swiperActive:true
  }
  generateSwiperContent() {
    const list = [];
    const img1 = require("./imgs/1.jpg");
    const img2 = require("./imgs/2.jpg");
    const img3 = require("./imgs/3.jpg");
    const img4 = require("./imgs/4.jpg");

    const images = [
      img1,
      img2,
      img3,
      img4
    ]
    images.map((img, index) => {
      list.push(
        <TouchableHighlight style={styles.item} key={index} onPress={this.onPress.bind(this,index)}>
        <Image style={styles.sliderImg} resizeMode={'stretch'} source={img} />
      </TouchableHighlight>
      )
    })
    return list;
  }
  componentWillMount() {
    this.setState({
      swiperContent: this.generateSwiperContent()
    })
  }
  onPress(index) {
    console.log("onPress:当前点击第"+index+"个")
  }
  onBeginDrag() {
    console.log("onBeginDrag:触摸开始")
    this.setState({
      swiperActive:false
    })
  }
  onEndDrag() {
    console.log("onEndDrag:触摸结束")
    this.setState({
      swiperActive:true
    })
  }
  onScroll(e) {
    // console.log(e)
  }
  onChange(index) {
    console.log("onchange:当前是第"+index+"个")
  }
  renderFlatList(){
    return <FlatList
    data={[1,2,3,4,5,6,7,8,9,10]}
    renderItem={({item}) => <Text style={{height:50}}>{item}</Text>}
  />
  }

  render() {
    return (
      <ScrollView scrollEnabled={this.state.swiperActive}>
        <ReactNativeSuperSwiper
          isAndroid={true}
          onChange={this.onChange}
          loadMoreOptions={{
            enableLoadMore: true,
            distance: 3,
            initText: "左滑",
            releaseText: "释放",
            onArrive: () => { console.log("到达") },
            onRelease: () => { console.log("释放") },
            renderLoadMoreView: () => { }
          }} 
          onScroll={this.onScroll}
          onBeginDrag={this.onBeginDrag.bind(this)} 
          onEndDrag={this.onEndDrag.bind(this)}>
          {this.state.swiperContent}
        </ReactNativeSuperSwiper>
        {
          this.renderFlatList()
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  item: {
    width: width,
    height: width / 1.5,
  },
  sliderImg:{
    width:"100%",
    height:"100%"
  }
});

AppRegistry.registerComponent('MyApp', () => MyApp);
