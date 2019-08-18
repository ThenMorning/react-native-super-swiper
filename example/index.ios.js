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

import ReactNativeSuperSwiper from 'react-native-super-swiper';
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
    list.push(
    <View style={styles.querItem} key={list.length}>
      <Text>左滑查看更多</Text>
    </View>)
    return list;
  }
  componentWillMount() {
    this.setState({
      swiperContent:this.generateSwiperContent()
    })
  }
  dragCB(){
    const newSwiperContent =this.state.swiperContent.slice(0,this.state.swiperContent.length-1)
    newSwiperContent.push(<View style={styles.querItem} key={this.state.swiperContent.length}>
      <Text>释放查看更多</Text>
    </View>)
    this.setState({
      swiperContent:newSwiperContent
    })
  }
  releaseCB(){
    console.log(23)
    //把 dragCB 中更新的视图还原
    const newSwiperContent =this.state.swiperContent.slice(0,this.state.swiperContent.length-1)
    newSwiperContent.push(<View style={styles.querItem} key={this.state.swiperContent.length}>
      <Text>左滑查看更多</Text>
    </View>)
     this.setState({
      swiperContent:newSwiperContent
    })
    alert("do something");
  }
  render() {
    return (
      <View style={styles.container}>
        <ReactNativeSuperSwiper ref={ref=>this.superSwiper = ref} swiperContent={this.state.swiperContent} action={{dragActionWidth:width/4 + 10,dragCB:this.dragCB.bind(this),releaseCB:this.releaseCB.bind(this)}}    horizontal={true}></ReactNativeSuperSwiper>
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
