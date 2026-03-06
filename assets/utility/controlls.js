/**
 * Reusable Modal Alert Library
 * Usage: showModal('info', 'Your message here')
 *        showModal('warning', 'Warning message')
 *        showModal('error', 'Error message')
 */

const ModalAlert = {
    types: {
        info: {
            icon: 'ℹ️',
            title: 'Information'
        },
        warning: {
            icon: '⚠️',
            title: 'Warnung'
        },
        error: {
            icon: '❌',
            title: 'Fehler'
        }
    },

    show: function(type, message) {
        // Modal erstellen falls nicht vorhanden
        if (!document.getElementById('modal-alert')) {
            this.createModal();
        }

        const modal = document.getElementById('modal-alert');
        const modalBox = modal.querySelector('.modal-box');
        const icon = modal.querySelector('.modal-icon');
        const title = modal.querySelector('.modal-title');
        const content = modal.querySelector('.modal-content');

        // Type validieren
        if (!this.types[type]) {
            type = 'info';
        }

        // Inhalt setzen
        icon.textContent = this.types[type].icon;
        title.textContent = this.types[type].title;
        content.textContent = message;

        // Type-Klasse setzen
        modalBox.className = 'modal-box modal-' + type;

        // Modal anzeigen
        modal.classList.add('show');
    },

    hide: function() {
        const modal = document.getElementById('modal-alert');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    createModal: function() {
        const modalHTML = `
            <div id="modal-alert" class="modal-overlay">
                <div class="modal-box">
                    <div class="modal-header">
                        <span class="modal-icon"></span>
                        <h2 class="modal-title"></h2>
                    </div>
                    <div class="modal-content"></div>
                    <div class="modal-footer">
                        <button class="modal-btn" onclick="ModalAlert.hide()">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Click außerhalb schließt Modal
        document.getElementById('modal-alert').addEventListener('click', function(e) {
            if (e.target === this) {
                ModalAlert.hide();
            }
        });
    }
};

// Kurze Alias-Funktionen für einfachere Nutzung
function showModal(type, message) {
    ModalAlert.show(type, message);
}

function showInfo(message) {
    ModalAlert.show('info', message);
}

function showWarning(message) {
    ModalAlert.show('warning', message);
}

function showError(message) {
    ModalAlert.show('error', message);
}
