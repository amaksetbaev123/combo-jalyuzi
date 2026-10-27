// Combo Jalyuzi - Frontend Scripts

// State for Calculator
const state = {
  currentType: 'combo',
  currentTypeName: 'Combo (Күн & Түн)',
  pricePerSqM: 130000,
  qty: 1
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initZebraSimulator();
  initCalculator();
});

/* ================= MOBILE MENU ================= */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
      });
    });
  }
}

/* ================= ZEBRA DAY/NIGHT SIMULATOR ================= */
function initZebraSimulator() {
  const slider = document.getElementById('zebra-slider');
  const stripes = document.getElementById('sliding-stripes');
  const ambient = document.getElementById('room-ambient');
  const label = document.getElementById('simulator-mode-label');
  const desc = document.getElementById('simulator-mode-desc');

  if (!slider || !stripes) return;

  slider.addEventListener('input', (e) => {
    updateZebraView(e.target.value);
  });
}

function updateZebraView(value) {
  const stripes = document.getElementById('sliding-stripes');
  const ambient = document.getElementById('room-ambient');
  const label = document.getElementById('simulator-mode-label');
  const desc = document.getElementById('simulator-mode-desc');

  // Translate stripes vertically from 0 to 16px to create the blackout overlap
  const offset = (value / 100) * 16;
  stripes.style.transform = `translateY(${offset}px)`;

  // Adjust darkness ambient
  const darkness = 0.2 + (value / 100) * 0.75;
  ambient.style.backgroundColor = `rgba(15, 23, 42, ${darkness})`;

  if (value < 30) {
    label.textContent = '☀️ Күн (Day Light)';
    label.className = 'text-amber-400';
    desc.textContent = 'Жарық толық өтүүде: бөлмеге табиғи күн нуры түсип, сыртқы көринис анық көринип турады.';
  } else if (value < 75) {
    label.textContent = '⛅ Жартылай жарық (Filtered)';
    label.className = 'text-amber-300';
    desc.textContent = 'Жумсақ жарық: күнниң көзди шағылыстыратын нурлары тосылып, бөлмеде жағымлы атмосфера жаратылады.';
  } else {
    label.textContent = '🌙 Түн (Blackout / 100% Privacy)';
    label.className = 'text-blue-400';
    desc.textContent = 'Толық жабық режим: бөлме толық қараңғыланады, сырттан ҳеш нәрсе көринбейди. Уйқы ҳәм дем алыў ушын идеаль.';
  }
}

function setZebraPreset(val) {
  const slider = document.getElementById('zebra-slider');
  if (slider) {
    slider.value = val;
    updateZebraView(val);
  }
}

/* ================= LIVE CALCULATOR ================= */
function initCalculator() {
  const widthInput = document.getElementById('calc-width');
  const heightInput = document.getElementById('calc-height');

  if (widthInput && heightInput) {
    widthInput.addEventListener('input', calculateTotal);
    heightInput.addEventListener('input', calculateTotal);
  }

  calculateTotal();
}

function selectCalcType(type, price) {
  state.currentType = type;
  state.pricePerSqM = price;

  const names = {
    combo: 'Combo (Күн & Түн)',
    zebra: 'Combo (Күн & Түн)',
    rollet: 'Rolletler (Рулонные)',
    dikiy: 'Dikiy (Дикий) жалюзи',
    vertical: 'Dikiy (Дикий) жалюзи',
    plice: 'Plice (Плиссе) жалюзи',
    horizontal: 'Plice (Плиссе) жалюзи'
  };
  state.currentTypeName = names[type] || type;

  // Update button active states
  const buttons = document.querySelectorAll('.calc-type-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  const clickedBtn = event.currentTarget;
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }

  calculateTotal();
}

function adjustQty(change) {
  const qtyInput = document.getElementById('calc-qty');
  let current = parseInt(qtyInput.value) || 1;
  current += change;
  if (current < 1) current = 1;
  if (current > 50) current = 50;

  qtyInput.value = current;
  state.qty = current;
  calculateTotal();
}

function calculateTotal() {
  const width = parseFloat(document.getElementById('calc-width').value) || 0;
  const height = parseFloat(document.getElementById('calc-height').value) || 0;
  const qty = state.qty || 1;

  // Area in square meters (standard minimum is 1 sq.m per window in blind manufacturing)
  let singleArea = (width * height) / 10000;
  if (singleArea < 1.0) singleArea = 1.0; // Industry standard minimum billing unit

  const totalArea = singleArea * qty;
  const totalPrice = Math.round(totalArea * state.pricePerSqM);

  // Update UI summary
  document.getElementById('summary-type').textContent = state.currentTypeName;
  document.getElementById('summary-area').textContent = totalArea.toFixed(2) + ' кв.м';
  document.getElementById('summary-qty').textContent = qty + ' дана';
  document.getElementById('calc-total').textContent = formatPrice(totalPrice) + ' сум';
}

function formatPrice(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function prefillCalculator(type) {
  const btnIndex = { combo: 0, zebra: 0, rollet: 1, dikiy: 2, vertical: 2, plice: 3, horizontal: 3 };
  const buttons = document.querySelectorAll('.calc-type-btn');

  if (buttons[btnIndex[type]]) {
    buttons[btnIndex[type]].click();
  }

  const calcElem = document.getElementById('calculator');
  if (calcElem) {
    calcElem.scrollIntoView({ behavior: 'smooth' });
  }
}

function applyCalculatedToOrder() {
  const width = document.getElementById('calc-width').value;
  const height = document.getElementById('calc-height').value;
  const qty = state.qty;
  const typeName = state.currentTypeName;
  const total = document.getElementById('calc-total').textContent;

  // Set values in the order form
  const orderTypeSelect = document.getElementById('order-blind-type');
  const notesTextarea = document.getElementById('order-notes');

  if (orderTypeSelect) {
    if (state.currentType === 'combo' || state.currentType === 'zebra') orderTypeSelect.value = 'Combo (Day & Night)';
    else if (state.currentType === 'rollet') orderTypeSelect.value = 'Rollet (Рулонные)';
    else if (state.currentType === 'dikiy' || state.currentType === 'vertical') orderTypeSelect.value = 'Dikiy (Дикий)';
    else if (state.currentType === 'plice' || state.currentType === 'horizontal') orderTypeSelect.value = 'Plice (Плиссе)';
  }

  if (notesTextarea) {
    notesTextarea.value = `Калькуляторда есапланды: ${typeName}, ${qty} дана терезе (Ени: ${width}см, Бийиклиги: ${height}см). Баҳасы шама менен: ${total}.`;
  }

  // Smooth scroll to form
  const contactElem = document.getElementById('contact');
  if (contactElem) {
    contactElem.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('client-name').focus();
  }
}

/* ================= ORDER SUBMISSION ================= */
function handleOrderSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('client-name').value;
  const phone = document.getElementById('client-phone').value;
  const type = document.getElementById('order-blind-type').value;
  const address = document.getElementById('client-address').value;
  const notes = document.getElementById('order-notes').value;

  const submitBtn = document.getElementById('submit-btn');
  const successAlert = document.getElementById('order-success');
  const form = document.getElementById('order-form');

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="inline-block animate-spin mr-2"><i class="fa-solid fa-spinner"></i></span>
    Жиберилмекте...
  `;

  // Simulate network dispatch
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <span class="material-symbols-outlined">send</span>
      Бийпул өлшеўге буйыртпа жибериў
    `;

    successAlert.classList.remove('hidden');
    form.reset();

    // Scroll to success notification
    successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 800);
}

/* ================= FULL CATALOG INTERACTION ================= */
const catalogData = {
  'combo-classic': {
    title: 'Combo Elegance (Гранит Сұр)',
    category: 'Combo (Күн & Түн)',
    origin: '🇹🇷 Түркия',
    light: '80% жарықты тосады',
    artikul: 'Артикул: #CB-101',
    price: '130 000 сум',
    img: 'images/combo-sample.jpg',
    material: '100% жоқары тығызлықтағы полиэстер (шаң тартпайды, гранит фактура)',
    colors: 'Гранит сұр, Крем, Бежевый, Шоколад ҳәм 35+ рең',
    desc: 'Цехымыздағы нақ үлги: текстуралы гранит-сұр полосалы жалюзи. Асхана, зал ҳәм мийманханалар ушын таңланатуғын заманагөй модель. Еки қабатлы матаның ҳәрекети арқалы жарықты қалаған дәрежеде басқарыўға болады.'
  },
  'rollet-blackout': {
    title: 'Rollet Blackout Deep Night',
    category: 'Rollet (Рулонные)',
    origin: '🇩🇪 Германия',
    light: '100% толық қараңғылық',
    artikul: 'Артикул: #RL-202',
    price: '135 000 сум',
    img: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef9?q=80&w=800&auto=format&fit=crop',
    material: '3 қабатлы Blackout (күннен ҳәм ультрабинафша нурдан толық қорғаў)',
    colors: 'Қара, Графит, Қоңыр, Қойыў көк + 20 рең',
    desc: 'Жатын бөлме ҳәм балалар бөлмеси ушын күн нурын толық тосатуғын арнаўлы мата. Күндүзги ўақытта да бөлмени 100% түндей қараңғылатып береди.'
  },
  'dikiy-silk': {
    title: 'Dikiy Silk Premium',
    category: 'Dikiy жалюзи',
    origin: '🇰🇷 Корея',
    light: '80% жарықты тосады',
    artikul: 'Артикул: #DK-303',
    price: '130 000 сум',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
    material: 'Табиғий жипек структурасы бар полимер (шаң өткермейди)',
    colors: 'Шампань, Күмүс сұр, Бежевый + 25 рең',
    desc: 'Табиғий фактурасы бар сәнли мата. Үйде өзгеше премиум атмосфера жаратады, күнде өңин жоғалтпайды ҳәм тазалаўға өте қолайлы.'
  },
  'plice-zigzag': {
    title: 'Plice ZigZag Modern',
    category: 'Plice (Плиссе)',
    origin: '🇹🇷 Түркия',
    light: '70% жарық өткериў',
    artikul: 'Артикул: #PL-404',
    price: '145 000 сум',
    img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop',
    material: 'Термо-бүкленген арнаўлы плиссе матасы',
    colors: 'Қардай ақ, Мәрмәр, Сұр + 18 рең',
    desc: 'Гармошка тәризли бүкленетуғын сәнли жалюзи. Тәрезе рамасына туўры жабысып турады, үстинен де, астынан да еркин ашып-жабыўға болады.'
  },
  'combo-royal': {
    title: 'Combo Dimout Royal Gold',
    category: 'Combo (Күн & Түн)',
    origin: '🇹🇷 Түркия',
    light: '85% жарықты тосады',
    artikul: 'Артикул: #CB-505',
    price: '140 000 сум',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
    material: 'Люрекс жипли элит полиэстер',
    colors: 'Алтын, Бронза, Капучино + 15 рең',
    desc: 'Жылтыраған нәзик алтын ҳәм күмүс жиплер менен исленген қымбат мата. Зал, мийманхана ҳәм ресторанларға айрықша сән бериўши модель.'
  },
  'rollet-sunscreen': {
    title: 'Rollet SunScreen Pro',
    category: 'Rollet (Рулонные)',
    origin: '🇰🇷 Корея',
    light: '65% күннен қорғаў',
    artikul: 'Артикул: #RL-606',
    price: '125 000 сум',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    material: 'Перфорацияланған микро-торлы композит',
    colors: 'Сұр, Антрацит, Қара + 12 рең',
    desc: 'Офислер ҳәм күн кўзи түсетін үлкен терезелер ушын жылыўды өткермейтуғын арнаўлы мата. Иштен сырт көринеди, сырттан бөлме көринбейди.'
  },
  'dikiy-wood': {
    title: 'Dikiy Wood Nature',
    category: 'Dikiy жалюзи',
    origin: '🇪🇺 Европа',
    light: '85% жарықты тосады',
    artikul: 'Артикул: #DK-707',
    price: '138 000 сум',
    img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop',
    material: 'Ағаш текстуралы эко-полимер',
    colors: 'Дуб, Ашық ағаш, Венге + 16 рең',
    desc: 'Ағаш фактуралы табиғий эко-жалюзи. Ағаш мебельлер ҳәм табиғий дизайн менен үйлесип, бөлмеде жылы, жағымлы шараят жаратады.'
  },
  'plice-thermo': {
    title: 'Plice Thermo Blackout',
    category: 'Plice (Плиссе)',
    origin: '🇩🇪 Германия',
    light: '100% толық қараңғылық',
    artikul: 'Артикул: #PL-808',
    price: '160 000 сум',
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    material: 'Уяшықлы (соталы) фольга қабатлы термо-мата',
    colors: 'Қардай ақ, Сұр, Қойыў сұр + 14 рең',
    desc: 'Соталы структурасы арқалы қыста сууқты, жазда ыссылықты бөлмеге өткермейтуғын ең алдыңғы қатарлы энергия үнемлеўши плиссе модели.'
  }
};

function filterCatalog(category, button) {
  // Update button active state
  const buttons = document.querySelectorAll('.catalog-filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active', 'bg-amber-500', 'text-slate-950', 'shadow-md');
    btn.classList.add('bg-slate-100', 'text-slate-700');
  });

  if (button) {
    button.classList.add('active', 'bg-amber-500', 'text-slate-950', 'shadow-md');
    button.classList.remove('bg-slate-100', 'text-slate-700');
  }

  // Filter cards
  const cards = document.querySelectorAll('.catalog-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category') || '';
    if (category === 'all' || cardCat.includes(category)) {
      card.classList.remove('hidden');
      card.classList.add('flex');
    } else {
      card.classList.add('hidden');
      card.classList.remove('flex');
    }
  });
}

function openCatalogModal(id) {
  const item = catalogData[id];
  if (!item) return;

  document.getElementById('modal-img').src = item.img;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-artikul').textContent = item.artikul;
  document.getElementById('modal-origin').textContent = item.origin;
  document.getElementById('modal-light').textContent = item.light;
  document.getElementById('modal-desc').textContent = item.desc;
  document.getElementById('modal-material').textContent = item.material;
  document.getElementById('modal-colors').textContent = item.colors;
  document.getElementById('modal-price').textContent = item.price;

  // Set action on order button
  const orderBtn = document.getElementById('modal-order-btn');
  orderBtn.onclick = () => {
    closeCatalogModal();
    orderFromCatalog(item.title, item.price);
  };

  const modal = document.getElementById('catalog-modal');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCatalogModal() {
  const modal = document.getElementById('catalog-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside or pressing Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCatalogModal();
});

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('catalog-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCatalogModal();
    });
  }
});

function orderFromCatalog(productTitle, price) {
  const select = document.getElementById('order-blind-type');
  const notes = document.getElementById('order-notes');

  if (select) {
    if (productTitle.toLowerCase().includes('combo')) select.value = 'Combo (Day & Night)';
    else if (productTitle.toLowerCase().includes('rollet')) select.value = 'Rollet (Рулонные)';
    else if (productTitle.toLowerCase().includes('dikiy')) select.value = 'Dikiy (Дикий)';
    else if (productTitle.toLowerCase().includes('plice')) select.value = 'Plice (Плиссе)';
  }

  if (notes) {
    notes.value = `Каталогтан таңланды: ${productTitle} (Баҳасы: ${price}). Өлшеўге шебер шақыраман.`;
  }

  const contactElem = document.getElementById('contact');
  if (contactElem) {
    contactElem.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('client-name').focus();
    }, 400);
  }
}

function requestCatalogVisit() {
  const notes = document.getElementById('order-notes');
  if (notes) {
    notes.value = 'Үйге 200+ мата үлгилери бар толық қағаз каталог пенен шеберди бийпул шақыраман.';
  }
  const contactElem = document.getElementById('contact');
  if (contactElem) {
    contactElem.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('client-name').focus();
    }, 400);
  }
}
