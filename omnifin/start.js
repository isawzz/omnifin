
const DB_PATH = '../db/test2.db'; // relative to omnifin dir
onload = start;//onscroll = handleSticky;

async function start() { await prelims(); test27(); }

async function test27(){
	await switchToMainMenu('overview');//return;
	//await	sortRecordsBy('amount');
	DA.sorting={MCC:'asc'}
	await	sortRecordsBy('MCC');

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
	let b = mToggleButton(handler, d);
	b = mToggleButton(handler, d, { w: 50 }, { states: ['hallo', 'du', 'bist', 'da'], colors: [GREEN, YELLOW, BLUE, RED] });
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

function getDistinguishibleColors() {
	return {
		"Black": "#000000",
		"DarkSlateGray": "#2F4F4F",
		"DimGray": "#696969",
		"SlateGray": "#708090",
		"Gray": "#808080",
		"LightSlateGray": "#778899",
		"DarkRed": "#8B0000",
		"Red": "#FF0000",
		"FireBrick": "#B22222",
		"Crimson": "#DC143C",
		"Tomato": "#FF6347",
		"Coral": "#FF7F50",
		"IndianRed": "#CD5C5C",
		"LightCoral": "#F08080",
		"DarkSalmon": "#E9967A",
		"Salmon": "#FA8072",
		"LightSalmon": "#FFA07A",
		"OrangeRed": "#FF4500",
		"DarkOrange": "#FF8C00",
		"Orange": "#FFA500",
		"Gold": "#FFD700",
		"DarkGoldenRod": "#B8860B",
		"GoldenRod": "#DAA520",
		"Yellow": "#FFFF00",
		"LightYellow": "#FFFFE0",
		"LemonChiffon": "#FFFACD",
		"LightGoldenRodYellow": "#FAFAD2",
		"PapayaWhip": "#FFEFD5",
		"Moccasin": "#FFE4B5",
		"PeachPuff": "#FFDAB9",
		"PaleGoldenRod": "#EEE8AA",
		"Khaki": "#F0E68C",
		"DarkKhaki": "#BDB76B",
		"Lavender": "#E6E6FA",
		"Thistle": "#D8BFD8",
		"Plum": "#DDA0DD",
		"Violet": "#EE82EE",
		"Orchid": "#DA70D6",
		"Fuchsia": "#FF00FF",
		"Magenta": "#FF00FF",
		"MediumOrchid": "#BA55D3",
		"MediumPurple": "#9370DB",
		"BlueViolet": "#8A2BE2",
		"DarkViolet": "#9400D3",
		"DarkOrchid": "#9932CC",
		"DarkMagenta": "#8B008B",
		"Purple": "#800080",
		"Indigo": "#4B0082",
		"SlateBlue": "#6A5ACD",
		"DarkSlateBlue": "#483D8B",
		"MediumSlateBlue": "#7B68EE",
		"GreenYellow": "#ADFF2F",
		"Chartreuse": "#7FFF00",
		"LawnGreen": "#7CFC00",
		"Lime": "#00FF00",
		"LimeGreen": "#32CD32",
		"PaleGreen": "#98FB98",
		"LightGreen": "#90EE90",
		"MediumSpringGreen": "#00FA9A",
		"SpringGreen": "#00FF7F",
		"MediumSeaGreen": "#3CB371",
		"SeaGreen": "#2E8B57",
		"ForestGreen": "#228B22",
		"Green": "#008000",
		"DarkGreen": "#006400",
		"YellowGreen": "#9ACD32",
		"OliveDrab": "#6B8E23",
		"Olive": "#808000",
		"DarkOliveGreen": "#556B2F",
		"MediumAquamarine": "#66CDAA",
		"DarkSeaGreen": "#8FBC8F",
		"LightSeaGreen": "#20B2AA",
		"DarkCyan": "#008B8B",
		"Teal": "#008080",
		"Aqua": "#00FFFF",
		"Cyan": "#00FFFF",
		"LightCyan": "#E0FFFF",
		"PaleTurquoise": "#AFEEEE",
		"Aquamarine": "#7FFFD4",
		"Turquoise": "#40E0D0",
		"MediumTurquoise": "#48D1CC",
		"DarkTurquoise": "#00CED1",
		"CadetBlue": "#5F9EA0",
		"SteelBlue": "#4682B4",
		"LightSteelBlue": "#B0C4DE",
		"PowderBlue": "#B0E0E6",
		"LightBlue": "#ADD8E6",
		"SkyBlue": "#87CEEB",
		"LightSkyBlue": "#87CEFA",
		"DeepSkyBlue": "#00BFFF",
		"DodgerBlue": "#1E90FF",
		"CornflowerBlue": "#6495ED",
		"MediumSlateBlue": "#7B68EE",
		"RoyalBlue": "#4169E1",
		"Blue": "#0000FF",
		"MediumBlue": "#0000CD",
		"DarkBlue": "#00008B",
		"Navy": "#000080",
		"MidnightBlue": "#191970",
		"Cornsilk": "#FFF8DC",
		"BlanchedAlmond": "#FFEBCD",
		"Bisque": "#FFE4C4",
		"NavajoWhite": "#FFDEAD",
		"Wheat": "#F5DEB3",
		"BurlyWood": "#DEB887",
		"Tan": "#D2B48C",
		"RosyBrown": "#BC8F8F",
		"SandyBrown": "#F4A460",
		"GoldenRod": "#DAA520",
		"DarkGoldenRod": "#B8860B",
		"Peru": "#CD853F",
		"Chocolate": "#D2691E",
		"SaddleBrown": "#8B4513",
		"Sienna": "#A0522D",
		"Brown": "#A52A2A",
		"Maroon": "#800000",
		"White": "#FFFFFF",
		"Snow": "#FFFAFA",
		"HoneyDew": "#F0FFF0",
		"MintCream": "#F5FFFA",
		"Azure": "#F0FFFF",
		"AliceBlue": "#F0F8FF",
		"GhostWhite": "#F8F8FF",
		"WhiteSmoke": "#F5F5F5",
		"SeaShell": "#FFF5EE",
		"Beige": "#F5F5DC",
		"OldLace": "#FDF5E6",
		"FloralWhite": "#FFFAF0",
		"Ivory": "#FFFFF0",
		"AntiqueWhite": "#FAEBD7",
		"Linen": "#FAF0E6",
		"LavenderBlush": "#FFF0F5",
		"MistyRose": "#FFE4E1",
		"Gainsboro": "#DCDCDC",
		"LightGrey": "#D3D3D3",
		"Silver": "#C0C0C0",
		"DarkGray": "#A9A9A9",
		"Gray": "#808080",
		"DimGray": "#696969",
		"LightSlateGray": "#778899",
		"SlateGray": "#708090",
		"DarkSlateGray": "#2F4F4F",
		"Black": "#000000",
		"CornflowerBlue": "#6495ED",
		"DarkSlateBlue": "#483D8B",
		"MediumSlateBlue": "#7B68EE",
		"SlateBlue": "#6A5ACD",
		"RoyalBlue": "#4169E1",
		"DarkBlue": "#00008B",
		"MediumBlue": "#0000CD",
		"Blue": "#0000FF",
		"DodgerBlue": "#1E90FF",
		"DeepSkyBlue": "#00BFFF",
		"SkyBlue": "#87CEEB",
		"LightSkyBlue": "#87CEFA",
		"SteelBlue": "#4682B4",
		"LightSteelBlue": "#B0C4DE",
		"LightBlue": "#ADD8E6",
		"PowderBlue": "#B0E0E6",
		"PaleTurquoise": "#AFEEEE",
		"LightCyan": "#E0FFFF",
		"Cyan": "#00FFFF",
		"Aqua": "#00FFFF",
		"Turquoise": "#40E0D0",
		"MediumTurquoise": "#48D1CC",
		"DarkTurquoise": "#00CED1",
		"CadetBlue": "#5F9EA0",
		"DarkCyan": "#008B8B",
		"Teal": "#008080",
		"DarkOliveGreen": "#556B2F",
		"Olive": "#808000",
		"OliveDrab": "#6B8E23",
		"YellowGreen": "#9ACD32",
		"LimeGreen": "#32CD32",
		"Lime": "#00FF00",
		"LawnGreen": "#7CFC00",
		"Chartreuse": "#7FFF00",
		"GreenYellow": "#ADFF2F",
		"SpringGreen": "#00FF7F",
		"MediumSpringGreen": "#00FA9A",
		"LightGreen": "#90EE90",
		"PaleGreen": "#98FB98",
		"DarkSeaGreen": "#8FBC8F",
		"MediumSeaGreen": "#3CB371",
		"SeaGreen": "#2E8B57",
		"ForestGreen": "#228B22",
		"Green": "#008000",
		"DarkGreen": "#006400"
	}
}
function getDistColors(n = 200) {
	//teile hue wheel auf in 360/10
	let hstart = 15;
	let res = {};
	for (let h = hstart; h < 360; h += 20) {
		for (const l of [20, 40, 60, 80]) {
			for (const s of [50, 75, 100]) {
				let c = colorFromHsl(h, s, l);
				let o = colorO(c);
				//console.log(o); 
				res[o.name] = M.colorByName[o.name];
			}
		}
	}
	return res;
}
async function prelims() {
	M = {};
	M.superdi = await mGetYaml('../assets/superdi.yaml');

	M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);[M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
	M.dbColors = await mGetYaml('../db/info.yaml');

	//mStyle('dMain', { bg:'white', fg:'black' }); //padding: 10 });
	UI.commands = {};
	UI.nav = mNavMenu();
	setColors('skyblue', 'white'); setCssVar('--bgNav', '#659AB0')

	DB = await dbInit(DB_PATH);
	M.qHistory = [];

	// let tablenames = dbGetTableNames();
	// tablenames = tablenames.map(x=>x.name);
	// tablenames.map(x=>M[x]=dbToDict(`select * from ${x}`));
	// M.tagsByName=dbToDict(`select * from tags`,'tag_name');
	//console.log(M)
}









