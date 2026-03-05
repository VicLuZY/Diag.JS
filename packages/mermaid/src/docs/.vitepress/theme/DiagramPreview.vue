<template>
  <div v-if="props.showCode">
    <h5>Source</h5>
    <div class="language-diagram">
      <button class="copy"></button>
      <span class="lang">inkline</span>
      <pre>
        <code
          ref="editableContent"
          :contenteditable="contentEditable"
          class="editable-code"
          @input="updateCode"
          @keydown.meta.enter="renderChart"
          @keydown.ctrl.enter="renderChart"
        ></code>
      </pre>
      <div class="buttons-container">
        <span>{{ ctrlSymbol }} + Enter</span><span>|</span>
        <button @click="renderChart">Render</button>
      </div>
    </div>
  </div>
  <div v-html="svg"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { renderDiagram } from './diagram-engine';

const props = defineProps({
  graph: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  showCode: {
    type: Boolean,
    default: true,
  },
});

const svg = ref('');
const code = ref(decodeURIComponent(props.graph));
const ctrlSymbol = ref('Ctrl');
const editableContent = ref(null);
const contentEditable = ref('plaintext-only');

let mut = null;

const updateCode = (event) => {
  code.value = event.target.innerText;
};

onMounted(async () => {
  const nav = globalThis.navigator;
  if (nav) {
    ctrlSymbol.value = nav.platform.includes('Mac') ? '⌘' : 'Ctrl';
    const isFirefox = nav.userAgent.toLowerCase().includes('firefox');
    contentEditable.value = isFirefox ? 'true' : 'plaintext-only';
  }

  mut = new MutationObserver(() => renderChart());
  mut.observe(document.documentElement, { attributes: true });

  if (editableContent.value) {
    editableContent.value.textContent = code.value;
  }

  await renderChart();

  const hasImages = /<img([\w\W]+?)>/.exec(code.value)?.length > 0;
  if (hasImages)
    setTimeout(() => {
      const imgElements = document.getElementsByTagName('img');
      const imgs = Array.from(imgElements);
      if (imgs.length) {
        Promise.all(
          imgs
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                })
            )
        ).then(() => {
          renderChart();
        });
      }
    }, 100);
});

onUnmounted(() => mut?.disconnect());

const renderChart = async () => {
  const hasDarkClass = document.documentElement.classList.contains('dark');
  const runtimeConfig = {
    securityLevel: 'loose',
    startOnLoad: false,
    theme: hasDarkClass ? 'dark' : 'default',
  };
  const svgCode = await renderDiagram(props.id, code.value, runtimeConfig);
  const salt = Math.random().toString(36).substring(7);
  svg.value = `${svgCode} <span style="display: none">${salt}</span>`;
};
</script>

<style>
.editable-code:focus {
  outline: none;
}

.buttons-container {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.buttons-container > span {
  cursor: default;
  opacity: 0.6;
  font-size: 0.78rem;
}

.buttons-container > button {
  color: #047857;
  font-weight: 700;
  cursor: pointer;
}

.buttons-container > button:hover {
  color: #065f46;
}
</style>
