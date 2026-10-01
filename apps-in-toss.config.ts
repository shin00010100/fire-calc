import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // TODO(ait): 콘솔에 등록한 appName(기획상 'freedom-flame')으로 확인 후 교체. 임의 변경 금지.
  appName: 'testapp999',
  brand: {
    primaryColor: '#EA580C',
  },
  permissions: [],
  webBundleDir: 'dist',
});
