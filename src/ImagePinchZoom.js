import * as React from 'react';
import { Animated, PanResponder, View } from 'react-native';
import { Props, State } from './imagePinchZoom.type';

export default class ImagePinchZoom extends React.Component {
  constructor () {
    super(...arguments);
    this.state = new State();
    this.lastPositionX = null;
    this.positionX = 0;
    this.animatedPositionX = new Animated.Value(0);
    this.lastPositionY = null;
    this.positionY = 0;
    this.animatedPositionY = new Animated.Value(0);
    this.scale = 1;
    this.animatedScale = new Animated.Value(1);
    this.zoomLastDistance = null;
    this.zoomCurrentDistance = 0;
    this.imagePanResponder = null;
    this.lastTouchStartTime = 0;
    this.horizontalWholeOuterCounter = 0;
    this.swipeDownOffset = 0;
    this.horizontalWholeCounter = 0;
    this.verticalWholeCounter = 0;
    this.centerDiffX = 0;
    this.centerDiffY = 0;
    this.lastClickTime = 0;
    this.doubleClickX = 0;
    this.doubleClickY = 0;
    this.isDoubleClick = false;
    this.isLongPress = false;
    this.isHorizontalWrap = false;
    this.opacity = new Animated.Value(0);

    this.panResponderReleaseResolve = (gestureState) => {
      if (this.props.enableSwipeDown && this.props.swipeDownThreshold) {
        if (this.swipeDownOffset > this.props.swipeDownThreshold) {
          this.props.onSwipeDown(gestureState.dy);
          return;
        }
      }

      if (this.scale < 1) {
        this.scale = 1;
        Animated.timing(this.animatedScale, {
          toValue: this.scale,
          duration: 100
        }).start();
      }
      if (this.props.imageWidth * this.scale <= this.props.cropWidth) {
        this.positionX = 0;
        Animated.timing(this.animatedPositionX, {
          toValue: this.positionX,
          duration: 100
        }).start();
      }
      if (this.props.imageHeight * this.scale <= this.props.cropHeight) {
        this.positionY = 0;
        Animated.timing(this.animatedPositionY, {
          toValue: this.positionY,
          duration: 100
        }).start();
      }
      if (this.props.imageHeight * this.scale > this.props.cropHeight) {
        const verticalMax =
          (this.props.imageHeight * this.scale - this.props.cropHeight) /
          2 /
          this.scale;
        if (this.positionY < -verticalMax) {
          this.positionY = -verticalMax;
        } else if (this.positionY > verticalMax) {
          this.positionY = verticalMax;
        }
        Animated.timing(this.animatedPositionY, {
          toValue: this.positionY,
          duration: 100
        }).start();
      }
      if (this.scale === 1) {
        this.positionX = 0;
        this.positionY = 0;
        Animated.timing(this.animatedPositionX, {
          toValue: this.positionX,
          duration: 100
        }).start();
        Animated.timing(this.animatedPositionY, {
          toValue: this.positionY,
          duration: 100
        }).start();
      }
      this.opacity.setValue(0);
      this.horizontalWholeOuterCounter = 0;
      this.swipeDownOffset = 0;
    };
  }

  componentWillMount () {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => false,

      // double-tap handler
      onPanResponderGrant: (evt, gestureState) => {
        this.lastPositionX = null;
        this.lastPositionY = null;
        this.zoomLastDistance = null;
        this.horizontalWholeCounter = 0;
        this.verticalWholeCounter = 0;
        this.lastTouchStartTime = new Date().getTime();
        this.isDoubleClick = false;
        this.isLongPress = false;
        this.isHorizontalWrap = false;
        if (this.singleClickTimeout) {
          clearTimeout(this.singleClickTimeout);
        }
        if (evt.nativeEvent.changedTouches.length > 1) {
          const centerX =
            (evt.nativeEvent.changedTouches[0].pageX +
              evt.nativeEvent.changedTouches[1].pageX) /
            2;
          this.centerDiffX = centerX - this.props.cropWidth / 2;
          const centerY =
            (evt.nativeEvent.changedTouches[0].pageY +
              evt.nativeEvent.changedTouches[1].pageY) /
            2;
          this.centerDiffY = centerY - this.props.cropHeight / 2;
        }

        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }
        this.longPressTimeout = setTimeout(() => {
          this.isLongPress = true;
          if (this.props.onLongPress) {
            this.props.onLongPress();
          }
        }, this.props.longPressTime);

        if (evt.nativeEvent.changedTouches.length <= 1) {
          if (
            new Date().getTime() - this.lastClickTime <
            (this.props.doubleClickInterval || 0)
          ) {
            this.lastClickTime = 0;
            if (this.props.onDoubleClick) {
              this.props.onDoubleClick();
            }
            clearTimeout(this.longPressTimeout);
            this.doubleClickX = evt.nativeEvent.changedTouches[0].pageX;
            this.doubleClickY = evt.nativeEvent.changedTouches[0].pageY;
            this.isDoubleClick = true;
            if (this.scale > 1 || this.scale < 1) {
              this.scale = 1;
              this.positionX = 0;
              this.positionY = 0;
            } else {
              const beforeScale = this.scale;
              this.scale = 2;
              const diffScale = this.scale - beforeScale;
              this.positionX =
                (this.props.cropWidth / 2 - this.doubleClickX) *
                diffScale /
                this.scale;
              this.positionY =
                (this.props.cropHeight / 2 - this.doubleClickY) *
                diffScale /
                this.scale;
            }

            Animated.parallel([
              Animated.timing(this.animatedScale, {
                toValue: this.scale,
                duration: 100
              }),
              Animated.timing(this.animatedPositionX, {
                toValue: this.positionX,
                duration: 100
              }),
              Animated.timing(this.animatedPositionY, {
                toValue: this.positionY,
                duration: 100
              })
            ]).start();
          } else {
            this.lastClickTime = new Date().getTime();
          }
        }
      },
      // end double-tap handler

      onPanResponderMove: (evt, gestureState) => {
        if (this.isDoubleClick) {
          return;
        }
        if (evt.nativeEvent.changedTouches.length <= 1) {
          let diffX = gestureState.dx - (this.lastPositionX || 0);
          if (this.lastPositionX === null) {
            diffX = 0;
          }
          let diffY = gestureState.dy - (this.lastPositionY || 0);
          if (this.lastPositionY === null) {
            diffY = 0;
          }
          this.lastPositionX = gestureState.dx;
          this.lastPositionY = gestureState.dy;
          this.horizontalWholeCounter += diffX;
          this.verticalWholeCounter += diffY;
          if (
            Math.abs(this.horizontalWholeCounter) > 5 ||
            Math.abs(this.verticalWholeCounter) > 5
          ) {
            clearTimeout(this.longPressTimeout);
          }

          if (this.props.panToMove) {
            if (this.swipeDownOffset === 0) {
              if (diffX !== 0) {
                this.isHorizontalWrap = true;
              }

              if (this.props.imageWidth * this.scale > this.props.cropWidth) {
                if (this.horizontalWholeOuterCounter > 0) {
                  if (diffX < 0) {
                    if (this.horizontalWholeOuterCounter > Math.abs(diffX)) {
                      this.horizontalWholeOuterCounter += diffX;
                      diffX = 0;
                    } else {
                      diffX += this.horizontalWholeOuterCounter;
                      this.horizontalWholeOuterCounter = 0;
                      if (this.props.horizontalOuterRangeOffset) {
                        this.props.horizontalOuterRangeOffset(0);
                      }
                    }
                  } else {
                    this.horizontalWholeOuterCounter += diffX;
                  }
                } else if (this.horizontalWholeOuterCounter < 0) {
                  if (diffX > 0) {
                    if (Math.abs(this.horizontalWholeOuterCounter) > diffX) {
                      this.horizontalWholeOuterCounter += diffX;
                      diffX = 0;
                    } else {
                      diffX += this.horizontalWholeOuterCounter;
                      this.horizontalWholeOuterCounter = 0;
                      if (this.props.horizontalOuterRangeOffset) {
                        this.props.horizontalOuterRangeOffset(0);
                      }
                    }
                  } else {
                    this.horizontalWholeOuterCounter += diffX;
                  }
                }

                this.positionX += diffX / this.scale;
                const horizontalMax =
                  (this.props.imageWidth * this.scale - this.props.cropWidth) /
                  2 /
                  this.scale;
                if (this.positionX < -horizontalMax) {
                  this.positionX = -horizontalMax;
                  this.horizontalWholeOuterCounter += -1 / 1e10;
                } else if (this.positionX > horizontalMax) {
                  this.positionX = horizontalMax;
                  this.horizontalWholeOuterCounter += 1 / 1e10;
                }
                this.animatedPositionX.setValue(this.positionX);
              } else {
                this.horizontalWholeOuterCounter += diffX;
              }
              if (
                this.horizontalWholeOuterCounter > (this.props.maxOverflow || 0)
              ) {
                this.horizontalWholeOuterCounter = this.props.maxOverflow || 0;
              } else if (
                this.horizontalWholeOuterCounter <
                -(this.props.maxOverflow || 0)
              ) {
                this.horizontalWholeOuterCounter = -(
                  this.props.maxOverflow || 0
                );
              }
              if (this.horizontalWholeOuterCounter !== 0) {
                if (this.props.horizontalOuterRangeOffset) {
                  this.props.horizontalOuterRangeOffset(
                    this.horizontalWholeOuterCounter
                  );
                }
              }
            }

            // handle swipe down
            if (this.props.imageHeight * this.scale > this.props.cropHeight) {
              this.positionY += diffY / this.scale;
              this.animatedPositionY.setValue(this.positionY);
            } else {
              // if (this.props.enableSwipeDown && !this.isHorizontalWrap) {
              if (this.props.enableSwipeDown) {
                this.animatedPositionY.setValue(gestureState.dy);
                this.opacity.setValue(Math.abs(gestureState.dy));
                this.swipeDownOffset += Math.abs(diffY);
                this.positionY += diffY;
              }
            }
          }
        } else {
          if (this.longPressTimeout) {
            clearTimeout(this.longPressTimeout);
          }
          if (this.props.pinchToZoom) {
            let minX;
            let maxX;
            if (
              evt.nativeEvent.changedTouches[0].locationX >
              evt.nativeEvent.changedTouches[1].locationX
            ) {
              minX = evt.nativeEvent.changedTouches[1].pageX;
              maxX = evt.nativeEvent.changedTouches[0].pageX;
            } else {
              minX = evt.nativeEvent.changedTouches[0].pageX;
              maxX = evt.nativeEvent.changedTouches[1].pageX;
            }
            let minY;
            let maxY;
            if (
              evt.nativeEvent.changedTouches[0].locationY >
              evt.nativeEvent.changedTouches[1].locationY
            ) {
              minY = evt.nativeEvent.changedTouches[1].pageY;
              maxY = evt.nativeEvent.changedTouches[0].pageY;
            } else {
              minY = evt.nativeEvent.changedTouches[0].pageY;
              maxY = evt.nativeEvent.changedTouches[1].pageY;
            }
            const widthDistance = maxX - minX;
            const heightDistance = maxY - minY;
            const diagonalDistance = Math.sqrt(
              widthDistance * widthDistance + heightDistance * heightDistance
            );
            this.zoomCurrentDistance = Number(diagonalDistance.toFixed(1));
            if (this.zoomLastDistance !== null) {
              const distanceDiff =
                (this.zoomCurrentDistance - this.zoomLastDistance) / 200;
              let zoom = this.scale + distanceDiff;
              if (zoom < 0.6) {
                zoom = 0.6;
              }
              if (zoom > 10) {
                zoom = 10;
              }

              const beforeScale = this.scale;
              this.scale = zoom;
              this.animatedScale.setValue(this.scale);
              const diffScale = this.scale - beforeScale;
              this.positionX -= this.centerDiffX * diffScale / this.scale;
              this.positionY -= this.centerDiffY * diffScale / this.scale;
              this.animatedPositionX.setValue(this.positionX);
              this.animatedPositionY.setValue(this.positionY);
            }
            this.zoomLastDistance = this.zoomCurrentDistance;
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (this.longPressTimeout) {
          clearTimeout(this.longPressTimeout);
        }
        if (this.isDoubleClick) {
          return;
        }
        if (this.isLongPress) {
          return;
        }

        const moveDistance = Math.sqrt(
          gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy
        );
        if (
          evt.nativeEvent.changedTouches.length === 1 &&
          moveDistance < (this.props.clickDistance || 0)
        ) {
          this.singleClickTimeout = setTimeout(() => {
            if (this.props.onClick) {
              this.props.onClick();
            }
          }, this.props.doubleClickInterval);
        } else {
          if (this.props.responderRelease) {
            this.props.responderRelease(gestureState.vx, this.scale);
          }
          this.panResponderReleaseResolve(gestureState);
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        //
      }
    });
  }

  render () {
    const color = this.opacity.interpolate({
      inputRange: [0, 100],
      outputRange: ['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']
    });
    const animateConf = {
      position: 'absolute',
      left: 0,
      top: (this.props.cropHeight - this.props.imageHeight) / 2,
      transform: [
        {
          scale: this.animatedScale
        },
        {
          translateX: this.animatedPositionX
        },
        {
          translateY: this.animatedPositionY
        }
      ]
    };
    const style = {
      ...this.props.style,
      overflow: 'hidden',
      width: this.props.cropWidth,
      height: this.props.cropHeight,
      backgroundColor: color
    };
    return (
      <View {...this.imagePanResponder.panHandlers}>
        <Animated.View style={style}>
          <Animated.View style={animateConf}>
            <View
              style={{
                width: this.props.imageWidth,
                height: this.props.imageHeight
              }}
            >
              {this.props.children}
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}
ImagePinchZoom.defaultProps = new Props();
