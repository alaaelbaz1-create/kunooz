/* ===== منصة كنوز — المنطق العام (بلا أي أدوات بناء — JavaScript خام) ===== */
(function(){
  "use strict";

  /* ---------- الترويسة والتذييل المشتركان ---------- */
  function shell(active){
    var header = document.getElementById("site-header");
    if(header){
      header.innerHTML =
        '<header class="site"><div class="wrap">' +
        '<a class="logo" href="index.html"><span class="mark">ك</span>' +
        '<span>كنوز<small>منصة معلمي اللغة العربية — قطر</small></span></a>' +
        '<nav class="main">' +
        navLink("index.html","الرئيسية",active==="home") +
        navLink("index.html#grades","الصفوف",active==="grades") +
        navLink("cambridge.html","Cambridge / Edexcel",active==="cambridge") +
        "</nav></div></header>";
    }
    var footer = document.getElementById("site-footer");
    if(footer){
      footer.innerHTML =
        '<footer class="site"><div class="container">' +
        '<p><span class="name">منصة كنوز</span> — عروض تقديمية وخطط تحضير لمعلمي اللغة العربية في دولة قطر (الصفوف 7–12)</p>' +
        '<p>المحتوى التعليمي: د. أحمد كمال أبو المجد (بتصرف) — آخر تحديث: <span id="last-updated">—</span></p>' +
        "</div></footer>";
    }
  }
  function navLink(href,label,isActive){
    return '<a href="'+href+'"'+(isActive?' class="active"':"")+">"+label+"</a>";
  }

  /* ---------- أدوات مساعدة ---------- */
  function q(param){
    return new URLSearchParams(window.location.search).get(param);
  }
  function fetchJSON(url){
    return fetch(url).then(function(r){
      if(!r.ok) throw new Error("تعذر تحميل "+url);
      return r.json();
    });
  }
  function esc(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function statusBadge(status){
    if(status==="ready") return '<span class="badge-status badge-ready">متاحة الآن</span>';
    return '<span class="badge-status badge-soon">تُرفع تدريجيًا</span>';
  }

  /* ---------- الصفحة الرئيسية ---------- */
  function renderHome(){
    shell("home");
    fetchJSON("data/index.json").then(function(data){
      var upd = document.getElementById("last-updated");
      if(upd) upd.textContent = data.updated;
      var host = document.getElementById("grades-grid");
      var html = "";
      data.grades.forEach(function(g){
        var readyUnits = g.units.filter(function(u){return u.status==="ready";}).length;
        var decks = g.units.reduce(function(n,u){return n+(u.decks||0);},0);
        var inner =
          '<h3>'+esc(g.title)+'</h3>' +
          '<p class="meta">'+esc(g.stage)+'</p>' +
          '<p style="margin:10px 0">'+statusBadge(g.status)+'</p>';
        if(g.status==="ready"){
          inner += '<div class="foot"><span>'+readyUnits+" وحدة • "+decks+" عرضًا</span>" +
                   '<span class="go">← تصفّح</span></div>';
          html += '<a class="card" href="grade.html?g='+g.grade+'">'+inner+"</a>";
        }else{
          inner += '<div class="foot"><span>'+esc(g.note||"")+"</span></div>";
          html += '<div class="card" style="opacity:.75">'+inner+"</div>";
        }
      });
      host.innerHTML = html;
    }).catch(showError);
  }

  /* ---------- صفحة الصف ---------- */
  function renderGrade(){
    shell("grades");
    var g = q("g");
    fetchJSON("data/index.json").then(function(data){
      var upd = document.getElementById("last-updated");
      if(upd) upd.textContent = data.updated;
      var grade = null;
      data.grades.forEach(function(x){ if(String(x.grade)===String(g)) grade=x; });
      var host = document.getElementById("grade-content");
      if(!grade){ host.innerHTML = '<div class="note">الصف غير موجود. <a href="index.html">عودة للرئيسية</a></div>'; return; }
      document.title = grade.title+" — منصة كنوز";
      var html =
        '<div class="breadcrumb"><a href="index.html">الرئيسية</a> ‹ '+esc(grade.title)+"</div>" +
        '<div class="unit-head"><h1>'+esc(grade.title)+'</h1>' +
        '<p class="meta">'+esc(grade.stage)+" — وحدات الكتاب المدرسي</p></div>";
      if(!grade.units.length){
        html += '<div class="note">'+esc(grade.note||"تُرفع أعمال هذا الصف تدريجيًا بعد اعتمادها.")+"</div>";
      }else{
        html += '<div class="grid grades">';
        grade.units.forEach(function(u){
          var inner =
            '<h3>الوحدة '+arUnit(u.unit)+"</h3>" +
            '<p class="meta">'+u.decks+" عرضًا تقديميًا + "+u.plans+" خطة تحضير</p>" +
            '<p style="margin:10px 0">'+statusBadge(u.status)+"</p>";
          if(u.status==="ready"){
            inner += '<div class="foot"><span>'+esc(u.pages||"")+'</span><span class="go">← فتح الوحدة</span></div>';
            html += '<a class="card" href="unit.html?g='+g+"&u="+u.unit+'">'+inner+"</a>";
          }else{
            inner += '<div class="foot"><span>تُعرض بعد اعتمادها</span></div>';
            html += '<div class="card" style="opacity:.75">'+inner+"</div>";
          }
        });
        html += "</div>";
      }
      host.innerHTML = html;
    }).catch(showError);
  }
  function arUnit(n){
    var m={1:"الأولى",2:"الثانية",3:"الثالثة",4:"الرابعة",5:"الخامسة",6:"السادسة"};
    return m[n]||n;
  }

  /* ---------- صفحة الوحدة ---------- */
  function renderUnit(){
    shell("grades");
    var g = q("g"), u = q("u");
    fetchJSON("data/index.json").then(function(index){
      var upd = document.getElementById("last-updated");
      if(upd) upd.textContent = index.updated;
      var grade=null, unit=null;
      index.grades.forEach(function(x){ if(String(x.grade)===String(g)) grade=x; });
      if(grade) grade.units.forEach(function(x){ if(String(x.unit)===String(u)) unit=x; });
      var host = document.getElementById("unit-content");
      if(!grade||!unit){ host.innerHTML='<div class="note">الوحدة غير موجودة. <a href="index.html">عودة للرئيسية</a></div>'; return; }
      if(unit.status!=="ready"){ host.innerHTML='<div class="breadcrumb"><a href="index.html">الرئيسية</a> ‹ <a href="grade.html?g='+g+'">'+esc(grade.title)+'</a></div><div class="note">هذه الوحدة لم تُنشر بعد — تُعرض بعد اعتمادها. <a href="grade.html?g='+g+'">عودة لصفحة الصف</a></div>'; return; }
      return fetchJSON(unit.manifest).then(function(man){
        document.title = "الوحدة "+arUnit(u)+" — "+grade.title+" — منصة كنوز";
        var html =
          '<div class="breadcrumb"><a href="index.html">الرئيسية</a> ‹ <a href="grade.html?g='+g+'">'+esc(grade.title)+"</a> ‹ الوحدة "+arUnit(u)+"</div>" +
          '<div class="unit-head"><h1>الوحدة '+arUnit(u)+"</h1>" +
          '<p class="meta">'+esc(grade.title)+" — "+man.decks.length+" عرضًا تقديميًا مع خطط التحضير — "+esc(man.term)+"</p>" +
          '<div class="unit-actions">'+
            (unit.zip? '<a class="btn gold" href="'+esc(unit.zip)+'" download>⬇ تحميل الوحدة كاملة (ZIP)</a>':"")+
          "</div></div>" +
          '<div class="note">استعرض أي عرض بزر «👁 معاينة» قبل تحميله (تظهر في المعاينة عناصر الشريحة كاملة دفعة واحدة)، أما ملف العرض المحمّل فيعمل بالضغط (F5): تظهر الإجابات نموذجيًا بعد محاولة الطالب. حمّل العرض وخطة التحضير منفردين، أو الوحدة كاملة بملف ZIP واحد.</div>' +
          '<div class="lessons">';
        man.decks.forEach(function(d){
          html +=
            '<div class="lesson">' +
              '<div class="sess">'+(d.session>0? "ح"+d.session : "قضية")+"</div>" +
              '<div class="info"><h3>'+esc(d.title)+"</h3>" +
              '<p class="meta">'+esc(d.lesson)+" — ص "+esc(d.pages)+" — "+d.slides+" شريحة</p></div>" +
              '<div class="btns">' +
                (d.preview? '<a class="btn" href="'+esc(d.preview)+'" target="_blank" rel="noopener">👁 معاينة</a>':"") +
                '<a class="btn primary" href="'+esc(d.file)+'" download="'+esc(d.download)+'">⬇ العرض</a>' +
                (d.plan_file? '<a class="btn" href="'+esc(d.plan_file)+'" download="'+esc(d.plan_download)+'">⬇ خطة التحضير</a>':"") +
                (d.game_url? '<a class="btn" href="'+esc(d.game_url)+'" target="_blank" rel="noopener">🎮 اللعبة</a>':"") +
              "</div>" +
            "</div>";
        });
        html += "</div>";
        host.innerHTML = html;
      });
    }).catch(showError);
  }

  /* ---------- صفحة كامبريدج ---------- */
  function renderCambridge(){
    shell("cambridge");
    fetchJSON("data/index.json").then(function(data){
      var upd = document.getElementById("last-updated");
      if(upd) upd.textContent = data.updated;
    });
  }

  function showError(e){
    console.error(e);
    var host = document.querySelector("main .container");
    if(host) host.innerHTML = '<div class="note">حدث خطأ في تحميل البيانات. تأكد من فتح الموقع عبر خادم (وليس فتح الملف مباشرة).</div>';
  }

  /* ---------- الإقلاع ---------- */
  window.Kunooz = { renderHome:renderHome, renderGrade:renderGrade, renderUnit:renderUnit, renderCambridge:renderCambridge };
})();
