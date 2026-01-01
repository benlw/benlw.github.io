// State management
const state = {
    apiKey: localStorage.getItem('sf_api_key') || '',
    apiBase: localStorage.getItem('sf_api_base') || 'https://api.siliconflow.cn/v1',
    modelId: localStorage.getItem('sf_model_id') || 'Qwen/Qwen2.5-7B-Instruct',
    writers: [] // Store HanziWriter instances
};

// DOM Elements
const elements = {
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings'),
    saveSettingsBtn: document.getElementById('save-settings'),
    apiKeyInput: document.getElementById('api-key'),
    apiBaseInput: document.getElementById('api-base'),
    modelIdInput: document.getElementById('model-id'),
    
    userInput: document.getElementById('user-input'),
    voiceBtn: document.getElementById('voice-btn'),
    searchBtn: document.getElementById('search-btn'),
    
    // New Overlay Elements
    listeningOverlay: document.getElementById('listening-overlay'),
    cancelVoiceBtn: document.getElementById('cancel-voice'),
    
    resultContainer: document.getElementById('result-container'),
    cardsGrid: document.getElementById('cards-grid'),
    aiContent: document.getElementById('ai-content'),
    statusMsg: document.getElementById('status-msg')
};

// --- Initialization ---
function init() {
    console.log("App Initializing...");
    // Restore settings
    elements.apiKeyInput.value = state.apiKey;
    elements.apiBaseInput.value = state.apiBase;
    elements.modelIdInput.value = state.modelId;

    // Check if API key is missing
    if (!state.apiKey) {
        setStatus('请先点击右上角设置 API Key', 'text-red-500');
        toggleModal(true);
    }

    setupEventListeners();
}

// --- Event Listeners ---
function setupEventListeners() {
    // Settings Modal
    elements.settingsBtn.addEventListener('click', () => toggleModal(true));
    elements.closeSettingsBtn.addEventListener('click', () => toggleModal(false));
    elements.saveSettingsBtn.addEventListener('click', saveSettings);

    // Search
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Voice
    elements.voiceBtn.addEventListener('click', startVoiceRecognition);
    
    // Cancel Voice
    elements.cancelVoiceBtn.addEventListener('click', stopVoiceRecognition);
}

// Global recognition instance to allow stopping
let recognition = null;

// --- Settings Logic ---
function toggleModal(show) {
    elements.settingsModal.classList.toggle('hidden', !show);
}

function saveSettings() {
    const key = elements.apiKeyInput.value.trim();
    // Remove trailing slash if user added it
    let base = elements.apiBaseInput.value.trim().replace(/\/+$/, '');
    const model = elements.modelIdInput.value.trim();

    if (!key) {
        alert('请输入 API Key');
        return;
    }

    localStorage.setItem('sf_api_key', key);
    localStorage.setItem('sf_api_base', base);
    localStorage.setItem('sf_model_id', model);

    state.apiKey = key;
    state.apiBase = base;
    state.modelId = model;

    console.log("Settings saved:", { base, model }); // Don't log key
    toggleModal(false);
    setStatus('设置已保存', 'text-green-500');
}

// --- Voice Recognition ---
function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('您的浏览器不支持语音识别，请使用 Chrome 或 Edge。');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        // Show Overlay
        elements.listeningOverlay.classList.remove('hidden');
        setStatus('正在听...', 'text-primary');
    };

    recognition.onend = () => {
        // Hide Overlay logic handled in result/error/stop
        // If it ends naturally without result, we might want to hide it
        // But usually we hide it on result or error.
        // Let's safe guard:
        if (!elements.listeningOverlay.classList.contains('hidden')) {
             stopVoiceRecognition(); 
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        elements.userInput.value = transcript;
        setStatus(`识别结果: ${transcript}`, 'text-gray-500');
        
        // Hide overlay immediately
        elements.listeningOverlay.classList.add('hidden');
        
        // Auto-search!
        setTimeout(() => handleSearch(), 500);
    };

    recognition.onerror = (event) => {
        console.error("Voice Error:", event.error);
        setStatus('语音识别错误: ' + event.error, 'text-red-500');
        stopVoiceRecognition();
        
        // If error is 'no-speech', user might want to try again, but let's just close
        if (event.error === 'no-speech') {
            alert("没听到声音，请再试一次~");
        }
    };

    recognition.start();
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
        recognition = null;
    }
    elements.listeningOverlay.classList.add('hidden');
    setStatus('', '');
}

// --- Main Logic: Search & AI ---
async function handleSearch() {
    console.log("Search button clicked");
    const text = elements.userInput.value.trim();
    
    if (!text) {
        setStatus('请输入汉字或词语', 'text-red-500');
        alert('请先输入想学习的汉字或词语');
        return;
    }

    if (!state.apiKey) {
        console.log("No API Key found");
        setStatus('请先设置 API Key', 'text-red-500');
        toggleModal(true);
        return;
    }

    setLoading(true);
    elements.resultContainer.classList.add('hidden');
    elements.cardsGrid.innerHTML = '';
    elements.aiContent.innerHTML = '';
    state.writers = []; // Clear previous writers

    try {
        console.log("Fetching AI analysis for:", text);
        const aiData = await fetchAIAnalysis(text);
        console.log("AI Response received:", aiData);
        renderResults(aiData);
        setLoading(false);
        elements.resultContainer.classList.remove('hidden');
        setStatus('学习完成！', 'text-green-500');
    } catch (error) {
        console.error("Search Logic Error:", error);
        setStatus('出错啦: ' + error.message, 'text-red-500');
        alert('出错啦: ' + error.message + '\n请检查 API Key 是否正确，或者按 F12 查看控制台日志。');
        setLoading(false);
    }
}

async function fetchAIAnalysis(text) {
    const prompt = `
    你是一个专业的中文教学助手，专门教小朋友写汉字。
    分析文本: "${text}"
    请返回且仅返回一个纯 JSON 对象，不要包含任何 markdown 标记。
    **重要要求**：
    1. "characters" 数组必须包含输入文本中的**每一个**中文字符。例如输入"草莓"，数组里必须有两个对象，分别是"草"和"莓"。不要遗漏任何字。
    
    格式如下：
    {
        "corrected_text": "纠正后的文本（如果输入有明显同音错误），否则原样返回",
        "definition": "用简单易懂的话给小朋友解释这个词的意思",
        "sentence": "一个简单的造句，包含这个词",
        "characters": [
            {
                "char": "单字"
            }
        ]
    }
    `;

    const url = `${state.apiBase}/chat/completions`;
    console.log("Sending request to:", url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify({
                model: state.modelId,
                messages: [
                    { role: "system", content: "You are a helpful assistant for teaching Chinese characters to children. Always respond in valid JSON." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("API Error Response:", errText);
            throw new Error(`API 请求失败 (${response.status}): ${errText}`);
        }

        const data = await response.json();
        console.log("Raw API Response:", data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
             throw new Error("API 返回的数据格式异常");
        }

        let content = data.choices[0].message.content;
        
        // Clean up potential markdown code blocks
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error("JSON Parse Error. Content was:", content);
            throw new Error("AI 返回的内容不是有效的 JSON 格式");
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        throw err;
    }
}

// --- Rendering ---
function renderResults(data) {
    const { pinyin } = pinyinPro;
    
    // Generate accurate pinyin for the whole corrected text using pinyin-pro
    // This handles polyphones correctly based on context
    const fullText = data.corrected_text || elements.userInput.value.trim();
    const pinyinArray = pinyin(fullText, { 
        type: 'array', 
        toneType: 'symbol',
        nonZh: 'removed' 
    });
    const fullPinyinString = pinyin(fullText, { toneType: 'symbol' });

    // 1. Render Explanation
    elements.aiContent.innerHTML = `
        <p><strong class="text-primary text-lg">${fullText}</strong> <span class="text-gray-500">(${fullPinyinString})</span></p>
        <p class="mt-2"><strong>📖 意思:</strong> ${data.definition}</p>
        <p class="mt-1"><strong>🗣️ 造句:</strong> ${data.sentence}</p>
    `;

    // 2. Render Character Cards
    // Ensure order matches the INPUT text, not just AI's return order (though they should match)
    // Filter to only Chinese characters from original input to maintain order
    const charsToRender = fullText.split('').filter(c => /[一-龥]/.test(c));

    charsToRender.forEach((charChar, index) => {
        // Get pinyin from our locally generated array
        // Note: pinyinArray length should match charsToRender length if nonZh was removed
        const charPinyin = pinyinArray[index] || '';
        
        const card = document.createElement('div');
        // Compact padding for mobile (p-1), normal for desktop (md:p-4)
        // Flex sizing: w-[calc(50%-0.375rem)] ensures 2 items fit perfectly with gap-1.5.
        card.className = 'bg-white rounded-xl shadow p-1 md:p-4 flex flex-col items-center gap-1 md:gap-2 w-[calc(50%-0.375rem)] md:w-auto';
        
        const charId = `hanzi-${index}`;
        
        // Use locally generated pinyin
        card.innerHTML = `
            <div class="text-xl md:text-2xl text-gray-600 font-sans mt-1">${charPinyin}</div>
            <div id="${charId}" class="hanzi-container w-full"></div>
            <button id="btn-${charId}" class="animate-btn my-1 px-3 py-1 bg-gray-300 text-white rounded-full text-xs md:text-sm transition-colors cursor-not-allowed" disabled>
                加载中...
            </button>
        `;

        elements.cardsGrid.appendChild(card);

        // Initialize HanziWriter
        setTimeout(() => {
            if (typeof HanziWriter === 'undefined') {
                console.error("HanziWriter not loaded");
                document.getElementById(charId).innerHTML = '<p class="text-red-500">汉字库加载失败</p>';
                return;
            }

            // Ensure we are only passing a single character
            const characterToLoad = charChar;
            console.log(`Initializing HanziWriter for: '${characterToLoad}'`);

            // Calculate size based on container, but default to 200 if hidden/zero
            const container = document.getElementById(charId);
            if (!container) return; // Safety check
            
            // Get precise width. Accessing getBoundingClientRect might be more accurate for sub-pixel rendering
            const rect = container.getBoundingClientRect();
            const initialSize = rect.width || container.clientWidth || 200;

            const writer = HanziWriter.create(charId, characterToLoad, {
                width: initialSize,
                height: initialSize,
                padding: 5, // Reduced padding to make character larger
                strokeColor: '#333',
                radicalColor: '#3B82F6', // Academic Blue
                showOutline: true,
                outlineColor: '#ddd',
                // Custom loader with Fallback
                charDataLoader: function(char, onComplete) {
                    const loadFromSource = (baseUrl) => {
                        const url = `${baseUrl}${encodeURIComponent(char)}.json`;
                        console.log(`Trying to load data from: ${url}`);
                        return fetch(url)
                            .then(res => {
                                if (!res.ok) throw new Error(`Status ${res.status}`);
                                return res.json();
                            });
                    };

                    // Try jsdelivr first
                    loadFromSource('https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/')
                        .then(onComplete)
                        .catch(err1 => {
                            console.warn(`JsDelivr failed for ${char}, trying unpkg...`, err1);
                            // Try unpkg as fallback
                            loadFromSource('https://unpkg.com/hanzi-writer-data@2.0/')
                                .then(onComplete)
                                .catch(err2 => {
                                    console.error(`All sources failed for ${char}`, err2);
                                    document.getElementById(charId).innerHTML = `<p class="text-red-400 text-xs">加载失败</p>`;
                                });
                        });
                }
            });

            state.writers.push({ writer, id: charId });
            
            // Start observing for resize
            resizeObserver.observe(container);

            const btn = document.getElementById(`btn-${charId}`);
            
            // Enable button immediately
            btn.disabled = false;
            btn.classList.remove('bg-gray-300', 'cursor-not-allowed');
            btn.classList.add('bg-secondary', 'hover:bg-blue-600');
            btn.textContent = '写给我看';

            const animate = () => {
                btn.disabled = true;
                writer.animateCharacter({
                    onComplete: () => {
                        btn.disabled = false;
                    }
                });
            };

            btn.onclick = animate;
            document.getElementById(charId).onclick = animate;
            
        }, 50);
    });
}

// --- Window Resize Handling ---
// Use ResizeObserver for more accurate element-level resizing
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const container = entry.target;
        // Find the writer associated with this container
        const writerItem = state.writers.find(item => item.id === container.id);
        
        if (writerItem && writerItem.writer) {
            const newSize = entry.contentRect.width;
            if (newSize > 0) {
                // Determine if we need to resize. Rounding to avoid jitter.
                // Accessing internal width isn't direct, but we can just call resize.
                // It's cheap enough.
                writerItem.writer.resize(newSize, newSize);
            }
        }
    }
});

// We need to observe containers as they are created. 
// So we'll move the observe call into the render loop.

// --- Helpers ---
function setStatus(msg, classes) {
    elements.statusMsg.textContent = msg;
    elements.statusMsg.className = `text-center text-sm h-5 ${classes}`;
}

function setLoading(isLoading) {
    if (isLoading) {
        elements.searchBtn.disabled = true;
        elements.searchBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            思考中...
        `;
    } else {
        elements.searchBtn.disabled = false;
        elements.searchBtn.innerHTML = '开始学习 / Learn';
    }
}

// Start
init();