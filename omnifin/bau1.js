
async function showRecords(q, dParent) {

	mClear(dParent);//mStyle(dParent,{bg:'white',vpadding:10})
	let records = dbToList(q); //'select * from tags');
	if (records.length == 0) return;
	let headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(DA.info)) DA.info={sorting:{}};
	DA.info.q=q;
	DA.info.dParent=dParent;
	DA.info.records=records;
	DA.info.headers=headers;
	//let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mIfNotRelative(dParent);
	let d=mDom(dParent,{position:'absolute',h:window.innerHeight-135,w:window.innerWidth-110});//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { bg:'white', fg:'black', margin:10, w:'98%', h:'97%', overy: 'auto', display: 'grid', gap: 4, box: true, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(records[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) { 
		let th = mDom(dh, { cursor: 'pointer' }, { html: h, onclick: ()=>sortRecordsBy(h) }); 
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

	function appendRecords(recpartial) {
		let styles = {cursor:'pointer'};
		recpartial.forEach(record => {
			for (const h of headers) {

				let html = record[h];
				styles.align = isNumber(html) && !['asset_name'].includes(h)?'right':'left';
				if (h.includes('amount')) html = html.toFixed(2);

				let td = mDom(dgrid, styles, { html,onclick:mToggleSelection });
			}
		});
	}

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
}








