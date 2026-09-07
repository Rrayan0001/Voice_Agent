/**
 * CHRONOS TEMPORAL LOGISTICS - VOICE ASSISTANT CLIENT CONTROLLER
 * Integrates Vapi Web SDK, Web Audio API oscilloscope, and retro terminal UI.
 */

// Global State
const STATE = {
  callActive: false,
  callConnecting: false,
  muted: false,
  simulatorMode: false,
  config: {
    publicKey: "",
    hasPrivateKey: false,
    assistantId: ""
  },
  audioCtx: null,
  analyser: null,
  animId: null
};

// Vapi Instance
let vapi = null;

// DTMF Frequencies (Dual-Tone Multi-Frequency)
const DTMF_FREQS = {
  '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
  '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
  '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
  '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
};

// DOM Elements
const DOM = {
  btnToggleCall: document.getElementById('btnToggleCall'),
  btnCallText: document.getElementById('btnCallText'),
  btnCallSub: document.getElementById('btnCallSub'),
  btnMuteMic: document.getElementById('btnMuteMic'),
  btnSimulateMode: document.getElementById('btnSimulateMode'),
  callStateLabel: document.getElementById('callStateLabel'),
  systemStatusText: document.getElementById('systemStatusText'),
  transcriptFeed: document.getElementById('transcriptFeed'),
  transcriptStatus: document.getElementById('transcriptStatus'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  needleMic: document.getElementById('needleMic'),
  needleSpeaker: document.getElementById('needleSpeaker'),
  canvas: document.getElementById('oscilloscope'),
  currentEpochTime: document.getElementById('currentEpochTime'),
  
  // Modals & Config
  configModal: document.getElementById('configModal'),
  btnOpenConfig: document.getElementById('btnOpenConfig'),
  btnCloseConfig: document.getElementById('btnCloseConfig'),
  configForm: document.getElementById('configForm'),
  inputPublicKey: document.getElementById('inputPublicKey'),
  inputPrivateKey: document.getElementById('inputPrivateKey'),
  inputAssistantId: document.getElementById('inputAssistantId'),
  btnAutoSetupAssistant: document.getElementById('btnAutoSetupAssistant'),
  configFeedback: document.getElementById('configFeedback'),

  // Tabs
  navTabs: document.querySelectorAll('.nav-tab'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  btnClearTranscript: document.getElementById('btnClearTranscript'),

  // Database
  tableParadoxes: document.getElementById('tableParadoxes'),
  tableTickets: document.getElementById('tableTickets'),
  claimsList: document.getElementById('claimsList'),
  btnRefreshDb: document.getElementById('btnRefreshDb')
};

// Initialize Web Audio Context
function getAudioContext() {
  if (!STATE.audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    STATE.audioCtx = new AudioContext();
  }
  if (STATE.audioCtx.state === 'suspended') {
    STATE.audioCtx.resume();
  }
  return STATE.audioCtx;
}

// Play DTMF Tone
function playDtmfTone(char) {
  try {
    const ctx = getAudioContext();
    const freqs = DTMF_FREQS[char];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.debug('Audio error:', e);
  }
}

// Play Terminal Chirp
function playTerminalChirp(pitch = 880, duration = 0.04) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// Clock Display
function updateClock() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  if (DOM.currentEpochTime) {
    DOM.currentEpochTime.textContent = `${year}.${month}.${day} // ${hours}:${mins}:${secs}`;
  }
}
setInterval(updateClock, 1000);
updateClock();

// Oscilloscope Visualizer
function initOscilloscope() {
  const canvas = DOM.canvas;
  const ctx = canvas.getContext('2d');
  let phase = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isLive = STATE.callActive || STATE.callConnecting;
    const color = getComputedStyle(document.body).getPropertyValue('--color-primary').trim() || '#ffb400';

    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.beginPath();

    const midY = canvas.height / 2;
    const points = 100;
    const step = canvas.width / points;

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      let y = midY;

      if (isLive) {
        // Dynamic waveform
        const freq1 = Math.sin((i * 0.15) + phase);
        const freq2 = Math.cos((i * 0.05) - (phase * 1.5));
        const amp = STATE.callActive ? 32 : 12;
        y = midY + (freq1 * amp * Math.sin(phase * 0.8)) + (freq2 * (amp * 0.5));
      } else {
        // Idle baseline with slight electronic hum
        y = midY + Math.sin((i * 0.08) + phase) * 2;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Deflect VU needles based on state
    if (isLive) {
      const micNoise = -35 + Math.sin(phase * 3) * 25 + Math.random() * 15;
      const spkNoise = -35 + Math.cos(phase * 2.5) * 35 + Math.random() * 20;
      updateVUNeedles(micNoise, spkNoise);
    } else {
      updateVUNeedles(-35, -35);
    }

    phase += 0.06;
    STATE.animId = requestAnimationFrame(render);
  }

  render();
}

function updateVUNeedles(micAngle, spkAngle) {
  // Angle bounds: -35deg to +35deg
  const clamp = (val) => Math.max(-35, Math.min(35, val));
  if (DOM.needleMic) DOM.needleMic.style.transform = `rotate(${clamp(micAngle)}deg)`;
  if (DOM.needleSpeaker) DOM.needleSpeaker.style.transform = `rotate(${clamp(spkAngle)}deg)`;
}

// Add Entry to Transcript Feed
function appendTranscript(speaker, text, type = 'assistant', toolData = null) {
  const now = new Date();
  const timeStr = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;

  const entry = document.createElement('div');
  entry.className = `message-entry ${type}`;

  let contentHtml = `
    <span class="msg-time">${timeStr}</span>
    <span class="msg-speaker">${speaker}:</span>
    <span class="msg-content">${escapeHtml(text)}</span>
  `;

  if (toolData) {
    contentHtml += `
      <div class="tool-action">
        <span class="tool-title">⚡ PYTHON TOOL EXECUTED: ${toolData.action || 'Function Call'}</span>
        <pre>${escapeHtml(JSON.stringify(toolData.tool_data || toolData, null, 2))}</pre>
      </div>
    `;
  }

  entry.innerHTML = contentHtml;
  DOM.transcriptFeed.appendChild(entry);
  DOM.transcriptFeed.scrollTop = DOM.transcriptFeed.scrollHeight;
  playTerminalChirp(600, 0.03);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Load System Config
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    STATE.config.publicKey = data.public_key || "";
    STATE.config.hasPrivateKey = data.has_private_key;
    STATE.config.assistantId = data.assistant_id || "";

    if (DOM.inputPublicKey) DOM.inputPublicKey.value = STATE.config.publicKey;
    if (DOM.inputAssistantId) DOM.inputAssistantId.value = STATE.config.assistantId;

    if (STATE.config.publicKey) {
      initVapiInstance();
    }
  } catch (e) {
    console.error('Failed to load server config:', e);
  }
}

// Initialize Vapi SDK Client
function initVapiInstance() {
  if (!window.vapi) {
    if (window.Vapi) {
      try {
        window.vapi = new window.Vapi(STATE.config.publicKey);
        setupVapiEvents();
      } catch (err) {
        console.warn('Vapi SDK init error:', err);
      }
    }
  }
}

// Vapi Event Listeners
function setupVapiEvents() {
  if (!window.vapi) return;

  window.vapi.on('call-start', () => {
    STATE.callActive = true;
    STATE.callConnecting = false;
    updateCallButtonState('active');
    DOM.callStateLabel.textContent = 'LINK STATUS: QUANTUM STREAM ACTIVE';
    DOM.systemStatusText.textContent = 'AUDIO COMM ONLINE';
    DOM.transcriptStatus.textContent = 'IRIS VOICE STREAMING';
    DOM.btnMuteMic.disabled = false;
    appendTranscript('CHRONOS COMM', 'Duplex WebRTC voice link established with IRIS.', 'system');
  });

  window.vapi.on('call-end', () => {
    STATE.callActive = false;
    STATE.callConnecting = false;
    updateCallButtonState('idle');
    DOM.callStateLabel.textContent = 'LINK STATUS: IDLE / STANDBY';
    DOM.systemStatusText.textContent = 'TERMINAL ONLINE';
    DOM.transcriptStatus.textContent = 'LISTENING CHANNELS OPEN';
    DOM.btnMuteMic.disabled = true;
    appendTranscript('CHRONOS COMM', 'Call terminated. Temporal coordinates closed.', 'system');
  });

  window.vapi.on('speech-start', () => {
    DOM.callStateLabel.textContent = 'IRIS // SPEAKING...';
  });

  window.vapi.on('speech-end', () => {
    DOM.callStateLabel.textContent = 'LISTENING FOR TRAVELER...';
  });

  window.vapi.on('message', (message) => {
    if (message.type === 'transcript') {
      if (message.role === 'assistant' && message.transcriptType === 'final') {
        appendTranscript('IRIS (AI)', message.transcript, 'assistant');
      } else if (message.role === 'user' && message.transcriptType === 'final') {
        appendTranscript('CALLER', message.transcript, 'caller');
      }
    } else if (message.type === 'function-call' || message.type === 'tool-calls') {
      appendTranscript('CHRONOS ENGINE', `Invoking Python function: ${message.functionCall?.name || 'tool'}`, 'tool-action', message);
      // Refresh temporal DB
      setTimeout(loadDatabaseStatus, 1500);
    }
  });

  window.vapi.on('error', (err) => {
    console.error('Vapi Call Error:', err);
    STATE.callConnecting = false;
    updateCallButtonState('idle');
    appendTranscript('SYSTEM ERROR', `Voice link error: ${err.message || JSON.stringify(err)}`, 'system');
  });
}

// Master Call Button Handler
async function toggleCall() {
  getAudioContext();

  if (STATE.callActive) {
    // End call
    if (window.vapi) {
      window.vapi.stop();
    }
    STATE.callActive = false;
    updateCallButtonState('idle');
    return;
  }

  // If in simulator mode or missing key, use interactive speech synthesizer
  if (STATE.simulatorMode || !STATE.config.publicKey) {
    if (!STATE.config.publicKey && !STATE.simulatorMode) {
      appendTranscript('ADVISORY', 'No Vapi Public Key configured. Automatically enabling SIMULATOR MODE for demonstration! (To use live Vapi voice, click SETTINGS & KEYS above).', 'system');
      toggleSimulatorMode(true);
    }
    startSimulatedCall();
    return;
  }

  // Live Vapi Call
  try {
    initVapiInstance();
    updateCallButtonState('calling');
    DOM.callStateLabel.textContent = 'CONNECTING TO VAPI CLOUD...';
    appendTranscript('COMM-LINK', 'Handshaking with Vapi.ai WebRTC Gateway...', 'system');

    if (STATE.config.assistantId) {
      await window.vapi.start(STATE.config.assistantId);
    } else {
      // Inline assistant configuration if ID not created yet
      await window.vapi.start({
        name: "IRIS - Chronos Support",
        firstMessage: "Greetings, traveler. You have reached Chronos Temporal Logistics. This is IRIS. What timeline discrepancy or quantum booking may I resolve for you today?",
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are IRIS, voice customer agent for Chronos Temporal Logistics & Paradox Management. Assist travelers with time paradoxes, ticket rescheduling, and epoch warnings with calm, slightly witty professionalism. Keep voice answers short."
            }
          ]
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM"
        }
      });
    }
  } catch (err) {
    console.error('Failed to start call:', err);
    updateCallButtonState('idle');
    appendTranscript('SYS ERROR', `Failed to initiate call: ${err.message || err}. Consider testing with Simulator Mode.`, 'system');
  }
}

function updateCallButtonState(state) {
  DOM.btnToggleCall.classList.remove('state-idle', 'state-calling', 'state-active');
  if (state === 'active') {
    DOM.btnToggleCall.classList.add('state-active');
    DOM.btnCallText.textContent = 'TERMINATE QUANTUM LINK';
    DOM.btnCallSub.textContent = 'Link Active // Tap to Disconnect';
  } else if (state === 'calling') {
    DOM.btnToggleCall.classList.add('state-calling');
    DOM.btnCallText.textContent = 'ESTABLISHING LINK...';
    DOM.btnCallSub.textContent = 'Transmitting Quantum Carrier Wave';
  } else {
    DOM.btnToggleCall.classList.add('state-idle');
    DOM.btnCallText.textContent = 'INITIATE QUANTUM VOICE LINK';
    DOM.btnCallSub.textContent = STATE.simulatorMode ? 'Simulator Active // Built-in TTS' : 'Vapi.ai Realtime WebRTC';
  }
}

// SIMULATION / DEMONSTRATION FALLBACK ENGINE
function toggleSimulatorMode(forcedState) {
  STATE.simulatorMode = forcedState !== undefined ? forcedState : !STATE.simulatorMode;
  if (STATE.simulatorMode) {
    DOM.btnSimulateMode.textContent = '⚡ SIMULATOR MODE: ON';
    DOM.btnSimulateMode.classList.add('btn-action');
    DOM.btnCallSub.textContent = 'Simulator Active // Built-in TTS';
  } else {
    DOM.btnSimulateMode.textContent = '⚡ SIMULATOR MODE: OFF';
    DOM.btnSimulateMode.classList.remove('btn-action');
    DOM.btnCallSub.textContent = 'Vapi.ai Realtime WebRTC';
  }
}

function startSimulatedCall() {
  STATE.callActive = true;
  updateCallButtonState('active');
  DOM.callStateLabel.textContent = 'LINK STATUS: SIMULATED VOICE ACTIVE';
  DOM.systemStatusText.textContent = 'SIMULATOR ON';
  DOM.btnMuteMic.disabled = false;

  const greeting = "Greetings, traveler. You have reached Chronos Temporal Logistics. This is IRIS. What timeline discrepancy or quantum booking may I resolve for you today?";
  appendTranscript('IRIS (AI)', greeting, 'assistant');
  speakSynthesizedText(greeting);
}

// Local TTS for simulator
function speakSynthesizedText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1.05;
  utterance.rate = 1.0;
  
  // Pick English voice if available
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Natural')));
  if (enVoice) utterance.voice = enVoice;

  utterance.onstart = () => {
    DOM.callStateLabel.textContent = 'IRIS // SPEAKING (SYNTH)...';
  };
  utterance.onend = () => {
    DOM.callStateLabel.textContent = 'LISTENING FOR TRAVELER...';
  };

  window.speechSynthesis.speak(utterance);
}

// Process Customer Queries (Text bar or Sample Chips)
async function sendCustomerQuery(queryText) {
  if (!queryText.trim()) return;

  appendTranscript('CALLER', queryText, 'caller');
  playTerminalChirp(750, 0.05);

  try {
    const res = await fetch('/api/temporal/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText })
    });
    const data = await res.json();

    // Show tool action in transcript if a tool was executed
    if (data.action && data.action !== 'conversational_triage') {
      appendTranscript('CHRONOS BACKEND', `Python Tool Triggered: [${data.action}]`, 'tool-action', data);
    }

    appendTranscript('IRIS (AI)', data.agent_response, 'assistant');
    
    // Speak response if call or simulator is active
    if (STATE.callActive || STATE.simulatorMode) {
      speakSynthesizedText(data.agent_response);
    }

    // Refresh database tab view
    loadDatabaseStatus();
  } catch (err) {
    appendTranscript('SYSTEM', 'Failed to communicate with temporal backend.', 'system');
  }
}

// Load Database Status for Tab 3
async function loadDatabaseStatus() {
  try {
    const res = await fetch('/api/temporal/status');
    const data = await res.json();

    // 1. Paradoxes
    const pBody = DOM.tableParadoxes.querySelector('tbody');
    pBody.innerHTML = '';
    data.active_paradoxes.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.incident_id}</strong></td>
        <td>${p.customer}</td>
        <td>${p.epoch}</td>
        <td>${p.anomaly}<br><small style="color:var(--color-text-dim)">${p.status}</small></td>
        <td><span class="tag">${p.turbulence_level}</span></td>
      `;
      pBody.appendChild(tr);
    });

    // 2. Tickets
    const tBody = DOM.tableTickets.querySelector('tbody');
    tBody.innerHTML = '';
    data.tickets.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${t.ticket_id}</strong></td>
        <td>${t.passenger}</td>
        <td>${t.departure_portal}</td>
        <td>${t.destination_epoch}</td>
        <td><span class="tag">${t.status}</span></td>
      `;
      tBody.appendChild(tr);
    });

    // 3. Claims
    if (data.recent_claims && data.recent_claims.length > 0) {
      DOM.claimsList.innerHTML = '';
      data.recent_claims.forEach(c => {
        const item = document.createElement('div');
        item.className = 'claim-item';
        item.innerHTML = `
          <div>
            <strong>${c.claim_id}</strong> // Traveler: ${c.customer_name} (${c.stranded_epoch})
            <div style="color:var(--color-text-dim);font-size:11px">${c.anomaly_description}</div>
          </div>
          <div><span class="tag">${c.status}</span></div>
        `;
        DOM.claimsList.appendChild(item);
      });
    }
  } catch (e) {
    console.warn('DB reload err:', e);
  }
}

// EVENT ATTACHMENTS
function attachEvents() {
  // Call Toggle
  DOM.btnToggleCall.addEventListener('click', toggleCall);

  // Mute Mic Toggle
  DOM.btnMuteMic.addEventListener('click', () => {
    STATE.muted = !STATE.muted;
    if (window.vapi) {
      window.vapi.setMuted(STATE.muted);
    }
    DOM.btnMuteMic.textContent = STATE.muted ? '🔇 UNMUTE MIC' : '🎤 MUTE MIC';
  });

  // Simulator Toggle
  DOM.btnSimulateMode.addEventListener('click', () => toggleSimulatorMode());

  // DTMF Keypad
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);
      playDtmfTone(key);

      // If call is active in Vapi, send DTMF
      if (window.vapi && STATE.callActive) {
        try { window.vapi.send({ type: 'dtmf', key }); } catch (e) {}
      }

      // Quick query shortcuts
      if (key === '1') sendCustomerQuery("Check status of paradox PRX-101");
      else if (key === '2') sendCustomerQuery("Apatosaurus dinosaur containment issue in PRX-774");
      else if (key === '3') sendCustomerQuery("Reschedule departure ticket TCK-882");
      else if (key === '4') sendCustomerQuery("What are the advisories for traveling to 1985?");
    });
  });

  // Chat Form Submission
  DOM.chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = DOM.chatInput.value.trim();
    if (q) {
      sendCustomerQuery(q);
      DOM.chatInput.value = '';
    }
  });

  // Sample Query Chips (Tab 2)
  document.querySelectorAll('.query-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      // Switch back to transcript tab to watch execution
      switchTab('tab-transcript');
      sendCustomerQuery(query);
    });
  });

  // Tabs Navigation
  DOM.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      switchTab(targetId);
    });
  });

  // Clear Transcript
  DOM.btnClearTranscript.addEventListener('click', () => {
    DOM.transcriptFeed.innerHTML = '';
    appendTranscript('CHRONOS CORE', 'Buffer cleared. Ready for transmission.', 'system');
  });

  // Refresh DB
  DOM.btnRefreshDb.addEventListener('click', loadDatabaseStatus);

  // Config Modal
  DOM.btnOpenConfig.addEventListener('click', () => {
    DOM.configModal.classList.add('open');
  });

  DOM.btnCloseConfig.addEventListener('click', () => {
    DOM.configModal.classList.remove('open');
  });

  DOM.configModal.addEventListener('click', (e) => {
    if (e.target === DOM.configModal) {
      DOM.configModal.classList.remove('open');
    }
  });

  // Config Form Submit
  DOM.configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pubKey = DOM.inputPublicKey.value.trim();
    const privKey = DOM.inputPrivateKey.value.trim();
    const asstId = DOM.inputAssistantId.value.trim();

    DOM.configFeedback.className = 'config-feedback';
    DOM.configFeedback.textContent = 'Saving configuration...';
    DOM.configFeedback.style.display = 'block';

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vapi_public_key: pubKey,
          vapi_private_key: privKey,
          assistant_id: asstId
        })
      });
      const data = await res.json();
      if (data.success) {
        STATE.config.publicKey = pubKey;
        STATE.config.assistantId = asstId;
        initVapiInstance();
        DOM.configFeedback.className = 'config-feedback success';
        DOM.configFeedback.textContent = '✓ Credentials saved successfully! You can now start voice calls.';
        setTimeout(() => DOM.configModal.classList.remove('open'), 1200);
      }
    } catch (err) {
      DOM.configFeedback.className = 'config-feedback error';
      DOM.configFeedback.textContent = `Error saving credentials: ${err.message}`;
    }
  });

  // Auto Setup Assistant via Server
  DOM.btnAutoSetupAssistant.addEventListener('click', async () => {
    const privKey = DOM.inputPrivateKey.value.trim();
    if (!privKey) {
      alert('Please enter your Vapi Private API Key first so the server can authenticate with Vapi to create IRIS.');
      return;
    }

    DOM.configFeedback.className = 'config-feedback';
    DOM.configFeedback.textContent = 'Connecting to Vapi API to deploy IRIS assistant & tools...';
    DOM.configFeedback.style.display = 'block';

    try {
      // First save keys
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vapi_public_key: DOM.inputPublicKey.value.trim(),
          vapi_private_key: privKey
        })
      });

      const res = await fetch('/api/setup-assistant', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        STATE.config.assistantId = data.assistant_id;
        DOM.inputAssistantId.value = data.assistant_id;
        DOM.configFeedback.className = 'config-feedback success';
        DOM.configFeedback.textContent = `✓ Assistant successfully ${data.action}! ID: ${data.assistant_id}`;
        initVapiInstance();
      } else {
        DOM.configFeedback.className = 'config-feedback error';
        DOM.configFeedback.textContent = `Setup failed: ${data.detail || 'Check private key.'}`;
      }
    } catch (err) {
      DOM.configFeedback.className = 'config-feedback error';
      DOM.configFeedback.textContent = `Request failed: ${err.message}`;
    }
  });

  // Theme Switcher Buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      document.body.className = theme;
      localStorage.setItem('chronos-theme', theme);
    });
  });

  // Restore Theme
  const savedTheme = localStorage.getItem('chronos-theme');
  if (savedTheme) {
    document.body.className = savedTheme;
    const activeBtn = document.querySelector(`[data-theme="${savedTheme}"]`);
    if (activeBtn) {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      activeBtn.classList.add('active');
    }
  }
}

function switchTab(targetId) {
  DOM.navTabs.forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-tab') === targetId);
  });
  DOM.tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === targetId);
  });
}

// Bootstrap on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  initOscilloscope();
  attachEvents();
  loadConfig();
  loadDatabaseStatus();
});
