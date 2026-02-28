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
              (function(){
                if (window.mermaid) return;
                const s = document.createElement('script');
                s.src = 'https://unpkg.com/mermaid@10/dist/mermaid.min.js';
                s.defer = true;
                s.onload = function() {
                  try {
                    window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'base' });
                    const renderAll = () => {
                      const nodes = Array.from(document.querySelectorAll('pre code.language-mermaid, code.language-mermaid, div.mermaid'));
                      nodes.forEach((el) => {
                        try {
                          const parent = el.closest('pre') || el.parentElement || document.body;
                          const container = document.createElement('div');
                          container.className = 'mermaid';
                          container.textContent = el.textContent || '';
                          parent.insertBefore(container, el);
                          if (el.closest('pre')) el.closest('pre').style.display = 'none';
                        } catch(e) { /* ignore */ }
                      });
                      window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                    };
                    renderAll();
                    document.addEventListener('nav', () => setTimeout(renderAll, 50));
                  } catch(e){ console.error('mermaid load error', e) }
                };
                document.head.appendChild(s);
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
