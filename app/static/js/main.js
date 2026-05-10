document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle Logic for Mobile
    const sidebar = document.getElementById('app-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarClose = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when sidebar open
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Handle resize events to cleanup state if window becomes large
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeSidebar();
        }
    });

    // Fetch and render events on dashboard
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const recentEventsList = document.getElementById('recent-events-list');

    if (recentEventsList) {
        fetch('/api/events')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch events');
                return res.json();
            })
            .then(events => {
                if (events.length === 0) {
                    recentEventsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">No events found. Create one!</div>';
                    return;
                }

                recentEventsList.innerHTML = '';
                // Limit to 4 most recent for dashboard
                events.slice(0, 4).forEach(evt => {
                    // event.date is "YYYY-MM-DD"
                    const dateParts = evt.date.split('-');
                    let monthStr = "UNK";
                    let dayStr = "00";
                    if (dateParts.length === 3) {
                        const monthIndex = parseInt(dateParts[1], 10) - 1;
                        monthStr = monthNames[monthIndex] || monthStr;
                        dayStr = dateParts[2];
                    }

                    const itemHtml = `
                        <a href="/event/${evt.id}" class="event-list-item" style="text-decoration: none; color: inherit; display: flex;">
                            <div class="event-date-box" style="margin-right: 15px;">
                                <span class="month">${monthStr}</span>
                                <span class="day">${dayStr}</span>
                            </div>
                            <div class="event-info" style="flex: 1;">
                                <h4 style="margin: 0 0 5px 0;">${evt.title}</h4>
                                <p style="margin: 0; color: #6b7280; font-size: 0.9em;">
                                    <i data-lucide="map-pin"></i> ${evt.venue} &middot; 
                                    <i data-lucide="clock"></i> ${evt.time}
                                </p>
                            </div>
                            <div class="event-status status-upcoming">Upcoming</div>
                        </a>
                    `;
                    recentEventsList.insertAdjacentHTML('beforeend', itemHtml);
                });

                // Render lucide icons for newly added HTML
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                recentEventsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #ef4444;">Error loading events from server.</div>';
            });
    }
});
