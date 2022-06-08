<template>
  <div>
    <div>切换参数</div>
    <div>
      当前分辨率：{{store.width}} x {{store.height}}
      <el-button @click="change(1)">切换</el-button>
    </div>
    <div>
      当前帧率：{{store.frameRate}}
      <el-button @click="change(2)">切换</el-button>
    </div>
    <div>
      当前码率：{{store.bitrate}}
      <el-button @click="change(3)">切换</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import appStore from '@/store/index';
// import { addSuccessLog } from './tools';

const whArr = [
  { width: 640, height: 480 },
  { width: 1080, height: 720 },
  { width: 1920, height: 1080 },
];
const fArr = [
  { frameRate: 15 },
  { frameRate: 30 },
  { frameRate: 45 },
  { frameRate: 60 },
  { frameRate: 90 },
];
const rArr = [
  { bitrate: 900 },
  { bitrate: 1000 },
  { bitrate: 1200 },
  { bitrate: 1500 },
  { bitrate: 2000 },
  { bitrate: 10000 },
];
let x = 0;
let y = 0;
let z = 0;
// eslint-disable-next-line no-undef
const props = defineProps({
  localStream: {
    default: null,
  },
});
console.log(props);
const store = appStore();
const profile = ref<object>({
  width: store.width || 640,
  height: store.height || 480,
  frameRate: store.frameRate || 15,
  bitrate: store.bitrate || 900,
});
function change(type: number) {
  let i = 99;
  let arr = [];
  if (type === 1) {
    x += 1;
    i = x;
    arr = whArr;
  } else if (type === 2) {
    y += 1;
    i = y;
    arr = fArr;
  } else {
    z += 1;
    i = z;
    arr = rArr;
  }
  if (!arr[i]) {
    i = 0;
    if (type === 1) {
      x = 0;
    } else if (type === 2) {
      y = 0;
    } else {
      z = 0;
    }
  }
  store.$patch({
    ...arr[i],
  });
  props.localStream.setVideoProfile({
    ...profile.value,
    ...arr[i],
  });
  // addSuccessLog(`切换视频profile：${JSON.stringify(profile.value)}`);
}
</script>
