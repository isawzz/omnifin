


async function showRecords(q,dParent) {

	let recs = dbToList(q); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	//let info = DA.info = { d: dParent, recs, headers };

	let styles = {w100:true,h:400,overy:'auto',display:'grid',gap:10,hpadding:10, box:true,border:'1px solid #ddd',};
	styles.gridCols = measureRecord(recs[0]);

	// let gridContainer = mDom(d, { className: 'gridContainer' }, { id: 'gridContainer' })
	let gridContainer = mDom(dParent, styles, { id: 'gridContainer' });

	let dh=mDom(gridContainer,{className:'gridHeader'});
	for(const h of headers) {
		mDom(dh,{},{html:h});
	}
	//return;

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
		records.forEach(record => {
			for (const h of headers) {
				mDom(gridContainer, {}, { html: record[h] });
			}
	
			// const item = document.createElement('div');
			// item.className = 'gridItem';
			// item.textContent = record.dateof;
			// gridContainer.appendChild(item);
		});
	}

	function loadMoreRecords() {
		loadRecords(currentPage).then(records => {
			appendRecords(records);
			currentPage++;
		});
	}

	gridContainer.addEventListener('scroll', () => {
		if (gridContainer.scrollTop + gridContainer.clientHeight >= gridContainer.scrollHeight) {
			loadMoreRecords();
		}
	});

	// Load initial records
	loadMoreRecords();
}








