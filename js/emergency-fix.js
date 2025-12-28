// Emergency fix for button click events
document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying emergency button fixes...');
    
    // Fix livestock selection cards
    const dairyCard = document.getElementById('dairy-card');
    const poultryCard = document.getElementById('poultry-card');
    
    if (dairyCard) {
        dairyCard.addEventListener('click', function() {
            console.log('Dairy card clicked');
            if (window.app && window.app.selectLivestock) {
                window.app.selectLivestock('dairy');
            } else {
                // Emergency fallback
                document.getElementById('welcome-screen').classList.remove('active');
                document.getElementById('app-screen').classList.add('active');
                alert('Dairy management selected!');
            }
        });
    }
    
    if (poultryCard) {
        poultryCard.addEventListener('click', function() {
            console.log('Poultry card clicked');
            if (window.app && window.app.selectLivestock) {
                window.app.selectLivestock('poultry');
            } else {
                // Emergency fallback
                document.getElementById('welcome-screen').classList.remove('active');
                document.getElementById('app-screen').classList.add('active');
                alert('Poultry management selected!');
            }
        });
    }
    
    // Fix backup button
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', function() {
            console.log('Backup button clicked');
            if (window.app && window.app.createBackup) {
                window.app.createBackup();
            } else {
                alert('Backup feature will work after app loads completely');
            }
        });
    }
    
    // Fix login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            console.log('Login button clicked');
            document.getElementById('auth-modal').classList.add('active');
        });
    }
    
    console.log('Emergency fixes applied');
});
