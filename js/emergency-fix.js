// Emergency fix for button click events
document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying emergency button fixes...');
    
    // Check if app is loaded
    function waitForApp() {
        if (window.app && window.app.selectLivestock) {
            console.log('App is loaded, using app.selectLivestock');
            setupAppListeners();
        } else {
            console.log('App not loaded yet, retrying...');
            setTimeout(waitForApp, 100);
        }
    }
    
    function setupAppListeners() {
        // Dairy card
        const dairyCard = document.getElementById('dairy-card');
        if (dairyCard) {
            dairyCard.addEventListener('click', function(e) {
                console.log('Dairy card clicked');
                window.app.selectLivestock('dairy');
            });
        }
        
        // Poultry card
        const poultryCard = document.getElementById('poultry-card');
        if (poultryCard) {
            poultryCard.addEventListener('click', function(e) {
                console.log('Poultry card clicked');
                window.app.selectLivestock('poultry');
            });
        }
        
        // Backup button
        const backupBtn = document.getElementById('backup-btn');
        if (backupBtn) {
            backupBtn.addEventListener('click', function() {
                console.log('Backup button clicked');
                if (window.app && window.app.createBackup) {
                    window.app.createBackup();
                }
            });
        }
        
        // Restore button
        const restoreBtn = document.getElementById('restore-btn');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', function() {
                console.log('Restore button clicked');
                if (window.app && window.app.restoreBackup) {
                    window.app.restoreBackup();
                }
            });
        }
        
        // Login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                console.log('Login button clicked');
                document.getElementById('auth-modal').classList.add('active');
            });
        }
        
        // Close auth modal button
        const closeAuthBtn = document.getElementById('close-auth-modal');
        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', function() {
                document.getElementById('auth-modal').classList.remove('active');
            });
        }
        
        console.log('All emergency listeners set up');
    }
    
    waitForApp();
});
