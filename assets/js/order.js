// Formular-Validierung mit JavaScript

const form = document.getElementById('exerciseForm');
const dataDisplay = document.getElementById('dataDisplay');
const displayContent = document.getElementById('displayContent');

// Formular-Felder
const nameField = document.getElementById('name');
const passwordField = document.getElementById('password');
const agbField = document.getElementById('agb');
const datenschutzField = document.getElementById('datenschutz');
const fileUploadField = document.getElementById('fileUpload');

// Fehlermeldungen anzeigen
function showErrorMessage(messages, firstErrorField) {
  let errorContainer = document.getElementById('formErrorMessages');
  
  if (!errorContainer) {
    errorContainer = document.createElement('div');
    errorContainer.id = 'formErrorMessages';
    errorContainer.className = 'form-error-message';
    form.insertBefore(errorContainer, form.firstChild);
  }
  
  let errorHTML = '<h3>Formular-Validierung fehlgeschlagen:</h3>';
  errorHTML += '<ul>';
  messages.forEach(msg => {
    errorHTML += `<li>${msg}</li>`;
  });
  errorHTML += '</ul>';
  
  errorContainer.className = 'form-error-message';
  errorContainer.innerHTML = errorHTML;
  errorContainer.style.display = 'block';
  
  errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
}

function showSuccessMessage(message) {
  let successContainer = document.getElementById('formSuccessMessage');
  
  if (!successContainer) {
    successContainer = document.createElement('div');
    successContainer.id = 'formSuccessMessage';

    form.parentNode.insertBefore(successContainer, form.nextSibling);
  }
  
  successContainer.className = 'form-success-message';
  successContainer.innerHTML = `<h3>${message}</h3>`;
  successContainer.style.display = 'block';
  successContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideErrorMessage() {
  const errorContainer = document.getElementById('formErrorMessages');
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
}

function hideSuccessMessage() {
  const successContainer = document.getElementById('formSuccessMessage');
  if (successContainer) {
    successContainer.style.display = 'none';
  }
}

// Validierungs-Funktionen

function validateName() {
  const name = nameField.value.trim();
  
  if (name === '') {
    return { 
      isValid: false, 
      errorMessage: 'Das Namensfeld darf nicht leer sein',
      field: nameField
    };
  }
  
  return { isValid: true, errorMessage: '', field: nameField };
}

function validatePassword() {
  const password = passwordField.value;
  
  if (password.length < 6) {
    return { 
      isValid: false, 
      errorMessage: 'Das Passwort muss mindestens 6 Zeichen lang sein',
      field: passwordField
    };
  }
  
  return { isValid: true, errorMessage: '', field: passwordField };
}

function validateDelivery() {
  const deliverySelected = document.querySelector('input[name="delivery"]:checked');
  const deliveryField = document.querySelector('input[name="delivery"]');
  
  if (!deliverySelected) {
    return { 
      isValid: false, 
      errorMessage: 'Eine Lieferoption muss ausgewählt sein',
      field: deliveryField
    };
  }
  
  return { isValid: true, errorMessage: '', field: deliveryField };
}

function validateCheckboxes() {
  const agb = agbField.checked;
  const datenschutz = datenschutzField.checked;
  
  if (!agb && !datenschutz) {
    return { 
      isValid: false, 
      errorMessage: 'Beide Checkboxen (AGB und Datenschutz) müssen aktiviert sein',
      field: agbField
    };
  }
  
  if (!agb) {
    return { 
      isValid: false, 
      errorMessage: 'Die AGB müssen akzeptiert werden',
      field: agbField
    };
  }
  
  if (!datenschutz) {
    return { 
      isValid: false, 
      errorMessage: 'Die Datenschutzrichtlinien müssen akzeptiert werden',
      field: datenschutzField
    };
  }
  
  return { isValid: true, errorMessage: '', field: null };
}

function validateForm() {
  let isValid = true;
  let errorMessages = [];
  let firstErrorField = null;
  
  // Fehlerklassen zurücksetzen
  document.querySelectorAll('input, textarea, select').forEach(field => {
    field.classList.remove('field-error');
  });
  
  const validators = [
    validateName,
    validatePassword,
    validateDelivery,
    validateCheckboxes
  ];
  
  // Alle Validierungen prüfen
  validators.forEach(validator => {
    const result = validator();
    if (!result.isValid) {
      errorMessages.push(result.errorMessage);
      isValid = false;
      
      // Erstes Fehlerfeld merken
      if (!firstErrorField && result.field) {
        firstErrorField = result.field;
      }
    }
  });
  
  // Fehler anzeigen falls vorhanden
  if (!isValid) {
    showErrorMessage(errorMessages, firstErrorField);
  } else {
    hideErrorMessage();
  }
  
  return isValid;
}

// Eingegebene Daten anzeigen
function displayFormData() {
  const formData = new FormData(form);
  const file = fileUploadField.files[0];
  
  const deliveryTexts = {
    'standard': 'Standard-Versand (3-5 Werktage)',
    'express': 'Express-Versand (1-2 Werktage)',
    'pickup': 'Selbstabholung'
  };
  
  // Dateiinfo mit Bildvorschau vorbereiten
  let fileDisplay = 'keine';
  if (file) {
    fileDisplay = file.name + ' (' + (file.size / 1024).toFixed(2) + ' KB)';
    if (file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      fileDisplay += '<br><img src="' + imageUrl + '" alt="Hochgeladenes Bild" style="max-width: 300px; margin-top: 10px; border-radius: 8px;">';
    }
  }
  
  const html = `
    <h3>Zusammenfassung Ihrer Eingaben:</h3>
    <table>
      <tr><td><strong>Name:</strong></td><td>${formData.get('name')}</td></tr>
      <tr><td><strong>Passwort:</strong></td><td>${'*'.repeat(formData.get('password').length)} (${formData.get('password').length} Zeichen)</td></tr>
      <tr><td><strong>Kommentare:</strong></td><td>${formData.get('comments') || '(keine Kommentare)'}</td></tr>
      <tr><td><strong>Lieferoption:</strong></td><td>${deliveryTexts[formData.get('delivery')]}</td></tr>
      <tr><td><strong>AGB akzeptiert:</strong></td><td>Ja</td></tr>
      <tr><td><strong>Datenschutz akzeptiert:</strong></td><td>Ja</td></tr>
      <tr><td><strong>Datei:</strong></td><td>${fileDisplay}</td></tr>
    </table>
  `;
  
  displayContent.innerHTML = html;
  dataDisplay.style.display = 'block';
  
  setTimeout(() => {
    dataDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

// Formular abschicken
form.addEventListener('submit', function(event) {
  event.preventDefault();
  
  if (validateForm()) {
    showSuccessMessage('Formular erfolgreich validiert! Alle Felder korrekt ausgefüllt.');
    
    // Daten anzeigen
    displayFormData();
    
    console.log('Formulardaten:', new FormData(form));
  }
});

//Reset nach eingabe
form.addEventListener('input', function(event) {
  const errorContainer = document.getElementById('formErrorMessages');
  if (errorContainer && errorContainer.style.display !== 'none') {
    // Fehlermeldung ausblenden
    setTimeout(() => hideErrorMessage(), 1000);
  }
  
  // Erfolgsmeldung und Daten ausblenden
  hideSuccessMessage();
  if (dataDisplay) {
    dataDisplay.style.display = 'none';
  }
  
  // Fehlerklasse vom Feld entfernen
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    event.target.classList.remove('field-error');
  }
});

// Änderungen bei Checkboxen und Radio-Buttons
form.addEventListener('change', function(event) {
  if (event.target.type === 'checkbox' || event.target.type === 'radio') {
    const errorContainer = document.getElementById('formErrorMessages');
    if (errorContainer && errorContainer.style.display !== 'none') {
      setTimeout(() => hideErrorMessage(), 1000);
    }
    // Erfolgsmeldung und Daten ausblenden
    hideSuccessMessage();
    if (dataDisplay) {
      dataDisplay.style.display = 'none';
    }
  }
});

console.log('Formular-Validierung geladen');
