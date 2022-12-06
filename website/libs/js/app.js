// When the user clicks the menu button, display the nav dropdown
const menuClick = document.querySelector("#menu-button");
const navDropdown = document.querySelector("#menu-container");

menuClick.addEventListener("click", function() {
    menuClick.classList.toggle("active");
    navDropdown.classList.toggle("visible");
});

// When the user clicks a nav button, reset the the menu button and dropdown
window.onclick = function(e) {
    if (e.target.matches(".nav-link")) {
        if (menuClick.classList.contains("active")) {
            menuClick.classList.remove("active");
        }
        if (navDropdown.classList.contains("visible")) {
            navDropdown.classList.remove("visible");
        }
    }
};

// When the user clicks the slider, activate dark mode
const darkButton = document.querySelector("#slider-container");
const slider = document.querySelector("#slider");
const navCSS = document.querySelector("#nav-container");
const menuCSS = document.querySelector("#menu-container");
const bodyCSS = document.querySelector("#scroll-container");
const carouselCSS = document.querySelector("#portfolio-carousel");

darkButton.addEventListener("click", function() {
    slider.classList.toggle("switch");
    navCSS.classList.toggle("dark");
    menuCSS.classList.toggle("dark");
    bodyCSS.classList.toggle("dark");
    carouselCSS.classList.toggle("carousel-dark");
});

// When the user leaves the nav menu, reset the menu button and dropdown
const navReset = document.querySelector("#navbar");

navReset.addEventListener("mouseleave", function() {
    menuClick.classList.remove("active");
    navDropdown.classList.remove("visible");
});

// On load, calculate the illustration's dimensions and resize the canvas accordingly
window.addEventListener("load", resizeCanvas);

// On window resize, re-calculate the illustration's dimensions and resize the canvas accordingly
window.addEventListener("resize", resizeCanvas);

// Resize the canvas
function resizeCanvas() {
    let img = document.getElementById("illustration");
    let cs = getComputedStyle(img);

    let width = parseInt(cs.getPropertyValue("width"), 10);
    let height = parseInt(cs.getPropertyValue("height"), 10);

    let canvas = document.getElementById("canvas")

    canvas.width = width;
    canvas.height = height;
};

// Allow the user to doodle on Esmé's illustration
let marker = "#1c1332";
let markerWidth = 4;

let lastEvent;
let mouseDown = false;

let context = $("#canvas")[0].getContext("2d");
let $canvas = $("#canvas");


$canvas.mousedown(function(e) {
    lastEvent = e;
    mouseDown = true;
    console.log(lastEvent);
}).mousemove(function(e) {
    if(mouseDown) {
        context.beginPath();
        
        context.moveTo(lastEvent.offsetX,lastEvent.offsetY);
        context.lineTo(e.offsetX,e.offsetY);
        context.lineWidth = markerWidth;
        context.strokeStyle = marker;
        context.lineCap="round";
        context.stroke();
        
        lastEvent = e;
    }
}).mouseup(function() {
    mouseDown = false; 
}).mouseleave(function() {
    mouseDown = false;
});

// When the user clicks send, check the form and handle accordingly
$("#contact-form").on("submit", function(e) {
    e.preventDefault();

    $(".status-notification").text("");

    submitForm();
})

function submitForm() {
    var name = $("#name");
    var email = $("#email");
    var message = $("#message");

    if(isNotEmpty(name) && isNotEmpty(email) && isNotEmpty(message)) {
        $.ajax({
            url: 'libs/php/mail.php',
            method: 'POST',
            dataType: 'json',
            data: {
                name: name.val(),
                email: email.val(),
                message: message.val()
            }, 
            success: function() {
                $("#contact-form")[0].reset();
                $(".status-notification").text("Message sent. Thank you!");
                document.querySelector("#contact-form").classList.remove("was-validated");
                console.log("libs/php/mail.php: ajax call successful");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/mail.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
            }
        });
    }
}

function isNotEmpty(caller) {
    if(caller.val() == "") {
        return false;
    } else {
        return true;
    }
}

// Disable form submissions if there are invalid fields and notify the user
(function () {
    'use strict'
  
    var forms = document.querySelectorAll('.needs-validation')
  
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
            $("#contact-form").addClass("animate__animated animate__headShake").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                $(this).removeClass("animate__animated animate__headShake");
            });
          }
  
          form.classList.add('was-validated')
        }, false)
    })
})();
