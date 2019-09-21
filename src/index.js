

import React from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ViewPropTypes
} from 'react-native';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;
const LOAD_MORE_WIDTH = 60;

const GESTURE_RADIUS = 10; // 手势滑动的容差
const ANIMATED_DURATION = 200; // 页面动画的时长
const GESTURE_DAMP = 3; // 手势阻尼
const SPEED_SENSITIVITY = 0.08; // 速度灵敏度

const SELECTED_DOT_WIDTH = 10;
const UNSELECTED_DOT_WIDTH = 5;
const DETAL_DOT_WIDTH = SELECTED_DOT_WIDTH - UNSELECTED_DOT_WIDTH;
const SELECTED_DOT_OPACITY = 0.8;
const UNSELECTED_DOT_OPACITY = 0.6;
const DETAL_DOT_OPACITY = SELECTED_DOT_OPACITY - UNSELECTED_DOT_OPACITY;

/**
 * 轮播组件
 */
export class ReactNativeSuperSwiper extends React.Component {
    static propTypes = {
        style: ViewPropTypes.style,
        isAndroid:PropTypes.bool, // 是否为安卓设备
        loadMoreOptions: PropTypes.object,// 加载更多 相关配置  enableLoadMore: PropTypes.bool, // 是否开启加载更多  onArrive: PropTypes.func, // 到达回调   onRelease: PropTypes.func, // 到达后释放回调 distance:PropTypes.number(可拖拽区域为 屏幕宽度/distance)  text:加载更多文案
        onBeginDrag: PropTypes.func, // 滑动拖拽开始时触发
        onEndDrag: PropTypes.func, // 滑动拖拽结束时触发
        onChange:PropTypes.func, // 改变时触发
        onScroll: PropTypes.func, // 滑动时触发
    };

    static defaultProps = {
        loadMoreOptions:{
            enableLoadMore: false,
            distance:GESTURE_DAMP
        }
    };

    constructor(props) {
        super(props);
        this.state = {};

        this.translateX = new Animated.Value(0); // 可视区域的实时偏移量
        this.moreViewWidth = new Animated.Value(0); // 加载更多区域的宽度
        this.moreArrowRotateZ = new Animated.Value(0);
        this.contentWidth = 0; // 内容区域的宽度
        this.tmpTranslateX = 0; // 响应手势时间时的瞬间偏移量
        this.currentIndex = 0; // 当前页面索引号
        this.pageWidth = 0; // 每页宽度
        this.pageCount = 0; // 总页数
        this.canLoadMore = false; // 是否允许执行LoadMore
        this.onScrollListener = []; // onScroll监听器对象

        this.viewPanResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderRelease: this.onPanResponderEnd,
            onPanResponderTerminate: this.onPanResponderEnd
        });

        this.translateX.addListener(({ value = 0 }) => {
            const scroll = Math.abs(-value);
            // 回调参数：
            const result = {
                scroll, // 总偏移量，
                position: Math.floor(scroll / this.pageWidth), // 从左数起第一个当前可见的页面的下标;
                offset: (scroll % this.pageWidth) / this.pageWidth, // 一个在[0,1]之内的范围(可以等于0或1)
                isOverScroll: scroll > this.contentWidth // 是否是在弹性滑动
            };

            this.props.onScroll && this.props.onScroll(result);
            for (let i = 0; i < this.onScrollListener.length; i++) {
                this.onScrollListener[i](result);
            }
        });
    }

    render() {
        const {isAndroid,loadMoreOptions} = this.props;
        const {enableLoadMore,onArrive,onRelease} = loadMoreOptions;
        // 实时页面内容数量
        let pageCount = 0;
        if (!this.props.children) {
            pageCount = 0;
        } else {
            pageCount = React.Children.count(this.props.children);
        }

        if (this.pageCount !== pageCount) {
            this.pageCount = pageCount;
        }

        if (isAndroid) {
            return (
                <ScrollView
                    {...this.props}
                    showsHorizontalScrollIndicator={false}
                    overScrollMode="never"
                    horizontal
                    scrollEventThrottle={16}
                    onLayout={(e) => {
                        this.initData(e.nativeEvent.layout.width, pageCount);
                        this.props.onLayout && this.props.onLayout(e);
                    }}
                    onScroll={(e) => {
                        const { x } = e.nativeEvent.contentOffset;
                        this.canLoadMore = x >= this.contentWidth + LOAD_MORE_WIDTH;
                        if (enableLoadMore && this.canLoadMore) {
                            onArrive && onArrive();
                        }
                        this.rotateArrow(!this.canLoadMore);
                        this.translateX.setValue(x);
                    }}
                    onScrollBeginDrag={() => {
                        this.props.onBeginDrag && this.props.onBeginDrag();
                    }}
                    onScrollEndDrag={() => {
                        this.props.onEndDrag && this.props.onEndDrag();
                        if (enableLoadMore && this.canLoadMore) {
                            onRelease && onRelease();
                        }
                    }}
                >
                    {this.props.children}
                </ScrollView>
            );
        }

        return (
            <View
                {...this.props}
                {...this.viewPanResponder.panHandlers}
                onLayout={(e) => {
                    this.initData(e.nativeEvent.layout.width, pageCount);
                    this.props.onLayout && this.props.onLayout(e);
                }}
            >
                <Animated.View
                    style={[
                        styles.root,
                        this.props.style,
                        {
                            transform: [
                                {
                                    translateX: this.translateX
                                }
                            ]
                        }
                    ]}
                >
                    {this.props.children}
                </Animated.View>
            </View>
        );
    }


    initData = (pageWidth = 0, pageCount = 0) => {
        const {loadMoreOptions} = this.props;
        const {enableLoadMore,distantce} = loadMoreOptions;

        if (pageWidth > 0 && pageCount > 0) {
            this.pageWidth = pageWidth;
            // 设置more区域的最大宽度
            if (enableLoadMore) {
                this.moreViewWidth.setValue(pageWidth / distantce);
            } else {
                this.moreViewWidth.setValue(0);
            }
            this.contentWidth = pageWidth * (pageCount - 1);
        }
    };

    onMoveShouldSetPanResponder = (e, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > GESTURE_RADIUS;
    };

    onPanResponderGrant = () => {
        this.tmpTranslateX = this.translateX.__getValue();
        this.props.onBeginDrag && this.props.onBeginDrag();
    };

    onPanResponderMove = (e, gestureState) => {
        const {loadMoreOptions,onChange} = this.props;
        const {enableLoadMore,onArrive,distance} = loadMoreOptions;
        const { dx } = gestureState;
        let newX = this.tmpTranslateX + dx;
        if (newX > 0) {
            // 向左滑动
            newX = 0;
        } else if (newX < -this.contentWidth) {
            // 向右滑动
            if (enableLoadMore) {
                const more = (this.contentWidth + newX) / distance;
                newX = -this.contentWidth + more;

                this.canLoadMore = !(more > -LOAD_MORE_WIDTH);
                this.rotateArrow(more > -LOAD_MORE_WIDTH);
            } else {
                newX = -this.contentWidth;
            }
        }
        this.translateX.setValue(newX);
        const newCurrentIndex = this.computeIndex(newX);
        if(newCurrentIndex !== this.currentIndex){
            this.currentIndex = newCurrentIndex;
            onChange && onChange(newCurrentIndex);
        }
        if (enableLoadMore && this.canLoadMore) {
            onArrive && onArrive();
        }
    };

    onPanResponderEnd = (e, gestureState) => {
        const {loadMoreOptions} = this.props;;
        const {enableLoadMore,onRelease} = loadMoreOptions;

        const { vx } = gestureState;

        const x = -this.translateX.__getValue();

        this.props.onEndDrag && this.props.onEndDrag();
        if (enableLoadMore && this.canLoadMore) {
            onRelease && onRelease();
        }

        

        // 如果松手时速度很快
        if (vx < -SPEED_SENSITIVITY) {
            this.toPage(this.currentIndex + 1);
        } else if (vx > SPEED_SENSITIVITY) {
            this.toPage(this.currentIndex);
        } else if (x % this.pageWidth >= this.pageWidth / 2) {
            this.toPage(this.currentIndex + 1);
        } else {
            this.toPage(this.currentIndex);
        }
    };

    computeIndex = (x) => Math.floor(-x / this.pageWidth);

    toPage = (index) => {
        const {onChange} = this.props;
        // 限制页面滚动的范围
        // eslint-disable-next-line no-param-reassign
        index = Math.min(Math.max(0, index), this.pageCount - 1);

        Animated.timing(this.translateX, {
            toValue: -index * this.pageWidth,
            duration: ANIMATED_DURATION,
            easing: Easing.linear
        })
                .start(() => {
                    if(this.currentIndex !== index){
                        onChange && onChange(index);
                    }
                    this.currentIndex = index;
                    this.rotateArrow();
                });
    };

    rotateArrow = (left = true) => {
        Animated.timing(this.moreArrowRotateZ, {
            toValue: left ? 0 : 180,
            duration: 50,
            easing: Easing.linear
        })
                .start(() => {
                    if (left) {
                        this.canLoadMore = false;
                    }
                });
    };

}



const checkRef = (ref) => ref !== null && ref !== undefined && !this.isAddListener;

const styles = StyleSheet.create({
    dot: {
        borderRadius: 1.5,
        height: 3
    },
    icon: {
        height: 16,
        width: 16
    },
    indicator: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    more_content: {
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
        width: LOAD_MORE_WIDTH
    },
    more_text: {
        // color: Color.textBlack,
        fontSize: 12,
        includeFontPadding: false,
        marginTop: 8,
        maxWidth: 52,
        textAlign: 'center'
    },
    more_view: {
        backgroundColor: 'white',
        height: '100%'
    },
    root: {
        alignItems: 'center',
        flexDirection: 'row',
        width: WIDTH
    },
    text: {
        // color: Color.white,
        fontSize: 13,
        includeFontPadding: false,
        textAlignVertical: 'center'
    }
});