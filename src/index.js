import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Text,
    View,
    ViewPropTypes,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Platform,
    ActivityIndicator
} from 'react-native';

export default class extends Component {
    // 属性类型
    static propTypes = {
        horizontal: PropTypes.bool,//水平垂直
        swiperContent: PropTypes.node.isRequired,// 滚动内容
        scrollViewStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),//滚动区域的样式
        contentContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),//滚动内容盒子的样式
        index: PropTypes.number, //当前元素
        onIndexChanged: PropTypes.func, //当前元素变化的回调
        action:PropTypes.object // dragActionWidth:触发激活事件的拖动距离 dragCB：激活事件  releaseCB：释放事件
    }
    // 默认属性
    static defaultProps = {
        index: 0,
        onIndexChanged: () => null,
        pagingEnabled: true
    }
    refScrollView = null;
    fingerXStart = 0;
    fingerYStart = 0;
    fingerXEnd = 0;
    fingerYEnd = 0;
    scrollX = 0;

    initState = props => {
        const { width, height } = Dimensions.get('window');
        initState = {
            index: 0, // 初始化当前元素为首个元素
            offset: {}
        };
        initState.children = Array.isArray(props.swiperContent)
            ? props.swiperContent.filter(child => child)
            : props.swiperContent

        initState.total = initState.children ? initState.children.length || 1 : 0;
        if (props.width) {
            initState.width = props.width
        } else if (this.state && this.state.width) {
            initState.width = this.state.width
        } else {
            initState.width = width
        }

        if (props.height) {
            initState.height = props.height
        } else if (this.state && this.state.height) {
            initState.height = this.state.height
        } else {
            initState.height = height
        }
        initState.dir = props.horizontal === false ? 'y' : 'x'; // 方向默认为水平
        initState.offset[initState.dir] =
            initState.dir === 'y' ? height * props.index : width * props.index
        this.internals = {
            isScrolling: false
        }
        return initState
    }

    state = this.initState(this.props)

    fullState() {
        // 返回state与internals 
        return Object.assign({}, this.state, this.internals)
    }

    componentWillUpdate(nextProps, nextState) {
        // If the index has changed, we notify the parent via the onIndexChanged callback
        // if (this.state.index !== nextState.index)
        //   this.props.onIndexChanged(nextState.index)
    }

    render() {
        const { swiperContent } = this.props;
        return (
            <View style={styles.container} onLayout={this.onLayout.bind(this)}>
                {this.renderScrollView(swiperContent)}
            </View>
        )
    }

    onLayout(e) {
        console.log(e)
        const { width, height } = e.nativeEvent.layout
        const offset = (this.internals.offset = {})
        let setup = this.state.index;
        offset[this.state.dir] =
            this.state.dir === 'y' ? height * setup : width * setup
    }

    scrollViewPropOverrides = () => {
        const props = this.props
        let overrides = {}
        for (let prop in props) {
            if (
                typeof props[prop] === 'function' &&
                prop !== 'onMomentumScrollEnd' &&
                prop !== 'renderPagination' &&
                prop !== 'onScrollBeginDrag'
            ) {
                let originResponder = props[prop]
                overrides[prop] = e => originResponder(e, this.fullState(), this)
            }
        }

        return overrides
    }

    renderScrollView = swiperContent => {
        return (
            <ScrollView
                ref={ref => this.refScrollView = ref}
                {...this.props}
                {...this.scrollViewPropOverrides()}
                contentContainerStyle={[this.props.contentContainerStyle]}
                contentOffset={this.state.offset}
                onScrollBeginDrag={this.onScrollBeginDrag.bind(this)}
                //onMomentumScrollBegin={this.onMomentumScrollBegin}
                onMomentumScrollEnd={this.onMomentumScrollEnd.bind(this)}
                //onScrollEndDrag={this.onScrollEndDrag}
                onScroll={this.onScroll.bind(this)}
                //onTouchStart={this.onTouchStart.bind(this)}
                //onTouchMove={this.onTouchMove.bind(this)}
                onTouchEnd={this.onTouchEnd.bind(this)}
                scrollEventThrottle={5}
                bounces={false}
                style={this.props.scrollViewStyle}
            >
                {swiperContent}
            </ScrollView>
        )
    }

    //一个子view滑动开始拖动开始时触发
    onScrollBeginDrag(e) {
        this.internals.isScrolling = true;
        this.props.onScrollBeginDrag &&
            this.props.onScrollBeginDrag(e, this.fullState(), this)
        //console.log(arguments)
    }
    //在滚动过程中, 每帧最多调用一次此函数, 调用的频率可以用scrollEventThrottle属性来控制
    onScroll(e) {
        //console.log(e.nativeEvent.contentOffset.x);//水平滚动距离
        console.log('onMomentumScrollEnd',e.nativeEvent)
        //console.log(this.state.index)
        if(!this.internals.isDrag && this.state.index == (this.state.total-2) && e.nativeEvent.contentOffset.x >=((this.state.total-2) * this.state.width + this.props.action.dragActionWidth)){
            this.internals.isDrag = true;
            console.warn('dragCB',this.state.index,e.nativeEvent.contentOffset.x);
            this.props.action.dragCB();
            this.internals.hasDragAction = 1;
            
        }
    }
    //当一帧滚动开始时调用
    onMomentumScrollBegin() { }
    //当一帧滚动完毕时调用
    onMomentumScrollEnd(e) {
        // console.log('onMomentumScrollEnd', e.nativeEvent);
        this.internals.isScrolling = false;
        this.updateIndex(e.nativeEvent.contentOffset, this.state.dir, () => {

            // if `onMomentumScrollEnd` registered will be called here
            this.props.onMomentumScrollEnd &&
                this.props.onMomentumScrollEnd(e, this.fullState(), this)
        })
    }
    //一个子view滚动结束拖拽时触发
    onScrollEndDrag(e) {
        //console.log('onScrollEndDrag', e.nativeEvent)
    }
    onTouchStart(e) {
        //console.log('onTouchStart',e.nativeEvent);//水平滚动距离
       // this.fingerXStart = e.nativeEvent.locationX;
       // this.fingerYStart = e.nativeEvent.locationY;
    }
    onTouchMove(e) {
        // console.log('onTouchMove', e.nativeEvent);//水平滚动距离
        //this.refScrollView.scrollTo({x:e.nativeEvent.locationX, y: 0, animated: false })
        // this.setState({
        //     offset:e.nativeEvent.locationX-this.fingerXStart
        // })
    }
    onTouchEnd(e) {
        //console.log('onTouchEnd', e.nativeEvent);//水平滚动距离
        //this.fingerXEnd = e.nativeEvent.locationX;
        //this.fingerYEnd = e.nativeEvent.locationY;
        if(this.internals.hasDragAction){
            this.internals.hasDragAction = 0;
            this.props.action.releaseCB();
            setTimeout(()=>{
                this.internals.isDrag = false;
            },0)
        }
    }
    updateIndex(offset, dir, cb) {
        const state = this.state;
        let index = state.index
        if (!this.internals.offset) {
            this.internals.offset = {}
        }
        const diff = offset[dir] - this.internals.offset[dir];
        if (!diff) return
        const step = dir === 'x' ? state.width : state.height;
        index = diff>0?parseInt(index + Math.round(diff / step)):parseInt(index - Math.round(Math.abs(diff) / step));
        this.internals.offset = offset
        this.setState({
            index
        })
    }

    scrollTo = (index, animated = true,cb) => {
        if (
          this.internals.isScrolling ||
          this.state.total < 2 ||
          index == this.state.index
        )
          return
    
        const state = this.state
        const diff = this.state.index + (index - this.state.index)
    
        let x = 0
        let y = 0
        if (state.dir === 'x') x = diff * state.width
        if (state.dir === 'y') y = diff * state.height
    
        this.scrollView && this.scrollView.scrollTo({ x, y, animated })
    
        // update scroll state
        this.internals.isScrolling = true
        cb && cb()
      }

}
const styles = {
    container: {
        backgroundColor: 'transparent',
        position: 'relative',
        flex: 1
    },
}


