
async function showRecords(q, dParent, clearInfo = false) {

	//#region vorher
	mClear(dParent);//mStyle(dParent,{bg:'white',vpadding:10})
	//console.log('________',q)
	q = sqlReplaceStar(q); //console.log(q)
	let records = dbToList(q);
	if (records.length == 0) { mDom(dParent, { className: 'section' }, { html: 'no records found' }); return; }

	let headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (clearInfo || nundef(DA.info)) DA.info = { sorting: {} };
	DA.info.q = q;
	DA.info.dParent = dParent;
	DA.info.records = records;
	DA.info.headers = headers;
	let tablename = DA.info.tablename = dbGetTableName(q);
	//let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mIfNotRelative(dParent);
	let d = mDom(dParent, { position: 'absolute', h: window.innerHeight - 135, w: window.innerWidth - 110 });//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { bg: 'white', fg: 'black', margin: 10, w: '98%', h: '97%', overy: 'auto', display: 'grid', box: true, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(records[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) {
		let th = mDom(dh, { cursor: 'pointer',hpadding:4 }, { onclick: () => sortRecordsBy(h) });

		let html = getHeaderHtml(h, DA.info.sorting[h])
		mDom(th, {}, { html });
		if (h == 'amount') addSumAmount(th, records);
	}

	let totalRecords = records.length; // Simulated total number of records
	let pageSize = 50; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const recpartial = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) break;
					recpartial.push(records[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(recpartial);
			}, 0); // Simulate network delay
		});
	}
	//#endregion

	function appendRecords(recpartial) {
		let styles = { cursor: 'pointer', hpadding: 4, vpadding:1 }; //,'border-bottom': '2px solid #eee' };

		recpartial.forEach(record => {
			let [bg1, bg2] = ['#ffffff', '#00000010'];
			styles.bg = (styles.bg ==bg1? bg2 :bg1);
			for (const h of headers) {

				let html = record[h];
				styles.align = isNumber(html) && !['asset_name', 'id'].includes(h) ? 'right' : isString(html) && html.length < 2 ? 'center' : 'left';
				if (h.includes('amount')) {
					if (!isNumber(html) && isEmpty(html)) console.log('amount empty!', record);
					html = isEmpty(html) ? '0.00' : html.toFixed(2);
				}

				let td = mDom(dgrid, styles, { html, onclick: mToggleSelection });

				let bg = dbFindColor(html, h);if (isdef(bg)) mStyle(td, { bg, fg: 'contrast' });
			}
		});
	}

	//#region nachher
	function loadMoreRecords() {
		loadRecords(currentPage).then(recpartial => {
			appendRecords(recpartial);
			currentPage++;
		});
	}
	async function loadMoreRecordsAsync() {
		let recpartial = await loadRecords(currentPage);
		appendRecords(recpartial);
		currentPage++;
	}

	dgrid.addEventListener('scroll', () => {
		if (dgrid.scrollTop + dgrid.clientHeight >= dgrid.scrollHeight) {
			loadMoreRecords();
		}
	});

	// Load initial records
	await loadMoreRecordsAsync();
	//#endregion
}

function _getHeaderHtml(header, sorting) {
	let arrowHtml = '';

	if (sorting === 'asc') {
		arrowHtml = ' &uarr;'; // Up arrow
	} else if (sorting === 'desc') {
		arrowHtml = ' &darr;'; // Down arrow
	}

	return `${header}${arrowHtml}`;
}
function getHeaderHtml(header, sorting) {
	let arrowHtml = '';

	if (sorting === 'asc') {
		arrowHtml = ' <span class="arrow">&#9650;</span>'; // Up arrow
	} else if (sorting === 'desc') {
		arrowHtml = ' <span class="arrow">&#9660;</span>'; // Down arrow
	}

	return `${header}${arrowHtml}`;
}





