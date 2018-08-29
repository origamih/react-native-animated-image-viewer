export const calculateDestModalImageMeasure = (imageSize, screenSize, swipedY = 0) => {
  let destMeasure = {
    width: 0,
    height: 0,
    pageX: 0,
    pageY: 0
  };

  const aspectRatio = imageSize.width / imageSize.height;
  const screenAspectRatio = screenSize.width / screenSize.height;

  destMeasure = {
    width: screenSize.width,
    height: screenSize.height,
    pageX: 0,
    pageY: 0
  };

  if (aspectRatio - screenAspectRatio < 0) {
    // Portrait image
    // height = screenHeight
    // width = screenHeight * aspectRatio
    // x = (screenWidth - width) / 2
    destMeasure.width = aspectRatio * destMeasure.height;
    destMeasure.pageX = (screenSize.width - destMeasure.width) / 2;
  } else {
    // Landscape image
    // width = screenWidth
    // height = screenWidth / aspectRatio
    // y = (screenHeight - height) / 2
    destMeasure.height = destMeasure.width / aspectRatio;
    destMeasure.pageY = (screenSize.height - destMeasure.height) / 2;
  }
  destMeasure.pageY += swipedY;
  return destMeasure;
};

export const calculateTransformation = (sourceMeasure, destMeasure) => {
  let openingInitScale = 1;
  let openingInitTranslateX = 0;
  let openingInitTranslateY = 0;

  const translateInitX = sourceMeasure.pageX + sourceMeasure.width / 2;
  const translateInitY = sourceMeasure.pageY + sourceMeasure.height / 2;
  const translateDestX = destMeasure.pageX + destMeasure.width / 2;
  const translateDestY = destMeasure.pageY + destMeasure.height / 2;

  openingInitTranslateX = translateInitX - translateDestX;
  openingInitTranslateY = translateInitY - translateDestY;

  openingInitScale = sourceMeasure.width / destMeasure.width;
  return {
    scale: openingInitScale,
    translateX: openingInitTranslateX,
    translateY: openingInitTranslateY
  };
};
