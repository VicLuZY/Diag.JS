import DefaultTheme from 'vitepress/theme';
import DiagramPreview from './DiagramPreview.vue';
import type { EnhanceAppContext } from 'vitepress';
import './custom.css';
import '../style/main.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('DiagramPreview', DiagramPreview);
  },
};
