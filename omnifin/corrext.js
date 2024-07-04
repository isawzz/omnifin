
function handleSticky() { let d = mBy('dNav'); if (window.scrollY >= 88) mClass(d, 'sticky'); else mClassRemove(d, 'sticky'); }

function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	//console.log(reclist[0])
	if (isEmpty(reclist)) {mText('no data',dParent); return; }
	if (nundef(headers)) headers = Object.keys(reclist[0]);
	let t = mTable(dParent, headers, showheaders);
	if (isdef(id)) t.id = `t${id}`;
	let rowitems = [];
	let i = 0;
	for (const u of reclist) {
		let rid = isdef(id) ? `r${id}_${i}` : null;
		r = mTableRow(t, u, headers, rid);
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
		i++;
	}
	return { div: t, rowitems: rowitems };
}
function mGather(dAnchor, styles = {}, opts = {}) {
	return new Promise((resolve, _) => {
		let [content, type] = [valf(opts.content, 'name'), valf(opts.type, 'text')]; //defaults
		let dbody = document.body;
		let dDialog = mDom(dbody, { bg: '#00000040', box: true, w: '100vw', h: '100vh' }, { tag: 'dialog', id: 'dDialog' });
		let d = mDom(dDialog);
		let funcName = `uiGadgetType${capitalize(type)}`; //console.log(funcName)
		let uiFunc = window[funcName];
		let dx = uiFunc(d, content, x => { dDialog.remove(); resolve(x) }, styles, opts);
		if (isdef(opts.title)) mInsert(dx, mCreateFrom(`<h2>Details for ${opts.title}</h2>`))
		dDialog.addEventListener('mouseup', ev => {
			if (opts.type != 'select' && isPointOutsideOf(dx, ev.clientX, ev.clientY)) {
				resolve(null);
				dDialog.remove();
			}
		});
		dDialog.addEventListener('keydown', ev => {
			if (ev.key === 'Escape') {
				dDialog.remove();
				console.log('RESOLVE NULL ESCAPE');
				resolve(null);
			}
		});
		dDialog.showModal();
		if (isdef(dAnchor)) mAnchorTo(dx, toElem(dAnchor), opts.align);
		else {mStyle(d,{h:'100vh'});mCenterCenterFlex(d); }
	});
}
async function onclickCommand(ev) {
	//hier muss command irgendwie markiert werden und altes unmarked werden!!!
	let key = evToAttr(ev, 'key'); //console.log(key);
	let cmd = key == 'user' ? UI.nav.commands.user : UI.commands[key];
	assertion(isdef(cmd), `command ${key} not in UI!!!`);

	await cmd.open();
}
function showNavbar() {
	mDom('dNav', { fz: 34, mabottom: 10, w100: true }, { html: `Omnifin` });
	let nav = mMenu('dNav');
	let commands = {};
	commands.overview = menuCommand(nav.l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	commands.sql = menuCommand(nav.l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);
	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	nav.commands = commands;
	return nav;
}
function uiTypeCheckListInput(any, dParent, styles = {}, opts = {}) {
	let dg = mDom(dParent);
	let list = toNameValueList(any); list.map(x => { if (x.value != true) x.value = false; });
	let items = [];
	for (const o of list) {
		//console.log(o.value)
		let div = mCheckbox(dg, o.name, o.value);
		items.push({ nam: o.name, div, w: mGetStyle(div, 'w'), h: mGetStyle(div, 'h') });
	}
	let wmax = arrMax(items, 'w'); //console.log('wmax',wmax); //measure max width of items
	let cols = 4;
	let wgrid = wmax * cols + 100;
	dg.remove();
	dg = mDom(dParent);
	let inp = mDom(dg, { w100: true, box: true, mabottom: 10 }, { className: 'input', tag: 'input', type: 'text' });
	let db = mDom(dg, { w100: true, box: true, align: 'right', mabottom: 4 });
	mButton('cancel', () => opts.handler(null), db, {}, 'input');
	mButton('clear', ev => { onclickClear(inp, grid) }, db, { maleft: 10 }, 'input');
	mButton('done', () => opts.handler(extractWords(inp.value, ' ')), db, { maleft: 10 }, 'input');
	mStyle(dg, { w: wgrid, box: true, padding: 10 }); //, w: wgrid })
	//let hmax = isdef(styles.hmax) ? styles.hmax - 150 : 300;
	//console.log('...hmax',styles.hmax)
	//addKeys({hmax:450},styles);
	let hmax = valf(styles.hmax,450); //isdef(styles.hmax) ? styles.hmax - 150 : 300;
	let grid = mGrid(null, cols, dg, { w100: true, gap: 10, matop: 4, hmax:hmax-150}); //, bg:'red' });
	items.map(x => mAppend(grid, iDiv(x)));
	sortCheckboxes(grid);
	let chks = Array.from(dg.querySelectorAll('input[type="checkbox"]'));
	for (const chk of chks) {
		chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
	}
	inp.value = list.filter(x => x.value).map(x => x.name).join(', ');
	inp.addEventListener('keypress', ev => inpToChecklist(ev, grid));
	return { dg, inp, grid };
}
async function updateExtra() { }













