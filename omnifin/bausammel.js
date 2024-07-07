function uiGadgetTypeTextarea(dParent, dict, resolve, styles = {}, opts = {}) {
	//let wIdeal = 500;
	let formStyles = { maleft: 10, box: true, padding: 10, bg: 'white', fg: 'black', rounding: 10 };
	let form = mDom(dParent, formStyles, {})
	addKeys({ className: 'input', tag: 'textarea', id:'taFilter' }, opts);
	//let df = mDom(form);

	addKeys({ fz: 14, family: 'tahoma', w: 500, padding: 10, resize: 'none' }, styles);
	let taStyles = styles;
	mDom(form, { mabottom: 4 }, { html: 'Filter expression:' });
	let ta = mDom(form, taStyles, opts);
	let db = mDom(form, { vmargin: 10, align: 'right' });

	// let ta = mDom(df, {}, { tag: 'textarea', rows: 20, cols: 80, id: 'taFilter', value:dict.exp, padding:10 });
	// let ta = UI.ta = mDom(df, { bg:'violet','white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { rows: 25, tag: 'textarea', id: 'taFilter', value: dict.exp });
	// ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); resolve(mBy('taFilter').value); } });

	mButton('Cancel', ev => resolve(null), db, { classes: 'button', maright: 10 });
	mButton(dict.caption, ev => { resolve(mBy('taFilter').value); }, db, { classes: 'button' });

	return form;
}
function extractFilterExpression(){
	let info=DA.tinfo;
	let cells = DA.cells;
	let selitems = cells.filter(x=>x.isSelected);
	//console.log(info,selitems);

	let qtrim=DA.tinfo.q.trim().toLowerCase();
	assertion(qtrim.endsWith(';'),'WTF!!!!!!!!!!!!!!!!!!!');
	let q=qtrim;

	// let pSelect=stringBefore(q,'from');
	// q=stringAfter(q,pSelect);
	// let pfrom;
	// if (q.contains('join')){
	// 	pfrom = stringBefore(q,'join');
	// }else if (q.contains('left join')){
	// 	pfrom = stringBefore(q,'left join');
	// }else if (q.contains('where')){
	// 	pfrom = stringBefore(q,'where');
	// }else if (q.contains('group by')){
	// 	pfrom = stringBefore(q,'group by');
	// }else if (q.contains('group by')){
	// 	pfrom = stringBefore(q,'group by');
	// }else if (q.contains('group by')){
	// 	pfrom = stringBefore(q,'group by');
	// }else if (q.contains('group by')){
	// 	pfrom = stringBefore(q,'group by');
	// }
	// let pfrom=stringBefore(q,'select');
	// let pSelect=stringBefore(q,'select');
	// let pSelect=stringBefore(q,'select');
	// let pSelect=stringBefore(q,'select');

	exp=stringBeforeLast(exp,';') + ' where ';
	//console.log(exp)

	
	for(const item of selitems){
		let header = info.headers[item.icol];
		let text = iDiv(item).innerHTML;
		//if (exp != '') exp += ' or ';
		exp += `${header}='${text}'`;
		if (isLast(item,selitems)) exp += ';'; else exp +=' or ';
	}
	return exp;

}
function isLast(el,arr){return arrLast(arr)==el;}
function checkButtons(){
  let info = DA.tinfo;
  let [ifrom,ito,records]=[info.ifrom,info.ito,info.records];
  if (ifrom == 0) disableButton('bPgUp'); else enableButton('bPgUp'); 
  if (ito == records.length) disableButton('bPgDn'); else enableButton('bPgDn'); 
  if (isEmpty(M.qHistory)) disableButton('bBack'); else enableButton('bBack'); 

  
}
function showChunk(inc) {
	let o = DA.tinfo;
	let [dParent, title, tablename, dTable, records, headers, header] = [o.dParent, o.title, o.tablename, o.dTable, o.records, o.headers, o.header];
  let [ifrom,ito]=calcIndexFromTo(inc,o); //console.log(ifrom,ito)
	let chunkRecords = records.slice(ifrom, ito);
	if (isdef(UI.dataTable)) mRemove(UI.dataTable.div); mClear(dTable);
	let t = UI.dataTable = mDataTable(chunkRecords, dTable, null, headers, 'records');
	if (nundef(t)) { console.log('UI.dataTable is NULL'); return; }
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => { evNoBubble(ev); showChunkedSortedBy(dParent, title, tablename, records, headers, ui.innerHTML); }
	}
	if (tablename != 'transactions') return;
	DA.tinfo.ifrom = ifrom;
	// return;
  let cells = DA.cells = [];
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
    //console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
    let tds = arrChildren(r);
		for (const ui of tds) {
      mStyle(ui,{cursor:'pointer'});
      let item = {ri,div:ui,text:ui.innerHTML,record:ri.o,isSelected:false,irow:t.rowitems.indexOf(ri),icol:tds.indexOf(ui)};
      cells.push(item);
			ui.onclick = ()=>toggleItemSelection(item); //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
  checkButtons();
}

async function onclickFilter1(ev, ofilter) {

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header]

	let content = { headers }; //.map(x => ({ name: x, value: false }));

	//let result = {val:'sender_name',op:'==',val2:'dkb-4394'}; //
	let result = ofilter;
	if (nundef(result)) result = await mGather(mBy('bFilter'), {}, { content, type: 'filter' });

	// result = ['unit','!=','USD'];
	// result = ['amount','<','1000'];
	// result = ['receiver_name','==','merchant'];

	if (!result || isEmpty(result)) { console.log('operation cancelled!'); return; }
	console.log(result)
	let recs = records.filter(x => {
		let [val1,op,val2] = [x[result[0]],result[1],result[2]];
		if (headers.includes(val2)) val2 = x[val2];
		if (isNumber(val1)) val1 = Number(val1);
		if (isNumber(val2)) val2 = Number(val2);
		let [e1, e2] = [!val1 || isEmpty(val1), !val2 || isEmpty(val2)];
		//console.log(val1,op,val2);
		switch (op) {
			case '==': return val1 == val2; break;
			case '!=': return val1 != val2; break;
			case '<': return val1 < val2; break;
			case '>': return val1 > val2; break;
			case '<=': return val1 <= val2; break;
			case '>=': return val1 >= val2; break;
			case '&&': return val1 && val2; break;
			case '||': return val1 || val2; break;
			case 'nor': return e1 && e2; break;
			case 'xor': return e1 & !e2 || e2 && !e1; break;
			case 'contains': return isString(val1) && val1.includes(val2); break;
			default: return val1 == 'X'||val1 == true; break; //for tag columns or true false columns
		}
	});

	DA.tinfo.records = recs;
	//console.log('recs',recs);
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, [])
}
function uiGadgetTypeFilter(dParent, dict, resolve, styles = {}, opts = {}) {

	addKeys({ hmax: 500, wmax: 400, bg: 'white', fg: 'black', padding: 16, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let selectStyles = { hmax, w:220, box: true };

	let d=mDom(dOuter);mFlexWrap(d)
	//checklist fuer headers
	let headers = dict.headers;
	let d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'LHS: '})
	let dSelectHeader = uiTypeSelect(headers, d1, selectStyles, opts);

	let linegap=10;
	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'op: '})
	let ops = ['contains', '==', '!=', '<=', '>=', '<', '>', '&&', '||', 'nor', 'xor'];
	let dSelectOp = uiTypeSelect(ops, d1, selectStyles, opts);

	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'RHS: '})
	let inp = mDom(d1, selectStyles, { autocomplete: 'off', className: 'input', name: 'val', tag: 'input', type: 'text', placeholder: `<enter value>` });
	
	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d1,{align:'right','align-self':'center',w:80},{html:'or: '});
	let dSelectHeader2 = uiTypeSelect(headers, d1, selectStyles, opts);

	function collectAndResolve(){
		let val=dSelectHeader.value;
		let op = dSelectOp.value;
		let val2 = !isEmpty(inp.value)?inp.value:dSelectHeader2.value;

		resolve([val,op,val2]);
	}

	mLinebreak(d,linegap);
	d1=mDom(d,{w100:true});mCenterCenterFlex(d1);
	mButton('done', collectAndResolve, d1, {w:90}, 'input', 'bFilter');
	return dOuter;

}









