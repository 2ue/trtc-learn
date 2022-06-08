import { LocalStream } from 'trtc-js-sdk';

let intervalId: NodeJS.Timer = null;

interface WaterMark {
  localStream: LocalStream;
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  imageUrl: string,
}

// 用于加载水印图片
function loadImage(imageUrl: string) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => resolve(image);
  });
}
export async function startWaterMark({
  localStream, x, y, width, height, imageUrl,
}: WaterMark) {
  // 2. 创建 video 标签播放视频流
  const video = document.createElement('video');
  const sourceVideoTrack = localStream.getVideoTrack();
  const mediaStream = new MediaStream();
  mediaStream.addTrack(sourceVideoTrack);
  video.srcObject = mediaStream;
  await video.play();
  // 3. 加载水印图片
  const image: { width?: number, height?: number } = await loadImage(imageUrl);
  console.log('000==>', image);
  // 4. 创建 canvas 标签，并使用 setInterval 将视频和水印绘制到 canvas 画布中
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const settings = sourceVideoTrack.getSettings();
  canvas.width = settings.width;
  canvas.height = settings.height;
  intervalId = setInterval(() => {
    // 将视频绘制到画布中
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 将水印图片绘制到画布中，可以控制水印的位置和大小
    if (image) {
      ctx.drawImage(image as CanvasImageSource, x || 0, y || 0, width || image.width, height || image.height);
    }
  }, Math.floor(1000 / settings.frameRate)); // 根据帧率计算每次绘制的时间间隔
  // 5. 使用 canvas.captureStream 从画布中采集视频流，使用 LocalStream.replaceTrack 替换视频流
  const canvasStream = canvas.captureStream();
  await localStream.replaceTrack(canvasStream.getVideoTracks()[0]);
}

export async function stopWaterMark(localStream: LocalStream, sourceVideoTrack: MediaStreamTrack) {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    await localStream.replaceTrack(sourceVideoTrack);
    // if (video) {
    //   video.srcObject = null;
    //   video = null;
    // }
  }
}
