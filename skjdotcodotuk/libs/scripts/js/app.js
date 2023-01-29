console.log("Hello, there! My name is Scott. I am a Full Stack Developer who is currently on the lookout for entry-level opportunities within the coding and web development industry.");
console.log("Find me on LinkedIn: https://www.linkedin.com/in/scott-kenneth-jackson/");
console.log("View my GitHub profile: https://github.com/scottkennethjackson");


// When the user clicks the slider, toggle dark mode
const darkButton = document.querySelector(".slider-container");
const slider = document.querySelector(".slider");
const bodyCSS = document.body;

darkButton.addEventListener("click", function() {
    slider.classList.toggle("switch");
    bodyCSS.classList.toggle("dark");
});

// On load, calculate the illustration's dimensions and resize the canvas
window.addEventListener("load", resizeCanvas);

// On viewport resize, re-calculate the illustration's dimensions and resize the canvas
window.addEventListener("resize", resizeCanvas);

// Resize the canvas
function resizeCanvas() {
    let illustration = document.getElementById("illustration");
    let computedStyle = getComputedStyle(illustration);

    let width = parseInt(computedStyle.getPropertyValue("width"), 10);
    let height = parseInt(computedStyle.getPropertyValue("height"), 10);

    let canvas = document.getElementById("canvas");

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
        context.moveTo(lastEvent.offsetX, lastEvent.offsetY);
        context.lineTo(e.offsetX, e.offsetY);
        context.lineWidth = markerWidth;
        context.strokeStyle = marker;
        context.lineCap = "round";
        context.stroke();

        lastEvent = e;
    }
}).mouseup(function() {
    mouseDown = false;
}).mouseleave(function() {
    mouseDown = false;
});

// When the user clicks a skill box, reveal its skill description
$(".box").click(function() {
    let selectedBox = this.closest(".box");

    selectedBox.classList.toggle("show");
    selectedBox.addEventListener("mouseleave", function() {
        selectedBox.classList.remove("show")
    });
});

// When the user clicks send, check the form and handle accordingly
$("#contact-form").on("submit", function(e) {
    e.preventDefault();

    $(".status-notification").text("");

    submitForm();
});

function submitForm() {
    const name = $("#name");
    const email = $("#email");
    const message = $("#message");

    if (isNotEmpty(name) && isNotEmpty(email) && isNotEmpty(message)) {
        $.ajax({
            url: 'libs/scripts/php/mail.php',
            method: 'POST',
            dataType: 'json',
            data: {
                name: name.val(),
                email: email.val(),
                message: message.val(),
            },

            success: function() {
                $("#contact-form")[0].reset();
                $(".status-notification").text("Message sent. Thank you!");
                document.querySelector("#contact-form").classList.remove("was-validated");
                console.log("libs/scripts/php/mail.php: ajax call successful");
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(`libs/scripts/php/mail.php: ajax call failed ${textStatus} ${errorThrown} ${jqXHR}`);
            }
        });
    }
};

function isNotEmpty(caller) {
    if(caller.val() == "") {
        return false;
    } else {
        return true;
    }
};

// Disable form submission if there is an invalid field and notify the user
(function() {
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
            $(".status-notification").text("Please complete the required fields.");
          }
  
          form.classList.add('was-validated')
        }, false)
    })
});