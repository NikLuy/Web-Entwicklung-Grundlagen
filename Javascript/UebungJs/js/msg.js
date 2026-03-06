/**
 * Comprehensive Messaging & Logging Demo
 * Zeigt alle Möglichkeiten, Nachrichten anzuzeigen und zu loggen
 */

// Globales Logging-System
const Logger = {
    logs: [],
    counts: {
        log: 0,
        info: 0,
        warn: 0,
        error: 0,
        debug: 0,
        success: 0
    },

    // Log-Eintrag erstellen
    createEntry(level, message, data = null) {
        const timestamp = new Date().toLocaleTimeString('de-DE');
        const entry = {
            level,
            timestamp,
            message,
            data,
            stackTrace: new Error().stack
        };
        this.logs.push(entry);
        this.counts[level]++;
        this.updateStats();
        this.displayLog(entry);
        return entry;
    },

    // Log im Display anzeigen
    displayLog(entry) {
        const logDisplay = document.getElementById('logDisplay');
        if (!logDisplay) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${entry.level}`;
        
        let content = `<span class="log-timestamp">[${entry.timestamp}]</span>`;
        content += `<strong>[${entry.level.toUpperCase()}]</strong> ${entry.message}`;
        
        if (entry.data) {
            content += `<br><pre style="margin-left: 20px; margin-top: 5px;">${JSON.stringify(entry.data, null, 2)}</pre>`;
        }
        
        logEntry.innerHTML = content;
        logDisplay.insertBefore(logEntry, logDisplay.firstChild);
        
        // Automatisches Scrollen
        if (logDisplay.children.length > 100) {
            logDisplay.removeChild(logDisplay.lastChild);
        }
    },

    // Statistiken aktualisieren
    updateStats() {
        document.getElementById('logCount').textContent = this.counts.log;
        document.getElementById('infoCount').textContent = this.counts.info;
        document.getElementById('warnCount').textContent = this.counts.warn;
        document.getElementById('errorCount').textContent = this.counts.error;
        document.getElementById('successCount').textContent = this.counts.success;
    },

    // Verschiedene Log-Level
    log(message, data) {
        console.log(message, data || '');
        return this.createEntry('log', message, data);
    },

    info(message, data) {
        console.info(message, data || '');
        return this.createEntry('info', message, data);
    },

    warn(message, data) {
        console.warn(message, data || '');
        return this.createEntry('warn', message, data);
    },

    error(message, data) {
        console.error(message, data || '');
        return this.createEntry('error', message, data);
    },

    debug(message, data) {
        console.debug(message, data || '');
        return this.createEntry('debug', message, data);
    },

    success(message, data) {
        console.log('%c' + message, 'color: green; font-weight: bold;', data || '');
        return this.createEntry('success', message, data);
    },

    // Logs löschen
    clear() {
        this.logs = [];
        this.counts = { log: 0, info: 0, warn: 0, error: 0, debug: 0, success: 0 };
        this.updateStats();
        const logDisplay = document.getElementById('logDisplay');
        if (logDisplay) logDisplay.innerHTML = '';
        console.clear();
    },

    // Logs exportieren
    export() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs_${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.success('Logs exportiert', { count: this.logs.length });
    }
};

// Haupt-Demo-Objekt
const msgDemo = {
    
    // ========== CONSOLE LOGGING ==========
    
    consoleLog() {
        console.log('Dies ist eine einfache Log-Nachricht');
        console.log('Mehrere Werte:', 42, true, { name: 'Test' });
        console.log('%cStylierte Nachricht', 'color: blue; font-size: 20px; font-weight: bold;');
        Logger.log('console.log() Demo ausgeführt');
    },

    consoleInfo() {
        console.info('ℹ️ Dies ist eine Info-Nachricht');
        console.info('Systeminfo:', navigator.userAgent);
        Logger.info('console.info() Demo ausgeführt');
    },

    consoleWarn() {
        console.warn('⚠️ Dies ist eine Warnung!');
        console.warn('Veraltete Funktion wird verwendet');
        Logger.warn('console.warn() Demo ausgeführt');
    },

    consoleError() {
        console.error('❌ Dies ist eine Fehlermeldung!');
        console.error('Fehlerdetails:', { code: 500, message: 'Interner Serverfehler' });
        Logger.error('console.error() Demo ausgeführt');
    },

    consoleDebug() {
        console.debug('🐛 Debug-Information');
        console.debug('Variable Werte:', { x: 10, y: 20, result: 30 });
        Logger.debug('console.debug() Demo ausgeführt');
    },

    consoleTable() {
        const users = [
            { id: 1, name: 'Max Mustermann', email: 'max@example.com', role: 'Admin' },
            { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', role: 'User' },
            { id: 3, name: 'Tom Weber', email: 'tom@example.com', role: 'Moderator' }
        ];
        console.table(users);
        Logger.info('console.table() Demo - Tabelle in Konsole anzeigen', { rows: users.length });
    },

    consoleGroup() {
        console.group('👥 Benutzer-Gruppe');
        console.log('Benutzer 1: Max');
        console.log('Benutzer 2: Anna');
        console.group('Untergruppe');
        console.log('Details...');
        console.groupEnd();
        console.groupEnd();
        
        console.groupCollapsed('📦 Eingeklappte Gruppe');
        console.log('Diese Gruppe ist standardmäßig eingeklappt');
        console.groupEnd();
        
        Logger.info('console.group() Demo ausgeführt');
    },

    consoleTime() {
        console.time('Operation');
        
        // Simuliere eine Berechnung
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
            sum += i;
        }
        
        console.timeEnd('Operation');
        Logger.info('console.time() Demo - Performance gemessen', { result: sum });
    },

    consoleTrace() {
        function level3() {
            console.trace('Stack Trace von level3()');
        }
        function level2() {
            level3();
        }
        function level1() {
            level2();
        }
        level1();
        Logger.debug('console.trace() Demo - Call Stack in Konsole');
    },

    // ========== BROWSER DIALOGS ==========
    
    showAlert() {
        Logger.info('Zeige alert() Dialog');
        alert('Dies ist eine Alert-Nachricht!\n\nAlert blockiert die JavaScript-Ausführung bis der Benutzer OK klickt.');
        Logger.log('Alert wurde geschlossen');
    },

    showConfirm() {
        Logger.info('Zeige confirm() Dialog');
        const result = confirm('Möchten Sie fortfahren?\n\nKlicken Sie OK oder Abbrechen.');
        if (result) {
            Logger.success('Benutzer hat bestätigt');
            this.showToast('success', 'Bestätigt', 'Sie haben OK geklickt');
        } else {
            Logger.warn('Benutzer hat abgebrochen');
            this.showToast('warning', 'Abgebrochen', 'Sie haben Abbrechen geklickt');
        }
    },

    showPrompt() {
        Logger.info('Zeige prompt() Dialog');
        const name = prompt('Wie ist Ihr Name?', 'Max Mustermann');
        if (name !== null && name !== '') {
            Logger.success('Benutzereingabe erhalten', { name });
            this.showToast('success', 'Willkommen!', `Hallo ${name}!`);
        } else {
            Logger.warn('Prompt abgebrochen oder leer');
        }
    },

    // ========== TOAST NOTIFICATIONS ==========
    
    showToast(type, title, message) {
        Logger.info(`Toast angezeigt: ${type}`, { title, message });
        
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div>
                <strong>${title}</strong><br>
                <span style="font-size: 12px;">${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove nach 5 Sekunden
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    },

    // ========== CUSTOM MESSAGE DISPLAY ==========
    
    displayMessage(type, title, message) {
        Logger.info(`Nachricht angezeigt: ${type}`, { title, message });
        
        const display = document.getElementById('messageDisplay');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            padding: 15px;
            margin-bottom: 10px;
            border-left: 5px solid ${colors[type]};
            background: ${colors[type]}15;
            border-radius: 5px;
            animation: slideIn 0.3s ease;
        `;
        
        msgDiv.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="font-size: 24px; margin-right: 10px;">${icons[type]}</span>
                <div>
                    <strong style="color: ${colors[type]}; font-size: 16px;">${title}</strong><br>
                    <span style="color: #666;">${message}</span>
                </div>
            </div>
        `;
        
        display.appendChild(msgDiv);
        
        // Auto-remove nach 10 Sekunden
        setTimeout(() => msgDiv.remove(), 10000);
    },

    clearMessages() {
        document.getElementById('messageDisplay').innerHTML = '';
        Logger.log('Nachrichten gelöscht');
    },

    // ========== MODAL DIALOGS ==========
    
    showModal() {
        Logger.info('Modal geöffnet');
        document.getElementById('customModal').style.display = 'block';
    },

    closeModal() {
        Logger.info('Modal geschlossen');
        document.getElementById('customModal').style.display = 'none';
    },

    handleModalAction(action) {
        Logger.success('Modal-Aktion ausgeführt', { action });
        this.showToast('success', 'Aktion ausgeführt', `Sie haben "${action}" gewählt`);
        this.closeModal();
    },

    // ========== FORM VALIDATION ==========
    
    validateAndSubmit() {
        Logger.info('Formularvalidierung gestartet');
        
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const message = document.getElementById('userMessage').value.trim();
        
        const errors = [];
        
        // Validierung
        if (!name) {
            errors.push('Name ist erforderlich');
            Logger.warn('Validierung fehlgeschlagen: Name fehlt');
        } else {
            Logger.log('Name validiert', { name });
        }
        
        if (!email) {
            errors.push('E-Mail ist erforderlich');
            Logger.warn('Validierung fehlgeschlagen: E-Mail fehlt');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('E-Mail ist ungültig');
            Logger.warn('Validierung fehlgeschlagen: E-Mail ungültig', { email });
        } else {
            Logger.log('E-Mail validiert', { email });
        }
        
        if (!message) {
            errors.push('Nachricht ist erforderlich');
            Logger.warn('Validierung fehlgeschlagen: Nachricht fehlt');
        } else {
            Logger.log('Nachricht validiert', { length: message.length });
        }
        
        // Ergebnis anzeigen
        if (errors.length > 0) {
            Logger.error('Formular-Validierung fehlgeschlagen', { errors });
            this.displayMessage('error', 'Validierungsfehler', errors.join(', '));
            this.showToast('error', 'Fehler', 'Bitte korrigieren Sie die Fehler');
        } else {
            Logger.success('Formular erfolgreich validiert', { name, email });
            this.displayMessage('success', 'Erfolgreich!', 'Ihr Formular wurde gesendet.');
            this.showToast('success', 'Gesendet', 'Ihre Nachricht wurde übermittelt');
            
            // Formular zurücksetzen
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userMessage').value = '';
        }
    },

    // ========== ADVANCED LOGGING ==========
    
    logObject() {
        const user = {
            id: 1,
            name: 'Max Mustermann',
            email: 'max@example.com',
            address: {
                street: 'Hauptstraße 1',
                city: 'Berlin',
                zip: '10115'
            },
            hobbies: ['Programmieren', 'Lesen', 'Sport']
        };
        
        console.log('Objekt:', user);
        console.dir(user);
        Logger.log('Objekt geloggt', user);
    },

    logArray() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const fruits = ['Apfel', 'Banane', 'Orange', 'Erdbeere'];
        
        console.log('Arrays:');
        console.log('Zahlen:', numbers);
        console.log('Früchte:', fruits);
        
        // Array-Methoden loggen
        console.log('Summe:', numbers.reduce((a, b) => a + b, 0));
        console.log('Gerade Zahlen:', numbers.filter(n => n % 2 === 0));
        
        Logger.log('Arrays geloggt', { numbers, fruits });
    },

    logFormatted() {
        console.log('%c Formatiertes Logging', 'background: #222; color: #bada55; font-size: 20px; padding: 10px;');
        console.log('%cErfolg', 'color: green; font-weight: bold;', '✓ Operation erfolgreich');
        console.log('%cFehler', 'color: red; font-weight: bold;', '✗ Operation fehlgeschlagen');
        console.log('%cInfo %cwichtige %cInformation', 
            'color: blue;', 
            'color: red; font-weight: bold;', 
            'color: green;'
        );
        Logger.info('Formatierte Logs in Konsole angezeigt');
    },

    logStackTrace() {
        function deepFunction() {
            console.trace('Stack Trace von deepFunction()');
            Logger.debug('Stack Trace erstellt');
        }
        
        function middleFunction() {
            deepFunction();
        }
        
        function topFunction() {
            middleFunction();
        }
        
        topFunction();
    },

    logPerformance() {
        Logger.info('Performance-Messung gestartet');
        
        // Performance-Messung mit console.time
        console.time('Array-Operation');
        const arr = Array.from({ length: 100000 }, (_, i) => i);
        const doubled = arr.map(x => x * 2);
        console.timeEnd('Array-Operation');
        
        // Performance-Messung mit Performance API
        const start = performance.now();
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
            sum += i;
        }
        const end = performance.now();
        
        const duration = (end - start).toFixed(2);
        console.log(`Performance: ${duration}ms für 1.000.000 Iterationen`);
        Logger.success('Performance gemessen', { duration: `${duration}ms`, result: sum });
        
        this.showToast('info', 'Performance', `Ausführungszeit: ${duration}ms`);
    },

    exportLogs() {
        Logger.export();
    },

    // ========== ERROR HANDLING ==========
    
    triggerError() {
        try {
            Logger.warn('Fehler wird absichtlich ausgelöst');
            throw new Error('Dies ist ein absichtlich ausgelöster Fehler!');
        } catch (error) {
            console.error('Fehler abgefangen:', error);
            console.error('Fehler-Stack:', error.stack);
            Logger.error('Fehler aufgetreten', { 
                message: error.message,
                stack: error.stack 
            });
            this.showToast('error', 'Fehler!', error.message);
        }
    },

    tryCatchExample() {
        Logger.info('Try-Catch Beispiel gestartet');
        
        try {
            console.log('Versuche unsichere Operation...');
            const obj = null;
            console.log(obj.property); // Dies wird einen Fehler auslösen
            
        } catch (error) {
            console.error('Fehler abgefangen:', error.message);
            Logger.error('Fehler in Try-Catch', { error: error.message });
            this.displayMessage('error', 'Fehler abgefangen', 
                `Ein Fehler wurde abgefangen: ${error.message}`);
            
        } finally {
            console.log('Finally-Block wird immer ausgeführt');
            Logger.log('Finally-Block ausgeführt');
        }
    },

    customErrorExample() {
        class ValidationError extends Error {
            constructor(message, field) {
                super(message);
                this.name = 'ValidationError';
                this.field = field;
                this.timestamp = new Date().toISOString();
            }
        }
        
        try {
            Logger.info('Custom Error Beispiel');
            throw new ValidationError('Ungültiger Wert', 'email');
        } catch (error) {
            if (error instanceof ValidationError) {
                console.error('Validierungsfehler:', {
                    name: error.name,
                    message: error.message,
                    field: error.field,
                    timestamp: error.timestamp
                });
                Logger.error('Custom Error gefangen', error);
                this.showToast('error', 'Validierungsfehler', `Feld: ${error.field}`);
            }
        }
    },

    // ========== UTILITY FUNCTIONS ==========
    
    clearLogs() {
        Logger.clear();
        this.showToast('info', 'Geleert', 'Alle Logs wurden gelöscht');
    },

    // ========== COMPREHENSIVE DEMO ==========
    
    async testAllFeatures() {
        Logger.info('🚀 Umfassender Feature-Test gestartet');
        
        // 1. Console Logs
        console.group('📋 Console Logging Tests');
        console.log('Standard Log');
        console.info('Info Log');
        console.warn('Warning Log');
        console.error('Error Log');
        console.debug('Debug Log');
        console.groupEnd();
        
        await this.delay(500);
        
        // 2. Toast Notifications
        Logger.info('Teste Toast-Benachrichtigungen');
        this.showToast('info', 'Test gestartet', 'Alle Features werden getestet...');
        
        await this.delay(1000);
        this.showToast('success', 'Phase 1', 'Console Logging abgeschlossen');
        
        await this.delay(1000);
        this.showToast('warning', 'Phase 2', 'Teste Benachrichtigungen...');
        
        await this.delay(1000);
        
        // 3. Custom Messages
        Logger.info('Teste benutzerdefinierte Nachrichten');
        this.displayMessage('info', 'Test läuft', 'Alle Messaging-Systeme werden getestet');
        
        await this.delay(1000);
        this.displayMessage('success', 'Erfolgreich', 'Alle Tests abgeschlossen!');
        
        // 4. Performance Test
        Logger.info('Teste Performance-Messung');
        console.time('Test-Suite');
        for (let i = 0; i < 100000; i++) {
            // Simuliere Arbeit
        }
        console.timeEnd('Test-Suite');
        
        // 5. Objekt- und Array-Logging
        const testData = {
            timestamp: new Date().toISOString(),
            testResults: ['Console Logs', 'Toasts', 'Messages', 'Performance'],
            success: true,
            metrics: {
                totalTests: 4,
                passed: 4,
                failed: 0
            }
        };
        
        console.table(testData.testResults);
        Logger.success('Alle Features getestet', testData);
        
        await this.delay(1000);
        this.showToast('success', 'Abgeschlossen!', 'Alle Features wurden erfolgreich demonstriert');
    },

    // Hilfsfunktion für Verzögerungen
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ========== GLOBAL ERROR HANDLER ==========

window.addEventListener('error', (event) => {
    console.error('Globaler Fehler abgefangen:', event.error);
    Logger.error('Unbehandelter Fehler', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unbehandelte Promise-Ablehnung:', event.reason);
    Logger.error('Unhandled Promise Rejection', { reason: event.reason });
});

// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {
    Logger.success('Messaging & Logging Demo geladen');
    console.log('%c🚀 Messaging & Logging Demo bereit!', 
        'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; font-size: 16px; border-radius: 5px;');
    console.log('Verfügbare Objekte:', { Logger, msgDemo });
    console.log('Öffnen Sie diese Konsole, um alle Logging-Funktionen zu sehen!');
});

// ========== ADDITIONAL LOGGING UTILITIES ==========

// Wrapper für console mit automatischem Logging
const log = {
    debug: (msg, data) => Logger.debug(msg, data),
    info: (msg, data) => Logger.info(msg, data),
    warn: (msg, data) => Logger.warn(msg, data),
    error: (msg, data) => Logger.error(msg, data),
    success: (msg, data) => Logger.success(msg, data),
    
    // Bedingte Logs
    assert: (condition, message) => {
        console.assert(condition, message);
        if (!condition) {
            Logger.error('Assertion fehlgeschlagen', { message });
        }
    },
    
    // Zähler
    count: (label = 'default') => {
        console.count(label);
        Logger.log(`Counter: ${label}`);
    },
    
    countReset: (label = 'default') => {
        console.countReset(label);
        Logger.log(`Counter zurückgesetzt: ${label}`);
    }
};

// Export für globale Verwendung
window.Logger = Logger;
window.msgDemo = msgDemo;
window.log = log;