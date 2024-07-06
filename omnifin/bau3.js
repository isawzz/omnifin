
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
	let inp = mDom(d, selectStyles, { autocomplete: 'off', className: 'input', name: 'val', tag: 'input', type: 'text', placeholder: `<enter value>` });
	mLinebreak(d,linegap);
	d1=mDom(d);mCenterCenterFlex(d1);
	mDom(d,{align:'right','align-self':'center',w:80},{html:'or: '});
	let dSelectHeader2 = uiTypeSelect(headers, d, selectStyles, opts);

	function collectAndResolve(){
		let val=dSelectHeader.value;
		let op = dSelectOp.value;
		let val2 = !isEmpty(inp.value)?inp.value:dSelectHeader2.value;

		resolve({val,op,val2});
	}

	mLinebreak(d,linegap);
	d1=mDom(d,{w100:true});mCenterCenterFlex(d1);
	mButton('done', collectAndResolve, d1, {w:90}, 'input', 'bFilter');
	return dOuter;

}
function mist() {
	let ops = ['contains', '==', '!=', '<=', '>=', '<', '>'];
	let dSelectOp = uiTypeSelect(ops, dParent, styles, opts);

	let inputs = [];
	let formStyles = opts.showLabels ? { wmin: 400, padding: 10, bg: 'white', fg: 'black' } : {};
	let form = mDom(dParent, formStyles, { tag: 'form', method: null, action: "javascript:void(0)" })
	for (const k in dict) {
		let [content, val] = [k, dict[k]];
		if (opts.showLabels) mDom(form, {}, { html: content });
		let inp = mDom(form, styles, { autocomplete: 'off', className: 'input', name: content, tag: 'input', type: 'text', value: val, placeholder: `<enter ${content}>` });
		inputs.push({ name: content, inp: inp });
		mNewline(form)
	}
	mDom(form, { display: 'none' }, { tag: 'input', type: 'submit' });
	form.onsubmit = ev => {
		ev.preventDefault();
		let di = {};
		inputs.map(x => di[x.name] = x.inp.value);
		resolve(di);
	}
	return form;
}












