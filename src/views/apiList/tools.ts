import appStore from '@/store/index';

const store = appStore();
export const addSuccessLog = (str: string) => {
  store.logs.push({
    type: 'success',
    content: str,
  });
};

export const addFailedLog = (str: string) => {
  store.logs.push({
    type: 'failed',
    content: str,
  });
};
