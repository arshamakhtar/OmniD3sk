import './view-session.js?v=bustcache3';
import './view-summary.js?v=bustcache3';

class AppRoot extends HTMLElement {
    constructor() {
        super();
        this.state = {
            view: 'session',
        };
    }

    connectedCallback() {
        this.innerHTML = '';

        // Force strict dark mode for OmniD3sk branding
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');

        // Check for token in URL and save it, redirect to dashboard if missing
        const urlParams = new URLSearchParams(window.location.search);
        let token = urlParams.get('token');
        
        if (token) {
            localStorage.setItem('omnid3sk_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            token = localStorage.getItem('omnid3sk_token');
        }

        if (!token) {
            // Unauthenticated: send them to the Next.js dashboard to login
            window.location.href = '/dashboard';
            return;
        }

        this.state.token = token;

        // View Container
        this.viewContainer = document.createElement('div');
        this.viewContainer.style.height = '100%';
        this.viewContainer.style.width = '100%';
        this.appendChild(this.viewContainer);

        this.render();

        this.addEventListener('navigate', (e) => {
            this.state.view = e.detail.view;
            this.state.language = e.detail.language || 'English';
            this.state.token = e.detail.token || null;
            this.render();
        });
    }

    render() {
        if (!this.viewContainer) return;
        this.viewContainer.innerHTML = '';
        let currentView;
        switch (this.state.view) {
            case 'session':
                currentView = document.createElement('view-session');
                currentView.setAttribute('language', this.state.language || 'English');
                break;
            case 'summary':
                currentView = document.createElement('view-summary');
                if (this.state.token) {
                    currentView.setAttribute('token', this.state.token);
                }
                break;
            default:
                currentView = document.createElement('view-session');
                currentView.setAttribute('language', this.state.language || 'English');
        }
        currentView.classList.add('fade-in');
        this.viewContainer.appendChild(currentView);
        
        // Remove the fade-in class after animation completes to destroy the transform containing block
        // This ensures position: fixed elements (like modals/drawers) work correctly relative to viewport
        setTimeout(() => {
            if (currentView && currentView.classList) {
                currentView.classList.remove('fade-in');
            }
        }, 650);
    }
}

customElements.define('app-root', AppRoot);
