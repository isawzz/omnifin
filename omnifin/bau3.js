
function generateSQLWhereClause(cells) {
	// // Example usage:
	// const cells = [
	//   { icol: 0, irow: 0, text: 'Alice', header: 'name' },
	//   { icol: 1, irow: 0, text: 'Engineering', header: 'department' },
	//   { icol: 0, irow: 1, text: 'Bob', header: 'name' },
	//   { icol: 1, irow: 1, text: 'HR', header: 'department' }
	// ];

	// console.log(generateSQLWhereClause(cells));
	if (cells.length === 0) {
		return '';
	}

	// Group cells by their rows and columns
	const rows = {};
	const cols = {};

	cells.forEach(cell => {
		if (!rows[cell.irow]) {
			rows[cell.irow] = [];
		}
		rows[cell.irow].push(cell);

		if (!cols[cell.icol]) {
			cols[cell.icol] = [];
		}
		cols[cell.icol].push(cell);
	});

	//console.log(rows,cols)

	let ands = [];
	for (const irow in rows) {
		let rcells = rows[irow];
		let cl = rcells.map(cell => generateEquals(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x => !isEmpty(x))
	ands = arrRemoveDuplicates(ands);
	let res = isEmpty(ands) ? null : 'WHERE\n ' + ands.join(' OR ');
	return res;
}


function generateSQLEqualsWHERE(a, text) {
	if (a == 'MCC' || a == 'tag_names') return null;
	return isEmpty(text) ? `(${a} IS NULL OR ${a}='')` : `${a}='${text}'`;
}

function generateCompExp(cells) {
	// // Example usage:
	// const cells = [
	//   { icol: 0, irow: 0, text: 'Alice', header: 'name' },
	//   { icol: 1, irow: 0, text: 'Engineering', header: 'department' },
	//   { icol: 0, irow: 1, text: 'Bob', header: 'name' },
	//   { icol: 1, irow: 1, text: 'HR', header: 'department' }
	// ];

	// console.log(generateSQLWhereClause(cells));
	if (cells.length === 0) {
		return '';
	}

	// Group cells by their rows and columns
	const rows = {};
	const cols = {};

	cells.forEach(cell => {
		if (!rows[cell.irow]) {
			rows[cell.irow] = [];
		}
		rows[cell.irow].push(cell);

		if (!cols[cell.icol]) {
			cols[cell.icol] = [];
		}
		cols[cell.icol].push(cell);
	});

	//console.log(rows,cols)

	let ands = [];
	for (const irow in rows) {
		let rcells = rows[irow];
		let cl = rcells.map(cell => generateEquals(cell.header, cell.text)).filter(cell => !isEmpty(cell)).join(' AND ');
		ands.push(cl);
	}
	ands = ands.filter(x => !isEmpty(x))
	ands = arrRemoveDuplicates(ands);
	let res = isEmpty(ands) ? null : ands.join(' OR ');
	return res;
}
function generateEquals(a, text) {	return isEmpty(text) ? `${a} IS NULL OR ${a}=''` : `${a}='${text}'`;}








