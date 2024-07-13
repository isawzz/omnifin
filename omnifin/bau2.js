
function mTableInfinite(recList, dParent, rowStyleFunc, headers, id, showHeaders = true) {
	//console.log(reclist[0])
	if (isEmpty(recList)) { mText('no data', dParent); return null; }
	if (nundef(headers)) headers = Object.keys(recList[0]);
	let t = mTable(dParent, headers, showHeaders);
	if (isdef(id)) t.id = `t${id}`;
	let rowItems = [];
	return { div: t, recList, rowItems, rowStyleFunc, headers, showHeaders };
}
function mTableAddRows(info,n){
	let i = info.rowItems.length;
	let id = iDiv(info).id;
	for (const u of arrTake(info.recList,n,i)) {
		let rid = isdef(id) ? `r${id}_${i}` : null;
		r = mTableRow(iDiv(info), u, info.headers, rid);
		if (isdef(info.rowStyleFunc)) mStyle(r.div, rowStyleFunc(u));
		info.rowItems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
		i++;
	}
}










