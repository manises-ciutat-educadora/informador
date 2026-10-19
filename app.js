"use strict";
/* ============================================================
   INFORMADOR DE MANISES · CIUTAT EDUCADORA
   Front-end multilingüe, amb veu (Web Speech API), lletra
   ampliable, PWA instal·lable i registre de preguntes
   (dia/hora/texto) al Worker de Cloudflare.
   ============================================================ */

/* >>> CONFIGURA AQUÍ l'URL del Worker de Cloudflare <<< */
const API_URL = "https://informador-manises.<el-teu-subdomini>.workers.dev/api/chat";
/* En local (wrangler dev) pots provar: http://127.0.0.1:8787/api/chat */

/* ---------- Idiomes ---------- */
const I18N = {
  ca:{nom:"Valencià",  nomAuto:"Valencià",   bcp:"ca", bcpVeu:"ca",
      lema:"L'oferta formativa del poble en 14 llengües — perquè la formació permanent és un dret.",
      avisPre:"Si vols rebre informacions, deixa'ns el teu email", avisLink:"fent clic ací.",
      benvinguda:"Soc l'Informador de Manises, Ciutat Educadora.🎓\nPregunta'm sobre l'oferta formativa del poble: escoles infantils, col·legis, instituts, formació de persones adultes, tallers, beques, ajudes al transport… Escriu o usa el botó de veu.",
      ph:"Escriu la teua pregunta…", envia:"Envia", micro:"Dicta amb veu",
      escolta:"Escolta", para:"Atura", pensant:"Pensant…",
      errConn:"No he pogut contactar amb el servidor. La pregunta queda guardada i s'enviarà quan torne la connexió. També pots trucar al 96 153 43 10 (Ajuntament).",
      instal:"Instal·lar app", fontMenys:"Reduir la lletra", fontMes:"Augmentar la lletra", fontReset:"Lletra normal",
      escoltant:"T'escolte… parla ara", cues:"Pregunta guardada per a enviar més tard"},
  es:{nom:"Español",   nomAuto:"Español",    bcp:"es", bcpVeu:"es",
      lema:"La oferta formativa del pueblo en 14 lenguas — porque la formación permanente es un derecho.",
      avisPre:"Si quieres recibir información, déjanos tu email", avisLink:"haciendo clic aquí.",
      benvinguda:"Soy el Informador de Manises, Ciutat Educadora.🎓\nPregúntame sobre la oferta formativa del pueblo: escuelas infantiles, colegios, institutos, formación de adultos, talleres, becas, ayudas al transporte… Escribe o usa el botón de voz.",
      ph:"Escribe tu pregunta…", envia:"Envía", micro:"Dicta por voz",
      escolta:"Escuchar", para:"Parar", pensant:"Pensando…",
      errConn:"No he podido contactar con el servidor. La pregunta queda guardada y se enviará cuando vuelva la conexión. También puedes llamar al 96 153 43 10 (Ayuntamiento).",
      instal:"Instalar app", fontMenys:"Reducir la letra", fontMes:"Ampliar la letra", fontReset:"Letra normal",
      escoltant:"Te escucho… habla ahora", cues:"Pregunta guardada para enviar más tarde"},
  en:{nom:"English",   nomAuto:"English",    bcp:"en", bcpVeu:"en-US",
      lema:"The town's education offer in 14 languages — because lifelong learning is a right.",
      avisPre:"If you want to receive information, leave us your email", avisLink:"by clicking here.",
      benvinguda:"I am the Manises Informer, Educating City.🎓\nAsk me about the town's education offer: nursery schools, primary schools, secondary schools, adult education, workshops, grants, transport aid… Type or use the voice button.",
      ph:"Type your question…", envia:"Send", micro:"Dictate by voice",
      escolta:"Listen", para:"Stop", pensant:"Thinking…",
      errConn:"Could not reach the server. Your question is saved and will be sent when the connection returns. You can also call +34 96 153 43 10 (Town Hall).",
      instal:"Install app", fontMenys:"Smaller text", fontMes:"Larger text", fontReset:"Normal text",
      escoltant:"Listening… speak now", cues:"Question saved to send later"},
  fr:{nom:"Français",  nomAuto:"Français",   bcp:"fr", bcpVeu:"fr-FR",
      lema:"L'offre de formation de la ville en 14 langues — car la formation tout au long de la vie est un droit.",
      avisPre:"Si vous souhaitez recevoir des informations, laissez-nous votre e-mail", avisLink:"en cliquant ici.",
      benvinguda:"Je suis l'Informateur de Manises, Cité Éducatrice.🎓\nPosez-moi vos questions sur l'offre de formation de la ville : écoles maternelles, écoles primaires, lycées, formation des adultes, ateliers, bourses, aides au transport… Écrivez ou utilisez le bouton vocal.",
      ph:"Écrivez votre question…", envia:"Envoyer", micro:"Dicter à voix haute",
      escolta:"Écouter", para:"Arrêter", pensant:"Réflexion…",
      errConn:"Impossible de joindre le serveur. La question est enregistrée et sera envoyée dès le retour de la connexion. Vous pouvez aussi appeler le 96 153 43 10 (Mairie).",
      instal:"Installer l'app", fontMenys:"Réduire le texte", fontMes:"Agrandir le texte", fontReset:"Texte normal",
      escoltant:"Je vous écoute… parlez", cues:"Question enregistrée pour envoi ultérieur"},
  ar:{nom:"العربية",   nomAuto:"العربية",     bcp:"ar", bcpVeu:"ar",
      lema:"العرض التعليمي للمدينة بـ 14 لغة — لأن التعلّم مدى الحياة حقٌّ من الحقوق.",
      avisPre:"إذا أردت تلقّي معلومات، اترك لنا بريدك الإلكتروني", avisLink:"بالنقر هنا.",
      benvinguda:"أنا المُعلِم الرقمي لمدينة مانيسس، المدينة المتعلِّمة.🎓\nاسألني عن العرض التعليمي للمدينة: رياض الأطفال، المدارس الابتدائية، الثانويات، تعليم الكبار، الورشات، المنح، مساعدات النقل… اكتب أو استخدم زر الصوت.",
      ph:"اكتب سؤالك…", envia:"إرسال", micro:"تحدث بالصوت",
      escolta:"استمع", para:"إيقاف", pensant:"أفكر…",
      errConn:"تعذّر الاتصال بالخادم. تم حفظ سؤالك وسيُرسل عند عودة الاتصال. يمكنك أيضًا الاتصال بالرقم 96 153 43 10 (البلدية).",
      instal:"تثبيت التطبيق", fontMenys:"تصغير الخط", fontMes:"تكبير الخط", fontReset:"خط عادي",
      escoltant:"أسمعك… تكلّم الآن", cues:"تم حفظ السؤال لإرساله لاحقًا"},
  ro:{nom:"Română",   nomAuto:"Română",     bcp:"ro", bcpVeu:"ro-RO",
      lema:"Oferta educațională a orașului în 14 limbi — pentru că învățarea pe tot parcursul vieții este un drept.",
      avisPre:"Dacă dorești să primești informații, lasă-ne adresa ta de e-mail", avisLink:"dând clic aici.",
      benvinguda:"Sunt Informatorul din Manises, Oraș Educator.🎓\nÎntreabă-mă despre oferta educațională a orașului: grădinițe, școli primare, licee, educația adulților, ateliere, burse, ajutoare pentru transport… Scrie sau folosește butonul vocal.",
      ph:"Scrie întrebarea ta…", envia:"Trimite", micro:"Dictează vocal",
      escolta:"Ascultă", para:"Oprește", pensant:"Mă gândesc…",
      errConn:"Nu am putut contacta serverul. Întrebarea este salvată și va fi trimisă când revine conexiunea. Poți suna și la 96 153 43 10 (Primărie).",
      instal:"Instalează aplicația", fontMenys:"Micșorează textul", fontMes:"Mărește textul", fontReset:"Text normal",
      escoltant:"Te ascult… vorbește acum", cues:"Întrebare salvată pentru trimitere ulterioară"},
  uk:{nom:"Українська",nomAuto:"Українська", bcp:"uk", bcpVeu:"uk-UA",
      lema:"Освітня пропозиція міста 14 мовами — бо навчання протягом усього життя є правом.",
      avisPre:"Якщо бажаєте отримувати інформацію, залиште нам свою електронну адресу", avisLink:"натиснувши тут.",
      benvinguda:"Я Інформатор Манісеса, Місто Освіти.🎓\nПитайте про освітню пропозицію міста: дитячі садки, початкові школи, ліцеї, освіта дорослих, гуртки, стипендії, допомога на транспорт… Пишіть або скористайтеся кнопкою голосу.",
      ph:"Напишіть своє запитання…", envia:"Надіслати", micro:"Диктувати голосом",
      escolta:"Слухати", para:"Зупинити", pensant:"Думаю…",
      errConn:"Не вдалося зв'язатися з сервером. Запитання збережено і буде надіслано, коли з'явиться зв'язок. Можна також зателефонувати: 96 153 43 10 (мерія).",
      instal:"Встановити застосунок", fontMenys:"Зменшити шрифт", fontMes:"Збільшити шрифт", fontReset:"Звичайний шрифт",
      escoltant:"Слухаю… говоріть", cues:"Запитання збережено для подальшого надсилання"},
  ru:{nom:"Русский",  nomAuto:"Русский",    bcp:"ru", bcpVeu:"ru-RU",
      lema:"Образовательное предложение города на 14 языках — ведь обучение в течение жизни — это право.",
      avisPre:"Если хотите получать информацию, оставьте нам свой email", avisLink:"нажав здесь.",
      benvinguda:"Я Информатор Манисеса, Город Образования.🎓\nСпросите меня об образовательных предложениях города: детские сады, начальные школы, лицеи, образование для взрослых, кружки, стипендии, помощь на транспорт… Пишите или используйте голосовую кнопку.",
      ph:"Напишите ваш вопрос…", envia:"Отправить", micro:"Диктовать голосом",
      escolta:"Слушать", para:"Стоп", pensant:"Думаю…",
      errConn:"Не удалось связаться с сервером. Вопрос сохранён и будет отправлен при восстановлении связи. Также можно позвонить: 96 153 43 10 (мэрия).",
      instal:"Установить приложение", fontMenys:"Уменьшить шрифт", fontMes:"Увеличить шрифт", fontReset:"Обычный шрифт",
      escoltant:"Слушаю… говорите", cues:"Вопрос сохранён для отправки позже"},
  zh:{nom:"中文",     nomAuto:"中文",       bcp:"zh", bcpVeu:"zh-CN",
      lema:"全镇教育资讯，14种语言——因为终身学习是一项权利。",
      avisPre:"如果您希望接收信息，请留下您的电子邮箱", avisLink:"点击这里。",
      benvinguda:"我是马尼塞斯教育之城的信息员。🎓\n请向我询问本镇的教育资讯：幼儿园、小学、中学、成人教育、培训班、助学金、交通补助……您可以打字，也可以使用语音按钮。",
      ph:"请输入您的问题……", envia:"发送", micro:"语音输入",
      escolta:"朗读", para:"停止", pensant:"正在思考……",
      errConn:"无法连接服务器。您的问题已保存，网络恢复后会自动发送。您也可以致电 96 153 43 10（市政府）。",
      instal:"安装应用", fontMenys:"缩小字体", fontMes:"放大字体", fontReset:"正常字体",
      escoltant:"正在聆听……请讲话", cues:"问题已保存，稍后发送"},
  it:{nom:"Italiano", nomAuto:"Italiano",   bcp:"it", bcpVeu:"it-IT",
      lema:"L'offerta formativa del paese in 14 lingue — perché l'apprendimento permanente è un diritto.",
      avisPre:"Se vuoi ricevere informazioni, lasciaci la tua email", avisLink:"cliccando qui.",
      benvinguda:"Sono l'Informatore di Manises, Città Educante.🎓\nChiedimi dell'offerta formativa del paese: scuole dell'infanzia, scuole primarie, istituti, formazione degli adulti, laboratori, borse di studio, aiuti per il trasporto… Scrivi o usa il pulsante vocale.",
      ph:"Scrivi la tua domanda…", envia:"Invia", micro:"Dettatura vocale",
      escolta:"Ascolta", para:"Ferma", pensant:"Sto pensando…",
      errConn:"Non riesco a contattare il server. La domanda è salvata e sarà inviata quando torna la connessione. Puoi anche chiamare il 96 153 43 10 (Municipio).",
      instal:"Installa l'app", fontMenys:"Riduci il testo", fontMes:"Ingrandisci il testo", fontReset:"Testo normale",
      escoltant:"Ti ascolto… parla ora", cues:"Domanda salvata per l'invio successivo"},
  pt:{nom:"Português",nomAuto:"Português",  bcp:"pt", bcpVeu:"pt-PT",
      lema:"A oferta formativa da vila em 14 línguas — porque a formação ao longo da vida é um direito.",
      avisPre:"Se quiser receber informações, deixe-nos o seu e-mail", avisLink:"clicando aqui.",
      benvinguda:"Sou o Informador de Manises, Cidade Educadora.🎓\nPergunte-me sobre a oferta formativa da vila: escolas infantis, escolas primárias, institutos, formação de adultos, oficinas, bolsas, apoios ao transporte… Escreva ou use o botão de voz.",
      ph:"Escreva a sua pergunta…", envia:"Enviar", micro:"Ditar por voz",
      escolta:"Ouvir", para:"Parar", pensant:"A pensar…",
      errConn:"Não foi possível contactar o servidor. A pergunta fica guardada e será enviada quando a ligação voltar. Também pode ligar para 96 153 43 10 (Câmara Municipal).",
      instal:"Instalar a app", fontMenys:"Reduzir o texto", fontMes:"Ampliar o texto", fontReset:"Texto normal",
      escoltant:"Estou a ouvir… fale agora", cues:"Pergunta guardada para envio posterior"},
  zgh:{nom:"ⵜⴰⵎⴰⵣⵖⴰ", nomAuto:"Tamazight", bcp:"zgh", bcpVeu:"fr-FR",
      lema:"Aselmed n temdint s 14 n tutlayin — acku aselmed n yal tallit d izerf.",
      avisPre:"Ma tebɣiḍ ad d-reseḍ talɣut, eǧǧ-aɣ yimayl inek", avisLink:"s usiti dagi.",
      benvinguda:"Nekk Informador n Manises, Tamdint Educadora.🎓\nSser-d ayen tebɣiḍ ad tissineḍ ɣef uselmed deg Manises: isalan n warrac, isalan, isaffen, aselmed n yimɣaren, ateliers, tawsa… Aru neɣ seqdec taqeffalt n uɣer.",
      ph:"Aru aseqqiṛ-ik…", envia:"Azen", micro:"Meslay s uɣer",
      escolta:"Sel", para:"Seḥbes", pensant:"Xedmeɣ…",
      errConn:"Ur izmir ad yessiwel ɣer uqeddac. Aseqqiṛ-ik yettwakles, ad yettwazen ticki yuɣal uneṭṭaf. Tzemreḍ ad tisedṛeḍ 96 153 43 10.",
      instal:"Sader asnas", fontMenys:"Senneẓ asekkil", fontMes:"Ssemɣer asekkil", fontReset:"Asekkil amagnu",
      escoltant:"Kkaɣ ilelli… meslay", cues:"Aseqqiṛ yettwakles i wazen"},
  bm:{nom:"Bamanankan",nomAuto:"Bamanankan",bcp:"bm", bcpVeu:"fr-FR",
      lema:"Manises ka kalan ɲɛnabɔ kan 14 la — sabu kalan kɛtɔtɔw ye hakɛ ye.",
      avisPre:"Ni i bɛ fɛ ka kunnafoni sɔrɔ, to an fɛ i ka email", avisLink:"ka cli ci la.",
      benvinguda:"Ne ye Manises Informateur ye, Dugu Educateur.🎓\nI bɛ se ka ɲinini kɛ n na Manises kalan ko kan: misoɲɛnɛw, tilebinyanaw, lise, kalan gundo, ateliers, tawsa… A bɛ se ka sɛbɛn walima ka kɛ ɲɛgɛn fɛ.",
      ph:"Sɛbɛn i ka ɲinini…", envia:"Ci", micro:"Kɛ ɲɛgɛn fɛ",
      escolta:"Mɛnni", para:"Jɔ", pensant:"N bɛ ɲini…",
      errConn:"Tɛ se ka seyi jatebaara la. I ka ɲinini datugu don, a bɛ ci ni internet nana. I bɛ se ka wele 96 153 43 10 (Dugu goyi).",
      instal:"App don", fontMenys:"Kɛtɛ lɛtɛri", fontMes:"Lɛtɛri bonya", fontReset:"Lɛtɛri ɲɔgɔn",
      escoltant:"N bɛ mɛnni i la… kuma", cues:"ɲinini datugu don ci la"},
  wo:{nom:"Wolof",    nomAuto:"Wolof",      bcp:"wo", bcpVeu:"fr-FR",
      lema:"Jëmmu jàngale gi Manises 14 làkk — ndax jàngale bu bés bépp dafa sañ-sañ.",
      avisPre:"Su bëgg nga am xibaar, wax nañu sa email", avisLink:"ci dox bu fi.",
      benvinguda:"Man maa ngi nekk Ki këy yi Manises, Dëkk bu xam-xamu.🎓\nLaaj ma ci jëmm yi ci biir Manises: ndefarug xale yi, penc yi, ëkk bi, jàngale gi góor, ateliers, tontu yi… Bind walla jëfandikul bóton wi.",
      ph:"Bind laaj bi…", envia:"Yónnee", micro:"Wax ci gëm",
      escolta:"Dégg", para:"Togg", pensant:"Dama xalaat…",
      errConn:"Duma ko jot server bi. Laaj bi dafa wéy, dina yónnee bu bés bi desse. Mën nga yóbbu 96 153 43 10 (Mairie).",
      instal:"Samp app bi", fontMenys:"Wàññi mbind mi", fontMes:"Yàggi mbind mi", fontReset:"Mbind bu ñàkk",
      escoltant:"Dama dégg… wax léegi", cues:"Laaj bi wéy na bu yónnee"}
};

/* ---------- Estat ---------- */
let lang = localStorage.getItem("informador-idioma") || "ca";
if (!I18N[lang]) lang = "ca";
const MARGE_FONT = [90, 100, 112, 125, 140];           // percentatges de mida de lletra
let nivellFont = parseInt(localStorage.getItem("informador-font") || "1", 10);
if (isNaN(nivellFont)) nivellFont = 1;
let reconeixement = null, escoltant = false;
/* Sessió estable: identifica el diàleg sencer a Supabase */
let sessio = localStorage.getItem("informador-sessio");
if (!sessio) {
  sessio = (crypto.randomUUID) ? crypto.randomUUID()
          : "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem("informador-sessio", sessio);
}

const $ = (id) => document.getElementById(id);
const xat = $("xat"), entrada = $("entrada"), estat = $("estat");

/* ---------- Inicialització ---------- */
function init(){
  // Selector d'idiomes
  const sel = $("idioma");
  for (const [codi, d] of Object.entries(I18N)){
    const op = document.createElement("option");
    op.value = codi; op.textContent = d.nomAuto;
    sel.appendChild(op);
  }
  sel.value = lang;
  sel.addEventListener("change", () => { lang = sel.value; localStorage.setItem("informador-idioma", lang); aplicarIdioma(true); });

  $("formulari").addEventListener("submit", (e) => { e.preventDefault(); envia(); });
  $("micro").addEventListener("click", alternaMicro);
  $("lletra-menys").addEventListener("click", () => canviaFont(-1));
  $("lletra-mes").addEventListener("click", () => canviaFont(+1));
  $("lletra-reset").addEventListener("click", () => { nivellFont = 1; aplicaFont(); });

  aplicaFont();
  aplicarIdioma(false);

  // PWA: instal·lació
  let evtInstal = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); evtInstal = e; $("instalar").hidden = false; });
  $("instalar").addEventListener("click", async () => {
    if (!evtInstal) return;
    evtInstal.prompt(); await evtInstal.userChoice; evtInstal = null; $("instalar").hidden = true;
  });
  window.addEventListener("appinstalled", () => { $("instalar").hidden = true; });

  // Service worker (offline)
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("sw.js").catch(()=>{});

  // Torna a enviar preguntes guardades offline
  window.addEventListener("online", enviaCua);
  enviaCua();
}

function t(){ return I18N[lang]; }

function aplicarIdioma(refresca){
  const d = t();
  document.documentElement.lang = d.bcp;
  document.documentElement.dir = (d.bcp === "ar") ? "rtl" : "ltr";
  $("lema").textContent = d.lema;
  if ($("avis-pre")) { $("avis-pre").textContent = d.avisPre; $("avis-enllac").textContent = d.avisLink; }
  entrada.placeholder = d.ph;
  entrada.setAttribute("aria-label", d.ph);
  $("enviar").title = d.envia; $("enviar").setAttribute("aria-label", d.envia);
  $("micro").title = d.micro; $("micro").setAttribute("aria-label", d.micro);
  $("instalar-text").textContent = d.instal;
  $("lletra-menys").title = d.fontMenys; $("lletra-menys").setAttribute("aria-label", d.fontMenys);
  $("lletra-mes").title = d.fontMes; $("lletra-mes").setAttribute("aria-label", d.fontMes);
  $("lletra-reset").title = d.fontReset; $("lletra-reset").setAttribute("aria-label", d.fontReset);
  if (refresca || !xat.children.length){ xat.innerHTML = ""; afegixMissatge("bot", d.benvinguda); }
}

/* ---------- Mida de lletra ---------- */
function aplicaFont(){
  document.documentElement.style.fontSize = MARGE_FONT[Math.min(Math.max(nivellFont,0), MARGE_FONT.length-1)] + "%";
  localStorage.setItem("informador-font", String(nivellFont));
}
function canviaFont(pas){ nivellFont = Math.min(Math.max(nivellFont + pas, 0), MARGE_FONT.length - 1); aplicaFont(); }

/* ---------- Xat ---------- */
function afegixMissatge(qui, text, ambEscolta){
  const div = document.createElement("div");
  div.className = "missatge " + qui;
  div.textContent = text;
  if (ambEscolta && "speechSynthesis" in window){
    const a = document.createElement("div"); a.className = "accions-missatge";
    const b = document.createElement("button");
    b.type = "button"; b.className = "boto-escolta"; b.textContent = "🔊 " + t().escolta;
    b.setAttribute("aria-label", t().escolta);
    let parlant = false;
    b.addEventListener("click", () => {
      if (parlant){ speechSynthesis.cancel(); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = t().bcpVeu;
      const veu = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith(t().bcpVeu.slice(0,2)));
      if (veu) u.voice = veu;
      u.onend = u.onerror = () => { parlant = false; b.textContent = "🔊 " + t().escolta; };
      parlant = true; b.textContent = "⏹ " + t().para;
      speechSynthesis.speak(u);
    });
    a.appendChild(b); div.appendChild(a);
  }
  xat.appendChild(div);
  div.scrollIntoView({behavior:"smooth", block:"end"});
  return div;
}

function envia(){
  const text = entrada.value.trim();
  if (!text) return;
  entrada.value = "";
  afegixMissatge("usuari", text);
  speechSynthesis && speechSynthesis.cancel();
  const pensant = afegixMissatge("bot", t().pensant + " ⏳");
  const ara = new Date();
  const registro = {
    pregunta: text,
    idioma: lang,
    dia: ara.toLocaleDateString(t().bcp),      // Dia
    hora: ara.toLocaleTimeString(t().bcp),     // Hora
    iso: ara.toISOString(),
    sesion: sessio
  };
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registro)
  })
  .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
  .then(d => { pensant.remove(); afegixMissatge("bot", d.respuesta || d.respuestaText || JSON.stringify(d), true); })
  .catch(() => {
    pensant.remove();
    afegixMissatge("bot", t().errConn);
    guardaCua(registro); estat.textContent = t().cues;
  });
}

/* ---------- Cua offline de preguntes ---------- */
function guardaCua(obj){
  const cua = JSON.parse(localStorage.getItem("informador-cua") || "[]");
  cua.push(obj);
  localStorage.setItem("informador-cua", JSON.stringify(cua));
}
function enviaCua(){
  if (!navigator.onLine) return;
  const cua = JSON.parse(localStorage.getItem("informador-cua") || "[]");
  if (!cua.length) return;
  const restants = [];
  (async () => {
    for (const obj of cua){
      try{
        const r = await fetch(API_URL, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(obj) });
        if (!r.ok) restants.push(obj);
      }catch(_){ restants.push(obj); }
    }
    localStorage.setItem("informador-cua", JSON.stringify(restants));
    if (!restants.length) estat.textContent = "";
  })();
}

/* ---------- Veu: dictat (pregunta per veu) ---------- */
function alternaMicro(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ estat.textContent = "⚠️ " + t().micro + " — " + (lang==="es"?"no disponible en este navegador":"no disponible en aquest navegador"); return; }
  if (escoltant){ reconeixement.stop(); return; }
  reconeixement = new SR();
  reconeixement.lang = t().bcp;
  reconeixement.interimResults = false;
  reconeixement.maxAlternatives = 1;
  reconeixement.onstart = () => { escoltant = true; $("micro").setAttribute("aria-pressed","true"); estat.textContent = "🎙️ " + t().escoltant; };
  reconeixement.onend = () => { escoltant = false; $("micro").removeAttribute("aria-pressed"); estat.textContent = ""; };
  reconeixement.onerror = () => { escoltant = false; $("micro").removeAttribute("aria-pressed"); estat.textContent = ""; };
  reconeixement.onresult = (e) => {
    const text = e.results[0][0].transcript;
    entrada.value = text;
    envia();
  };
  reconeixement.start();
}

document.addEventListener("DOMContentLoaded", init);
