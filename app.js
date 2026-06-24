// Navigation Mobile Menu Toggle
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('hidden');
}
document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);

// Active tab tracking state
let activeTab = 'selling';

// Switch Wizard Tabs
function switchTab(tabId) {
  activeTab = tabId;
  
  // Update Tab Styles
  const tabs = ['selling', 'buying', 'combo', 'remortgage'];
  tabs.forEach(t => {
    const tabElement = document.getElementById('tab-' + t);
    const fieldsElement = document.getElementById('fields-' + t);
    
    if (t === tabId) {
      tabElement.classList.add('border-primary-600', 'text-primary-700', 'bg-white');
      tabElement.classList.remove('border-transparent', 'text-slate-500', 'bg-slate-50');
      fieldsElement.classList.remove('hidden');
    } else {
      tabElement.classList.remove('border-primary-600', 'text-primary-700', 'bg-white');
      tabElement.classList.add('border-transparent', 'text-slate-500', 'bg-slate-50');
      fieldsElement.classList.add('hidden');
    }
  });

  // Clear any errors when switching tabs
  document.getElementById('error-alert').classList.add('hidden');
}

// Toggle Button Helper (Yes/No Custom Controls)
function setToggleButton(fieldId, value) {
  // Set hidden input value
  document.getElementById(fieldId).value = value;
  
  // Toggle button active classes
  const yesBtn = document.getElementById('btn-' + fieldId + '-yes');
  const noBtn = document.getElementById('btn-' + fieldId + '-no');
  
  if (value === 'yes') {
    yesBtn.classList.add('toggle-btn-active');
    noBtn.classList.remove('toggle-btn-active');
  } else {
    noBtn.classList.add('toggle-btn-active');
    yesBtn.classList.remove('toggle-btn-active');
  }
}

// Initialize to show default Selling tab
document.addEventListener('DOMContentLoaded', () => {
  switchTab('selling');
});

// Form Submission & Calculation
function handleFormSubmit(event) {
  event.preventDefault();
  
  const errorAlert = document.getElementById('error-alert');
  errorAlert.classList.add('hidden');

  // 1. Collect inputs based on activeTab
  let name = '';
  let email = '';
  let phone = '';
  let price = 0;
  const rawData = {};

  if (activeTab === 'selling') {
    rawData.sellPrice = parseFloat(document.getElementById('sell_price').value);
    rawData.leasehold = document.getElementById('sell_leasehold').value;
    rawData.mortgage = document.getElementById('sell_mortgage').value;
    rawData.sellersCount = parseInt(document.getElementById('sell_num_sellers').value) || 1;
    name = document.getElementById('sell_contact_name').value.trim();
    email = document.getElementById('sell_contact_email').value.trim();
    phone = document.getElementById('sell_contact_phone').value.trim();
    price = rawData.sellPrice;

    rawData.price = rawData.sellPrice;
    rawData.peopleCount = rawData.sellersCount;
    rawData.customerName = name;
    rawData.customerEmail = email;
    rawData.customerPhone = phone;
  } 
  else if (activeTab === 'buying') {
    rawData.purchasePrice = parseFloat(document.getElementById('buy_price').value);
    rawData.firstTimeBuyer = document.getElementById('buy_first_time').value;
    rawData.buyToLet = document.getElementById('buy_second_home').value;
    rawData.leasehold = document.getElementById('buy_leasehold').value;
    rawData.newBuild = document.getElementById('buy_new_build').value;
    rawData.companyPurchase = document.getElementById('buy_company').value;
    rawData.mortgage = document.getElementById('buy_mortgage').value;
    rawData.nonUkResident = document.getElementById('buy_non_uk').value;
    rawData.buyersCount = parseInt(document.getElementById('buy_num_buyers').value) || 1;
    name = document.getElementById('buy_contact_name').value.trim();
    email = document.getElementById('buy_contact_email').value.trim();
    phone = document.getElementById('buy_contact_phone').value.trim();
    price = rawData.purchasePrice;

    rawData.price = rawData.purchasePrice;
    rawData.peopleCount = rawData.buyersCount;
    rawData.customerName = name;
    rawData.customerEmail = email;
    rawData.customerPhone = phone;
  } 
  else if (activeTab === 'combo') {
    rawData.purchasePrice = parseFloat(document.getElementById('combo_buy_price').value);
    rawData.sellPrice = parseFloat(document.getElementById('combo_sell_price').value);
    rawData.sellLeasehold = document.getElementById('combo_sell_leasehold').value;
    rawData.sellMortgage = document.getElementById('combo_sell_mortgage').value;
    rawData.firstTimeBuyer = document.getElementById('combo_buy_first_time').value;
    rawData.buyToLet = document.getElementById('combo_buy_second_home').value;
    rawData.buyLeasehold = document.getElementById('combo_buy_leasehold').value;
    rawData.newBuild = document.getElementById('combo_buy_new_build').value;
    rawData.companyPurchase = document.getElementById('combo_buy_company').value;
    rawData.mortgage = document.getElementById('combo_buy_mortgage').value;
    rawData.nonUkResident = document.getElementById('combo_buy_non_uk').value;
    rawData.buyersCount = parseInt(document.getElementById('combo_buy_num_buyers').value) || 1;
    rawData.sellersCount = parseInt(document.getElementById('combo_sell_num_sellers').value) || 1;
    name = document.getElementById('combo_contact_name').value.trim();
    email = document.getElementById('combo_contact_email').value.trim();
    phone = document.getElementById('combo_contact_phone').value.trim();
    price = rawData.purchasePrice;

    rawData.price = rawData.purchasePrice;
    rawData.peopleCount = rawData.buyersCount;
    rawData.customerName = name;
    rawData.customerEmail = email;
    rawData.customerPhone = phone;
  } 
  else if (activeTab === 'remortgage') {
    rawData.propertyValue = parseFloat(document.getElementById('remortgage_price').value);
    rawData.leasehold = document.getElementById('remortgage_leasehold').value;
    rawData.transferOfOwnership = document.getElementById('remortgage_transfer').value;
    rawData.companyPurchase = document.getElementById('remortgage_company').value;
    name = document.getElementById('remortgage_contact_name').value.trim();
    email = document.getElementById('remortgage_contact_email').value.trim();
    phone = document.getElementById('remortgage_contact_phone').value.trim();
    price = rawData.propertyValue;

    rawData.price = rawData.propertyValue;
    rawData.peopleCount = 1;
    rawData.customerName = name;
    rawData.customerEmail = email;
    rawData.customerPhone = phone;
  }

  // 2. Validate Inputs
  if (isNaN(price) || price <= 0) {
    showError('Please enter a valid property value/price greater than £0.');
    return;
  }
  if (activeTab === 'combo' && (isNaN(rawData.sellPrice) || rawData.sellPrice <= 0)) {
    showError('Please enter a valid property selling price greater than £0.');
    return;
  }
  if (!name) {
    showError('Please enter your full name.');
    return;
  }
  if (!validateEmail(email)) {
    showError('Please enter a valid email address.');
    return;
  }
  if (!validatePhone(phone)) {
    showError('Please enter a valid UK phone number (e.g. 07123 456789 or +447123456789).');
    return;
  }

  // 3. Prepare Payload for Backend
  const payload = prepareQuotePayload(activeTab, rawData);
  console.log("Prepared quote payload for backend integration:", payload);

  // 4. Show Loading Animation
  const formElement = document.getElementById('quoteForm');
  const loadingOverlay = document.getElementById('loading-overlay');
  
  formElement.classList.add('hidden');
  loadingOverlay.classList.remove('hidden');

  const progress = document.getElementById('loading-progress');
  const statusText = document.getElementById('loading-status');
  
  const statuses = [
    { pct: 20, txt: 'Analyzing property transaction type...' },
    { pct: 50, txt: 'Calculating SRA solicitor legal rates...' },
    { pct: 75, txt: 'Estimating Land Registry and search disbursements...' },
    { pct: 100, txt: 'Rendering fixed-fee comparisons...' }
  ];

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < statuses.length) {
      progress.style.width = statuses[currentStep].pct + '%';
      statusText.textContent = statuses[currentStep].txt;
      currentStep++;
    } else {
      clearInterval(interval);
      
      // Complete loading, show results
      loadingOverlay.classList.add('hidden');
      formElement.classList.remove('hidden'); // keep form ready if they click edit
      document.getElementById('calculator-box').classList.add('hidden'); // hide full box
      
      // MOCK DATA ONLY - replace with backend calculation response when integration is connected:
      // fetchQuotesFromBackend(payload).then(response => {
      //    renderQuoteResults(response, rawData);
      // });
      const results = calculateMockQuotes(activeTab, rawData);
      renderQuoteResults(results, rawData);
      
      const resultsSection = document.getElementById('results-section');
      resultsSection.classList.remove('hidden');
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 350);
}

// Show input errors helper
function showError(msg) {
  const errorAlert = document.getElementById('error-alert');
  const errorMessage = document.getElementById('error-message');
  errorMessage.textContent = msg;
  errorAlert.classList.remove('hidden');
  errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Email regex check
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Phone validation for UK phone formats (accepts 07..., +44..., 44..., spaces/hyphens allowed)
function validatePhone(phone) {
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');
  return /^(0[0-9]{10}|\+44[0-9]{10}|44[0-9]{10})$/.test(clean);
}

// Returns to editing inputs
function goBackToForm() {
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('calculator-box').classList.remove('hidden');
  document.getElementById('quote-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Prepare JSON payload for future backend connection
function prepareQuotePayload(transactionType, formData) {
  return {
    transaction_type: transactionType,
    sell_price: formData.sellPrice || null,
    purchase_price: formData.purchasePrice || null,
    property_value: formData.propertyValue || null,
    leasehold: formData.leasehold || "no",
    mortgage: formData.mortgage || "no",
    first_time_buyer: formData.firstTimeBuyer || "no",
    buy_to_let: formData.buyToLet || "no",
    new_build: formData.newBuild || "no",
    company_purchase: formData.companyPurchase || "no",
    non_uk_resident: formData.nonUkResident || "no",
    buyers_count: formData.buyersCount || null,
    sellers_count: formData.sellersCount || null,
    customer_name: formData.customerName || "",
    customer_email: formData.customerEmail || "",
    customer_phone: formData.customerPhone || ""
  };
}

// Placeholder async function for real backend request
async function fetchQuotesFromBackend(payload) {
  // Future backend integration:
  // return fetch('/whatsapp/compare.php', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // }).then(res => res.json());
  return null;
}

/**
 * DYNAMIC MOCK CALCULATION ENGINE
 * // MOCK DATA ONLY - replace with PHP/backend response later
 * Easily replaceable with real backend calculations.
 */
function calculateMockQuotes(transactionType, details) {
  let versusBase = 0;
  let reynardsBase = 0;
  
  const price = details.price;
  
  if (transactionType === 'selling') {
    versusBase = 600 + Math.min(200, Math.floor(price / 4000));
    reynardsBase = 650 + Math.min(250, Math.floor(price / 3000));
  } 
  else if (transactionType === 'buying') {
    versusBase = 580 + Math.min(220, Math.floor(price / 3500));
    reynardsBase = 640 + Math.min(260, Math.floor(price / 3000));
  } 
  else if (transactionType === 'combo') {
    const sellPrice = details.sellPrice;
    versusBase = 1000 + Math.min(300, Math.floor((price + sellPrice) / 5000));
    reynardsBase = 1100 + Math.min(350, Math.floor((price + sellPrice) / 4000));
  } 
  else if (transactionType === 'remortgage') {
    versusBase = 380 + Math.min(120, Math.floor(price / 5000));
    reynardsBase = 420 + Math.min(180, Math.floor(price / 4000));
  }

  // Supplements lists
  const versusSupplements = [];
  const reynardsSupplements = [];

  // Selling / combined leasehold
  if ((transactionType === 'selling' && details.leasehold) || (transactionType === 'combo' && details.sellLeasehold)) {
    versusSupplements.push({ name: 'Leasehold Sale Supplement', amount: 150 });
    reynardsSupplements.push({ name: 'Leasehold Sale Supplement', amount: 180 });
  }
  
  // Buying / combined leasehold
  if ((transactionType === 'buying' && details.leasehold) || (transactionType === 'combo' && details.buyLeasehold) || (transactionType === 'remortgage' && details.leasehold)) {
    versusSupplements.push({ name: 'Leasehold Transaction Supplement', amount: 150 });
    reynardsSupplements.push({ name: 'Leasehold Transaction Supplement', amount: 180 });
  }

  // Selling mortgage pay off
  if ((transactionType === 'selling' && details.mortgage) || (transactionType === 'combo' && details.sellMortgage)) {
    versusSupplements.push({ name: 'Mortgage Discharge Handling', amount: 95 });
    reynardsSupplements.push({ name: 'Mortgage Discharge Handling', amount: 95 });
  }

  // Buying mortgage
  if ((transactionType === 'buying' && details.mortgage) || (transactionType === 'combo' && details.buyMortgage)) {
    versusSupplements.push({ name: 'Mortgage Inception/Lender Panel Fee', amount: 95 });
    reynardsSupplements.push({ name: 'Mortgage Inception/Lender Panel Fee', amount: 120 });
  }

  // New Build
  if ((transactionType === 'buying' && details.newBuild) || (transactionType === 'combo' && details.buyNewBuild)) {
    versusSupplements.push({ name: 'New Build Purchase Supplement', amount: 195 });
    reynardsSupplements.push({ name: 'New Build Purchase Supplement', amount: 250 });
  }

  // Buy to let / second home
  if ((transactionType === 'buying' && details.secondHome) || (transactionType === 'combo' && details.buySecondHome)) {
    versusSupplements.push({ name: 'Buy-to-Let / Second Home Handling', amount: 80 });
    reynardsSupplements.push({ name: 'Buy-to-Let / Second Home Handling', amount: 110 });
  }

  // Corporate Purchase
  if ((transactionType === 'buying' && details.company) || (transactionType === 'combo' && details.buyCompany) || (transactionType === 'remortgage' && details.company)) {
    versusSupplements.push({ name: 'Corporate Ownership Handling', amount: 120 });
    reynardsSupplements.push({ name: 'Corporate Ownership Handling', amount: 160 });
  }

  // Non-UK resident
  if ((transactionType === 'buying' && details.nonUk) || (transactionType === 'combo' && details.buyNonUk)) {
    versusSupplements.push({ name: 'Non-UK Resident Supplement', amount: 150 });
    reynardsSupplements.push({ name: 'Non-UK Resident Supplement', amount: 200 });
  }

  // Remortgage transfer of equity
  if (transactionType === 'remortgage' && details.transfer) {
    versusSupplements.push({ name: 'Transfer of Equity Handling', amount: 120 });
    reynardsSupplements.push({ name: 'Transfer of Equity Handling', amount: 150 });
  }

  const versusSuppTotal = versusSupplements.reduce((sum, item) => sum + item.amount, 0);
  const reynardsSuppTotal = reynardsSupplements.reduce((sum, item) => sum + item.amount, 0);

  // VAT at 20% on legal fees + supplements
  const versusVat = Math.round((versusBase + versusSuppTotal) * 0.2);
  const reynardsVat = Math.round((reynardsBase + reynardsSuppTotal) * 0.2);

  // Third-party Disbursements
  const versusDisbursements = [];
  const reynardsDisbursements = [];

  // AML identity verification check
  const people = details.peopleCount || 1;
  const sellers = details.sellersCount || 1;
  const totalPeople = (transactionType === 'combo') ? (people + sellers) : people;

  versusDisbursements.push({ name: `Anti-Money Laundering ID Verification (x${totalPeople})`, amount: 15 * totalPeople });
  reynardsDisbursements.push({ name: `Anti-Money Laundering ID Verification (x${totalPeople})`, amount: 18 * totalPeople });

  // Bank Transfer (CHAPS transfer of funds)
  versusDisbursements.push({ name: 'CHAPS Bank Transfer Administration', amount: 30 });
  reynardsDisbursements.push({ name: 'CHAPS Bank Transfer Administration', amount: 35 });

  // Search Pack (Buying/Combo only)
  if (transactionType === 'buying' || transactionType === 'combo') {
    versusDisbursements.push({ name: 'Regulated Search Pack (Local, Environmental, Drainage)', amount: 215 });
    reynardsDisbursements.push({ name: 'Regulated Search Pack (Local, Environmental, Drainage)', amount: 240 });
    
    versusDisbursements.push({ name: 'Bankruptcy Official Search', amount: 2 * people });
    reynardsDisbursements.push({ name: 'Bankruptcy Official Search', amount: 2 * people });
    
    versusDisbursements.push({ name: 'HM Land Registry OS1 Priority Search', amount: 3 });
    reynardsDisbursements.push({ name: 'HM Land Registry OS1 Priority Search', amount: 3 });
  }

  // Land Registry Registration fee (scaled with price)
  if (transactionType === 'buying' || transactionType === 'combo' || transactionType === 'remortgage') {
    let lrFee = 20;
    if (price > 100000 && price <= 200000) lrFee = 30;
    else if (price > 200000 && price <= 500000) lrFee = 80;
    else if (price > 500000) lrFee = 150;

    versusDisbursements.push({ name: 'HM Land Registry Registration Fee', amount: lrFee });
    reynardsDisbursements.push({ name: 'HM Land Registry Registration Fee', amount: lrFee });
  }

  const versusDisbTotal = versusDisbursements.reduce((sum, item) => sum + item.amount, 0);
  const reynardsDisbTotal = reynardsDisbursements.reduce((sum, item) => sum + item.amount, 0);

  // Totals
  const versusTotal = versusBase + versusSuppTotal + versusVat + versusDisbTotal;
  const reynardsTotal = reynardsBase + reynardsSuppTotal + reynardsVat + reynardsDisbTotal;

  return {
    versus: {
      base: versusBase,
      supplements: versusSupplements,
      suppTotal: versusSuppTotal,
      vat: versusVat,
      disbursements: versusDisbursements,
      disbTotal: versusDisbTotal,
      total: versusTotal
    },
    reynards: {
      base: reynardsBase,
      supplements: reynardsSupplements,
      suppTotal: reynardsSuppTotal,
      vat: reynardsVat,
      disbursements: reynardsDisbursements,
      disbTotal: reynardsDisbTotal,
      total: reynardsTotal
    }
  };
}

// Render results in card UI
function renderQuoteResults(results, details) {
  // Update Summary Header Text
  let summaryText = '';
  if (activeTab === 'selling') {
    summaryText = `Selling Property at £${details.price.toLocaleString()} · Leasehold: ${details.leasehold ? 'Yes' : 'No'} · Mortgage Payoff: ${details.mortgage ? 'Yes' : 'No'}`;
  } else if (activeTab === 'buying') {
    summaryText = `Buying Property at £${details.price.toLocaleString()} · Leasehold: ${details.leasehold ? 'Yes' : 'No'} · Mortgage: ${details.mortgage ? 'Yes' : 'No'} · New Build: ${details.newBuild ? 'Yes' : 'No'}`;
  } else if (activeTab === 'combo') {
    summaryText = `Buying at £${details.price.toLocaleString()} & Selling at £${details.sellPrice.toLocaleString()} · Buy Leasehold: ${details.buyLeasehold ? 'Yes' : 'No'}`;
  } else if (activeTab === 'remortgage') {
    summaryText = `Remortgaging at Value £${details.price.toLocaleString()} · Leasehold: ${details.leasehold ? 'Yes' : 'No'} · Ownership Transfer: ${details.transferOfOwnership ? 'Yes' : 'No'}`;
  }
  document.getElementById('results-summary').textContent = summaryText;

  // Update Versus Law Cards
  document.getElementById('versus-total-price').textContent = `£${results.versus.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('versus-legal-fee').textContent = `£${results.versus.base.toFixed(2)}`;
  document.getElementById('versus-supp-fee').textContent = `£${results.versus.suppTotal.toFixed(2)}`;
  document.getElementById('versus-vat-fee').textContent = `£${results.versus.vat.toFixed(2)}`;
  document.getElementById('versus-disb-fee').textContent = `£${results.versus.disbTotal.toFixed(2)}`;

  // Update Reynards Cards
  document.getElementById('reynards-total-price').textContent = `£${results.reynards.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('reynards-legal-fee').textContent = `£${results.reynards.base.toFixed(2)}`;
  document.getElementById('reynards-supp-fee').textContent = `£${results.reynards.suppTotal.toFixed(2)}`;
  document.getElementById('reynards-vat-fee').textContent = `£${results.reynards.vat.toFixed(2)}`;
  document.getElementById('reynards-disb-fee').textContent = `£${results.reynards.disbTotal.toFixed(2)}`;

  // Generate Disbursement HTML breakdowns
  generateDisbursementHTML('breakdown-versus', results.versus);
  generateDisbursementHTML('breakdown-reynards', results.reynards);
  
  // Close any open breakdowns by default
  document.getElementById('breakdown-versus').classList.add('hidden');
  document.getElementById('breakdown-reynards').classList.add('hidden');
  document.getElementById('arrow-versus').classList.remove('rotate-180');
  document.getElementById('arrow-reynards').classList.remove('rotate-180');
}

// Detailed disbursement sublist generator
function generateDisbursementHTML(targetId, quoteData) {
  const container = document.getElementById(targetId);
  let html = '<div class="space-y-3">';
  
  // Supplements list if any
  if (quoteData.supplements.length > 0) {
    html += '<p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Legal supplements included:</p><ul class="space-y-1 pl-2 border-l border-slate-200 mb-3">';
    quoteData.supplements.forEach(supp => {
      html += `<li class="flex justify-between text-slate-600"><span>- ${supp.name}</span><span class="font-semibold text-slate-700">£${supp.amount.toFixed(2)}</span></li>`;
    });
    html += '</ul>';
  }

  // Third party disbursements
  html += '<p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Third-party fees (Disbursements):</p><ul class="space-y-1 pl-2 border-l border-slate-200">';
  quoteData.disbursements.forEach(disb => {
    html += `<li class="flex justify-between text-slate-600"><span>- ${disb.name}</span><span class="font-semibold text-slate-700">£${disb.amount.toFixed(2)}</span></li>`;
  });
  html += '</ul>';

  html += '</div>';
  container.innerHTML = html;
}

// Toggle accordion drawer for breakdowns
function toggleDisbursementBreakdown(cardType) {
  const breakdown = document.getElementById('breakdown-' + cardType);
  const arrow = document.getElementById('arrow-' + cardType);
  
  breakdown.classList.toggle('hidden');
  arrow.classList.toggle('rotate-180');
}

// Success Modal control
function instructSolicitor(solicitorName) {
  document.getElementById('modal-solicitor-name').textContent = solicitorName;
  
  const modal = document.getElementById('success-modal');
  modal.classList.remove('hidden');
  modal.firstElementChild.classList.remove('scale-95');
  modal.firstElementChild.classList.add('scale-100');
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.firstElementChild.classList.remove('scale-100');
  modal.firstElementChild.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
    goBackToForm();
  }, 155);
}
