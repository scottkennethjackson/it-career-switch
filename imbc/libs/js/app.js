const menuButton = document.querySelector(".menu-button");
const dropdown = document.querySelector(".dropdown");

menuButton.addEventListener("click", function() {
    menuButton.classList.toggle("active");
    dropdown.classList.toggle("visible");
});

window.onclick = function(e) {
    if (e.target.matches(".nav-link")) {
        if (menuButton.classList.contains("active")) {
            menuButton.classList.remove("active");
        }

        if (dropdown.classList.contains("visible")) {
            dropdown.classList.remove("visible");
        }
    }
};

const navReset = document.querySelector(".navbar");

navReset.addEventListener("mouseleave", function() {
    menuButton.classList.remove("active");
    dropdown.classList.remove("visible");
});