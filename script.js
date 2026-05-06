// File storage (in real app, this would be server-side)
let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
let currentFileId = null;

// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

// Touch-friendly menu toggle
mobileMenu.addEventListener('click', (e) => {
    e.preventDefault();
    mobileMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !navMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        mobileMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// File upload functionality
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

browseBtn.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('click', () => fileInput.click());

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.size > 50 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
            return;
        }
        uploadFile(file);
    });
}

function uploadFile(file) {
    uploadArea.style.display = 'none';
    uploadProgress.style.display = 'block';

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Create file object
            const fileObj = {
                id: Date.now(),
                name: file.name,
                size: file.size,
                type: file.type,
                category: getFileCategory(file.type, file.name),
                uploadDate: new Date().toISOString(),
                downloads: 0,
                description: `Uploaded ${new Date().toLocaleDateString()}`
            };
            
            // Store file (in real app, upload to server)
            uploadedFiles.push(fileObj);
            localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
            
            // Reset UI
            setTimeout(() => {
                uploadArea.style.display = 'block';
                uploadProgress.style.display = 'none';
                progressFill.style.width = '0%';
                progressText.textContent = '0%';
                fileInput.value = '';
                
                // Refresh files display
                displayFiles();
                updateStats();
                
                alert(`File "${file.name}" uploaded successfully!`);
            }, 1000);
        }
    }, 200);
}

function getFileCategory(type, name) {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text') || 
        name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.txt')) return 'document';
    if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'archive';
    return 'other';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(category) {
    const icons = {
        image: 'fa-image',
        video: 'fa-video',
        audio: 'fa-music',
        document: 'fa-file-alt',
        archive: 'fa-file-archive',
        other: 'fa-file'
    };
    return icons[category] || icons.other;
}

// Display files
function displayFiles() {
    const filesGrid = document.getElementById('filesGrid');
    const emptyState = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredFiles = uploadedFiles.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || file.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    // Sort files
    filteredFiles.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            case 'oldest':
                return new Date(a.uploadDate) - new Date(b.uploadDate);
            case 'name':
                return a.name.localeCompare(b.name);
            case 'size':
                return b.size - a.size;
            default:
                return 0;
        }
    });
    
    if (filteredFiles.length === 0) {
        filesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    filesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    filesGrid.innerHTML = filteredFiles.map(file => `
        <div class="file-card" data-id="${file.id}">
            <div class="file-header">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.category)}"></i>
                </div>
                <div class="file-info">
                    <h3 title="${file.name}">${file.name}</h3>
                    <div class="file-meta">
                        ${formatFileSize(file.size)} • ${file.downloads} downloads
                    </div>
                </div>
            </div>
            <div class="file-description">${file.description}</div>
            <div class="file-actions">
                <button class="btn-download" onclick="downloadFile(${file.id})">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn-share" onclick="shareFile(${file.id})">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
    `).join('');
}

// Download file
function downloadFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
        file.downloads++;
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        // In real app, this would trigger actual file download
        alert(`Downloading "${file.name}"... (In a real application, this would download the actual file)`);
        displayFiles();
        updateStats();
    }
}

// Share file
function shareFile(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
        const shareUrl = `${window.location.origin}#file-${fileId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share link copied to clipboard!');
        });
    }
}

// Update statistics
function updateStats() {
    const totalFiles = uploadedFiles.length;
    const totalDownloads = uploadedFiles.reduce((sum, file) => sum + file.downloads, 0);
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    
    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('totalDownloads').textContent = totalDownloads;
    document.getElementById('totalSize').textContent = formatFileSize(totalSize);
}

// Modal functionality
const modal = document.getElementById('previewModal');
const closeModal = document.getElementById('closeModal');

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Filter and sort event listeners
document.getElementById('searchInput').addEventListener('input', displayFiles);
document.getElementById('categoryFilter').addEventListener('change', displayFiles);
document.getElementById('sortBy').addEventListener('change', displayFiles);

// Footer links
document.getElementById('privacyLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Privacy Policy: We respect your privacy and only collect necessary information for file sharing.');
});

document.getElementById('termsLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Terms of Service: Use this platform responsibly. Do not upload illegal or harmful content.');
});

document.getElementById('reportLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('To report abuse, please contact us with details of the problematic content.');
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for animation
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Initialize
displayFiles();
updateStats();
