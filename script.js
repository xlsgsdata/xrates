var rates = [];

// Onload -------------------------------------------------------------------------------------------
function loadPage() {
	getPage(); 
}

// navigation -------------------------------------------------------------------------------------------
function getPage() {
	var p = window.location.pathname;
	if (p.match('/contact')) {
		var navi = "contact";	
	} else if (p.match('/about')) {
		var navi = "about";
	} else {
		var navi = "home";
		getRates();		
		google.charts.load('current', {packages: ['corechart']});			
	}
	naviSelect(navi);
}

function naviSelect(navi) {
	document.getElementById(navi).style.borderBottom = "5px solid white";
	//document.getElementById(navi).style.fontWeight = "bold"; 	
}


// Currencies
function getCurrencies() {
	for (var i=0; i < currencies.length; i++) { 
		var options = options + "<option>" + currencies[i] + "</options>";
	}
	document.getElementById("basecur").innerHTML = options;
	document.getElementById("quotecur").innerHTML = options;
	document.getElementById("basecur").value = "";
	document.getElementById("quotecur").value = "";	
	document.getElementById("baseval").value = ""; 
	document.getElementById("quoteval").value = "";	
	document.getElementById("pairs").style.display = "block";	
	document.getElementById("pairsrates").style.display = "block";
	getPairRates();
}

//get data ------------------------------------------------------------------------------------------------------------
async function getData () {
	const token = "1234";	
	const enc_token = encryptWithAES(token);
	const url = "https://script.google.com/macros/s/AKfycbxt1ctnZpRu2EJwIUcmP41iBR2GeKfJgVxWHNAAMzJf31g7Tr_c5ThWXpFbr5mHjQXiCw/exec"
	+ "?token=" + token;
	
	let response = await fetch(url)
	.then(response => response.text())
	return response;
}

const encryptWithAES = (text) => {
  const passphrase = '123';
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

function getRates() {
	getData().then(response => {
		if (response!='Failed') {
			entries = JSON.parse(response);
		}		
		rates = entries;
		allowInput();
	})
}

function allowInput() {
	document.getElementById("basecur").disabled = false;
	document.getElementById("quotecur").disabled = false;
	document.getElementById("baseval").disabled = false;
	document.getElementById("quoteval").disabled = false;
	getCurrencies();
}

function getRate(cur) {
	let code = cur.substring(0, 3);
	let lr = rates.length - 1;
	for (var i=0; i < rates[0].length; i++) { 
		if (rates[0][i] == code) {
			let rate = rates[lr][i];
			return rate;
			break;
		}
	}
}

function getPrevRate(cur) {
	let code = cur.substring(0, 3);
	let lr = rates.length -2;
	for (var i=0; i < rates[0].length; i++) { 
		if (rates[0][i] == code) {
			let rate = rates[lr][i];
			return rate;
			break;
		}
	}	
}

// convert currency -----------------------------------------------------------------------------------------------------------
function convertCurrency(e) {
	
	// remove message below the converter
	if (e.id=="basecur" || e.id=="quotecur") {
		document.getElementById("exchange").innerText = "";	
	}
	
	// check if numeric
	if (e.id=="baseval" || e.id=="quoteval") {
		if (e.value=="") {
			clearContents();
		} else if ( isNaN(e.value) || isNaN(parseFloat(e.value)) ) {  
			var eval = e.value;
			e.value = eval.substring(0, eval.length - 1);	
			return;
		}
	}
	
	// get currencys
	let basecur = document.getElementById("basecur").value;
	let quotecur = document.getElementById("quotecur").value;	
	
	// show rates
	if (basecur!="" || quotecur!="") {
		showRates();
	}
		
	// convert currency now
	if (basecur!="" && quotecur!="") {	
		let baseval = document.getElementById("baseval").value;
		let quoteval = document.getElementById("quoteval").value;	
		var baseprice = getRate(basecur);	
		var quoteprice = getRate(quotecur);	
		updateExchange(basecur,quotecur,baseprice,quoteprice);		
			
		if (baseval!="" || quoteval!="") {

			if (e.id=="baseval" || e.id=="basecur") {
				if (baseval!="") {
					var amount = baseval;
					var target = document.getElementById("quoteval");
				} else if (quoteval!="") {
					amount = quoteval;
					var target = document.getElementById("baseval");
					var baseprice = getRate(quotecur);		
					var quoteprice = getRate(basecur);
				}
			} else if (e.id=="quoteval" || e.id=="quotecur") {
				if (quoteval!="") {
				amount = quoteval;
				var target = document.getElementById("baseval");
				var baseprice = getRate(quotecur);		
				var quoteprice = getRate(basecur);	
				} else if (baseval!="") {
					var amount = baseval;
					var target = document.getElementById("quoteval");
				}					
			}
						
			var targetval = amount * quoteprice / baseprice;
			if (target) {
				target.value = formatNumber(targetval);		
			}			
		}
	}
}

function formatNumber(num) {		
	if (Number.isInteger(num)) {
		var fix = 2;
	} else {
		// set number of decimals if < 1 to ensure at least 2 digits after 0s (example 0.000032)
		var numzeros = -Math.floor( Math.log10(Number(num)) + 1 );  // number of 0s after the dot
		if (num < 1 && numzeros > 0) {	
			fix = numzeros + 2;
		} else {
			fix = 2;
		}
	}
	return Number(num).toFixed(fix);
}

function clearContents() {
	document.getElementById("baseval").value = "";
	document.getElementById("quoteval").value = "";
}

function numberWithCommas(x) {  // NOT used anymore - creates many problems!!!!!!!!!!!!!!!!
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// other functions ------------------------------------------------------------------------------------------------------------
function getCurCode(e) {
	let cur = document.getElementById(e).value;
	return cur.substring(0, 3);
}

function getCurName(code) {
	for (var c = 0; c < currencies.length; c++) { 
		if (currencies[c].substring(0, 3) == code) {
			return currencies[c];
			break;
		}
	}
}

function getCurPrice(code) {
	for (var c = 0; c < rates[0].length; c++) { 
		if (rates[0][c] == code) {
			let lr = rates.length - 1;
			return rates[lr][c];
			break;
		}
	}
}

function swapcur() {
	let basecur = document.getElementById("basecur").value;
	let quotecur = document.getElementById("quotecur").value;
	document.getElementById("basecur").value = quotecur;
	document.getElementById("quotecur").value = basecur;
	var el = document.getElementById("basecur");
	convertCurrency (el);
}

function updateExchange(basecur,quotecur,baseprice,quoteprice) {
	var targetval = quoteprice/baseprice;
	let basecode = basecur.substring(0, 3);
	let quotecode = quotecur.substring(0, 3);	
	document.getElementById("message").style.display = 'none';
	if (basecode!="JPY" && quotecode!="JPY") {
		targetval = targetval.toFixed(6)
	} else {
		targetval = targetval.toFixed(3)
	}
	document.getElementById("exchange").innerText = "1 " + basecode + " = " + targetval + " " + quotecode;
	var lastupdate = new Date(rates[rates.length-1][0]);
	document.getElementById("lastupdate").innerText = lastupdate;
	
	var days = sessionStorage.getItem("days");
	if (days == null) {
		sessionStorage.setItem("days", 180);
		var days = 180; 
	}
	getHistoric(basecode,quotecode,days);
}

// Historic data  -------------------------------------------------------------------------------------------------------
function getHistoric(basecode,quotecode,days) { 
	//get columns for base and quote currencies (c1 and c2 respectively)
	for (var c = 0; c < rates[0].length; c++) { 
		if (rates[0][c] == basecode) {
			var c1 = c;
		} else if (rates[0][c] == quotecode) {
			var c2 = c;
		}
	}
	
	//get data for base and quote currencies over the priod of time (lr-days)
	var FXdata = [];	
	let lr = rates.length;
	for (var r = lr-days; r < lr ;r++) {
		var date = new Date(rates[r][0]);
		var datestr = date.getFullYear() + "," + (date.getMonth()+1) + "," + date.getDate();
		var rate1 = rates[r][c1];
		var rate2 = rates[r][c2];
		var rate = rate2/rate1;	
		FXdata.push([new Date(datestr), rate]);				
	}
			
	//update chart title and show chart
	document.getElementById("chartarea").style.display = 'block';
	document.getElementById("chartTitle").innerText = basecode + " to " + quotecode + " Chart";
	var percent = (rate - (rates[lr-days][c2]/rates[lr-days][c1])) / rate * 100;
	if ( isNaN(percent) ) { percent = 0; }
	let period = getPeriod(days);	
	if (percent >= 0) {
		document.getElementById("percent").innerHTML = "<label style='color:#090;'>+" + percent.toFixed(2) + "%</label> (" + period + ")";			
	} else {
		document.getElementById("percent").innerHTML = "<label style='color:red;'>" + percent.toFixed(2) + "%</label> (" + period + ")";	
	}
	selectPeriod(period);
	showChart(FXdata,days);
}

// Show chart  ------------------------------------------------------------------------------------
function showChart(mydata,days) { 
	if (days<90) {
		var dateperiod = 'week';
	} else if (days<360) {
		var dateperiod = 'month';	
	} else {
		var dateperiod = 'year';			
	}
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'date');
	data.addColumn('number', 'rate');
	data.addRows(mydata);
	
	var options = {
		//title: 'FX Chart',
		//width: 900,
		lineWidth:1,
		height: 400,
		legend: 'none',
		hAxis: {
		  //format: 'dd-MMM',
			textStyle: {
				color: '#555',
				fontSize: 12,
				bold: false,
				italic: false
			},
			gridlines: {
				color: 'none'
			},
			//gridlines: {
				//count: -1,
				//units: {
					//days: {format: ['dd MMM']
				//}
			//}
		},
		vAxis: {
			format:'#,####0.0000'
			//gridlines: {count: 5}
		}
	};

	if (dateperiod == 'week') {
		options.hAxis.format = 'dd MMM';
		options.hAxis.showTextEvery = 1;
	} else if (dateperiod == 'month') {
		options.hAxis.format = 'MMM YYYY';
		options.hAxis.showTextEvery = 1;
	}  else if (dateperiod == 'year') {
		options.hAxis.format = 'MMM YYYY';
		options.hAxis.showTextEvery = 2;
	}
	
	// Instantiate and draw the chart.
	var chart = new google.visualization.LineChart(document.getElementById('FXchart'));
	chart.draw(data, options);
}

function selectPeriod(period) {
	const btns = document.getElementById("chartarea").getElementsByTagName("button");
	for (var i = 0; i < btns.length; i++) {
		var el = btns[i];
		el.style.background = '#F2F2F2'; 
		el.style.color = 'black'; 
	}
	document.getElementById(period).style.background = '#555'; 
	document.getElementById(period).style.color = 'white'; 
}

function setPeriod(el){
	if (el.id == "1M") {
		var days = 30;
	} else if (el.id == "3M") {
		var days = 90;
	} else if (el.id == "6M") {
		var days = 180;		
	} else if (el.id == "1Y") {
		var days = 365;		
	} else if (el.id == "2Y") {
		var days = 730;		
	}
	sessionStorage.setItem("days", days);
	let basecode = getCurCode('basecur');
	let quotecode = getCurCode('quotecur');
	getHistoric(basecode,quotecode,days);
}

function getPeriod(days){
	if (days == 30) {
		return '1M';
	} else if (days == 90) {
		return '3M';
	} else if (days == 180) {
		return '6M';	
	} else if (days == 365) {
		return '1Y';	
	} else if (days == 730) {
		return '2Y';	
	}
}

// Rates -------------------------------------------------------------------------------------------------
function showRates() {
	var ratesarea = document.getElementById("ratesarea");	
	if (window.getComputedStyle(ratesarea, null).display == "none") {
		ratesarea.style.display = "block"
		document.getElementById("ratestbl").style.display = 'block';
	}

	var table = document.getElementById("ratestbl");
	var basecur = document.getElementById("basecur");
	var quotecur = document.getElementById("quotecur");
	if (basecur.value!="") {
		var cur = basecur.value;
		var code = getCurCode("basecur");
		var price = getCurPrice(code);
	} else if (quotecur.value!="") {
		var cur = quotecur.value;
		var code = getCurCode("quotecur");
		var price = getCurPrice(code);		
	}

	//clear table
	if (table.rows.length > 2) {
		table.innerHTML = "";		
	}

	//insert first row in table
	var row = table.insertRow(0);
	row.insertCell(0).outerHTML = "<th></th><th class='tbl1curname'>" + cur + "</th><th class='tbl1currate'>1.00</th>";

	//insert other rows in table
	for (var r = 0; r < currencies.length; r++){	
		var rcur = currencies[r];
		if (rcur!="--------------------------------") {
			if (rcur!=cur) {
				var rcode = rcur.substring(0, 3);
				var rprice = getCurPrice(rcode);
				var row = table.insertRow(table.rows.length);
				var rflag= "pics/flags/" + flags[r].toLowerCase()  + ".png";
				var cell = row.insertCell(0);
				cell.innerHTML = "<img src='" + rflag + "'>";
				var cell = row.insertCell(1);
				cell.className = "tbl1curname";
				cell.innerText = rcur;
				var cell = row.insertCell(2);
				cell.className = "tbl1currate";			
				cell.innerText = (rprice/price).toFixed(6);
			} else {
				var flag= "pics/flags/" + flags[r].toLowerCase()  + ".png";
				table.rows[0].cells[0].innerHTML = "<img src='" + flag + "'>";
			}
		}
	}	
}

function showhiderates() {
	var ratestbl = document.getElementById("ratestbl")
	if (ratestbl.style.display == "block") {
		ratestbl.style.display = "none";
		document.getElementById("foldunfold").src = "pics/unfold.png";
	} else {
		ratestbl.style.display = "block";	
		document.getElementById("foldunfold").src = "pics/fold.png";		
	}
}

// pairs -------------------------------------------------------------------------------------------------
function setpair(el) {
	var pair = el.innerText;
	var basecur = pair.substring(0, 3);
	var quotecur = pair.substring(6, 9);
	var baseName = getCurName(basecur);
	var quoteName = getCurName(quotecur);	
	document.getElementById("basecur").value = baseName;
	document.getElementById("quotecur").value = quoteName;	
	window.scrollTo(0, 0);
	convertCurrency(document.getElementById("basecur"));
}

function getPairRates() {
	var table = document.getElementById("pairstbl");	
	for (var r = 1; r < 13; r++){	
		var pair = table.rows[r].cells[0].innerText;
		var basecode = pair.substring(0, 3);
		var quotecode = pair.substring(6, 9);		
		var baseprice = getRate(basecode);
		var quoteprice = getRate(quotecode);	
		
		var price = quoteprice/baseprice;
		if (basecode!="JPY" && quotecode!="JPY") {
			table.rows[r].cells[1].innerText = price.toFixed(6);
		} else {
			table.rows[r].cells[1].innerText = price.toFixed(3);
		}
		
		var baseprevprice = getPrevRate(basecode);
		var quoteprevprice = getPrevRate(quotecode);	
		if (quoteprice/baseprice > quoteprevprice/baseprevprice) {
			table.rows[r].cells[2].innerHTML = "<img src='pics/up.png'>"			
		} else {
			table.rows[r].cells[2].innerHTML = "<img src='pics/down.png'>"	
		}
	}
}

//List of currencies  ------------------------------------------------------------------------------------
const currencies = [
"EUR-Euro",
"USD-United States Dollar",
"GBP-British Pound",
"CAD-Canadian Dollar",
"JPY-Japanese Yen",
"--------------------------------",
"AED-United Arab Emirates Dirham",
"AFN-Afghan Afghani",
"ALL-Albanian Lek",
"AMD-Armenian Dram",
"ANG-Netherlands Antillean Guilder",
"AOA-Angolan Kwanza",
"ARS-Argentine Peso",
"AUD-Australian Dollar",
"AWG-Aruban Florin",
"AZN-Azerbaijani Manat",
"BAM-Bosnian Convertible Mark",
"BBD-Barbadian Dollar",
"BDT-Bangladeshi Taka",
"BGN-Bulgarian Lev",
"BHD-Bahraini Dinar",
"BIF-Burundian Franc",
"BMD-Bermudian Dollar",
"BND-Brunei Dollar",
"BOB-Bolivian Boliviano",
"BRL-Brazilian Real",
"BSD-Bahamian Dollar",
"BTN-Bhutanese Ngultrum",
"BWP-Botswana Pula",
"BYN-Belarusian Ruble",
"BZD-Belize Dollar",
"CDF-Congolese Franc",
"CHF-Swiss Franc",
"CLP-Chilean Peso",
"CNY-Chinese Yuan (Renminbi)",
"COP-Colombian Peso",
"CRC-Costa Rican Colón",
"CUP-Cuban Peso",
"CVE-Cape Verdean Escudo",
"CZK-Czech Koruna",
"DJF-Djiboutian Franc",
"DKK-Danish Krone",
"DOP-Dominican Peso",
"DZD-Algerian Dinar",
"EGP-Egyptian Pound",
"ERN-Eritrean Nakfa",
"ETB-Ethiopian Birr",
"FJD-Fijian Dollar",
"FKP-Falkland Islands Pound",
"FOK-Faroese Krona",
"GEL-Georgian Lari",
"GGP-Guernsey Pound",
"GHS-Ghanaian Cedi",
"GIP-Gibraltar Pound",
"GMD-Gambian Dalasi",
"GNF-Guinean Franc",
"GTQ-Guatemalan Quetzal",
"GYD-Guyanese Dollar",
"HKD-Hong Kong Dollar",
"HNL-Honduran Lempira",
"HRK-Croatian Kuna",
"HTG-Haitian Gourde",
"HUF-Hungarian Forint",
"IDR-Indonesian Rupiah",
"ILS-Israeli New Shekel",
"IMP-Manx Pound",
"INR-Indian Rupee",
"IQD-Iraqi Dinar",
"IRR-Iranian Rial",
"ISK-Icelandic Króna",
"JEP-Jersey Pound",
"JMD-Jamaican Dollar",
"JOD-Jordanian Dinar",
"KES-Kenyan Shilling",
"KGS-Kyrgyz Som",
"KHR-Cambodian Riel",
"KMF-Comorian Franc",
"KRW-South Korean Won",
"KWD-Kuwaiti Dinar",
"KYD-Cayman Islands Dollar",
"KZT-Kazakhstani Tenge",
"LAK-Lao Kip",
"LBP-Lebanese Pound",
"LKR-Sri Lankan Rupee",
"LRD-Liberian Dollar",
"LSL-Lesotho Loti",
"LYD-Libyan dinar",
"MAD-Moroccan Dirham",
"MDL-Moldovan Leu",
"MGA-Malagasy Ariary",
"MKD-Macedonian Denar",
"MMK-Burmese Kyat",
"MNT-Mongolian Tögrög",
"MOP-Macanese Pataca",
"MRU-Mauritanian Ouguiya",
"MUR-Mauritian Rupee",
"MVR-Maldivian Rufiyaa",
"MWK-Malawian Kwacha",
"MXN-Mexican Peso",
"MYR-Malaysian Ringgit",
"MZN-Mozambican Metical",
"NAD-Namibian Dollar",
"NGN-Nigerian Naira",
"NIO-Nicaraguan Córdoba",
"NOK-Norwegian Krone",
"NPR-Nepalese Rupee",
"NZD-New Zealand Dollar",
"OMR-Omani Rial",
"PAB-Panamanian Balboa",
"PEN-Peruvian Sol",
"PGK-Papua New Guinean Kina",
"PHP-Philippine Peso",
"PKR-Pakistani Rupee",
"PLN-Polish Złoty",
"PYG-Paraguayan Guaraní",
"QAR-Qatari Riyal",
"RON-Romanian Leu",
"RSD-Serbian Dinar",
"RUB-Russian Ruble",
"RWF-Rwandan Franc",
"SAR-Saudi Riyal",
"SBD-Solomon Islands Dollar",
"SCR-Seychellois Rupee",
"SDG-Sudanese Pound",
"SEK-Swedish Krona",
"SGD-Singapore Dollar",
"SHP-Saint Helena Pound",
"SLE-Sierra Leonean Leone",
"SOS-Somali Shilling",
"SRD-Surinamese Dollar",
"SSP-South Sudanese Pound",
"STN-São Tomé and Príncipe Dobra",
"SYP-Syrian Pound",
"SZL-Swazi Lilangeni",
"THB-Thai Baht",
"TJS-Tajikistani Somoni",
"TMT-Turkmenistani Manat",
"TND-Tunisian Dinar",
"TOP-Tongan Paʻanga",
"TRY-Turkish Lira",
"TTD-Trinidad and Tobago Dollar",
"TVD-Tuvaluan Dollar",
"TWD-New Taiwan Dollar",
"TZS-Tanzanian Shilling",
"UAH-Ukrainian Hryvnia",
"UGX-Ugandan Shilling",
"UYU-Uruguayan Peso",
"UZS-Uzbekistani Sum",
"VES-Venezuelan Sovereign Bolívar",
"VND-Vietnamese Dong",
"VUV-Vanuatu Vatu",
"WST-Samoan Tālā",
"XAF-Central African CFA Franc",
"XCD-Eastern Caribbean Dollar",
"XOF-West African CFA Franc",
"XPF-CFP Franc",
"YER-Yemeni Rial",
"ZAR-South African Rand",
"ZMW-Zambian Kwacha",
"ZWL-Zimbabwean Dollar"
]

// List of flags
const flags = [
'EU',
'US',
'GB',
'CA',
'JP',
'',
'AE',
'AF',
'AL',
'AM',
'CW',
'AO',
'AR',
'AU',
'AW',
'AZ',
'BA',
'BB',
'BD',
'BG',
'BH',
'BI',
'BM',
'BN',
'BO',
'BR',
'BA',
'BT',
'BW',
'BY',
'BZ',
'CG',
'LI',
'CL',
'CN',
'CO',
'CR',
'CU',
'CV',
'CZ',
'DJ',
'DK',
'DO',
'DZ',
'EG',
'ER',
'ET',
'FJ',
'FK',
'FO',
'GE',
'GG',
'GH',
'GI',
'GA',
'GQ',
'GT',
'GY',
'HK',
'HN',
'HR',
'HT',
'HU',
'ID',
'IL',
'IM',
'IO',
'IQ',
'IR',
'IS',
'JE',
'JM',
'JO',
'KE',
'KG',
'KH',
'KM',
'KR',
'KW',
'KY',
'KZ',
'LA',
'LB',
'LK',
'LR',
'LS',
'LY',
'MA',
'MD',
'MG',
'MK',
'MM',
'MN',
'MO',
'MR',
'MU',
'MV',
'MW',
'MX',
'MY',
'MZ',
'NA',
'NG',
'NI',
'NO',
'NP',
'CK',
'OM',
'PA',
'PE',
'PG',
'PH',
'PK',
'PL',
'PY',
'QA',
'RO',
'RS',
'RU',
'RW',
'SA',
'SB',
'SC',
'SS',
'SE',
'BN',
'SH',
'SL',
'SO',
'SR',
'SS',
'ST',
'SY',
'SZ',
'TH',
'TJ',
'TM',
'TN',
'TO',
'TR',
'TT',
'TV',
'TW',
'TZ',
'UA',
'UG',
'UY',
'UZ',
'VE',
'VN',
'VU',
'AS',
'CM',
'AI',
'BJ',
'PF',
'YE',
'SZ',
'ZM',
'ZW',
]
