// Authentication Check and UI Update
(function() {
    let auth = null;
    try {
        const authStr = localStorage.getItem('civicReportAuth');
        if (authStr) {
            auth = JSON.parse(authStr);
        }
    } catch (error) {
        console.error('Error parsing auth data:', error);
        // Clear corrupted auth data
        localStorage.removeItem('civicReportAuth');
    }
    
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    const userNameSpan = document.getElementById('userName');
    const contactInput = document.getElementById('contact');

    if (auth && auth.isLoggedIn) {
        // User is logged in
        userMenu.style.display = 'block';
        authButtons.style.display = 'none';
        userNameSpan.textContent = auth.firstName;
        
        // Pre-fill email in contact form
        if (contactInput) {
            contactInput.value = auth.email;
        }

        // Load user's reports
        loadUserReports();
    } else {
        // User is not logged in
        userMenu.style.display = 'none';
        authButtons.style.display = 'flex';
    }
})();

// Toggle dropdown menu
function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('dropdownMenu');
    
    if (userMenu && !userMenu.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('civicReportAuth');
        // Redirect to the login page
        window.location.href = 'login.html';
    }
}

// Show My Reports
function showMyReports() {
    let auth = null;
    try {
        const authStr = localStorage.getItem('civicReportAuth');
        if (authStr) {
            auth = JSON.parse(authStr);
        }
    } catch (error) {
        console.error('Error parsing auth data:', error);
    }
    
    if (!auth || !auth.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Switch to track section
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    document.getElementById('track').style.display = 'block';

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#track') {
            link.classList.add('active');
        }
    });

    // Load user's reports
    loadUserReports();
}

// Load User Reports
async function loadUserReports() {
    let auth = null;
    try {
        const authStr = localStorage.getItem('civicReportAuth');
        if (authStr) {
            auth = JSON.parse(authStr);
        }
    } catch (error) {
        console.error('Error parsing auth data:', error);
        return;
    }
    
    if (!auth || !auth.isLoggedIn) return;

    const reportsList = document.getElementById('reportsList');
    
    try {
        const response = await fetch(`http://localhost:3000/api/reports/user/${encodeURIComponent(auth.email)}`);
        const result = await response.json();
        
        if (result.success && result.reports) {
            const userReports = result.reports;
            
            if (userReports.length === 0) {
                reportsList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <i class="ri-file-list-line" style="font-size: 48px;"></i>
                        <p>You haven't reported any issues yet.</p>
                        <button class="btn btn-primary" onclick="showReportForm()">Report Your First Issue</button>
                    </div>
                `;
                return;
            }

            reportsList.innerHTML = userReports.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <span class="report-id">#${report.reportId}</span>
                        <span class="report-status status-${report.status}">${report.status}</span>
                    </div>
                    <h4>${report.issueType}</h4>
                    <p>${report.description}</p>
                    <div class="report-meta">
                        <span><i class="ri-map-pin-line"></i> ${report.location}</span>
                        <span><i class="ri-time-line"></i> ${new Date(report.date).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        } else {
            reportsList.innerHTML = '<p>No reports found.</p>';
        }
    } catch (error) {
        console.error('Error loading user reports:', error);
        reportsList.innerHTML = '<p>Error loading reports. Please try again.</p>';
    }

    // Update stats
    updateStats();
}

// Update Stats
async function updateStats() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success && result.reports) {
            const allReports = result.reports;
            const resolved = allReports.filter(r => r.status === 'resolved').length;
            
            document.getElementById('totalReports').textContent = allReports.length;
            document.getElementById('resolvedReports').textContent = resolved;
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Check if user is logged in before reporting
function showReportForm() {
    let auth = null;
    try {
        const authStr = localStorage.getItem('civicReportAuth');
        if (authStr) {
            auth = JSON.parse(authStr);
        }
    } catch (error) {
        console.error('Error parsing auth data:', error);
    }
    
    if (!auth || !auth.isLoggedIn) {
        if (confirm('Please login to report an issue. Do you want to login now?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    // Show report form
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('report').style.display = 'block';

    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#report') {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        document.getElementById(targetId).style.display = 'block';
        
        // Update active link
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Initialize on page load (will be handled by the second DOMContentLoaded listener below)

// Keep your existing home.js functions below...
// (getCurrentLocation, previewImage, resetForm, showMap, etc.)






// Global variables
let map;
let markers = [];
let reports = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    updateStats(); // Load stats from MongoDB
});

// Initialize application
function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    navToggle.addEventListener('click', toggleMobileMenu);
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', handleReportSubmit);
    }
}

// Navigation handling
function handleNavigation(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    showSection(targetId);
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Initialize map if showing map section
        if (sectionId === 'map' && !map) {
            setTimeout(initializeMap, 100);
        }
        
        // Load dashboard data if showing dashboard
        if (sectionId === 'dashboard') {
            loadDashboard();
        }
        
        // Load track reports if showing track section
        if (sectionId === 'track') {
            loadUserReports();
        }
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Show report form
function showReportForm() {
    showSection('report');
    window.scrollTo(0, 0);
}

// Show map
function showMap() {
    showSection('map');
    if (!map) {
        setTimeout(initializeMap, 100);
    }
}

// Handle report form submission
async function handleReportSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    let auth = null;
    try {
        const authStr = localStorage.getItem('civicReportAuth');
        if (authStr) {
            auth = JSON.parse(authStr);
        }
    } catch (error) {
        console.error('Error parsing auth data:', error);
    }
    
    if (!auth || !auth.isLoggedIn) {
        alert('Please login to submit a report');
        window.location.href = 'login.html';
        return;
    }
    
    // Get form data
    const reportId = generateReportId();
    const issueType = document.getElementById('issueType').value.trim();
    const priority = document.getElementById('priority').value.trim();
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    const userEmail = auth.email;
    const photoFile = document.getElementById('photo').files[0];
    
    // Validate required fields on frontend
    if (!issueType || issueType === '') {
        alert('Please select an issue type');
        document.getElementById('issueType').focus();
        return;
    }
    
    if (!priority || priority === '') {
        alert('Please select a priority level');
        document.getElementById('priority').focus();
        return;
    }
    
    if (!description || description.length < 10) {
        alert('Please provide a description (at least 10 characters)');
        document.getElementById('description').focus();
        return;
    }
    
    if (!location || location === '') {
        alert('Please provide a location');
        document.getElementById('location').focus();
        return;
    }
    
    if (!userEmail || userEmail === '') {
        alert('User email not found. Please login again.');
        window.location.href = 'login.html';
        return;
    }
    
    // Parse location for coordinates if available
    let latitude = null;
    let longitude = null;
    const locationMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (locationMatch) {
        latitude = parseFloat(locationMatch[1]);
        longitude = parseFloat(locationMatch[2]);
    }
    
    // Convert photo to base64 if exists
    let photoBase64 = null;
    if (photoFile) {
        try {
            photoBase64 = await convertImageToBase64(photoFile);
        } catch (error) {
            alert('Error processing image: ' + error.message);
            return;
        }
    }
    
    // Prepare report data
    const reportData = {
        reportId,
        issueType,
        priority,
        description,
        location,
        userEmail,
        photo: photoBase64,
        latitude,
        longitude
    };
    
    // Submit to MongoDB via API
    try {
        const response = await fetch('http://localhost:3000/api/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        
        // Check if response is ok
        if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            
            // Handle specific error codes
            if (response.status === 413) {
                errorMessage = 'File too large. Please use a smaller image or compress it before uploading.';
            } else {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.details || errorMessage;
                } catch (e) {
                    // If we can't parse JSON, use status-based message
                    if (response.status === 413) {
                        errorMessage = 'Request too large. The image file is too big. Please use a smaller image.';
                    }
                }
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Show success modal
            showSuccessModal(reportId);
            
            // Reset form
            e.target.reset();
            document.getElementById('imagePreview').innerHTML = '';
            
            // Refresh reports
            await loadAllReports();
            updateStats();
        } else {
            alert('Failed to submit report: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        const errorMessage = error.message || 'Unable to connect to server. Please make sure the server is running.';
        alert('Failed to submit report: ' + errorMessage);
    }
}

// Convert image file to base64 with compression
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        // Check file size (max 5MB before compression)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Image file is too large. Please use an image smaller than 5MB.'));
            return;
        }

        // Create image to compress
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Create canvas to resize/compress
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max width 1200px, maintain aspect ratio)
                let width = img.width;
                let height = img.height;
                const maxWidth = 1200;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with quality compression (0.7 = 70% quality)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                // Check final size (should be much smaller now)
                if (compressedBase64.length > 10 * 1024 * 1024) { // 10MB limit for base64
                    reject(new Error('Image is still too large after compression. Please use a smaller image.'));
                    return;
                }
                
                resolve(compressedBase64);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Generate unique report ID
function generateReportId() {
    return 'RPT-' + Date.now().toString(36).toUpperCase();
}

// Save report - now using MongoDB (kept for compatibility)
async function saveReport(report) {
    // This function is kept for compatibility but reports are now saved via API
    // Add marker to map if exists
    if (map) {
        addMarkerToMap(report);
    }
    
    // Load reports to update display
    await loadAllReports();
    updateStats();
}

// Show success modal
function showSuccessModal(reportId) {
    const modal = document.getElementById('successModal');
    document.getElementById('reportId').textContent = reportId;
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                // Reverse geocoding would go here
                document.getElementById('location').value = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            },
            error => {
                alert('Unable to get your location. Please enter it manually.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Preview uploaded image
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Reset form
function resetForm() {
    document.getElementById('reportForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
}

// Initialize map
function initializeMap() {
    // Create map centered on a default location
    map = L.map('issueMap').setView([40.7128, -74.0060], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Load existing reports as markers
    loadMapMarkers();
}

// Load markers on map
async function loadMapMarkers() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success && result.reports) {
            result.reports.forEach(report => {
                addMarkerToMap(report);
            });
        }
    } catch (error) {
        console.error('Error loading map markers:', error);
    }
}

// Load all reports (helper function)
async function loadAllReports() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success && result.reports) {
            // Store in localStorage for backward compatibility with existing code
            const formattedReports = result.reports.map(r => ({
                id: r.reportId,
                type: r.issueType,
                priority: r.priority,
                description: r.description,
                location: r.location,
                contact: r.userEmail,
                status: r.status,
                date: r.date,
                userEmail: r.userEmail
            }));
            localStorage.setItem('civicReports', JSON.stringify(formattedReports));
            return formattedReports;
        }
        return [];
    } catch (error) {
        console.error('Error loading reports:', error);
        return [];
    }
}

// Add marker to map
function addMarkerToMap(report) {
    if (!map) return;
    
    // Use actual coordinates if available, otherwise use location string or default
    let coords;
    if (report.latitude && report.longitude) {
        coords = [report.latitude, report.longitude];
    } else {
        // Try to parse coordinates from location string
        const locationMatch = report.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (locationMatch) {
            coords = [parseFloat(locationMatch[1]), parseFloat(locationMatch[2])];
        } else {
            // Default location (should geocode in production)
            coords = [
                40.7128 + (Math.random() - 0.5) * 0.1,
                -74.0060 + (Math.random() - 0.5) * 0.1
            ];
        }
    }
    
    // Get issue type (handle both old and new format)
    const issueType = report.type || report.issueType;
    const reportId = report.id || report.reportId;
    
    // Create custom icon based on issue type
    const iconColor = getIconColor(issueType);
    
    // Create marker
    const marker = L.marker(coords).addTo(map);
    
    // Add popup
    marker.bindPopup(`
        <div class="map-popup">
            <h4>${issueType.charAt(0).toUpperCase() + issueType.slice(1)}</h4>
            <p>${report.description}</p>
            <small>Status: ${report.status}</small><br>
            <small>Priority: ${report.priority}</small><br>
            <small>ID: ${reportId}</small>
        </div>
    `);
    
    markers.push({marker, type: issueType, status: report.status});
}

// Get icon color based on issue type
function getIconColor(type) {
    const colors = {
        pothole: '#ef4444',
        streetlight: '#f59e0b',
        trash: '#84cc16',
        graffiti: '#8b5cf6',
        water: '#3b82f6',
        sidewalk: '#ec4899',
        other: '#6b7280'
    };
    return colors[type] || colors.other;
}

// Filter map markers
function filterMarkers() {
    const typeFilter = document.getElementById('filterType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    markers.forEach(({marker, type, status}) => {
        let show = true;
        
        if (typeFilter !== 'all' && type !== typeFilter) {
            show = false;
        }
        
        if (statusFilter !== 'all' && status !== statusFilter) {
            show = false;
        }
        
        if (show) {
            marker.setOpacity(1);
        } else {
            marker.setOpacity(0.3);
        }
    });
}

// Search reports
async function searchReports() {
    const searchTerm = document.getElementById('trackingId').value.toLowerCase();
    
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success && result.reports) {
            const filteredReports = result.reports.filter(report => 
                report.reportId.toLowerCase().includes(searchTerm) ||
                (report.userEmail && report.userEmail.toLowerCase().includes(searchTerm))
            );
            
            displayReports(filteredReports);
        } else {
            displayReports([]);
        }
    } catch (error) {
        console.error('Error searching reports:', error);
        displayReports([]);
    }
}

// Display reports in track section
function displayReports(reports) {
    const reportsList = document.getElementById('reportsList');
    
    if (reports.length === 0) {
        reportsList.innerHTML = '<p>No reports found.</p>';
        return;
    }
    
    reportsList.innerHTML = reports.map(report => {
        const issueType = report.type || report.issueType;
        const reportId = report.id || report.reportId;
        
        return `
        <div class="report-card">
            <div class="report-icon" style="background: ${getIconColor(issueType)}20; color: ${getIconColor(issueType)}">
                <i class="ri-${getIconForType(issueType)}"></i>
            </div>
            <div class="report-details">
                <h4>Report #${reportId}</h4>
                <p>${issueType.charAt(0).toUpperCase() + issueType.slice(1)} - ${report.description.substring(0, 50)}...</p>
                <p><i class="ri-map-pin-line"></i> ${report.location}</p>
                <p><i class="ri-calendar-line"></i> ${new Date(report.date).toLocaleDateString()}</p>
            </div>
            <div class="report-status status-${report.status}">
                ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </div>
        </div>
    `;
    }).join('');
}

// Get icon for issue type
function getIconForType(type) {
    const icons = {
        pothole: 'road-line',
        streetlight: 'lightbulb-line',
        trash: 'delete-bin-line',
        graffiti: 'paint-brush-line',
        water: 'drop-line',
        sidewalk: 'walk-line',
        other: 'error-warning-line'
    };
    return icons[type] || icons.other;
}

// Load user reports (for track section)
async function loadUserReports() {
    await loadAllReports(); // This updates localStorage for compatibility
    const reports = JSON.parse(localStorage.getItem('civicReports')) || [];
    displayReports(reports);
}

// Load dashboard
async function loadDashboard() {
    await loadRecentReports();
    await createIssueChart();
    loadPerformanceStats();
}

// Load recent reports for dashboard
async function loadRecentReports() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success && result.reports) {
            const recentReports = result.reports.slice(-5).reverse();
            
            const recentReportsDiv = document.getElementById('recentReports');
            recentReportsDiv.innerHTML = recentReports.map(report => {
                const issueType = report.issueType || report.type;
                return `
                <div class="recent-item">
                    <div class="recent-item-icon">
                        <i class="ri-${getIconForType(issueType)}"></i>
                    </div>
                    <div style="flex: 1;">
                        <strong>${issueType.charAt(0).toUpperCase() + issueType.slice(1)}</strong>
                        <p style="font-size: 0.875rem; color: #64748b; margin: 0;">
                            ${new Date(report.date).toLocaleString()}
                        </p>
                    </div>
                    <span class="status-${report.status}" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem;">
                        ${report.status}
                    </span>
                </div>
            `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading recent reports:', error);
    }
}

// Create issue distribution chart
async function createIssueChart() {
    try {
        const response = await fetch('http://localhost:3000/api/reports');
        const result = await response.json();
        
        if (result.success && result.reports) {
            const reports = result.reports;
            
            // Count issues by type
            const issueCounts = {};
            reports.forEach(report => {
                const issueType = report.issueType || report.type;
                issueCounts[issueType] = (issueCounts[issueType] || 0) + 1;
            });
            
            const ctx = document.getElementById('issueChart');
            if (ctx) {
                // Destroy existing chart if it exists
                if (window.issueChartInstance) {
                    window.issueChartInstance.destroy();
                }
                
                window.issueChartInstance = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(issueCounts).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
                        datasets: [{
                            data: Object.values(issueCounts),
                            backgroundColor: [
                                '#ef4444',
                                '#f59e0b',
                                '#84cc16',
                                '#8b5cf6',
                                '#3b82f6',
                                '#ec4899',
                                '#6b7280'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error creating chart:', error);
    }
}

// Load performance stats
function loadPerformanceStats() {
    const stats = document.querySelector('.performance-stats');
    if (stats) {
        stats.innerHTML = `
            <div style="display: grid; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                    <span>Public Works</span>
                    <strong>87%</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                    <span>Sanitation</span>
                    <strong>92%</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem; background: #f8fafc; border-radius: 8px;">
                    <span>Utilities</span>
                    <strong>78%</strong>
                </div>
            </div>
        `;
    }
}

// Update statistics - async version already defined above

// Load sample data for demonstration
function loadSampleData() {
    const existingReports = JSON.parse(localStorage.getItem('civicReports')) || [];
    
    if (existingReports.length === 0) {
        const sampleReports = [
            {
                id: 'RPT-SAMPLE1',
                type: 'pothole',
                priority: 'high',
                description: 'Large pothole on Main Street causing traffic issues',
                location: 'Main Street & 5th Avenue',
                contact: 'sample@email.com',
                status: 'inprogress',
                date: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'RPT-SAMPLE2',
                type: 'streetlight',
                priority: 'medium',
                description: 'Streetlight not working for past week',
                location: 'Park Road near Community Center',
                contact: 'user@email.com',
                status: 'pending',
                date: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 'RPT-SAMPLE3',
                type: 'trash',
                priority: 'low',
                description: 'Overflowing trash bin in the park',
                location: 'Central Park East Entrance',
                contact: 'resident@email.com',
                status: 'resolved',
                date: new Date(Date.now() - 259200000).toISOString()
            }
        ];
        
        localStorage.setItem('civicReports', JSON.stringify(sampleReports));
    }
    
    updateStats();
}

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.remove('active');
    }
});