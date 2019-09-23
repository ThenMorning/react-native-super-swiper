# react-native-super-swiper

支持安卓和ios效果相同的react-native轮播图,实现淘宝详情页banner的效果。


# 效果
ios:

<img width="300" src="https://github.com/WinwardZ/react-native-super-swiper/blob/master/img/1.gif"/>

android:

<img width="300" src="https://github.com/WinwardZ/react-native-super-swiper/blob/master/img/2.gif"/>

# install

npm i react-native-super-swiper --s

# usage

```
<ReactNativeSuperSwiper
          onChange={this.onChange}
          isAndroid={false}
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
```


