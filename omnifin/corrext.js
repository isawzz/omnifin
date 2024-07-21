
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
function clearMessage(remove=false) { if (remove) mRemove('dMessage'); else mStyle('dMessage', { h: 0 }); }

function extractWords(s, allowed) {
	let specialChars = getSeparators(allowed);
	let parts = splitAtAnyOf(s, specialChars.join('')).map(x => x.trim());
	return parts.filter(x => !isEmpty(x));
}
function getServerurl() {
  let type = detectSessionType();
  let server = type == 'vps' ? 'https://server.vidulusludorum.com' : 'http://localhost:3001';
  return server;
}
function mButtonX(dParent, handler = null, sz = 22, offset = 5, color = 'contrast') {
	mIfNotRelative(dParent);
	let bx = mDom(dParent, { position: 'absolute', top: -2 + offset, right: -5 + offset, w: sz, h: sz, cursor: 'pointer' }, { className: 'hop1' });
	bx.onclick = ev => { evNoBubble(ev); if (!handler) dParent.remove(); else handler(ev); }
	let o = M.superdi.xmark;
	let bg = mGetStyle(dParent, 'bg'); if (isEmpty(bg)) bg = 'white';
	let fg = color == 'contrast' ? colorIdealText(bg, true) : color;
	el = mDom(bx, { fz: sz, hline: sz, family: 'fa6', fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
}
function mCommand(dParent, key, html, styles={}, opts = {}) {
	if (nundef(html)) html = capitalize(key);
	let close = valf(opts.close, () => { console.log('close', key) });
	let save = valf(opts.save, false);
	let open = valf(opts.open, window[`onclick${capitalize(key)}`]);
	let d = mDom(dParent, { display: 'inline-block' }, { key: key });
	let a = mDom(d, styles, { id: `${key}`, key: `${key}`, tag: 'a', href: '#', html: html, className: 'nav-link', onclick: onclickCommand })
	let cmd = { dParent, elem: d, div: a, key, open, close, save };
	addKeys(opts, cmd);
	return cmd;
}
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
function mPopup(dParent, styles = {}, opts = {}) {
	if (nundef(dParent)) dParent = document.body;
	if (isdef(mBy(opts.id))) mRemove(opts.id);
	mIfNotRelative(dParent);
	let animation = 'diamond-in-center .5s ease-in-out'; let transition = 'opacity .5s ease-in-out';
	addKeys({ animation, bg: 'white', fg: 'black', padding: 20, rounding: 12, top: 50, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }, styles);
	let popup = mDom(dParent, styles, opts); //console.log(popup)
	mButtonX(popup);
	return popup;
}
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent); mClass(dParent,'table_container')
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
function showMessage(msg, ms = 3000) {
	let d = mBy('dMessage');
	if (nundef(d)) d = mPopup(); d.id='dMessage';
	mStyle(d, { h: 21, bg: 'red', fg: 'yellow' });
	d.innerHTML = msg;
	clearTimeout(TO.message);
	TO.message = setTimeout(()=>clearMessage(true), ms)
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













