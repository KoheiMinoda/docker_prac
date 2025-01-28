let recognition;
let isRecording = false;

function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isRecording = true;
            document.getElementById('voice-btn').classList.add('recording');
            updateVoiceStatus('Recording now...');
        };

        recognition.onend = function() {
            isRecording = false;
            document.getElementById('voice-btn').classList.remove('recording');
            updateVoiceStatus('');
        };

        recognition.onresult = function(event) {
            const result = event.results[0][0].transcript;
            document.getElementById('user-input').value = result;
            updateVoiceStatus('result: ' + result);
        };

        recognition.onerror = function(event) {
            console.error('record error:', event.error);
            updateVoiceStatus('error: ' + event.error);
            document.getElementById('voice-btn').classList.remove('recording');
        };
    } else {
        alert('your browser cannot use this function');
    }
}

function toggleRecording() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

function updateVoiceStatus(message) {
    document.getElementById('voice-status').textContent = message;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value;
    if (!message) return;

    appendMessage('user', message);
    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        appendMessage('ai', data.response);
    } catch (error) {
        console.error('Error:', error);
        appendMessage('ai', 'Sorry, an error occurred.');
    }
}

function appendMessage(sender, message) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
    
    document.getElementById('voice-btn').addEventListener('click', toggleRecording);
    
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

let speechSynthesis = window.speechSynthesis;
let voices = [];
let autoSpeak = false;

function initSpeechSynthesis() {
    function loadVoices() {
        voices = speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voice-select');
        voiceSelect.innerHTML = '';
        
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        
        englishVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

function speakText(text) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[document.getElementById('voice-select').value];
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    speechSynthesis.speak(utterance);
}

function appendMessage(sender, message) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageText = document.createElement('span');
    messageText.textContent = message;
    messageDiv.appendChild(messageText);
    
    if (sender === 'ai') {
        const speakButton = document.createElement('button');
        speakButton.className = 'speak-button';
        speakButton.innerHTML = '🔊';
        speakButton.onclick = () => speakText(message);
        messageDiv.appendChild(speakButton);
        
        if (autoSpeak) {
            speakText(message);
        }
    }
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function toggleAutoSpeak() {
    const toggleButton = document.getElementById('toggle-speech');
    autoSpeak = !autoSpeak;
    toggleButton.classList.toggle('active');
    toggleButton.textContent = autoSpeak ? '🔊' : '🔇';
}

document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
    initSpeechSynthesis();
    
    document.getElementById('voice-btn').addEventListener('click', toggleRecording);
    
    document.getElementById('toggle-speech').addEventListener('click', toggleAutoSpeak);
    
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

window.addEventListener('beforeunload', function() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
});

function appendMessage(sender, message) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageText = document.createElement('span');
    messageText.textContent = message;
    messageDiv.appendChild(messageText);
    
    const speakButton = document.createElement('button');
    speakButton.className = 'speak-button';
    speakButton.innerHTML = '🔊';
    speakButton.onclick = () => speakText(message);
    messageDiv.appendChild(speakButton);
    
    if (autoSpeak) {
        if (sender === 'ai') {
            speakText(message);
        }
    }
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value;
    if (!message) return;

    appendMessage('user', message);
    if (autoSpeak) {
        speakText(message);
    }
    
    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        appendMessage('ai', data.response);
    } catch (error) {
        console.error('Error:', error);
        appendMessage('ai', 'Sorry, an error occurred.');
    }
}
