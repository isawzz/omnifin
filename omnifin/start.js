
const DB_PATH = '../omnifin/db/test2.db'; // relative to omnifin dir

onload = start;
onscroll = handleSticky;

async function start() { await prelims(); test11(); }

async function test11(){
	await switchToMainMenu('overview');
	let recs = dbToList('select * from accounts');
	console.log(recs);
	accColors = {};
	for(let i=0;i<recs.length;i++){
		let colorName = Object.keys(M.dicolor)[i];
		let color = Object.values(M.dicolor)[i];
		accColors[recs[i].id]={color,colorName};
	}
	DA.dbColors={account:accColors};
	showChunkedSortedBy(UI.d,'account colors',accounts,recs);
	downloadAsYaml(DA.dbColors,'accColors');
}
async function test10_edittest(){
	await switchToMainMenu('overview'); return;
	let q=`		INSERT INTO transactions
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
async function test9_filter2SelectedCells(){
	await switchToMainMenu('overview');
}
async function test8_filter2SelectedCells(){
	await switchToMainMenu('overview');
	let cells = DA.cells.filter(x=>!isEmpty(iDiv(x).innerHTML));
	let selitems = ifNotList(rChoose(cells.slice(0,20),2));
	//console.log(selitems);
	selitems.map(x=>toggleItemSelection(x));

	let exp = extractFilterExpression(); //console.log(exp)
}
async function test7_filterAddTag(){
	await switchToMainMenu('overview');
	//await onclickCommand(null,'translist');
	await onclickFilter();//null,'receiver_name == tax');
	//await onclickTagForAll(null,['alpensee']);
}
async function test6(){

	await switchToMainMenu('overview');

	//onclickFilter()
	//let recs = M.transactionRecords = dbToList(qTTCols()); db calls sind eh urschnell!!!
	//console.log(recs)


	//createNewDatabase();
}
async function test5(){
	await switchToMainMenu('home');
	let q=qTransactionsFlexperks();
	let res=dboutput(q);
	mBy('dPre').textContent = res;
}
async function test4() {
	await switchToMainMenu('sql');

	let res=dbq('select * from transactions');
	console.log(res[0].columns,res[0].values)

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
	M={};
	M.superdi = await mGetYaml('../assets/superdi.yaml');
	M.dicolor = {
		"Red": "#FF0000",
		"Green": "#00FF00",
		"Blue": "#0000FF",
		"Yellow": "#FFFF00",
		"Magenta": "#FF00FF",
		"Cyan": "#00FFFF",
		"Maroon": "#800000",
		"DarkGreen": "#008000",
		"Navy": "#000080",
		"Olive": "#808000",
		"Purple": "#800080",
		"Teal": "#008080",
		"DarkRed": "#C00000",
		"DarkLime": "#00C000",
		"DarkBlue": "#0000C0",
		"DarkYellow": "#C0C000",
		"DarkMagenta": "#C000C0",
		"DarkCyan": "#00C0C0",
		"Brown": "#A52A2A",
		"DarkOliveGreen": "#556B2F",
		"DarkNavy": "#000080",
		"DarkKhaki": "#BDB76B",
		"DarkPurple": "#800080",
		"DarkTeal": "#008080",
		"Orange": "#FFA500",
		"Lime": "#00FF00",
		"Azure": "#F0FFFF",
		"LightYellow": "#FFFFE0",
		"HotPink": "#FF69B4",
		"LightCyan": "#E0FFFF",
		"Gold": "#FFD700",
		"LimeGreen": "#32CD32",
		"Aquamarine": "#7FFFD4",
		"Lavender": "#E6E6FA",
		"DeepPink": "#FF1493",
		"Violet": "#EE82EE",
		"BurntOrange": "#CC5500",
		"Chartreuse": "#7FFF00",
		"SeaGreen": "#2E8B57",
		"LightBlue": "#ADD8E6",
		"PaleGreen": "#98FB98",
		"Orchid": "#DA70D6",
		"Mulberry": "#C54B8C",
		"GoldenBrown": "#996515",
		"MossGreen": "#8A9A5B",
		"Jade": "#00A86B",
		"SteelBlue": "#4682B4",
		"OliveDrab": "#6B8E23",
		"Plum": "#DDA0DD",
		"Aquamarine": "#7FFFD4",
		"Coral": "#FF7F50",
		"SpringGreen": "#00FF7F",
		"MediumAquamarine": "#66CDAA",
		"CornflowerBlue": "#6495ED",
		"DeepPink": "#FF1493",
		"BlueViolet": "#8A2BE2",
		"LightPink": "#FFB6C1",
		"MediumPurple": "#9370DB",
		"SkyBlue": "#87CEEB",
		"PaleTurquoise": "#AFEEEE",
		"PaleGreen": "#98FB98",
		"LightSalmon": "#FFA07A",
		"Orchid": "#DA70D6",
		"Orchid": "#9932CC",
		"DeepSkyBlue": "#00BFFF",
		"Turquoise": "#40E0D0",
		"LightGreen": "#90EE90",
		"Khaki": "#F0E68C",
		"PaleVioletRed": "#DB7093",
		"Silver": "#C0C0C0",
		"Gray": "#808080",
		"DarkGray": "#A9A9A9",
		"DarkSlateGray": "#2F4F4F",
		"SlateGray": "#708090",
		"DimGray": "#696969",
		"LightSlateGray": "#778899",
		"DarkSeaGreen": "#8FBC8F",
		"MediumSeaGreen": "#3CB371",
		"LightSeaGreen": "#20B2AA",
		"MediumSlateBlue": "#7B68EE",
		"MediumTurquoise": "#48D1CC",
		"RoyalBlue": "#4169E1",
		"MediumVioletRed": "#C71585",
		"RosyBrown": "#BC8F8F",
		"IndianRed": "#CD5C5C"
	};
	
	//M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);
	//[M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	mStyle('dMain',{padding:10})
	UI.commands = {};
	UI.nav = showNavbar(); 
	setColors('skyblue', 'white');
	DB = await dbInit(DB_PATH);
	M.qHistory=[];

	// let tablenames = dbGetTableNames();
	// tablenames = tablenames.map(x=>x.name);
	// tablenames.map(x=>M[x]=dbToDict(`select * from ${x}`));
	// M.tagsByName=dbToDict(`select * from tags`,'tag_name');
	//console.log(M)
}









