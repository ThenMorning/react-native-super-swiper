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
  Dimensions
} from 'react-native';

import {ReactNativeSuperSwiper} from 'react-native-super-swiper';
const { width, height } = Dimensions.get('window');

export default class MyApp extends Component {
  
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
        <View style={styles.item} key={index}>
          <Image style={styles.sliderImg} resizeMode={'stretch'} source={img} />
        </View>
      )
    })
    return list;
  }
  componentWillMount() {
    this.setState({
      swiperContent:this.generateSwiperContent()
    })
  }
  onBeginDrag(){
    console.log("start")
  }
  onEndDrag(){
    console.log("end")
  }
  onScroll(e){
    // console.log(e)
  }
  onChange(index){
    console.log(index)
  }
  
  render() {
    return (
      <View style={styles.container}>
        <ReactNativeSuperSwiper 
        onChange={this.onChange}
        loadMoreOptions={{
          enableLoadMore:true,
          distance:2,
          onArrive:()=>{console.log("到达")},
          onRelease:()=>{console.log("释放")},
          renderLoadMoreView:()=>{}
        }} onScroll={this.onScroll} onBeginDrag={this.onBeginDrag} onEndDrag={this.onEndDrag}>
          {this.state.swiperContent}
        </ReactNativeSuperSwiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
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
  querItem:{
    width: width/4 + 20,
    height: width / 1.5,
  },
  sliderImg: {
    width: "100%",
  }
});

AppRegistry.registerComponent('MyApp', () => MyApp);
