import { Client } from 'trtc-js-sdk';

export default async function pushCdn(client: Client) {
  const options = {
    appId: 1304422935,
    bizId: 168484,
    url: 'webrtc://168484.livepush.myqcloud.com/live/test?txSecret=d29c371ce938e6c5761c8c9dae503690&txTime=62A09354',
  };
  try {
    await client.startPublishCDNStream(options);
  } catch (error) {
    console.log('startPublishCDNStream failed', error);
  }
}
