export class Props {
  constructor () {
    /**
         * 操作区域宽度
         */
    this.cropWidth = 100;
    /**
         * 操作区域高度
         */
    this.cropHeight = 100;
    /**
         * 图片宽度
         */
    this.imageWidth = 100;
    /**
         * 图片高度
         */
    this.imageHeight = 100;
    /**
         * 单手是否能移动图片
         */
    this.panToMove = true;
    /**
         * 多手指是否能缩放
         */
    this.pinchToZoom = true;
    /**
         * 单击最大位移
         */
    this.clickDistance = 10;
    /**
         * 最大滑动阈值
         */
    this.maxOverflow = 100;
    /**
         * 长按的阈值（毫秒）
         */
    this.longPressTime = 800;
    /**
         * 双击计时器最大间隔
         */
    this.doubleClickInterval = 200;
    this.style = {};
    /**
         * threshold for firing swipe down function
         */
    this.swipeDownThreshold = 100;
    /**
         * for enable vertical movement if user doens't want it
         */
    this.enableSwipeDown = false;
    /**
         * 单击的回调
         */
    this.onClick = () => {
      //
    };
    /**
         * 双击的回调
         */
    this.onDoubleClick = () => {
      //
    };
    /**
         * 长按的回调
         */
    this.onLongPress = () => {
      //
    };
    /**
         * 横向超出的距离，父级做图片切换时，可以监听这个函数
         * 当此函数触发时，可以做切换操作
         */
    this.horizontalOuterRangeOffset = () => {
      //
    };
    /**
         * 触发想切换到左边的图，向左滑动速度超出阈值时触发
         */
    this.onDragLeft = () => {
      //
    };
    /**
         * 松手但是没有取消看图的回调
         */
    this.responderRelease = () => {
      //
    };
    /**
         * If provided, this will be called everytime the map is moved
         */
    this.onMove = () => {
      //
    };
    /**
         * If provided, this method will be called when the onLayout event fires
         */
    this.layoutChange = () => {
      //
    };
    /**
         * function that fires when user swipes down
         */
    this.onSwipeDown = () => {
      //
    };
  }
}
export class State {
  constructor () {
    /**
         * 中心 x 坐标
         */
    this.centerX = 0.5;
    /**
         * 中心 y 坐标
         */
    this.centerY = 0.5;
    this.mounted = false;
  }
}
