jQuery(document).ready(function ($) {
    "use strict";

    // ========== 1) TEAM CAROUSEL FIRST (must run even if other plugins fail) ==========
    // Owl hides .owl-carousel until .owl-loaded is added. If init never runs, section is blank.
    if ($("#team-members").length) {
        try {
            if ($.fn.owlCarousel) {
                $("#team-members").owlCarousel({
                    items: 3,
                    margin: 20,
                    autoplay: true,
                    autoplayTimeout: 4000,
                    smartSpeed: 700,
                    loop: true,
                    autoplayHoverPause: true,
                    nav: true,
                    dots: true,
                    navText: [
                        '<i class="fa fa-chevron-left"></i>',
                        '<i class="fa fa-chevron-right"></i>'
                    ],
                    mouseDrag: true,
                    touchDrag: true,
                    pullDrag: true,
                    responsive: {
                        0:   { items: 1 },
                        480: { items: 2 },
                        768: { items: 3 }
                    }
                });
            } else {
                // Owl not loaded – force visible fallback grid
                $("#team-members").addClass("team-fallback owl-loaded").css("display", "flex");
            }
        } catch (err) {
            console.warn("Team carousel error:", err);
            $("#team-members").addClass("team-fallback owl-loaded").css("display", "flex");
        }
    }

    // ========== 2) Smooth scroll ==========
    $("a.smooth-scroll").on("click", function (e) {
        e.preventDefault();
        var target = $(this).attr("href");
        if (target && $(target).length) {
            $("html, body").stop().animate({
                scrollTop: $(target).offset().top - 70
            }, 800);
        }
    });

    // ========== 3) Optional plugins (never block team) ==========
    try {
        if ($.fn.ripples) {
            $(".slider").ripples({
                dropRadius: 11,
                perturbance: 0.01
            });
        }
    } catch (err) {
        console.warn("ripples skipped:", err);
    }

    try {
        if ($.fn.typed) {
            $(".text").typed({
                strings: [
                    "<strong>KEEP MOVING FORWARD <strong class='primary'>TRUST THE PROCESS </strong></strong>",
                    "<strong>LET YOUR ACTIONS<strong class='primary'> SPEAK</strong>",
                    "<strong>BE PROUD OF YOUR JOURNEY <strong class='primary'> KEEP STRONGER </strong>"
                ],
                typeSpeed: 0,
                loop: true
            });
        }
    } catch (err) {
        console.warn("typed skipped:", err);
    }

    $(window).scroll(function () {
        var top = $(window).scrollTop();
        if (top >= 60) {
            $("nav").addClass("secondary");
        } else if ($("nav").hasClass("secondary")) {
            $("nav").removeClass("secondary");
        }
    });

    // magnificPopup is often NOT loaded – never call without check
    try {
        if ($.fn.magnificPopup) {
            $(".work").magnificPopup({
                delegate: "a",
                type: "image",
                gallery: { enabled: true }
            });
        }
    } catch (err) {
        console.warn("magnificPopup skipped:", err);
    }

    try {
        if ($.fn.counterUp) {
            $(".counter").counterUp({
                delay: 10,
                time: 4000
            });
        }
    } catch (err) {
        console.warn("counterUp skipped:", err);
    }

    // Reviews: touch swipe
    (function () {
        var $carousel = $("#carousel-testimonials");
        if (!$carousel.length) return;
        var startX = 0, endX = 0;
        $carousel.on("touchstart", function (e) {
            startX = e.originalEvent.touches[0].clientX;
        });
        $carousel.on("touchmove", function (e) {
            endX = e.originalEvent.touches[0].clientX;
        });
        $carousel.on("touchend", function () {
            var diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) $carousel.carousel("next");
                else $carousel.carousel("prev");
            }
            startX = endX = 0;
        });
    })();

    // CTA contact
    $("#cta-contact").on("click", function (e) {
        e.preventDefault();
        var href = $(this).attr("href");
        var section = $(href);
        if (!section.length) return;
        var subj = $(this).data("subject") || "";
        $("html, body").animate({
            scrollTop: section.offset().top
        }, 1250, function () {
            if (subj) $("#subject").val(subj);
            $("#name").focus();
        });
    });

    try {
        if (typeof WOW !== "undefined") {
            new WOW().init();
        }
    } catch (err) {
        console.warn("WOW skipped:", err);
    }

    // Contact form
    $(".contact-form").on("submit", function (e) {
        e.preventDefault();
        var $form = $(this);
        var $alert = $form.find(".form-alert");
        var name = $.trim($form.find('[name="name"]').val());
        var email = $.trim($form.find('[name="email"]').val());
        var subject = $.trim($form.find('[name="subject"]').val());
        var message = $.trim($form.find('[name="message"]').val());
        var source = $form.find('[name="source"]').val() || "inline";

        function showAlert(type, msg) {
            if ($alert.length === 0) $alert = $("#form-alert");
            $alert.removeClass("success error").addClass(type).text(msg).show();
            try {
                $("html,body").animate({ scrollTop: $alert.offset().top - 100 }, 300);
            } catch (e) {}
        }

        if (!name) {
            showAlert("error", "Please enter your name.");
            return;
        }
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailPattern.test(email)) {
            showAlert("error", "Please enter a valid email address.");
            return;
        }
        if (subject.length < 3) {
            showAlert("error", "Please enter a subject.");
            return;
        }
        if (message.length < 10) {
            showAlert("error", "Please enter a message (at least 10 characters).");
            return;
        }

        var $btn = $form.find("button[type=submit]");
        var originalBtnText = $btn.text();
        $btn.prop("disabled", true).text("Sending...");

        var postData = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            source: source
        };

        $.ajax({
            url: $form.attr("action"),
            method: "POST",
            data: postData,
            dataType: "json",
            timeout: 15000
        })
            .done(function (resp) {
                if (resp && resp.success) {
                    showAlert("success", resp.message || "Message sent successfully.");
                    $form[0].reset();
                    $btn.addClass("sent").text("Sent");
                    setTimeout(function () {
                        $btn.removeClass("sent").text(originalBtnText);
                    }, 1700);
                } else {
                    showAlert("error", (resp && resp.message) || "An error occurred while sending your message.");
                }
            })
            .fail(function () {
                showAlert("error", "An error occurred while sending your message. Please try again later.");
            })
            .always(function () {
                $btn.prop("disabled", false).text(originalBtnText);
            });
    });
});

// Blog card hover (safe even if no cards)
document.addEventListener("DOMContentLoaded", function () {
    var cards = document.querySelectorAll(".latest-news-wrap");
    cards.forEach(function (card) {
        var newsImg = card.querySelector(".news-img");
        if (!newsImg) return;
        card.addEventListener("mouseenter", function () {
            newsImg.classList.add("hovered");
        });
        card.addEventListener("mouseleave", function () {
            newsImg.classList.remove("hovered");
        });
    });
});
