
const DB_PATH = '../db/test2.db'; // relative to omnifin dir
onload = start;onresize = ()=>{if (UI.nav.cur == 'overview' && lookup(DA,['info','q'])) showRecords(DA.info.q,UI.d); }//onscroll = handleSticky;

async function start() { await prelims(); test30_config(); }

async function test30_config(){
	await switchToMainMenu('overview');
	return;
	let d=clearFlex();
	mToggleButton('==',null,d,{wmin:0,wmax:30},{states:['==','<=','>=']});
}


async function test29(){
	await switchToMainMenu('overview');
	// await showRecords(qTTList(),UI.d); return;
	// let grid = mBy('gridContainer'); //console.log(arrChildren(grid).length)
	// ch = arrChildren(grid)[17];
	// mClass(ch,'bg_yellow')
	// await filterRecords();
}
async function test28(){
	await switchToMainMenu('overview');

	let q = qTTList();q=stringBeforeLast(q,';');

	q+=`\nHAVING GROUP_CONCAT(CASE WHEN tg.category = 'MCC' THEN tg.tag_name ELSE NULL END) IS NULL
    OR GROUP_CONCAT(CASE WHEN tg.category = 'MCC' THEN tg.tag_name ELSE NULL END) = '';`

	console.log(q)
	//q+=`HAVING MCC IS NULL OR MCC = '';`
	// q += `\nHAVING group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) IS NULL OR
  //   group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) = ''`;

	await showRecords(q,UI.d); return;

	await showRecords(qTTList(),UI.d); 
	let grid = mBy('gridContainer'); //console.log(arrChildren(grid).length)
	let ch=rChoose(arrTake(arrChildren(grid),7,3));

	ch = arrChildren(grid)[17];

	mClass(ch,'bg_yellow')
	//console.log('ch',ch)
	//ch.map(x=>mClass(x,'bg_yellow'));
	await filterRecords();
}
async function test27(){
	//await onclickCommand(null, 'transcols');//	await showRecords(qTTCols(),UI.d); //return;
	//await	sortRecordsBy('prudential');
	//DA.info.sorting={neurips22:'desc'};
	//await showRecords(qTTColsSorted({amount:'asc',neurips23:'desc'}),UI.d);
	//await	sortRecordsBy('MCC');

	// onclickSortFast();
	return;

	let grid = mBy('gridContainer'); //console.log(arrChildren(grid).length)
	let ch=rChoose(arrTake(arrChildren(grid),20,3));mClass(ch,'bg_yellow')
	//console.log('ch',ch)
	//ch.map(x=>mClass(x,'bg_yellow'));
	await filterRecords();
}

async function test26_sql(){
	let q = qTTList();
	q=sqlUpdateOrderBy(q,['sender_name','receiver_name']);
	//console.log(q);
	let d=clearFlex();
	showRecords(q,d);

	q=sqlUpdateOrderBy(q,['amount']); 
	//console.log(q)
	showRecords(q,d);

}
async function test25(){
	let d=clearFlex();
	showRecords(qTTList(),d);
}
async function test24_removeLoadDelay() {
	let d = clearFlex(); //document.getElementById('gridContainer');

	let recs = dbToList(qTTList()); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	let info = DA.info = { d, recs, headers };

	let styles = {w100:true,h:400,overy:'auto',display:'grid',gap:10,padding:10, box:true,border:'1px solid #ddd',};
	styles.gridCols = measureRecord(recs[0]);

	// let gridContainer = mDom(d, { className: 'gridContainer' }, { id: 'gridContainer' })
	let gridContainer = mDom(d, styles, { id: 'gridContainer' })
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
async function test24_actuallyDisplayingMyRecords() {
	let d = clearFlex(); //document.getElementById('gridContainer');

	let recs = dbToList(qTTList()); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	let info = DA.info = { d, recs, headers };

	let styles = {w100:true,h:300,overy:'auto',display:'grid',gap:10,padding:10, box:true,border:'1px solid #ddd',};
	styles.gridCols = measureRecord(recs[0]);

	// let gridContainer = mDom(d, { className: 'gridContainer' }, { id: 'gridContainer' })
	let gridContainer = mDom(d, styles, { id: 'gridContainer' })
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
			}, 500); // Simulate network delay
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
async function test23_displayJustTheDateOf() {
	let d = clearFlex(); //document.getElementById('gridContainer');

	let recs = dbToList(qTTList()); //'select * from tags');
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	let info = DA.info = { d, recs, headers };

	let gridContainer = mDom(d, { className: 'gridContainer' }, { id: 'gridContainer' })
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
			}, 500); // Simulate network delay
		});
	}

	function appendRecords(records) {
		records.forEach(record => {
			const item = document.createElement('div');
			item.className = 'gridItem';
			item.textContent = record.dateof;
			gridContainer.appendChild(item);
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
async function test22_aiSolution() {
	let d = clearFlex(); //document.getElementById('gridContainer');

	let gridContainer = mDom(d, { className: 'gridContainer' }, { id: 'gridContainer' })
	let totalRecords = 10000; // Simulated total number of records
	let pageSize = 100; // Number of records to load at a time
	let currentPage = 0;

	function loadRecords(page) {
		// Simulate fetching data from a server
		return new Promise(resolve => {
			setTimeout(() => {
				const records = [];
				for (let i = 0; i < pageSize; i++) {
					const recordIndex = page * pageSize + i;
					if (recordIndex >= totalRecords) break;
					records.push(`Record ${recordIndex + 1}`);
				}
				resolve(records);
			}, 500); // Simulate network delay
		});
	}

	function appendRecords(records) {
		records.forEach(record => {
			const item = document.createElement('div');
			item.className = 'gridItem';
			item.textContent = record;
			gridContainer.appendChild(item);
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
async function test21_grid() {
	let dParent = clearFlex();
	let records = dbToList(qTTList()); //'select * from tags');
	if (records.length == 0) return;
	let headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	let info = DA.info = { dParent, records, headers };

	//let tCont = mDom(dParent, { h: 400, w100:true, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!
	let dgrid = info.dgrid = gridCreate(dParent, records, headers);

	DA.info = { dParent, records, headers, dgrid };
	info.n = gridAddRows(dgrid, records, headers, 0, 50);

	let gridContainer = dgrid;
	gridContainer.addEventListener('scroll', () => {
		console.log('scrolling...')
		if (gridContainer.scrollTop + gridContainer.clientHeight >= gridContainer.scrollHeight) {
			info.n = gridAddRows(dgrid, records, headers, info.n, 50);
			// loadMoreRecords();
		}
	});

	// tCont.onscroll = ()=>{if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
	// 	console.log('...adding records...');
	// 	gridAddRows(dgrid, records, headers, info.n, 50);
	// }};


}
async function test20_grid() {
	let dParent = clearFlex();
	let records = dbToList(qTTList()); //'select * from tags');
	if (records.length == 0) return;
	let headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']

	let d = mGrid(records.length, headers.length, dParent, { h: 500, w100: true, overy: 'auto' });
	for (const rec of arrTake(records, 25)) {
		for (const h of headers) {
			mDom(d, {}, { html: rec[h] });
		}
	}

}
async function test19_grid() {
	let dParent = clearFlex();
	let records = dbToList(qTTList());
	if (records.length == 0) return;
	let headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']

	let d = mGrid(records.length, headers.length, dParent);
	for (const rec of records) {
		for (const h of headers) {
			mDom(d, {}, { html: rec[h] });
		}
	}

}
async function test18_16() {
	let dParent = clearFlex();
	showRecords(qTTList(), dParent);
}
async function test17_aggrid() {
	let d = clearFlex();
	let recs = dbToList(qTTList());
	let headers = Object.keys(recs[0]);
	let columnDefs = headers.map(x => ({ headerName: x, field: x, resizable: true }));
	let rowData = recs;
	const gridOptions = { columnDefs: columnDefs, rowData: rowData };

	// <div id="myGrid" style="height: 500px; width: 600px;" class="ag-theme-alpine"></div>
	let dg = mDom(d, { h: 500, w: 600, className: 'ag-theme-alpine' }, { id: 'myGrid' });
	const gridDiv = document.querySelector('#myGrid');
	//let gridapi = createGrid(gridDiv,gridOptions);
	new agGrid.Grid(gridDiv, gridOptions);

}
async function test16_scrollable() {
	let dParent = clearFlex();
	showRecords(qTTList(), dParent);
}
async function test15_scrollable() {
	let dParent = clearFlex();

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0 }); //table container important!
	let recs = dbToList(qTTList());
	if (recs.length == 0) return;
	let headers = Object.keys(recs[0]);//['id','description','amount','unit','sender_name','receiver_name']
	let t = mTable(tCont, headers, true, { w100: true, 'border-collapse': 'collapse', padding: 0 });

	tCont.addEventListener('scroll', () => {
		console.log('Element is scrolling');
		if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
			console.log('...adding records...');
			tLoadMoreRows(t, recs, headers);
		}
	});
	tLoadMoreRows(t, recs, headers);
}
async function test14() {
	//await switchToMainMenu('overview');
	showRecords(qTTList(), 'dMain');
	return;
	let h = calcHeightLeftUnder('dNav') - 25; console.log(h)
	mStyle('dMain', { h })

	// let h=window.innerHeight-135;
	// mStyle('dPage',{hmax:h,h,overflow:'hidden',scroll:'hidden'});
	// mStyle('dMain',{hmax:h,h,overflow:'hidden',scroll:'hidden'});

	// //mStyle(UI.d,{bg:'green',overy:'scroll',h:500,hmax:500})
	// // mStyle('trecords',{bg:'green',overy:'scroll',h:500,hmax:500})
	// mStyle(UI.d,{h:500,hmax:500});
	// console.log(UI.d)
	// let d=mBy('trecords').parentNode;
	// mStyle(d,{h:500,hmax:500});
	// mStyle('trecords',{bg:'green',overflow:'scroll'})
}
async function test13() {
	let d = clearFlex();
	let handler = i => console.log(i)
	let b = mToggleButton(null,handler, d);
	b = mToggleButton(null,handler, d, { w: 50 }, { states: ['hallo', 'du', 'bist', 'da'], colors: [GREEN, YELLOW, BLUE, RED] });
}
async function test12() {
	await switchToMainMenu('overview');
}
async function test11() {
	await switchToMainMenu('overview');

	let colors = M.colorsDist = getDistColors(); let colorNames = Object.keys(colors); //console.log(colorNames); //return;

	//console.log(recs);
	let diByTable = DA.dbColorsByTable = {};
	let di = DA.dbColors = {};
	for (const kTable of ['account', 'tag']) {
		let recs = dbToList(`select * from ${kTable}s`);
		for (let i = 0; i < recs.length; i++) {
			let colorName = colorNames[i]; console.log('colorName', colorName)
			let color = colors[colorName].hex; console.log('color', color)
			let text = recs[i][`${kTable}_name`];
			di[text] = { color, name: colorName };
			//accColors[]={color,colorName};
			//di[]
		}
	}
	// showChunkedSortedBy(UI.d, 'account colors', accounts, recs);
	//downloadAsYaml(DA.dbColors, 'accColors');
}
async function test10_edittest() {
	await switchToMainMenu('overview'); return;
	let q = `		INSERT INTO transactions
			SELECT t.*
			FROM transactions t
			JOIN (
					SELECT id
					FROM transaction_tags
					GROUP BY id
					HAVING COUNT(tag_id) > 1
			) tt ON t.id = tt.id
			WHERE ;
		`;
	let records = dbToList(q);
	showTableSortedBy(UI.d, 'TEST', 'transactions', records);
}
async function test9_filter2SelectedCells() {
	await switchToMainMenu('overview');
}
async function test8_filter2SelectedCells() {
	await switchToMainMenu('overview');
	let cells = DA.cells.filter(x => !isEmpty(iDiv(x).innerHTML));
	let selitems = ifNotList(rChoose(cells.slice(0, 20), 2));
	//console.log(selitems);
	selitems.map(x => toggleItemSelection(x));

	let exp = extractFilterExpression(); //console.log(exp)
}
async function test7_filterAddTag() {
	await switchToMainMenu('overview');
	//await onclickCommand(null,'translist');
	await onclickFilter();//null,'receiver_name == tax');
	//await onclickTagForAll(null,['alpensee']);
}
async function test6() {

	await switchToMainMenu('overview');

	//onclickFilter()
	//let recs = M.transactionRecords = dbToList(qTTCols()); db calls sind eh urschnell!!!
	//console.log(recs)


	//createNewDatabase();
}
async function test5() {
	await switchToMainMenu('home');
	let q = qTransactionsFlexperks();
	let res = dboutput(q);
	mBy('dPre').textContent = res;
}
async function test4() {
	await switchToMainMenu('sql');

	let res = dbq('select * from transactions');
	console.log(res[0].columns, res[0].values)

}

//#region preliminary tests
async function test3_getdb() {
	let db = await dbInit('../db/test.db');
	if (!db) return; //	console.log(db)
	let text = await dbQuery(db, `SELECT sql FROM sqlite_master WHERE type='table';`, mBy('output'))
}
async function test2() {
	const fileUrl = './test.db';

	try {
		const response = await fetch(fileUrl);
		const buffer = await response.arrayBuffer();

		const SQL = await initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` });
		const db = new SQL.Database(new Uint8Array(buffer));
		const query = "SELECT * FROM transactions;";

		try {
			const result = db.exec(query);
			const output = result.map(({ columns, values }) => {
				return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
			}).join('\n\n');
			document.getElementById('output').textContent = output || 'Query executed successfully.';
		} catch (error) {
			document.getElementById('output').textContent = 'Error executing SQL: ' + error.message;
		}
	} catch (error) {
		console.error('Error:', error);
		document.getElementById('output').textContent = 'Error: ' + error.message;
	}
}
async function test1() {
	const fileUrl = './test.db';

	fetch(fileUrl)
		.then(response => response.arrayBuffer())
		.then(buffer => {
			initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` })
				.then(SQL => {
					const db = new SQL.Database(new Uint8Array(buffer));
					const query = "SELECT * FROM transactions;";
					try {
						const result = db.exec(query);
						const output = result.map(({ columns, values }) => {
							return columns.join('\t') + '\n' + values.map(row => row.join('\t')).join('\n');
						}).join('\n\n');
						document.getElementById('output').textContent = output || 'Query executed successfully.';
					} catch (error) {
						document.getElementById('output').textContent = 'Error executing SQL: ' + error.message;
					}
				})
				.catch(error => {
					console.error('Error initializing SQL.js:', error);
				});
		})
		.catch(error => {
			console.error('Error fetching database file:', error);
		});

}
async function test0() {
	document.body.innerHTML = `
			<h1>SQLite Database Viewer</h1>
			<textarea id="sql-input" rows="10" cols="50" placeholder="Enter SQL commands here..."></textarea>
			<button onclick="executeSQL()">Execute</button>
			<pre id="output"></pre>
		`;
	const fileUrl = './test.db';

	fetch(fileUrl)
		.then(response => response.arrayBuffer())
		.then(buffer => {
			initSqlJs({ locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}` })
				.then(SQL => {
					const db = new SQL.Database(new Uint8Array(buffer));
					// Example: Query to show tables
					const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
					document.getElementById('output').textContent = JSON.stringify(tables, null, 2);
				})
				.catch(error => {
					console.error('Error initializing SQL.js:', error);
				});
		})
		.catch(error => {
			console.error('Error fetching database file:', error);
		});
}
//#endregion

async function prelims() {
	Serverdata = await mGetRoute('session'); //session ist: users,config,events
	console.log(Serverdata);

	M = {};
	M.superdi = await mGetYaml('../assets/superdi.yaml');

	M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);[M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
	M.dbColors = await mGetYaml('../db/info.yaml');

	//mStyle('dMain', { bg:'white', fg:'black' }); //padding: 10 });
	UI.commands = {};
	UI.nav = showNavMenu();
	setColors('skyblue', 'white'); setCssVar('--bgNav', '#659AB0')

	DB = await dbInit(DB_PATH);
	M.qHistory = [];

	// let tablenames = dbGetTableNames();
	// tablenames = tablenames.map(x=>x.name);
	// tablenames.map(x=>M[x]=dbToDict(`select * from ${x}`));
	// M.tagsByName=dbToDict(`select * from tags`,'tag_name');
	//console.log(M)
}









