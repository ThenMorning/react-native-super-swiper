

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
// import { arrow_more } from '../../resources';
// import * as Color from '../../layouts/Color';
// import Screen from '../../layouts/Screen';
// import { SwiperViewConfig, format } from '../../sharks';

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
const Screen = {isAndroid:true};
const arrow_more = null;
const Color = {};
/**
 * 轮播组件
 */
export class SwiperView extends React.Component {
    static propTypes = {
        style: ViewPropTypes.style,
        pagingEnabled: PropTypes.bool, // 是否开启分页
        enableLoadMore: PropTypes.bool, // 是否开启加载更多
        onLoadMore: PropTypes.func, // 加载更多回调
        onBeginDrag: PropTypes.func, // 滑动拖拽开始时触发
        onEndDrag: PropTypes.func, // 滑动拖拽结束时触发
        onScroll: PropTypes.func // 滑动时触发
    };

    static defaultProps = {
        enableLoadMore: true,
        pagingEnabled: true
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
        this.onContentChangeListener = []; // 内容数量改变监听器对象

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
        // 实时页面内容数量
        let pageCount = 0;
        if (!this.props.children) {
            pageCount = 0;
        } else {
            pageCount = React.Children.count(this.props.children);
        }

        if (this.pageCount !== pageCount) {
            this.pageCount = pageCount;
            for (let i = 0; i < this.onContentChangeListener.length; i++) {
                this.onContentChangeListener[i](pageCount, this.currentIndex);
            }
        }
        alert(Screen.isAndroid)
        if (Screen.isAndroid) {
            return (
                <ScrollView
                    {...this.props}
                    showsHorizontalScrollIndicator={false}
                    overScrollMode="never"
                    horizontal
                    onLayout={(e) => {
                        this.initData(e.nativeEvent.layout.width, pageCount);
                        this.props.onLayout && this.props.onLayout(e);
                    }}
                    onScroll={(e) => {
                        const { x } = e.nativeEvent.contentOffset;
                        this.canLoadMore = x >= this.contentWidth + LOAD_MORE_WIDTH;
                        this.rotateArrow(!this.canLoadMore);
                        this.translateX.setValue(x);
                    }}
                    onScrollBeginDrag={() => {
                        this.props.onBeginDrag && this.props.onBeginDrag();
                    }}
                    onScrollEndDrag={() => {
                        this.props.onEndDrag && this.props.onEndDrag();
                        if (this.props.enableLoadMore && this.canLoadMore) {
                            this.props.onLoadMore && this.props.onLoadMore();
                        }
                    }}
                >
                    {this.props.children}
                    {/* {this.renderViewMore()} */}
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
                    {this.renderViewMore()}
                </Animated.View>
            </View>
        );
    }

    renderViewMore = () => {
        if (!this.props.enableLoadMore) {
            return null;
        }
        return (
            <Animated.View
                style={[
                    styles.more_view,
                    {
                        width: Screen.isAndroid ? LOAD_MORE_WIDTH + 10 : this.moreViewWidth
                    }
                ]}
            >
                <View style={styles.more_content}>
                    {/* <Animated.Image
                        style={[
                            styles.icon,
                            {
                                transform: [
                                    {
                                        rotateZ: this.moreArrowRotateZ.interpolate({
                                            inputRange: [0, 180],
                                            outputRange: ['0deg', '180deg'],
                                            extrapolate: 'clamp'
                                        })
                                    }
                                ]
                            }
                        ]}
                        source={arrow_more}
                        resizeMode="stretch"
                    /> */}
                                    {/* <CruIcon style={this.canLoadMore?[styles.dragIcon, styles.dragActive]:[styles.dragIcon]} type={CRUISE_FONT} name={icons.drop_down} color={colors.font_level_2} /> */}

                    <Text style={styles.more_text}>{this.canLoadMore?"释放":"左滑"}</Text>
                </View>
            </Animated.View>
        );
    };

    initData = (pageWidth = 0, pageCount = 0) => {
        if (pageWidth > 0 && pageCount > 0) {
            this.pageWidth = pageWidth;
            // 设置more区域的最大宽度
            if (this.props.enableLoadMore) {
                this.moreViewWidth.setValue(pageWidth / GESTURE_DAMP);
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
        const { dx } = gestureState;
        let newX = this.tmpTranslateX + dx;
        if (newX > 0) {
            // 向左滑动
            newX = 0;
        } else if (newX < -this.contentWidth) {
            // 向右滑动
            if (this.props.enableLoadMore) {
                const more = (this.contentWidth + newX) / GESTURE_DAMP;
                newX = -this.contentWidth + more;

                this.canLoadMore = !(more > -LOAD_MORE_WIDTH);
                this.rotateArrow(more > -LOAD_MORE_WIDTH);
            } else {
                newX = -this.contentWidth;
            }
        }
        this.translateX.setValue(newX);
        const newIndex = this.computeIndex(newX);
        if(this.currentIndex !=newIndex){
            this.currentIndex = newIndex;
            this.props.onChange && this.props.onChange(this.currentIndex);
        } 
    };

    onPanResponderEnd = (e, gestureState) => {
        const { vx } = gestureState;

        const x = -this.translateX.__getValue();

        this.props.onEndDrag && this.props.onEndDrag();
        if (this.props.enableLoadMore && this.canLoadMore) {
            this.props.onLoadMore && this.props.onLoadMore();
        }
        if (!this.props.pagingEnabled) {
            return;
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
        // 限制页面滚动的范围
        // eslint-disable-next-line no-param-reassign
        index = Math.min(Math.max(0, index), this.pageCount - 1);

        Animated.timing(this.translateX, {
            toValue: -index * this.pageWidth,
            duration: ANIMATED_DURATION,
            easing: Easing.linear
        })
                .start(() => {
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

    /**
     * 增加OnScroll监听器
     * @param listener
     */
    setOnScrollListener = (listener) => {
        this.onScrollListener.push(listener);
    };

    setOnContentChangeListener = (listener) => {
        this.onContentChangeListener.push(listener);
        listener && listener(this.pageCount, this.currentIndex);
    };
}

/**
 * 轮播指示器组件
 */
export class SwiperViewIndicator extends React.Component {
    static propTypes = {
        style: ViewPropTypes.style,
        dotColor: PropTypes.string
    };

    static defaultProps = {
        dotColor: 'white'
    };

    constructor(props) {
        super(props);
        this.state = {
            count: 0,
            dots: []
        };
        this.dotWidth = [];
        this.dotOpacity = [];
        this.isAddListener = false;
    }

    render() {
        return <View style={[this.props.style, styles.indicator]}>{this.state.dots}</View>;
    }

    /**
     * 添加SwiperView的实例对象
     */
    setSwiperViewRef = (ref) => {
        if (!checkRef(ref)) {
            return;
        }

        setTimeout(() => {
            // 监听SwiperView的滚动事件
            ref.setOnScrollListener(({ position, offset, isOverScroll }) => {
                if (isOverScroll) {
                    return;
                }
                this.dotWidth[position].setValue(SELECTED_DOT_WIDTH - DETAL_DOT_WIDTH * offset);
                this.dotOpacity[position].setValue(SELECTED_DOT_OPACITY - DETAL_DOT_OPACITY * offset);
                if (position + 1 < this.state.count) {
                    this.dotWidth[position + 1].setValue(UNSELECTED_DOT_WIDTH + DETAL_DOT_WIDTH * offset);
                    this.dotOpacity[position + 1].setValue(UNSELECTED_DOT_OPACITY + DETAL_DOT_OPACITY * offset);
                }
            });

            // 监听SwiperView的内容变化事件
            ref.setOnContentChangeListener((count, index) => {
                if (count === this.state.count) {
                    return;
                }

                // 设置监听器，并初始化指示器的个数
                const dots = [];
                for (let i = 0; i < count; i++) {
                    const width = new Animated.Value(i === index ? SELECTED_DOT_WIDTH : UNSELECTED_DOT_WIDTH);
                    const opacity = new Animated.Value(i === index ? SELECTED_DOT_OPACITY : UNSELECTED_DOT_OPACITY);
                    dots.push(
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: this.props.dotColor,
                                    marginLeft: i === 0 ? 0 : 6,
                                    opacity,
                                    width
                                }
                            ]}
                            key={i}
                        />
                    );
                    this.dotWidth.push(width);
                    this.dotOpacity.push(opacity);
                }
                this.setState({
                    count,
                    dots
                });
            });

            this.isAddListener = true;
        }, 0);
    };
}

/**
 * 轮播文字指示器组件
 */
export class SwiperViewTextIndicator extends React.Component {
    static propTypes = {
        count: PropTypes.number
    };

    static defaultProps = {
        count: 1
    };

    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 1
        };
        this.isAddListener = false;
    }

    render() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                <Text style={styles.text}>{this.state.currentIndex}</Text>
                <Text style={styles.text}>/</Text>
                <Text style={styles.text}>{this.props.count}</Text>
            </View>
        );
    }

    /**
     * 添加SwiperView的实例对象
     */
    setSwiperViewRef = (ref) => {
        if (!checkRef(ref)) {
            return;
        }

        setTimeout(() => {
            // 监听SwiperView的滚动事件
            ref.setOnScrollListener(({ position, offset, isOverScroll }) => {
                if (isOverScroll) {
                    return;
                }
                const newIndex = offset > 0.5 ? position + 2 : position + 1;
                if (this.state.currentIndex !== newIndex) {
                    this.setState({
                        currentIndex: newIndex
                    });
                }
            });
            this.isAddListener = true;
        }, 0);
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
        color: Color.textBlack,
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
        color: Color.white,
        fontSize: 13,
        includeFontPadding: false,
        textAlignVertical: 'center'
    }
});