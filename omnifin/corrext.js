
function extractWords(s, allowed) {
	let specialChars = getSeparators(allowed);
	let parts = splitAtAnyOf(s, specialChars.join('')).map(x => x.trim());
	return parts.filter(x => !isEmpty(x));
}
function handleSticky() { let d = mBy('dNav'); if (window.scrollY >= 88) mClass(d, 'sticky'); else mClassRemove(d, 'sticky'); }

function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	//console.log(reclist[0])
	if (isEmpty(reclist)) {mText('no data',dParent); return null; }
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
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	if (isdef(className)) mClass(t, className);
	if (isdef(styles)) mStyle(t, styles);
	if (showheaders) {
		let r=mDom(t,{},{tag:'tr'});
		headers.map(x=>mDom(r,{},{tag:'th',html:x}));
	}
	return t;
}
async function onclickCommand(ev) {
	//hier muss command irgendwie markiert werden und altes unmarked werden!!!
	let key = evToAttr(ev, 'key'); //console.log(key);
	let cmd = key == 'user' ? UI.nav.commands.user : UI.commands[key];
	assertion(isdef(cmd), `command ${key} not in UI!!!`);

	let links = Array.from(mBy('dLeft').getElementsByTagName('a'));
	links.map(x=>mStyle(x,{fStyle:'normal'}));
	mStyle(ev.target,{fStyle:'italic'})


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
function sortBy(arr, key) { 
	function fsort(a,b){
		let [av,bv]=[a[key],b[key]];
		if(isNumber(av) && isNumber(bv)) return Number(av)<Number(bv)?-1:1;
		if (isEmpty(av)) return -1;
		if (isEmpty(bv)) return 1;
		return av<bv?-1:1;
	}
	arr.sort(fsort); //(a, b) => {let [av,bv]=[a[key],b[key]];return (av && !bv && av > bv) ? -1 : 1;}); 
	// arr.sort((a, b) => {let [av,bv]=[a[key],b[key]];return (!av || av < bv) ? -1 : 1;}); 
	return arr; 
}

function sortByDescending(arr, key) { 
	function fsort(a,b){
		let [av,bv]=[a[key],b[key]];
		if(isNumber(av) && isNumber(bv)) return Number(av)>Number(bv)?-1:1;
		if (isEmpty(av)) return 1;
		if (isEmpty(bv)) return -1;
		return av>bv?-1:1;
	}
	arr.sort(fsort); //(a, b) => {let [av,bv]=[a[key],b[key]];return (av && !bv && av > bv) ? -1 : 1;}); 
	return arr; 
}

async function updateExtra() { }













