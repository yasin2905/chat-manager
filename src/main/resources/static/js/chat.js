

let stompClient = null;
let currentUser = null;
let selectedUser = null;

function connect(username) {
    currentUser = username;
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    const headers = {
        'username': username,
        'token' : 'jdjifdsjfiodsf8908932840832jrkdl;jf9i329ikfd;sl'
    };

    stompClient.connect(headers, (frame) => {
        // Subscribe to private messages
        stompClient.subscribe(`/user/queue/private`, (message) => {
            const msg = JSON.parse(message.body);
            displayMessage(msg, msg.sender === currentUser);
        });

        // Update UI
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('chatSection').style.display = 'flex';
    });
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const fileInput = document.getElementById('fileInput');

    if (!selectedUser) {
        alert('Please select a contact first!');
        return;
    }

    if (fileInput.files[0]) {
        handleFileUpload(fileInput.files[0]);
    } else if (messageInput.value.trim()) {
        const message = {
            type: 'TEXT',
            content: messageInput.value.trim(),
            receiver: selectedUser,
            timestamp: new Date().toISOString()
        };

        stompClient.send("/app/chat.private", {}, JSON.stringify(message));
        messageInput.value = '';
    }
}

// Rest of the code remains same as previous version
async function handleFileUpload(file) {
    if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit');
        return;
    }

    // Show preview
    const preview = document.getElementById('preview');
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="relative">
                    <img src="${e.target.result}" 
                         class="max-h-32 rounded-lg shadow-md">
                    <button onclick="clearPreview()" 
                            class="absolute top-0 right-0 p-1 bg-gray-800 text-white rounded-full">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = `
            <div class="p-2 bg-gray-100 rounded-lg flex items-center justify-between">
                <span>${file.name}</span>
                <button onclick="clearPreview()" 
                        class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
        const filename = await response.text();

        const message = {
            type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
            content: filename,
            sender: currentUser,
            receiver: selectedUser,
            timestamp: new Date().toISOString()
        };

        stompClient.send("/app/chat.private", {}, JSON.stringify(message));
        clearPreview();
    } catch (error) {
        console.error('Upload failed:', error);
    }
}


function selectUser(user) {
    selectedUser = user;
    document.getElementById('currentChat').textContent = user;
    document.getElementById('messages').innerHTML = '';
}

function clearPreview() {
    document.getElementById('preview').innerHTML = '';
    document.getElementById('fileInput').value = '';
}

function displayMessage(message, isSender) {
    const messagesDiv = document.getElementById('messages');

    let content;
    switch(message.type) {
        case 'IMAGE':
            content = `
        <div class="relative group">
            <img src="/api/files/${message.content}" 
                 onerror="this.onerror=null;this.src='/placeholder-image.png'"
                 class="max-w-xs max-h-64 rounded-lg cursor-pointer hover:shadow-lg transition">
            <div class="absolute inset-0 flex items-center justify-center hidden group-hover:flex">
                <button onclick="window.open('/api/files/${message.content}', '_blank')"
                        class="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
    `;
            break;
        case 'FILE':
            content = `
                <a href="/uploads/${message.content}" download
                   class="inline-block p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition">
                   <i class="fas fa-file mr-2"></i>${message.content.split('_')[1]}
                </a>
            `;
            break;
        default:
            content = `<p class="text-gray-800">${message.content}</p>`;
    }

    const messageElement = document.createElement('div');
    messageElement.className = `flex ${isSender ? 'justify-end' : 'justify-start'} message-enter`;
    messageElement.innerHTML = `
        <div class="max-w-md p-3 rounded-lg ${
        isSender ? 'bg-blue-500 text-white' : 'bg-gray-200'
    }">
            ${content}
            <div class="text-xs mt-1 ${
        isSender ? 'text-blue-100' : 'text-gray-500'
    }">
                ${new Date(message.timestamp).toLocaleTimeString()}
            </div>
        </div>
    `;

    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Preload image for smoother preview
    if (message.type === 'IMAGE') {
        const img = new Image();
        img.src = `/uploads/${message.content}`;
    }
}

// Show full-screen image preview
function showFullImage(src) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center';
    overlay.innerHTML = `
        <div class="relative max-w-4xl max-h-screen p-4">
            <button onclick="this.parentElement.parentElement.remove()"
                    class="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300">
                <i class="fas fa-times"></i>
            </button>
            <img src="${src}" class="max-h-screen max-w-full object-contain">
            <div class="absolute bottom-4 left-0 right-0 flex justify-center">
                <a href="${src}" download 
                   class="px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-100">
                   <i class="fas fa-download mr-2"></i>Download
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Download image helper
function downloadImage(src, filename) {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize
document.getElementById('username').addEventListener('change', (e) => {
    if (e.target.value.trim()) {
        currentUser = e.target.value.trim();
        connect();
    }
});