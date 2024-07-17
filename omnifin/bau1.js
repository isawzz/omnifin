
async function showRecords(q, dParent) {

	mClear(dParent);//mStyle(dParent,{bg:'white',vpadding:10})
	let recs = dbToList(q); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	DA.info = { q,records:recs,headers };//d: dParent, recs, headers };
	//let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mIfNotRelative(dParent);
	let d=mDom(dParent,{position:'absolute',h:window.innerHeight-135,w:window.innerWidth-110});//,bg:'red'})

	//let h=750;//window.innerHeight-150;
	let styles = { bg:'white', fg:'black', margin:10, w:'98%', h:'97%', overy: 'auto', display: 'grid', gap: 4, box: true, border: '1px solid #ddd', };
	styles.gridCols = measureRecord(recs[0]);

	let dgrid = mDom(d, styles, { id: 'gridContainer' });

	let dh = mDom(dgrid, { className: 'gridHeader' });
	for (const h of headers) { 
		let th = mDom(dh, { cursor: 'pointer' }, { html: h, onclick: mToggleSelection }); 
	}

	let totalRecords = recs.length; // Simulated total number of records
	let pageSize = 50; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const records = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) break;
					records.push(recs[recordIndex]); //records.push(`Record ${recordIndex + 1}`);
				}
				resolve(records);
			}, 0); // Simulate network delay
		});
	}

	function appendRecords(records) {
		let styles = {cursor:'pointer'};
		records.forEach(record => {
			for (const h of headers) {

				let html = record[h];
				styles.align = isNumber(html)?'right':'left';
				if (h.includes('amount')) html = html.toFixed(2);

				let td = mDom(dgrid, styles, { html,onclick:mToggleSelection });
			}
		});
	}

	function loadMoreRecords() {
		loadRecords(currentPage).then(records => {
			appendRecords(records);
			currentPage++;
		});
	}

	dgrid.addEventListener('scroll', () => {
		if (dgrid.scrollTop + dgrid.clientHeight >= dgrid.scrollHeight) {
			loadMoreRecords();
		}
	});

	// Load initial records
	loadMoreRecords();
}








