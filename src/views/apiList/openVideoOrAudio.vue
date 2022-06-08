<template>
  <div>
    <div>视频状态切换<el-button @click="changeVideo">切换</el-button></div>
    <div>音频状态切换<el-button @click="changeAudio">切换</el-button></div>
  </div>
</template>
<script lang="ts" setup>
// import { addSuccessLog } from './tools';

let videoStatus = true;
let audioStatus = true;
// eslint-disable-next-line no-undef
const props = defineProps({
  localStream: {
    default: null,
  },
});
console.log(props);
function changeVideo() {
  if (!videoStatus) {
    props.localStream.unmuteVideo();
  } else {
    props.localStream.muteVideo();
  }
  videoStatus = !videoStatus;
  // addSuccessLog(`${videoStatus ? '打开' : '关闭'}视频流`);
}
function changeAudio() {
  if (!audioStatus) {
    props.localStream.unmuteAudio();
  } else {
    props.localStream.muteAudio();
  }
  audioStatus = !audioStatus;
  // addSuccessLog(`${videoStatus ? '打开' : '关闭'}音频流`);
}
</script>
