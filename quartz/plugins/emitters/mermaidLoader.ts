import { QuartzEmitterPlugin } from "../types"

export const MermaidLoader: QuartzEmitterPlugin = () => {
  return {
    name: "MermaidLoader",
    externalResources() {
      return {
        js: [
          {
            loadTime: "afterDOMReady",
            contentType: "inline",
            script: `
              (async function(){
                try {
                  // If an older mermaid is present, skip re-initializing.
                  if (window.mermaid && window.mermaid.run) return;

                  // Use ESM build (mermaid 11.x) from CDN and initialize once.
                  const mod = await import('https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.esm.min.mjs');
                  const mermaid = mod && (mod.default || mod);
                  if (!mermaid) {
                    console.error('mermaid import failed');
                    return;
                  }

                  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'base' });

                  const renderAll = async () => {
                    const nodes = Array.from(document.querySelectorAll('pre code.language-mermaid, code.language-mermaid, div.mermaid'));
                    nodes.forEach((el) => {
                      try {
                        const parent = el.closest('pre') || el.parentElement || document.body;
                        const container = document.createElement('div');
                        container.className = 'mermaid';
                        container.textContent = el.textContent || '';
                        parent.insertBefore(container, el);
                        if (el.closest('pre')) el.closest('pre').style.display = 'none';
                      } catch(e) { /* ignore individual node errors */ }
                    });
                    try {
                      await mermaid.run({ nodes: Array.from(document.querySelectorAll('.mermaid')) });
                    } catch(e) {
                      // fallback to mermaid.init for compatibility
                      try { mermaid.init(undefined, document.querySelectorAll('.mermaid')); } catch(e2){ console.error('mermaid render failed', e2) }
                    }
                  };

                  // Initial render and on navigation/theme changes
                  await renderAll();
                  document.addEventListener('nav', () => setTimeout(renderAll, 50));
                  document.addEventListener('themechange', renderAll);
                } catch (e) {
                  console.error('mermaid loader error', e);
                }
              })();
            `,
          },
        ],
      }
    },
    async *emit(ctx, _content, _resources) {
      // This emitter only provides client-side externalResources (JS). No files to emit.
      return;
    }
  }
}
