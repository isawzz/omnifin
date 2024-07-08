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
