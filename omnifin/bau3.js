
function tLoadRowsRest(t, records, headers, diw = {}) {
	let tbody = t.querySelector('tbody');
	let irow = arrChildren(tbody).length; // assumes headers shown!
	while (irow < records.length) {
		let r = mDom(tbody, {}, { tag: 'tr' });
		let icol = -1;
		for (const k of headers) {
			let html = records[irow][k];
			icol++;
			let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
			let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
			//if (isdef(diw[k])) mStyle(c, { w: diw[k] });
			c.onclick = () => toggleItemSelection(c);
		}
		irow++;
	}
}

function tLoadRowsByChunk(t, records, headers, diw = {}) {
	let tbody = t.querySelector('tbody');
	let nChunk = 30;
	let irow = arrChildren(tbody).length; // assumes headers shown!
	while (irow < records.length) {
		for (const rec of arrTake(records, nChunk, irow)) {
			let r = mDom(tbody, {}, { tag: 'tr' });
			let icol = -1;
			for (const k of headers) {
				let html = rec[k];
				icol++;
				let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
				let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
				if (isdef(diw[k])) mStyle(c, { w: diw[k] });
				c.onclick = () => toggleItemSelection(c);
			}
			irow++;
		}
	}

}












