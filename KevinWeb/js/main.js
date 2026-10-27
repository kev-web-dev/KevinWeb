jQuery(document).ready(function () {
  "use strict";

  // --- Ripples effect on slider ---
  $(".slider").ripples({
    dropRadius: 11,
    perturbance: 0.01,
  });

  // --- Typed text animation ---
  $(".text").typed({
    strings: [
      "<strong>i love</strong><strong class='primary'> codings.</strong>",
      "<strong>and to</strong><strong class='primary'> share !!.</strong>",
    ],
    typespeed: 0,
    loop: true,
  });

  // --- Navbar shrink on scroll ---
  $(window).scroll(function () {
    var top = $(window).scrollTop();
    if (top > 60) {
      $("nav").addClass("secondary");
    } else {
      $("nav").removeClass("secondary");
    }
  });

  // --- Team carousel (single init) ---
  $("#team-members").owlCarousel({
    items: 3,
    autoplay: true,
    smartSpeed: 700,
    loop: true,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 1 },
      480: { items: 2 },
      768: { items: 3 },
    },
  });

  // --- Smooth scroll for all internal anchor links ---
  // Custom rAF-based easing keeps the animation silky, fully interruptible,
  // and free of the double-animation jank caused by combining CSS
  // `scroll-behavior: smooth` with jQuery's `.animate()`.
  function smoothScrollTo(targetY, duration) {
    var startY = window.pageYOffset || document.documentElement.scrollTop;
    var maxY =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    var endY = Math.max(0, Math.min(targetY, maxY));
    var diff = endY - startY;
    var startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function step(time) {
      if (startTime === null) startTime = time;
      var progress = Math.min((time - startTime) / duration, 1);
      window.scrollTo(0, startY + diff * easeInOutCubic(progress));
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  $('a[href^="#"]').on("click", function (e) {
    var target = $(this).attr("href");
    if (target && $(target).length) {
      e.preventDefault();
      smoothScrollTo($(target).offset().top - 50, 800);
    }
  });

  // --- Contact form: client-side validation and AJAX submission ---
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
      if ($alert.length === 0) {
        $alert = $("#form-alert");
      }
      $alert.removeClass("success error").addClass(type).text(msg).show();
      try {
        smoothScrollTo($alert.offset().top - 100, 300);
      } catch (ex) {}
    }

    if (!name) { showAlert("error", "Please enter your name."); return; }
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) { showAlert("error", "Please enter a valid email address."); return; }
    if (subject.length < 3) { showAlert("error", "Please enter a subject."); return; }
    if (message.length < 10) { showAlert("error", "Please enter a message (at least 10 characters)."); return; }

    var $btn = $form.find("button[type=submit]");
    var originalBtnText = $btn.text();
    $btn.prop("disabled", true).text("Sending...");

    var postData = { name: name, email: email, subject: subject, message: message, source: source };

    $.ajax({
      url: $form.attr("action"),
      method: "POST",
      data: postData,
      dataType: "json",
      timeout: 15000,
    })
      .done(function (resp) {
        if (resp && resp.success) {
          showAlert("success", resp.message || "Message sent successfully.");
          $form[0].reset();
          $btn.addClass("sent").text("Sent");
          setTimeout(function () { $btn.removeClass("sent").text(originalBtnText); }, 1700);
        } else {
          showAlert("error", resp.message || "An error occurred while sending your message.");
        }
      })
      .fail(function () {
        showAlert("error", "An error occurred. Please try again later.");
      })
      .always(function () {
        $btn.prop("disabled", false).text(originalBtnText);
      });
  });

  // --- Quick Contact modal open/close ---
  function openModal(subject) {
    var $modal = $("#quick-contact-modal");
    if (subject) $modal.find('[name="subject"]').val(subject);
    $modal.show().attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    $modal.find('[name="name"]').focus();
  }

  function closeModal() {
    var $modal = $("#quick-contact-modal");
    $modal.hide().attr("aria-hidden", "true");
    $("body").removeClass("modal-open");
    $modal.find(".form-alert").hide().text("");
  }

  $("#cta-quick").on("click", function (e) {
    e.preventDefault();
    openModal($(this).data("subject") || "");
  });

  $("#quick-contact-modal .modal-close, #quick-contact-modal .modal-overlay").on("click", function () {
    closeModal();
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Escape") { closeModal(); }
  });
});
