/* eslint-env browser */
(function() {
  window.TrekDeskAI = {
    init: function(config = {}) {
      // 1. Configuration Check
      const agentId = config.agentId || "00000000-0000-0000-0000-000000000001";
      const primaryColor = config.color || "#10b981";
      const position = config.position || "right";
      const initialMessage = config.msg || "Hi! How can I help you today?";
      const assistantName = config.name || "TrekDesk AI";

      // 2. Create Styles
  const style = document.createElement("style");
  style.textContent = `
    #trekdesk-widget-launcher {
      position: fixed;
      bottom: 20px;
      ${position}: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${primaryColor};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #trekdesk-widget-launcher:hover {
      transform: scale(1.1);
    }
    #trekdesk-widget-container {
      position: fixed;
      bottom: 90px;
      ${position}: 20px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 110px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      z-index: 999998;
      overflow: hidden;
      display: none;
      border: 1px solid #eee;
    }
    #trekdesk-widget-container.open {
      display: block;
      animation: trekdesk-fade-in 0.3s ease-out;
    }
    @keyframes trekdesk-fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 480px) {
      #trekdesk-widget-container {
        width: calc(100% - 40px);
        height: calc(100% - 110px);
      }
    }
  `;
  document.head.appendChild(style);

  // 3. Create Elements
  const launcher = document.createElement("div");
  launcher.id = "trekdesk-widget-launcher";
  const headsetIcon = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-5Z"/><path d="M21 16v2a2 2 0 0 1-2 2h-1"/></svg>`;
  launcher.innerHTML = headsetIcon;
  
  const container = document.createElement("div");
  container.id = "trekdesk-widget-container";
  
  const iframe = document.createElement("iframe");
  const embedUrl = `http://localhost:5173/embed/chat?agentId=${agentId}&color=${encodeURIComponent(primaryColor)}&msg=${encodeURIComponent(initialMessage)}&name=${encodeURIComponent(assistantName)}`;
  iframe.src = embedUrl;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  
  container.appendChild(iframe);
  document.body.appendChild(launcher);
  document.body.appendChild(container);

  // 4. Toggle Interaction
  let isOpen = false;
  launcher.onclick = () => {
    isOpen = !isOpen;
    container.classList.toggle("open", isOpen);
    if (isOpen) {
      launcher.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
    } else {
      launcher.innerHTML = headsetIcon;
    }
  };
    }
  };
})();
