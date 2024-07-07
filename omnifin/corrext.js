
function calculateGoodColors(bg, fg) {
	let fgIsLight = isdef(fg) ? colorIdealText(fg) == 'black' : colorIdealText(bg) == 'white';
	let bgIsDark = colorIdealText(bg) == 'white';
	if (nundef(fg)) fg = colorIdealText(bg);
	let bgNav = bg;
	fg = colorToHex79(fg);
	if (fgIsLight) {
		if (isEmpty(U.texture)) { bgNav = '#00000040'; }
		else if (bgIsDark) { bgNav = colorTrans(bg, .8); }
		else { bgNav = colorTrans(colorDark(bg, 50), .8); }
	} else {
		if (isEmpty(U.texture)) { bgNav = '#ffffff40'; }
		else if (!bgIsDark) { bgNav = colorTrans(bg, .8); }
		else { bgNav = colorTrans(colorLight(bg, 50), .8); }
	}
	let realBg = bg;
	if (bgNav == realBg) bgNav = fgIsLight ? colorDark(bgNav, .2) : colorLight(bgNav, .2);
	let bgContrast = fgIsLight ? colorDark(bgNav, .2) : colorLight(bgNav, .2);
	let fgContrast = fgIsLight ? '#ffffff80' : '#00000080';
	return [realBg, bgContrast, bgNav, fg, fgContrast];
}
function extractWords(s, allowed) {
	let specialChars = getSeparators(allowed);
	let parts = splitAtAnyOf(s, specialChars.join('')).map(x => x.trim());
	return parts.filter(x => !isEmpty(x));
}
function handleSticky() { let d = mBy('dNav'); if (window.scrollY >= 88) mClass(d, 'sticky'); else mClassRemove(d, 'sticky'); }

function ifNotList(x){return isList(x)?x:[x];}

function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	//console.log(reclist[0])
	if (isEmpty(reclist)) { mText('no data', dParent); return null; }
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
		else { mStyle(d, { h: '100vh' }); mCenterCenterFlex(d); }
	});
}
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	if (isdef(className)) mClass(t, className);
	if (isdef(styles)) mStyle(t, styles);
	if (showheaders) {
		let r = mDom(t, {}, { tag: 'tr' });
		headers.map(x => mDom(r, {}, { tag: 'th', html: x }));
	}
	return t;
}
function multiSort(properties) {
	// Example usage:
	// const data = [
	// 	{ name: "Alice", age: 30, city: "New York" },
	// 	{ name: "bob", age: null, city: "los angeles" },
	// 	{ name: null, age: 25, city: "Chicago" },
	// 	{ name: "alice", age: 25, city: "Los Angeles" },
	// 	{ name: "Bob", age: 30, city: null },
	// ];

	// data.sort(multiSort(['name', 'age', 'city']));

	// console.log(data);
	return function (a, b) {
		for (let prop of properties) {
			let propA = a[prop];
			let propB = b[prop];

			// Handle null or undefined values
			if (propA == null && propB == null) continue;
			if (propA == null) return -1;
			if (propB == null) return 1;

			// Compare numbers
			if (typeof propA === 'number' && typeof propB === 'number') {
				if (propA < propB) return -1;
				if (propA > propB) return 1;
				continue;
			}

			// Compare strings case-insensitively
			if (typeof propA === 'string' && typeof propB === 'string') {
				propA = propA.toLowerCase();
				propB = propB.toLowerCase();
				if (propA < propB) return -1;
				if (propA > propB) return 1;
				continue;
			}

			// For other types (including mixed types), compare as strings
			propA = String(propA);
			propB = String(propB);
			if (propA < propB) return -1;
			if (propA > propB) return 1;
		}
		return 0;
	};
}
async function onclickCommand(ev,key) {
	//hier muss command irgendwie markiert werden und altes unmarked werden!!!
	if (nundef(key)) key = evToAttr(ev, 'key'); //console.log(key);
	let cmd = key == 'user' ? UI.nav.commands.user : UI.commands[key];
	assertion(isdef(cmd), `command ${key} not in UI!!!`);

	let links = Array.from(mBy('dLeft').getElementsByTagName('a'));
	links.map(x => mStyle(x, { fStyle: 'normal' }));
	mStyle(iDiv(cmd), { fStyle: 'italic' });
	UI.lastCommandKey = key;


	await cmd.open();
}
function replaceAllSpecialCharsFromList(str, list, sBy, removeConsecutive=true) { 
	for(const sSub of list){
		str=replaceAllSpecialChars(str,sSub,sBy);
	}
	if (removeConsecutive){
		let sresult='';
		while(str.length>0){
			let sSub=str.substring(0,sBy.length);
			str = stringAfter(str,sSub);
			if (sSub == sBy && sresult.endsWith(sBy)) continue;
			sresult += sSub;
			if (str.length<sBy.length) {sresult+=str;break;}
		}
		str=sresult;
	}
	return str;
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
	function fsort(a, b) {
		let [av, bv] = [a[key], b[key]];
		if (isNumber(av) && isNumber(bv)) return Number(av) < Number(bv) ? -1 : 1;
		if (isEmpty(av)) return -1;
		if (isEmpty(bv)) return 1;
		return av < bv ? -1 : 1;
	}
	arr.sort(fsort); //(a, b) => {let [av,bv]=[a[key],b[key]];return (av && !bv && av > bv) ? -1 : 1;}); 
	// arr.sort((a, b) => {let [av,bv]=[a[key],b[key]];return (!av || av < bv) ? -1 : 1;}); 
	return arr;
}
function sortByDescending(arr, key) {
	function fsort(a, b) {
		let [av, bv] = [a[key], b[key]];
		if (isNumber(av) && isNumber(bv)) return Number(av) > Number(bv) ? -1 : 1;
		if (isEmpty(av)) return 1;
		if (isEmpty(bv)) return -1;
		return av > bv ? -1 : 1;
	}
	arr.sort(fsort); //(a, b) => {let [av,bv]=[a[key],b[key]];return (av && !bv && av > bv) ? -1 : 1;}); 
	return arr;
}
function sortByEmptyLast(arr, key) {
	function fsort(a, b) {
		let [av, bv] = [a[key], b[key]];
		if (isNumber(av) && isNumber(bv)) return Number(av) < Number(bv) ? -1 : 1;
		if (isEmpty(av)) return 1;
		if (isEmpty(bv)) return -1;
		return av < bv ? -1 : 1;
	}
	arr.sort(fsort); //(a, b) => {let [av,bv]=[a[key],b[key]];return (av && !bv && av > bv) ? -1 : 1;}); 
	// arr.sort((a, b) => {let [av,bv]=[a[key],b[key]];return (!av || av < bv) ? -1 : 1;}); 
	return arr;
}
function sortByMultipleProperties(list) {
	let props = Array.from(arguments).slice(1);
	return list.sort((a, b) => {
		for (const p of props) {
			if (a[p] < b[p]) return -1;
			if (a[p] > b[p]) return 1;
		}
		return 0;
	});
}


async function updateExtra() { }













