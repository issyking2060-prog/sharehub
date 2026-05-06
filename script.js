// File Storage - Using localStorage (ready for Firebase integration)
let uploadedFiles = [];
let currentFileId = null;

// Load files from localStorage
function loadFilesFromStorage() {
    const stored = localStorage.getItem('uploadedFiles');
    if (stored) {
        uploadedFiles = JSON.parse(stored);
    }
    displayFiles();
}

// Save files to localStorage
function saveFilesToStorage() {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
}

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

// Debug: Check if elements exist
console.log('Upload elements:', {
    uploadArea: !!uploadArea,
    fileInput: !!fileInput,
    browseBtn: !!browseBtn,
    uploadProgress: !!uploadProgress
});

if (browseBtn) {
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Browse button clicked');
        if (fileInput) {
            fileInput.click();
        } else {
            console.error('File input not found');
        }
    });
} else {
    console.error('Browse button not found');
}

if (uploadArea) {
    uploadArea.addEventListener('click', (e) => {
        // Don't trigger if clicking on form elements
        if (e.target.closest('.file-details')) {
            return;
        }
        console.log('Upload area clicked');
        if (fileInput) {
            fileInput.click();
        } else {
            console.error('File input not found');
        }
    });
} else {
    console.error('Upload area not found');
}

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

// Drag and drop
if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        console.log('Drag over event');
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        console.log('Drag leave event');
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('Drop event', e.dataTransfer.files);
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        console.log('File input change event', e.target.files);
        handleFiles(e.target.files);
    });
} else {
    console.error('File input element not found for change event');
}

function handleFiles(files) {
    console.log('handleFiles called with:', files);
    if (!files || files.length === 0) {
        console.log('No files to handle');
        return;
    }
    
    Array.from(files).forEach(file => {
        console.log('Processing file:', file.name, file.size);
        if (file.size > 100 * 1024 * 1024) {
            alert(`File "${file.name}" is too large. Maximum size is 100MB.`);
            return;
        }
        console.log('Starting upload for:', file.name);
        uploadFile(file);
    });
}

async function uploadFile(file) {
    console.log('uploadFile called for:', file.name);
    
    if (!uploadArea || !uploadProgress) {
        console.error('Upload elements not found');
        return;
    }
    
    uploadArea.style.display = 'none';
    uploadProgress.style.display = 'block';
    console.log('Upload progress shown');

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Simulate file upload and save to localStorage
            setTimeout(() => {
                const visibility = visibilityToggle.checked ? 'public' : 'private';
                const description = fileDescription.value.trim() || 
                    `Uploaded ${new Date().toLocaleDateString()} - ${visibility === 'public' ? 'Public' : 'Private'} file`;
                
                const newFile = {
                    id: Date.now().toString(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    category: getFileCategory(file.type),
                    visibility: visibility,
                    description: description,
                    upload_date: new Date().toISOString(),
                    downloads: 0
                };
                
                uploadedFiles.unshift(newFile);
                saveFilesToStorage();
                displayFiles();
                
                // Reset UI
                setTimeout(() => {
                    uploadProgress.style.display = 'none';
                    uploadArea.style.display = 'block';
                    progressFill.style.width = '0%';
                    progressText.textContent = '0%';
                    fileInput.value = '';
                    
                    // Clear description field
                    fileDescription.value = '';
                    charCount.textContent = '0';
                    
                    showNotification('File uploaded successfully!', 'success');
                }, 1000);
            }, 2000);
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
        saveFilesToStorage();
        
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

// Legal modal functionality
const legalModal = document.getElementById('legalModal');
const legalModalTitle = document.getElementById('legalModalTitle');
const legalModalBody = document.getElementById('legalModalBody');
const closeLegalModal = document.getElementById('closeLegalModal');

// Initialize legal modal event listeners
if (closeLegalModal) {
    closeLegalModal.addEventListener('click', () => {
        legalModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === legalModal) {
        legalModal.style.display = 'none';
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal.style.display === 'block') {
        legalModal.style.display = 'none';
    }
});

// Legal pages content
const legalContent = {
    privacy: {
        title: 'Privacy Policy',
        content: `
            <div class="legal-content">
                <h2>Privacy Policy for ShareHub</h2>
                <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h3>1. Information We Collect</h3>
                <p>We collect minimal information necessary to provide our file sharing service:</p>
                <ul>
                    <li>File metadata (name, size, type, upload date)</li>
                    <li>File descriptions and visibility settings</li>
                    <li>Download statistics (count only)</li>
                    <li>No personal identification required</li>
                </ul>
                
                <h3>2. How We Use Your Information</h3>
                <ul>
                    <li>To provide file sharing services</li>
                    <li>To display file information to other users</li>
                    <li>To generate download statistics</li>
                    <li>To improve our services</li>
                </ul>
                
                <h3>3. Data Security</h3>
                <p>We implement appropriate security measures to protect your files and information.</p>
                
                <h3>4. Cookies</h3>
                <p>We use minimal cookies for essential functionality only.</p>
                
                <h3>5. Third-Party Services</h3>
                <p>We use Firebase for database services and Vercel for hosting.</p>
                
                <h3>6. Your Rights</h3>
                <ul>
                    <li>You can delete your uploaded files at any time</li>
                    <li>You can modify file descriptions and visibility</li>
                    <li>You can request data removal</li>
                </ul>
                
                <h3>7. Contact Us</h3>
                <div class="contact-info">
                    <p>If you have questions about this Privacy Policy, please contact us.</p>
                </div>
            </div>
        `
    },
    terms: {
        title: 'Terms of Service',
        content: `
            <div class="legal-content">
                <h2>Terms of Service for ShareHub</h2>
                <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h3>1. Acceptance of Terms</h3>
                <p>By using ShareHub, you agree to these Terms of Service.</p>
                
                <h3>2. Service Description</h3>
                <p>ShareHub is a free file sharing platform that allows users to upload, share, and download files.</p>
                
                <h3>3. Acceptable Use</h3>
                <p>You agree to use our service responsibly:</p>
                <ul>
                    <li>No illegal or harmful content</li>
                    <li>No copyrighted material without permission</li>
                    <li>No malware or viruses</li>
                    <li>No spam or abusive behavior</li>
                    <li>Respect other users' privacy</li>
                </ul>
                
                <h3>4. File Content</h3>
                <ul>
                    <li>You are responsible for files you upload</li>
                    <li>You must have rights to share uploaded content</li>
                    <li>We reserve the right to remove inappropriate content</li>
                </ul>
                
                <h3>5. Privacy</h3>
                <p>Your privacy is important to us. Please review our Privacy Policy.</p>
                
                <h3>6. Service Availability</h3>
                <p>We strive to maintain high availability but cannot guarantee 100% uptime.</p>
                
                <h3>7. Limitations</h3>
                <ul>
                    <li>Maximum file size: 100MB</li>
                    <li>Files may be removed after extended inactivity</li>
                    <li>We reserve the right to modify service features</li>
                </ul>
                
                <h3>8. Disclaimer</h3>
                <p>ShareHub is provided "as is" without warranties of any kind.</p>
                
                <h3>9. Contact</h3>
                <div class="contact-info">
                    <p>For questions about these Terms of Service, please contact us.</p>
                </div>
            </div>
        `
    },
    report: {
        title: 'Report Abuse',
        content: `
            <div class="legal-content">
                <h2>Report Abuse</h2>
                <p>If you encounter inappropriate content or behavior on ShareHub, please report it to us.</p>
                
                <h3>What to Report</h3>
                <ul>
                    <li>Illegal content or activities</li>
                    <li>Copyright infringement</li>
                    <li>Malware or viruses</li>
                    <li>Harassment or abuse</li>
                    <li>Spam or fraudulent content</li>
                    <li>Privacy violations</li>
                </ul>
                
                <h3>How to Report</h3>
                <div class="report-form">
                    <textarea id="reportContent" placeholder="Please describe the issue in detail. Include file name, URL, and any relevant information..."></textarea>
                    <button onclick="submitReport()">Submit Report</button>
                </div>
                
                <h3>What Happens Next</h3>
                <ul>
                    <li>We review all reports within 24-48 hours</li>
                    <li>We take appropriate action based on our findings</li>
                    <li>We may remove content and suspend accounts</li>
                    <li>We follow up with serious legal matters</li>
                </ul>
                
                <h3>Emergency Reports</h3>
                <p>For immediate threats or illegal content involving minors, please contact local authorities immediately.</p>
                
                <h3>Contact Information</h3>
                <div class="contact-info">
                    <p>For urgent matters, please reach out through our contact channels.</p>
                </div>
            </div>
        `
    }
};

// Footer links - Initialize after DOM is loaded
function initializeLegalLinks() {
    const privacyLink = document.getElementById('privacyLink');
    const termsLink = document.getElementById('termsLink');
    const reportAbuseLink = document.getElementById('reportAbuseLink');

    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (legalModal && legalModalTitle && legalModalBody) {
                legalModalTitle.textContent = legalContent.privacy.title;
                legalModalBody.innerHTML = legalContent.privacy.content;
                legalModal.style.display = 'block';
            }
        });
    }

    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (legalModal && legalModalTitle && legalModalBody) {
                legalModalTitle.textContent = legalContent.terms.title;
                legalModalBody.innerHTML = legalContent.terms.content;
                legalModal.style.display = 'block';
            }
        });
    }

    if (reportAbuseLink) {
        reportAbuseLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (legalModal && legalModalTitle && legalModalBody) {
                legalModalTitle.textContent = legalContent.report.title;
                legalModalBody.innerHTML = legalContent.report.content;
                legalModal.style.display = 'block';
            }
        });
    }
}

// Initialize legal links when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLegalLinks);
} else {
    initializeLegalLinks();
}

// Submit report function
function submitReport() {
    const reportContent = document.getElementById('reportContent');
    if (reportContent && reportContent.value.trim()) {
        showNotification('Report submitted successfully. We will review it within 24-48 hours.', 'success');
        legalModal.style.display = 'none';
        reportContent.value = '';
    } else {
        showNotification('Please provide details about the issue you want to report.', 'error');
    }
}

const reportLink = document.getElementById('reportLink');
if (reportLink) {
    reportLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('To report abuse, please contact us with details of the problematic content.');
    });
}

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

// Initialize with localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadFilesFromStorage();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to ShareHub! Upload and share files globally.', 'info');
    }, 1000);
});
