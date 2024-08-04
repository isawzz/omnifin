
async function showRecordsExpanded(q, dParent, clearInfo = false) {

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

	mIfNotRelative(dParent);
	let h= Math.min(mGetStyle(dParent,'h'),window.innerHeight - 130);
	let d = mDom(dParent, { h, w: window.innerWidth - 110}); //,bg:'red'})
	let dtitle = mDom(d, {w100:true,box:true, bg:'#00000080',fg:'white',padding:10,fz:24}, {html:`${tablename} (${records.length})`});//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { h:h-48,bg: 'white', fg: 'black', w100:true, overy: 'auto', display: 'grid', box: true }; //, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(records[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) {
		let th = mDom(dh, { cursor: 'pointer', hpadding: 4 }, { onclick: () => sortRecordsBy(h) });

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
					if (recordIndex >= totalRecords) { dgrid.removeEventListener('scroll', onScrollGrid); break; }
					recpartial.push(records[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(recpartial);
			}, 0); // Simulate network delay
		});
	}
	//#endregion

	function appendRecords(recpartial) {
		let styles = { cursor: 'pointer', hpadding: 4, vpadding: 1 }; //,'border-bottom': '2px solid #eee' };

		recpartial.forEach(record => {
			let [bg1, bg2] = ['#ffffff', '#00000010'];
			styles.bg = (styles.bg == bg1 ? bg2 : bg1);
			for (const h of headers) {

				let html = record[h];
				styles.align = ['asset_name', 'id', 'report'].includes(h) ? 'center':isNumber(html)? 'right' : isString(html) && html.length < 2 ? 'center' : 'left';
				if (h.includes('amount')) {
					if (!isNumber(html) && isEmpty(html)) console.log('amount empty!', record);
					html = isEmpty(html) ? '0.00' : html.toFixed(2);
				}

				let td = mDom(dgrid, styles, { html, onclick: mToggleSelection });

				let bg = dbFindColor(html, h); if (isdef(bg)) mStyle(td, { bg, fg: 'contrast' });
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
	async function onScrollGrid() {
		//console.log('hallo!', dgrid.scrollTop, dgrid.clientHeight, dgrid.scrollHeight);
		if (dgrid.scrollTop + dgrid.clientHeight >= dgrid.scrollHeight - 20) {
			await loadMoreRecordsAsync();
		}
	}

	dgrid.addEventListener('scroll', onScrollGrid);

	// Load initial records
	await loadMoreRecordsAsync();
	//#endregion
}









