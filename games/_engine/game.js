/* محرك ألعاب منصة كنوز — جافاسكربت خالص بلا مكتبات خارجية */
(function () {
  "use strict";
  var data = window.KONOOZ_GAME;
  if (!data || !data.questions || !data.questions.length) {
    document.body.innerHTML = '<p style="text-align:center;padding:40px">خطأ في تحميل اللعبة</p>';
    return;
  }
  var qs = data.questions;
  var i = 0, score = 0, locked = false;

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function startScreen() {
    document.getElementById("app").innerHTML =
      '<div class="g-brand">منصة كنوز — konozq.com</div>' +
      '<h1 class="g-title">' + esc(data.title) + '</h1>' +
      '<p class="g-sub">' + esc(data.subtitle || "") + '</p>' +
      '<p class="g-msg g-center">' + qs.length + ' أسئلة سريعة… أجب بسرعة ودقة!</p>' +
      '<div class="g-center" style="margin-top:18px"><button class="g-btn" id="startBtn">ابدأ اللعب</button></div>' +
      '<p class="g-foot"><a href="https://konozq.com/">العودة إلى المنصة</a></p>';
    document.getElementById("startBtn").onclick = function () { i = 0; score = 0; renderQ(); };
  }

  function renderQ() {
    locked = false;
    var q = qs[i];
    var pct = Math.round((i / qs.length) * 100);
    var optsHtml = "";
    for (var k = 0; k < q.options.length; k++) {
      optsHtml += '<button class="g-opt" data-k="' + k + '">' + esc(q.options[k]) + '</button>';
    }
    document.getElementById("app").innerHTML =
      '<div class="g-progress"><div style="width:' + pct + '%"></div></div>' +
      '<div class="g-qnum">السؤال ' + (i + 1) + ' من ' + qs.length + '</div>' +
      '<div class="g-question">' + esc(q.q) + '</div>' +
      '<div class="g-opts">' + optsHtml + '</div>' +
      '<div class="g-feedback" id="fb"></div>';
    var btns = document.querySelectorAll(".g-opt");
    for (var b = 0; b < btns.length; b++) {
      btns[b].onclick = function () { answer(parseInt(this.getAttribute("data-k"), 10), this); };
    }
  }

  function answer(k, btn) {
    if (locked) return;
    locked = true;
    var q = qs[i];
    var btns = document.querySelectorAll(".g-opt");
    for (var b = 0; b < btns.length; b++) btns[b].disabled = true;
    var fb = document.getElementById("fb");
    if (k === q.answer) {
      score++;
      btn.className = "g-opt correct";
      fb.className = "g-feedback ok";
      fb.textContent = q.praise || "إجابة صحيحة… أحسنت!";
    } else {
      btn.className = "g-opt wrong";
      btns[q.answer].className = "g-opt correct";
      fb.className = "g-feedback no";
      fb.textContent = "الإجابة الصحيحة: " + q.options[q.answer];
    }
    setTimeout(function () {
      i++;
      if (i < qs.length) renderQ(); else endScreen();
    }, 1400);
  }

  function endScreen() {
    var pct = Math.round((score / qs.length) * 100);
    var stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 40 ? 1 : 0;
    var starsHtml = "";
    for (var s = 0; s < 3; s++) {
      starsHtml += '<span class="' + (s < stars ? "" : "off") + '">★</span>';
    }
    var msg;
    if (pct >= 90) msg = "مذهل! أنت نجم هذا الدرس بلا منازع.";
    else if (pct >= 60) msg = "أحسنت! مراجعة بسيطة وستصل إلى القمة.";
    else if (pct >= 40) msg = "بداية طيبة… أعد المحاولة وستتحسن نتيجتك.";
    else msg = "لا بأس! راجع الدرس ثم عد للعب من جديد.";
    document.getElementById("app").innerHTML =
      '<div class="g-brand">منصة كنوز — konozq.com</div>' +
      '<h1 class="g-title">انتهت اللعبة</h1>' +
      '<div class="g-center">' +
      '<div class="g-score-big">' + score + ' / ' + qs.length + '</div>' +
      '<div class="g-stars">' + starsHtml + '</div>' +
      '<p class="g-msg">' + msg + '</p>' +
      '</div>' +
      '<div class="g-actions">' +
      '<button class="g-btn" id="againBtn">العب مرة أخرى</button>' +
      '<a class="g-btn ghost" href="https://konozq.com/">العودة إلى المنصة</a>' +
      '</div>';
    document.getElementById("againBtn").onclick = function () { i = 0; score = 0; renderQ(); };
  }

  startScreen();
})();
