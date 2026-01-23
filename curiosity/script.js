// State Management
const state = {
    apiKey: localStorage.getItem('sf_api_key') || '',
    apiBase: localStorage.getItem('sf_api_base') || 'https://api.siliconflow.cn/v1',
    chatModel: localStorage.getItem('curiosity_model') || 'deepseek-ai/DeepSeek-V3.2',
    imageModel: 'Kwai-Kolors/Kolors',
    autoTTS: localStorage.getItem('curiosity_auto_tts') !== 'false',
    
    // TTS State
    useAITTS: localStorage.getItem('curiosity_use_ai_tts') === 'true', 
    ttsModel: localStorage.getItem('curiosity_tts_model') || 'FunAudioLLM/CosyVoice2-0.5B',
    ttsVoice: localStorage.getItem('curiosity_tts_voice') || 'FunAudioLLM/CosyVoice2-0.5B:bella',
    
    // Load persisted messages
    messages: JSON.parse(localStorage.getItem('curiosity_history') || '[]')
};

// DOM Elements
const els = {
    chatContainer: document.getElementById('chat-container'),
    textInput: document.getElementById('text-input'),
    sendBtn: document.getElementById('send-btn'),
    voiceBtn: document.getElementById('voice-btn'),
    micIcon: document.getElementById('mic-icon'),
    stopIcon: document.getElementById('stop-icon'),
    statusText: document.getElementById('status-text'),
    settingsBtn: document.getElementById('settings-btn'),
    clearChatBtn: document.getElementById('clear-chat-btn'), // New
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    saveSettings: document.getElementById('save-settings'),
    apiKeyInput: document.getElementById('api-key'),
    modelSelect: document.getElementById('model-select'),
    autoTTSCheckbox: document.getElementById('auto-tts'),
    
    // TTS Elements
    useAITTSCheckbox: document.getElementById('use-ai-tts'),
    ttsSettingsDiv: document.getElementById('ai-tts-settings'),
    ttsModelInput: document.getElementById('tts-model-input'),
    ttsVoiceSelect: document.getElementById('tts-voice-select'),
    ttsModeLabel: document.getElementById('tts-mode-label'),

    imageModal: document.getElementById('image-modal'),
    imagePreview: document.getElementById('image-preview')
};

// Speech Recognition Setup
let recognition = null;
let isRecording = false;
let synthesis = window.speechSynthesis;
let currentAudio = null;

// --- Initialization ---
function init() {
    els.apiKeyInput.value = state.apiKey;
    els.modelSelect.value = state.chatModel;
    els.autoTTSCheckbox.checked = state.autoTTS;
    
    els.useAITTSCheckbox.checked = state.useAITTS;
    els.ttsModelInput.value = state.ttsModel;
    els.ttsVoiceSelect.value = state.ttsVoice;
    toggleTTSUI(state.useAITTS);

    // Initial check for API Key
    if (!state.apiKey) {
        const legacyKey = localStorage.getItem('sf_api_key');
        if (legacyKey) {
            state.apiKey = legacyKey;
            els.apiKeyInput.value = legacyKey;
        } else {
            setTimeout(() => {
                // Only show modal if no key, don't nag if history exists
                if(state.messages.length === 0) {
                     els.settingsModal.classList.remove('hidden');
                }
            }, 1000);
        }
    }
    
    // Render History
    renderHistory();
    
    setupEventListeners();
}

function renderHistory() {
    els.chatContainer.innerHTML = '';
    
    // Welcome Message (Always at top)
    const welcomeHtml = `
    <div class="flex flex-col gap-2 items-start animate-fade-in">
        <div class="flex items-end gap-2">
            <div class="w-8 h-8 rounded-full bg-primary flex justify-center items-center text-lg flex-shrink-0 border border-white overflow-hidden shadow-sm">
                <img src="capybara.jpg" alt="Capybara" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentNode.innerText='🦦';">
            </div>
            <div class="bg-bubble-ai p-4 rounded-2xl rounded-bl-none shadow-sm max-w-[85%] text-gray-700 text-lg leading-relaxed relative border border-orange-50">
                你好呀！我是 <strong>Capybara (卡皮巴拉)</strong> 🦦<br>
                我就像水豚一样情绪稳定，而且什么都知道哦！你可以问我任何问题，或者让我给你画画~ 🍊
            </div>
        </div>
    </div>`;
    els.chatContainer.innerHTML = welcomeHtml;

    // Persisted Messages
    state.messages.forEach(msg => {
        appendMessage(msg.role, msg.text, false); // false = no animation for history
    });
    
    scrollToBottom();
}

// --- Event Listeners ---
function setupEventListeners() {
    els.sendBtn.addEventListener('click', () => handleUserMessage());
    els.textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    els.voiceBtn.addEventListener('click', toggleRecording);

    els.settingsBtn.addEventListener('click', () => els.settingsModal.classList.remove('hidden'));
    els.closeSettings.addEventListener('click', () => els.settingsModal.classList.add('hidden'));
    els.saveSettings.addEventListener('click', saveSettings);
    
    // Export History
    document.getElementById('export-history-btn').addEventListener('click', () => {
        const historyText = state.messages.map(m => {
            const role = m.role === 'user' ? '我' : 'Capybara';
            return `${role}: ${m.text}\n-------------------`;
        }).join('\n');
        
        // Simple way: Create a temporary textarea and copy, or just show in prompt
        // Let's creating a simple modal overlay dynamically or just use a prompt/alert for V1 simplicity?
        // Actually, prompt is bad for long text. Let's make a simple new window/tab.
        const win = window.open("", "History", "width=600,height=600");
        win.document.write(`<pre style="font-family: sans-serif; white-space: pre-wrap; word-wrap: break-word; padding: 20px;">${historyText || '暂无聊天记录'}</pre>`);
        win.document.title = "聊天记录备份";
    });

    els.useAITTSCheckbox.addEventListener('change', (e) => toggleTTSUI(e.target.checked));
    
    els.ttsModelInput.addEventListener('change', (e) => {
        const model = e.target.value;
        if (model.includes('CosyVoice')) {
            const voiceSelect = els.ttsVoiceSelect;
            voiceSelect.innerHTML = '';
             const voices = [
                 {v: `${model}:bella`, n: 'Bella (女-推荐)'},
                 {v: `${model}:anna`, n: 'Anna (女)'},
             ];
             voices.forEach(opt => voiceSelect.add(new Option(opt.n, opt.v)));
        }
    });

    // Clear History Button
    els.clearChatBtn.addEventListener('click', () => {
        if(confirm("确定要清空所有聊天记录吗？")) {
            state.messages = [];
            localStorage.removeItem('curiosity_history');
            renderHistory();
        }
    });

    els.imageModal.addEventListener('click', () => els.imageModal.classList.add('hidden'));
}

function toggleTTSUI(useAI) {
    if (useAI) {
        els.ttsSettingsDiv.classList.remove('opacity-50', 'pointer-events-none');
        els.ttsModeLabel.textContent = "AI 语音 (高级)";
        els.ttsModeLabel.className = "text-xs text-primary font-bold";
    } else {
        els.ttsSettingsDiv.classList.add('opacity-50', 'pointer-events-none');
        els.ttsModeLabel.textContent = "本地语音 (默认)";
        els.ttsModeLabel.className = "text-xs text-green-600 font-bold";
    }
}

// --- Logic: Settings ---
function saveSettings() {
    const key = els.apiKeyInput.value.trim();
    if (!key) return alert("API Key 不能为空");
    
    state.apiKey = key;
    state.chatModel = els.modelSelect.value;
    state.autoTTS = els.autoTTSCheckbox.checked;
    
    state.useAITTS = els.useAITTSCheckbox.checked;
    state.ttsModel = els.ttsModelInput.value.trim();
    state.ttsVoice = els.ttsVoiceSelect.value;

    localStorage.setItem('sf_api_key', state.apiKey);
    localStorage.setItem('curiosity_model', state.chatModel);
    localStorage.setItem('curiosity_auto_tts', state.autoTTS);
    localStorage.setItem('curiosity_use_ai_tts', state.useAITTS);
    localStorage.setItem('curiosity_tts_model', state.ttsModel);
    localStorage.setItem('curiosity_tts_voice', state.ttsVoice);

    els.settingsModal.classList.add('hidden');
    alert("设置保存成功！");
}

// --- Logic: Recording ---
function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return alert("您的浏览器不支持语音识别，请使用 Chrome。");
    }
    
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isRecording = true;
        els.micIcon.classList.add('hidden');
        els.stopIcon.classList.remove('hidden');
        els.voiceBtn.classList.add('bg-red-500');
        els.voiceBtn.classList.remove('bg-primary');
        els.statusText.textContent = "正在听你说...";
        els.textInput.placeholder = "正在听...";
    };

    recognition.onend = () => {
        isRecording = false;
        resetMicUI();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        els.textInput.value = transcript;
        if (event.results[0].isFinal) {
             els.statusText.textContent = "听到啦！正在思考...";
             setTimeout(() => handleUserMessage(), 500);
        }
    };

    recognition.onerror = (e) => {
        console.error(e);
        resetMicUI();
        els.statusText.textContent = "没听清，请再试一次~";
    };

    recognition.start();
}

function stopRecording() {
    if (recognition) recognition.stop();
}

function resetMicUI() {
    isRecording = false;
    els.micIcon.classList.remove('hidden');
    els.stopIcon.classList.add('hidden');
    els.voiceBtn.classList.remove('bg-red-500');
    els.voiceBtn.classList.add('bg-primary');
    els.textInput.placeholder = "和 Capybara 聊天...";
    els.statusText.textContent = "点击话筒开始说话...";
}

// --- Logic: Chat ---
async function handleUserMessage() {
    const text = els.textInput.value.trim();
    if (!text) return;

    if (!state.apiKey) {
        els.settingsModal.classList.remove('hidden');
        return alert("请先设置 API Key");
    }

    // Add & Save User Message
    appendMessage('user', text);
    state.messages.push({ role: 'user', text });
    localStorage.setItem('curiosity_history', JSON.stringify(state.messages));
    
    els.textInput.value = '';
    const loadingId = appendLoading();
    
    // System Prompt for "Capybara" (Smart & Educational Ver.)
    const systemPrompt = `你是一只名叫 "Capybara (卡皮巴拉)" 的水豚 🦦。
    你的特点是：情绪超级稳定、性格温和、**博学多才**、说话慢条斯理但非常有逻辑。
    你的对话对象是3-8岁的小朋友。
    
    请遵守以下核心原则：
    1. **语气**：温柔、耐心、多用 Emoji 🦦🌿🍊。自称“我”或“卡皮巴拉”。
    2. **日常聊天**：保持简短有趣（100字以内），多打比方。
    
    3. **遇到知识问答（数学、古诗、科学）时，请切换到“金牌辅导员”模式**：
       - **数学题**：不要直接甩数字！要用生活中的例子（比如分糖果、排队）一步步引导计算过程。
       - **古诗词**：先解释字面意思，再描绘一幅画面（讲故事），最后解释诗人想表达的感情。
       - **长度**：解释知识时**不限制字数**，要讲清楚为止。
       - **排版**：必须使用 Markdown！重点词用**粗体**，步骤用列表，公式用代码块。
    
    4. **画画指令**：如果被要求画画，只回答：“好的，点击下面的【🎨 画给我看】按钮，我这就为你画一张。”
    `;
    
    // Construct context window (Last 10 messages + System)
    const contextMessages = state.messages.slice(-10).map(m => ({ role: m.role, content: m.text }));
    
    const messages = [
        { role: 'system', content: systemPrompt },
        ...contextMessages
    ];

    try {
        const response = await fetch(`${state.apiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify({
                model: state.chatModel,
                messages: messages,
                stream: false
            })
        });

        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        const reply = data.choices[0].message.content;

        removeLoading(loadingId);
        
        // Add & Save AI Message
        appendMessage('assistant', reply);
        state.messages.push({ role: 'assistant', text: reply });
        localStorage.setItem('curiosity_history', JSON.stringify(state.messages));

        if (state.autoTTS) speak(reply);

    } catch (error) {
        removeLoading(loadingId);
        appendMessage('system', '网络开小差啦，请检查 Key 或网络哦~');
        console.error(error);
    }
}

// --- UI Helpers ---
function appendMessage(role, text, animate = true) {
    const div = document.createElement('div');
    const animClass = animate ? 'opacity-0 animate-fade-in' : '';
    div.className = `flex flex-col gap-2 items-${role === 'user' ? 'end' : 'start'} ${animClass}`;
    
    let avatar = '';
    let bubbleClass = '';
    
    if (role === 'user') {
        avatar = `<div class="w-8 h-8 rounded-full bg-secondary flex justify-center items-center text-sm text-white flex-shrink-0 overflow-hidden border border-white shadow-sm">
            <img src="avatar.jpg" alt="👶" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentNode.innerHTML='👶';">
        </div>`;
        bubbleClass = 'bg-primary text-white rounded-br-none';
    } else if (role === 'assistant') {
        avatar = `<div class="w-8 h-8 rounded-full bg-primary flex justify-center items-center text-lg flex-shrink-0 border border-white overflow-hidden shadow-sm">
            <img src="capybara.jpg" alt="Capybara" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentNode.innerText='🦦';">
        </div>`;
        bubbleClass = 'bg-white text-gray-700 rounded-bl-none border border-orange-50';
    } else {
        // System
        div.className = 'flex justify-center my-2 opacity-0 animate-fade-in';
        div.innerHTML = `<span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">${text}</span>`;
        els.chatContainer.appendChild(div);
        scrollToBottom();
        return;
    }

    // Enhanced Markdown Rendering with Highlight.js
    const htmlContent = marked.parse(text);

    let extraActions = '';
    if (role === 'assistant') {
        const safeText = text.replace(/'/g, "\' ").replace(/"/g, '&quot;').replace(/\n/g, ' ');
        
        extraActions = `
        <div class="flex gap-2 mt-1 ml-1">
            <button onclick="speak('${safeText}')" class="text-gray-400 hover:text-primary transition-colors flex items-center gap-1" title="朗读">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            </button>
            <button onclick="generateImage('${safeText.substring(0, 60)}')" class="flex items-center gap-1 text-xs text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full transition-colors shadow-sm" title="画一张图">
                <span>🎨 画给我看</span>
            </button>
        </div>
        `;
    }

    div.innerHTML = `
        <div class="flex items-end gap-2 max-w-full">
            ${role === 'assistant' ? avatar : ''}
            <div class="${bubbleClass} p-3 rounded-2xl shadow-sm max-w-[85%] text-lg leading-relaxed prose">
                ${htmlContent}
            </div>
            ${role === 'user' ? avatar : ''}
        </div>
        ${extraActions}
    `;

    els.chatContainer.appendChild(div);
    
    // Highlight Code Blocks
    div.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    scrollToBottom();
}

function appendLoading() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = `flex flex-col gap-2 items-start opacity-0 animate-fade-in`;
    div.innerHTML = `
        <div class="flex items-end gap-2">
            <div class="w-8 h-8 rounded-full bg-primary flex justify-center items-center text-lg flex-shrink-0 border border-white overflow-hidden shadow-sm">
                <img src="capybara.jpg" alt="Capybara" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentNode.innerText='🦦';">
            </div>
            <div class="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm text-gray-400">
                <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
            </div>
        </div>
    `;
    els.chatContainer.appendChild(div);
    scrollToBottom();
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    els.chatContainer.scrollTo({
        top: els.chatContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// --- Logic: TTS ---
function stopSpeaking() {
    if (synthesis.speaking) synthesis.cancel();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

async function speak(text) {
    stopSpeaking();

    if (state.useAITTS) {
        try {
            const cleanText = text.replace(/[*#`]/g, '').substring(0, 200); 

            const response = await fetch(`${state.apiBase}/audio/speech`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                },
                body: JSON.stringify({
                    model: state.ttsModel,
                    input: cleanText,
                    voice: state.ttsVoice
                })
            });

            if (!response.ok) throw new Error("TTS API Error");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            currentAudio = new Audio(url);
            currentAudio.play();
            currentAudio.onended = () => URL.revokeObjectURL(url);
            return; 

        } catch (e) {
            console.warn("AI TTS Failed, falling back to local.");
        }
    }

    // Local Fallback
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`]/g, ''));
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    
    // Attempt to select a Chinese voice
    const voices = synthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh'));
    if (zhVoice) utterance.voice = zhVoice;

    synthesis.speak(utterance);
}

// --- Logic: Image Generation ---
window.generateImage = async function(contextText) {
    if (!state.apiKey) return alert("请先设置 API Key");
    
    const imgId = 'gen-img-' + Date.now();
    const div = document.createElement('div');
    div.className = "flex justify-center my-2 pl-10 animate-fade-in";
    div.innerHTML = `
        <div id="${imgId}" class="w-64 h-64 bg-gray-100 rounded-xl flex flex-col justify-center items-center border-2 border-dashed border-gray-300 text-gray-400">
            <svg class="animate-spin h-8 w-8 mb-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm">Capybara 正在作画...</span>
        </div>
    `;
    els.chatContainer.appendChild(div);
    scrollToBottom();

    try {
        // Kolors prompt
        let imagePrompt = `${contextText}，儿童插画风格，温暖治愈，水彩质感，卡皮巴拉元素，高质量，杰作，8k`;
        console.log("Generating image with:", state.imageModel, "Prompt:", imagePrompt);

        const imgResponse = await fetch(`${state.apiBase}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify({
                model: state.imageModel,
                prompt: imagePrompt,
                image_size: "1024x1024",
                batch_size: 1
            })
        });

        if (!imgResponse.ok) throw new Error("Image API Failed");
        const imgData = await imgResponse.json();
        const imgUrl = imgData.data[0].url;

        const container = document.getElementById(imgId);
        container.innerHTML = `<img src="${imgUrl}" class="w-full h-full object-cover rounded-xl shadow-md cursor-pointer hover:scale-105 transition-transform" onclick="viewImage(this.src)">`;
        container.classList.remove('border-dashed', 'bg-gray-100', 'flex-col');
        container.classList.add('overflow-hidden');

    } catch (e) {
        console.error(e);
        const container = document.getElementById(imgId);
        container.innerHTML = `<p class="text-red-400 text-xs p-2 text-center">作画失败: ${e.message}</p>`;
    }
}

window.viewImage = function(src) {
    els.imagePreview.src = src;
    els.imageModal.classList.remove('hidden');
}

// Start
init();
