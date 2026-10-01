import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 콘솔에 등록된 appName (변경 불가)
  appName: 'firegroup',
  brand: {
    primaryColor: '#EA580C',
  },
  permissions: [],
  webBundleDir: 'dist',
});
