import { LocalStream, Client } from 'trtc-js-sdk';
/*eslint-disable*/
import AudioMixerPlugin from 'rtc-audio-mixer';

// const sourceUrl = 'https://www.joy127.com/url/90726.mp3';
const result = AudioMixerPlugin.isSupported();
if (!result) {
	alert('Your browser is not compatible with AudioMixerPlugin');
}

export default async function mixBgMusic(url: string, localStream: LocalStream, client: Client) {
  const audioSourceA = AudioMixerPlugin.createAudioSource({ url });
  console.log('localStream==>', localStream);
  // await localStream.initialize();
  // 1. 获取麦克风轨道
  const originAudioTrack = localStream.getAudioTrack();
  // 2. 与 audioSourceA audioSourceB 混合后生成 mixedAudioTrack
  const mixedAudioTrack = AudioMixerPlugin.mix({ targetTrack: originAudioTrack, sourceList: [audioSourceA] });
  // 3. 替换麦克风轨道
  localStream.replaceTrack(mixedAudioTrack);
  // 4. 发布
  // client.publish(localStream);
  // 5. 调用 play 方法播放，这时通话双方都能听到背景音乐
  audioSourceA.play();
}
