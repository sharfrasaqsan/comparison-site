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
      
      // Try to fetch quotes from the database-driven PHP backend API
      fetchQuotesFromBackend(payload)
        .then(response => {
          // Complete loading, show results
          loadingOverlay.classList.add('hidden');
          formElement.classList.remove('hidden'); // keep form ready if they click edit
          document.getElementById('calculator-box').classList.add('hidden'); // hide full box
          
          renderQuoteResults(response, rawData);
          const resultsSection = document.getElementById('results-section');
          resultsSection.classList.remove('hidden');
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch(err => {
          console.error("Backend API call failed:", err);
          loadingOverlay.classList.add('hidden');
          formElement.classList.remove('hidden');
          showError('We encountered an error calculating your quote from the database. Please try again.');
        });
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
  const typeMap = {
    'selling': 1,
    'buying': 2,
    'combo': 3,
    'remortgage': 4
  };
  return {
    transaction_type: typeMap[transactionType] || 2,
    transaction_key: transactionType,
    purchase_price: formData.purchasePrice || null,
    sell_price: formData.sellPrice || null,
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

// Fetch conveyancing quotes from the database-driven PHP backend API
async function fetchQuotesFromBackend(payload) {
  // PHP calculates quotes from provided backend tables.
  // JavaScript only displays the API response.
  const response = await fetch('api/get-quotes.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`API returned HTTP status ${response.status}`);
  }
  const result = await response.json();
  if (result && result.success === false) {
    throw new Error(result.error || 'Unknown backend API error');
  }
  return result;
}

/**
 * DATABASE TABLE BASED MOCK RESPONSE GENERATOR
 * Imitates response based on:
 * - solicitors
 * - legal_fee_ranges
 * - fees_table
 * - fees_name
 * - fees_type
 */
function getMockTableBasedQuoteResponse(payload) {
  const transactionKey = payload.transaction_key;
  const price = payload.purchase_price || payload.sell_price || payload.property_value || 0;
  
  // 1. Calculate Base Legal Fees (Simulating legal_fee_ranges table lookup)
  let versusBase = 0;
  let reynardsBase = 0;

  if (transactionKey === 'selling') {
    versusBase = 600 + Math.min(200, Math.floor(price / 4000));
    reynardsBase = 650 + Math.min(250, Math.floor(price / 3000));
  } else if (transactionKey === 'buying') {
    versusBase = 580 + Math.min(220, Math.floor(price / 3500));
    reynardsBase = 640 + Math.min(260, Math.floor(price / 3000));
  } else if (transactionKey === 'combo') {
    const sellPrice = payload.sell_price || 0;
    versusBase = 1000 + Math.min(300, Math.floor((price + sellPrice) / 5000));
    reynardsBase = 1100 + Math.min(350, Math.floor((price + sellPrice) / 4000));
  } else if (transactionKey === 'remortgage') {
    versusBase = 380 + Math.min(120, Math.floor(price / 5000));
    reynardsBase = 420 + Math.min(180, Math.floor(price / 4000));
  }

  // 2. Supplements (Simulating fees_table / fees_name with type="supplement")
  const versusSupplements = [];
  const reynardsSupplements = [];

  // Leasehold Supplement
  if (payload.leasehold === 'yes') {
    versusSupplements.push({ fee_name_id: 1, name: 'Leasehold Transaction Supplement (inc VAT)', type: 'supplement', amount: 150.00 });
    reynardsSupplements.push({ fee_name_id: 1, name: 'Leasehold Transaction Supplement (inc VAT)', type: 'supplement', amount: 180.00 });
  }

  // Mortgage pay off (Selling)
  if (transactionKey === 'selling' && payload.mortgage === 'yes') {
    versusSupplements.push({ fee_name_id: 2, name: 'Mortgage Discharge Handling (inc VAT)', type: 'supplement', amount: 95.00 });
    reynardsSupplements.push({ fee_name_id: 2, name: 'Mortgage Discharge Handling (inc VAT)', type: 'supplement', amount: 95.00 });
  }

  // Mortgage inception (Buying)
  if (transactionKey === 'buying' && payload.mortgage === 'yes') {
    versusSupplements.push({ fee_name_id: 3, name: 'Mortgage Inception/Lender Panel Fee (inc VAT)', type: 'supplement', amount: 95.00 });
    reynardsSupplements.push({ fee_name_id: 3, name: 'Mortgage Inception/Lender Panel Fee (inc VAT)', type: 'supplement', amount: 120.00 });
  }

  // New Build
  if (payload.new_build === 'yes') {
    versusSupplements.push({ fee_name_id: 4, name: 'New Build Purchase Supplement (inc VAT)', type: 'supplement', amount: 195.00 });
    reynardsSupplements.push({ fee_name_id: 4, name: 'New Build Purchase Supplement (inc VAT)', type: 'supplement', amount: 250.00 });
  }

  // Buy to let / second home
  if (payload.buy_to_let === 'yes') {
    versusSupplements.push({ fee_name_id: 5, name: 'Buy-to-Let / Second Home Handling (inc VAT)', type: 'supplement', amount: 80.00 });
    reynardsSupplements.push({ fee_name_id: 5, name: 'Buy-to-Let / Second Home Handling (inc VAT)', type: 'supplement', amount: 110.00 });
  }

  // Corporate Purchase
  if (payload.company_purchase === 'yes') {
    versusSupplements.push({ fee_name_id: 6, name: 'Corporate Ownership Handling (inc VAT)', type: 'supplement', amount: 120.00 });
    reynardsSupplements.push({ fee_name_id: 6, name: 'Corporate Ownership Handling (inc VAT)', type: 'supplement', amount: 160.00 });
  }

  // Non-UK resident
  if (payload.non_uk_resident === 'yes') {
    versusSupplements.push({ fee_name_id: 7, name: 'Non-UK Resident Supplement (inc VAT)', type: 'supplement', amount: 150.00 });
    reynardsSupplements.push({ fee_name_id: 7, name: 'Non-UK Resident Supplement (inc VAT)', type: 'supplement', amount: 200.00 });
  }

  // 3. Disbursements (Simulating fees_table / fees_name with type="disbursement")
  const versusDisbursements = [];
  const reynardsDisbursements = [];

  const buyers = payload.buyers_count || 1;
  const sellers = payload.sellers_count || 1;
  const totalPeople = (transactionKey === 'combo') ? (buyers + sellers) : buyers;

  // AML Verification check
  versusDisbursements.push({ fee_name_id: 8, name: `Anti-Money Laundering ID Verification (x${totalPeople})`, type: 'disbursement', amount: 15.00 * totalPeople });
  reynardsDisbursements.push({ fee_name_id: 8, name: `Anti-Money Laundering ID Verification (x${totalPeople})`, type: 'disbursement', amount: 18.00 * totalPeople });

  // Bank Transfer
  versusDisbursements.push({ fee_name_id: 9, name: 'CHAPS Bank Transfer Administration', type: 'disbursement', amount: 30.00 });
  reynardsDisbursements.push({ fee_name_id: 9, name: 'CHAPS Bank Transfer Administration', type: 'disbursement', amount: 35.00 });

  // Search Pack (Buying/Combo only)
  if (transactionKey === 'buying' || transactionKey === 'combo') {
    versusDisbursements.push({ fee_name_id: 10, name: 'Regulated Search Pack (Local, Environmental, Drainage)', type: 'disbursement', amount: 215.00 });
    reynardsDisbursements.push({ fee_name_id: 10, name: 'Regulated Search Pack (Local, Environmental, Drainage)', type: 'disbursement', amount: 240.00 });
    
    versusDisbursements.push({ fee_name_id: 11, name: 'Bankruptcy Official Search', type: 'disbursement', amount: 2.00 * totalPeople });
    reynardsDisbursements.push({ fee_name_id: 11, name: 'Bankruptcy Official Search', type: 'disbursement', amount: 2.00 * totalPeople });
    
    versusDisbursements.push({ fee_name_id: 12, name: 'HM Land Registry OS1 Priority Search', type: 'disbursement', amount: 3.00 });
    reynardsDisbursements.push({ fee_name_id: 12, name: 'HM Land Registry OS1 Priority Search', type: 'disbursement', amount: 3.00 });
  }

  // HM Land Registry Fee (scaled with price)
  if (transactionKey === 'buying' || transactionKey === 'combo' || transactionKey === 'remortgage') {
    let lrFee = 20.00;
    if (price > 100000 && price <= 200000) lrFee = 30.00;
    else if (price > 200000 && price <= 500000) lrFee = 80.00;
    else if (price > 500000) lrFee = 150.00;

    versusDisbursements.push({ fee_name_id: 13, name: 'HM Land Registry Registration Fee', type: 'disbursement', amount: lrFee });
    reynardsDisbursements.push({ fee_name_id: 13, name: 'HM Land Registry Registration Fee', type: 'disbursement', amount: lrFee });
  }

  // VAT (20%) on legal base fee + supplements
  const versusSuppTotal = versusSupplements.reduce((sum, item) => sum + item.amount, 0);
  const reynardsSuppTotal = reynardsSupplements.reduce((sum, item) => sum + item.amount, 0);

  const versusVat = Math.round((versusBase + versusSuppTotal) * 0.2);
  const reynardsVat = Math.round((reynardsBase + reynardsSuppTotal) * 0.2);

  const versusDisbTotal = versusDisbursements.reduce((sum, item) => sum + item.amount, 0);
  const reynardsDisbTotal = reynardsDisbursements.reduce((sum, item) => sum + item.amount, 0);

  // Totals
  const versusTotal = versusBase + versusSuppTotal + versusVat + versusDisbTotal;
  const reynardsTotal = reynardsBase + reynardsSuppTotal + reynardsVat + reynardsDisbTotal;

  return {
    success: true,
    quotes: [
      {
        solicitor_id: 1,
        solicitor_name: "Versus Law",
        solicitor_logo: "1778473407_vc.png",
        legal_fee: versusBase,
        supplements: versusSupplements,
        disbursements: versusDisbursements,
        vat: versusVat,
        total: versusTotal
      },
      {
        solicitor_id: 2,
        solicitor_name: "Reynards Law",
        solicitor_logo: "reynards_logo.png",
        legal_fee: reynardsBase,
        supplements: reynardsSupplements,
        disbursements: reynardsDisbursements,
        vat: reynardsVat,
        total: reynardsTotal
      }
    ]
  };
}

// Render results dynamically from quotes response
function renderQuoteResults(response, details) {
  // Update Summary Header Text
  let summaryText = '';
  const priceVal = details.price || 0;
  if (activeTab === 'selling') {
    summaryText = `Selling Property at £${priceVal.toLocaleString()} · Leasehold: ${details.leasehold === 'yes' ? 'Yes' : 'No'} · Mortgage Payoff: ${details.mortgage === 'yes' ? 'Yes' : 'No'}`;
  } else if (activeTab === 'buying') {
    summaryText = `Buying Property at £${priceVal.toLocaleString()} · Leasehold: ${details.leasehold === 'yes' ? 'Yes' : 'No'} · Mortgage: ${details.mortgage === 'yes' ? 'Yes' : 'No'} · New Build: ${details.newBuild === 'yes' ? 'Yes' : 'No'}`;
  } else if (activeTab === 'combo') {
    const sellPriceVal = details.sellPrice || 0;
    summaryText = `Buying at £${priceVal.toLocaleString()} & Selling at £${sellPriceVal.toLocaleString()} · Buy Leasehold: ${details.buyLeasehold === 'yes' ? 'Yes' : 'No'}`;
  } else if (activeTab === 'remortgage') {
    summaryText = `Remortgaging at Value £${priceVal.toLocaleString()} · Leasehold: ${details.leasehold === 'yes' ? 'Yes' : 'No'} · Ownership Transfer: ${details.transferOfOwnership === 'yes' ? 'Yes' : 'No'}`;
  }
  document.getElementById('results-summary').textContent = summaryText;

  const quotesGrid = document.getElementById('quotes-grid');
  quotesGrid.innerHTML = ''; // Clear fallback cards

  if (!response || !response.quotes || response.quotes.length === 0) {
    quotesGrid.innerHTML = '<div class="col-span-2 text-center py-8 text-slate-500 font-medium">No quotes available.</div>';
    return;
  }

  response.quotes.forEach((quote, index) => {
    const suppTotal = quote.supplements.reduce((sum, item) => sum + item.amount, 0);
    const disbTotal = quote.disbursements.reduce((sum, item) => sum + item.amount, 0);
    
    const isRecommended = index === 0;
    const cardBorderClass = isRecommended ? 'border-2 border-primary-600 shadow-xl' : 'border border-slate-200 shadow-md hover:shadow-lg';
    const btnClass = isRecommended ? 'btn-primary text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800';
    const badgeHtml = isRecommended ? `
      <div class="bg-primary-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 absolute top-0 right-0 rounded-bl-xl">
        Demo Quote · Recommended
      </div>` : '';

    const initials = quote.solicitor_name.split(' ').map(n => n[0]).join('');

    // Generate detailed breakdown HTML
    let breakdownHtml = '<div class="space-y-3">';
    if (quote.supplements.length > 0) {
      breakdownHtml += '<p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Legal supplements included:</p><ul class="space-y-1 pl-2 border-l border-slate-200 mb-3">';
      quote.supplements.forEach(supp => {
        breakdownHtml += `<li class="flex justify-between text-slate-600"><span>- ${supp.name}</span><span class="font-semibold text-slate-700">£${supp.amount.toFixed(2)}</span></li>`;
      });
      breakdownHtml += '</ul>';
    }
    breakdownHtml += '<p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Third-party fees (Disbursements):</p><ul class="space-y-1 pl-2 border-l border-slate-200">';
    quote.disbursements.forEach(disb => {
      breakdownHtml += `<li class="flex justify-between text-slate-600"><span>- ${disb.name}</span><span class="font-semibold text-slate-700">£${disb.amount.toFixed(2)}</span></li>`;
    });
    breakdownHtml += '</ul></div>';

    const cardHtml = `
      <div class="bg-white rounded-3xl ${cardBorderClass} overflow-hidden relative flex flex-col justify-between transition-all duration-300">
        ${badgeHtml}
        
        <div class="p-6 md:p-8 space-y-6 flex-1">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 font-bold border border-primary-100">${initials}</div>
            <div>
              <h4 class="font-heading font-extrabold text-2xl text-primary-900">${quote.solicitor_name}</h4>
              <div class="flex items-center gap-1.5 text-amber-500 mt-0.5">
                <div class="flex">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  <svg class="w-4 h-4 ${isRecommended ? 'text-amber-500' : 'text-slate-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                </div>
                <span class="text-xs font-bold text-slate-500">4.8/5 (Demo Rating)</span>
              </div>
            </div>
          </div>
          
          <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex justify-between items-center">
            <div>
              <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fixed Legal Fee</p>
              <p class="text-[10px] text-slate-500 mt-0.5">Subject to confirmation</p>
            </div>
            <div class="text-right">
              <span class="text-3xl font-heading font-extrabold text-slate-900">£${quote.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <p class="text-xs text-slate-500 font-semibold">inc. VAT & disbursements</p>
            </div>
          </div>
          
          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between text-slate-600">
              <span>Legal Solicitor Fees (Fixed)</span>
              <span class="font-semibold text-slate-800">£${quote.legal_fee.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Supplements</span>
              <span class="font-semibold text-slate-800">£${suppTotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>VAT on Legal Fees (20%)</span>
              <span class="font-semibold text-slate-800">£${quote.vat.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Disbursements (Third-Party Costs)</span>
              <span class="font-semibold text-slate-800">£${disbTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="border-t border-slate-100 pt-4">
            <button type="button" onclick="toggleDisbursementBreakdown('${quote.solicitor_id}')" class="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1">
              <span>Detailed Disbursement Breakdown</span>
              <svg id="arrow-${quote.solicitor_id}" class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div id="breakdown-${quote.solicitor_id}" class="hidden mt-3 bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              ${breakdownHtml}
            </div>
          </div>
        </div>
        
        <div class="p-6 md:p-8 bg-slate-50 border-t border-slate-100">
          <button type="button" onclick="instructSolicitor('${quote.solicitor_name}')" class="${btnClass} w-full py-3.5 rounded-xl font-extrabold text-sm text-center shadow-md transition-all duration-300">
            Choose ${quote.solicitor_name}
          </button>
        </div>
      </div>
    `;
    quotesGrid.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// Toggle accordion drawer for breakdowns
function toggleDisbursementBreakdown(solicitorId) {
  const breakdown = document.getElementById('breakdown-' + solicitorId);
  const arrow = document.getElementById('arrow-' + solicitorId);
  
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

