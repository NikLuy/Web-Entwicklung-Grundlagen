function showHobbies() {
    const hobbiesOutput = document.getElementById("hobbies-output");
    if (hobbiesOutput.innerHTML.trim() !== "") {
        hobbiesOutput.innerHTML = "";
        return;
    }

    hobbiesOutput.innerHTML = "<strong>Meine Hobbies:</strong> <ul><li>Wintersport</li><li>Kochen</li><li>Entwicklung</li></ul>";
}

function showContactInfo() {
    const contactOutput = document.getElementById("contact-output");
    if (contactOutput.innerHTML.trim() !== "") {
        contactOutput.innerHTML = "";
        return;
    }

    contactOutput.innerHTML = "<strong>Kontakt:</strong> <ul><li>Telefon: <a href=\"tel:+41791234567\">+41 79 123 45 67</a></li><li>E-Mail: <a href=\"mailto:nik.lussy@example.com\">nik.lussy@example.com</a></li></ul>";
}
