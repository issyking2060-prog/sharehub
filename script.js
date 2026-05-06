// Supabase Integration
const supabaseUrl = 'https://oaiaawwiwawmrsukobmc.supabase.co';
const supabaseKey = 'sb_publishable_CxlR8ynzGWtNq11f_XwUww_j-yQ-IEV';
const supabase = createClient(supabaseUrl, supabaseKey);

// File storage (now using Supabase)
let uploadedFiles = [];
let currentFileId = null;

// Clear localStorage for fresh Supabase integration
localStorage.removeItem('uploadedFiles');

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
const fileDescription = document.getElementById('fileDescription');
const charCount = document.getElementById('charCount');
const visibilityToggle = document.getElementById('visibilityToggle');
const visibilityStatus = document.getElementById('visibilityStatus');
const visibilityDescription = document.getElementById('visibilityDescription');

browseBtn.addEventListener('click', () => fileInput.click());

// Description character counter
fileDescription.addEventListener('input', () => {
    const length = fileDescription.value.length;
    charCount.textContent = length;
    if (length > 180) {
        charCount.style.color = '#ef4444';
    } else if (length > 150) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#666';
    }
});

// Visibility toggle functionality
visibilityToggle.addEventListener('change', () => {
    const isPublic = visibilityToggle.checked;
    if (isPublic) {
        visibilityStatus.textContent = '🌍 Public';
        visibilityStatus.style.color = '#4ade80';
        visibilityDescription.textContent = 'Everyone can see and download this file';
    } else {
        visibilityStatus.textContent = '🔒 Private';
        visibilityStatus.style.color = '#f59e0b';
        visibilityDescription.textContent = 'Only you can see and download this file';
    }
});

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

async function uploadFile(file) {
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
            
            // Upload to Supabase
            uploadFileToSupabase(file).then(uploadedFile => {
                if (uploadedFile) {
                    // Reset UI
                    setTimeout(() => {
                        uploadArea.style.display = 'block';
                        uploadProgress.style.display = 'none';
                        progressFill.style.width = '0%';
                        progressText.textContent = '0%';
                        fileInput.value = '';
                        
                        // Refresh files display
                        loadFilesFromSupabase();
                        
                        // Clear description field
                        fileDescription.value = '';
                        charCount.textContent = '0';
                        charCount.style.color = '#666';
                        
                        const visibility = uploadedFile.visibility === 'public' ? 'Public' : 'Private';
                        showNotification(`File "${file.name}" uploaded successfully as ${visibility}!`, 'success');
                    }, 1000);
                } else {
                    // Reset UI on error
                    uploadArea.style.display = 'block';
                    uploadProgress.style.display = 'none';
                    progressFill.style.width = '0%';
                    progressText.textContent = '0%';
                    fileInput.value = '';
                    fileDescription.value = '';
                    charCount.textContent = '0';
                    charCount.style.color = '#666';
                }
            });
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

// Load files from Supabase
async function loadFilesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .order('upload_date', { ascending: false });
        
        if (error) {
            console.error('Error loading files:', error);
            showNotification('Error loading files. Please try again.', 'error');
            return;
        }
        
        uploadedFiles = data || [];
        displayFiles();
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Connection error. Please check your internet.', 'error');
    }
}

// Upload file to Supabase
async function uploadFileToSupabase(file) {
    try {
        const visibility = visibilityToggle.checked ? 'public' : 'private';
        const description = fileDescription.value.trim() || 
            `Uploaded ${new Date().toLocaleDateString()} - ${visibility === 'public' ? 'Public' : 'Private'} file`;
        
        const { data, error } = await supabase
            .from('files')
            .insert([
                {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    category: getFileCategory(file.type, file.name),
                    visibility: visibility,
                    upload_date: new Date().toISOString(),
                    downloads: 0,
                    description: description
                }
            ])
            .select();
        
        if (error) {
            console.error('Error uploading file:', error);
            showNotification('Error uploading file. Please try again.', 'error');
            return null;
        }
        
        return data[0];
    } catch (error) {
        console.error('Error:', error);
        showNotification('Upload failed. Please try again.', 'error');
        return null;
    }
}

// Display files
function displayFiles() {
    const filesGrid = document.getElementById('filesGrid');
    const emptyState = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const visibilityFilter = document.getElementById('visibilityFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filteredFiles = uploadedFiles.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || file.category === categoryFilter;
        const matchesVisibility = !visibilityFilter || file.visibility === visibilityFilter;
        return matchesSearch && matchesCategory && matchesVisibility;
    });
    
    // Sort files
    filteredFiles.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.upload_date) - new Date(a.upload_date);
            case 'oldest':
                return new Date(a.upload_date) - new Date(b.upload_date);
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
                <div class="file-info">
                    <div class="visibility-badge ${file.visibility}">
                        ${file.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                    </div>
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
        // Increment download count
        file.downloads++;
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        
        // Create sample file content for demo
        const sampleContent = generateSampleFileContent(file);
        
        // Create blob and download URL
        const blob = new Blob([sampleContent], { type: file.type || 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = file.name;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        // Show download notification
        showNotification(`Downloading "${file.name}" (${formatFileSize(file.size)})`, 'success');
        
        // Trigger download
        downloadLink.click();
        
        // Show completion notification
        setTimeout(() => {
            showNotification(`Download completed! "${file.name}" has been saved.`, 'success');
        }, 1000);
        
        // Update display
        displayFiles();
        updateStats();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 2000);
    }
}

// Generate sample file content based on file type
function generateSampleFileContent(file) {
    const timestamp = new Date().toISOString();
    const header = `ShareHub Download - ${timestamp}\n`;
    const footer = `\n\n---\nDownloaded from ShareHub by ${file.name}\nSize: ${formatFileSize(file.size)}\nDownloads: ${file.downloads + 1}\nCreated: ${file.uploadDate}\n---`;
    
    switch (file.category) {
        case 'document':
            return header + `Document Information:\n\nThis is a sample document file uploaded to ShareHub.\n\nFile Details:\n- Name: ${file.name}\n- Size: ${formatFileSize(file.size)}\n- Category: ${file.category}\n- Upload Date: ${file.uploadDate}\n\nThis is a demonstration file showing how ShareHub works.\nIn a production environment, this would be the actual uploaded document content.` + footer;
            
        case 'image':
            return header + `Image File Information:\n\nThis is a sample image file from ShareHub.\n\nFile Details:\n- Name: ${file.name}\n- Size: ${formatFileSize(file.size)}\n- Category: ${file.category}\n- Upload Date: ${file.uploadDate}\n\nNote: This is a placeholder for the actual image file.\nIn production, users would download the real image data.` + footer;
            
        case 'video':
            return header + `Video File Information:\n\nThis is a sample video file from ShareHub.\n\nFile Details:\n- Name: ${file.name}\n- Size: ${formatFileSize(file.size)}\n- Category: ${file.category}\n- Upload Date: ${file.uploadDate}\n\nNote: This is a placeholder for the actual video file.\nIn production, users would download the real video data.` + footer;
            
        case 'audio':
            return header + `Audio File Information:\n\nThis is a sample audio file from ShareHub.\n\nFile Details:\n- Name: ${file.name}\n- Size: ${formatFileSize(file.size)}\n- Category: ${file.category}\n- Upload Date: ${file.uploadDate}\n\nNote: This is a placeholder for the actual audio file.\nIn production, Users would download the real audio data.` + footer;
            
        case 'archive':
            return header + `Archive File Information:\n\nThis is a sample archive file from ShareHub.\n\nFile Details:\n- Name: ${file.name}\n- Size: ${formatFileSize(file.size)}\n- Category: ${file.category}\n- Upload Date: ${file.uploadDate}\n\nNote: This is a placeholder for the actual archive file.\nIn production, Users would download the real archive data.` + footer;
            
        default:
            return header + `File Information:\n\nThis is a sample file from ShareHub.\n\nFile Details:\n- Name: ${file.name}\n- Size: ${formatFileSize(file.size)}\n- Category: ${file.category}\n- Upload Date: ${file.uploadDate}\n\nNote: This is a placeholder for the actual file content.\nIn production, Users would download the real file data.` + footer;
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
document.getElementById('visibilityFilter').addEventListener('change', displayFiles);
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

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4ade80' : '#2563eb'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Real-time updates for new uploads
function checkForNewFiles() {
    const currentFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    const newFiles = currentFiles.filter(file => file.uploadDate > new Date(Date.now() - 60000).toISOString());
    
    if (newFiles.length > 0) {
        newFiles.forEach(file => {
            showNotification(`New file uploaded: "${file.name}"`, 'success');
        });
    }
}

// Auto-refresh files every 30 seconds
setInterval(() => {
    displayFiles();
    updateStats();
    checkForNewFiles();
}, 30000);

// Initialize with Supabase
document.addEventListener('DOMContentLoaded', () => {
    loadFilesFromSupabase();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to ShareHub! Upload and share files globally.', 'info');
    }, 1000);
});

// Real-time updates for new files
supabase
    .channel('files')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'files' },
        (payload) => {
            console.log('Change received!', payload);
            loadFilesFromSupabase(); // Reload files when changes happen
            
            // Show notification for new uploads
            if (payload.eventType === 'INSERT') {
                showNotification(`New file uploaded: "${payload.new.name}"`, 'success');
            }
        }
    )
    .subscribe();
