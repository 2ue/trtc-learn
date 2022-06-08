<template>
  <el-row style='padding: 0 10px 40px 10px'>
    <el-col :md='{span: 18, offset: 3}' :sm='{span: 24}'>
      <div class="invite">
        <div class='share-link'>
          <div class='alert'>{{ t('inviteUrl') }}</div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>
<script lang='ts' setup>
import { useI18n } from 'vue-i18n';
import TRTC from 'trtc-js-sdk';
import { ElMessage } from 'element-plus/es';
import { getParamKey } from '@/utils/utils';

const { t } = useI18n();

const sdkAppId = parseInt(getParamKey('sdkAppId'), 10);
const userId = getParamKey('userId');
const userSig = getParamKey('userSig');
const roomId = parseInt(getParamKey('roomId'), 10);

const state = { url: window.location.href.split('?')[0] };
window.history.pushState(state, '', 'index.html#/invite');

if (!sdkAppId || !userId || !userSig || !roomId) {
  ElMessage.error(t('check'));
}
console.log('111111');
console.log('TRTC==>', TRTC);
TRTC.checkSystemRequirements().then((res) => {
  console.log('checkSystemRequirements res==>', res);
});
console.log('TRTC.isScreenShareSupported()===>', TRTC.isScreenShareSupported());
console.log('TRTC.isSmallStreamSupported()===>', TRTC.isSmallStreamSupported());
TRTC.getDevices().then((res) => {
  console.log('getDevices res==>', res);
});
TRTC.getCameras().then((res) => {
  console.log('getCameras res==>', res);
});
TRTC.getMicrophones().then((res) => {
  console.log('getMicrophones res==>', res);
});
TRTC.getSpeakers().then((res) => {
  console.log('getSpeakers res==>', res);
});
</script>
<style lang='stylus' scoped>
.invite
  display flex
  padding-top 20px

.share-link
  color #084298
  background-color #cfe2ff
  border-color #b6d4fe
  width 100%
  padding 15px 20px
  font-size 14px
  border-radius 4px

.el-button
  background-color #0d6efd
  font-size 14px
  font-weight 400
  padding 4px 8px

.el-button:hover
  background-color #0d6efd

.el-button:focus
  background-color #0d6efd

.el-button + .el-button
  margin-left 6px

.remote-container
  display flex
  flex-wrap wrap
  justify-content space-between
  padding-top 20px
</style>
