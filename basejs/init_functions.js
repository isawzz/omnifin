function _INTERRUPT() {
	clearEvents();
}
function _showPaletteNames(dParent, colors) {
	let d1 = mDom(dParent, { padding: 10, gap: 4 }); mFlexWrap(d1);
	for (var c of colors) {
		let bg = c.hex;
		let html = `${c.name}`;
		let dmini = mDom(d1, { padding: 10, bg, fg: colorIdealText(bg) }, { html, class: 'colorbox', dataColor: bg });
	}
}
function addAREA(id, o) {
	if (AREAS[id]) {
		error('AREAS ' + id + ' exists already!!! ');
		error(o);
		return;
	}
	AREAS[id] = o;
}
function addDummy(dParent, place) {
	let b = mButton('', null, dParent, { opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
	if (isdef(place)) mPlace(b, place);
	b.id = 'dummy';
}
function addEditable(dParent, styles = {}, opts = {}) {
	addKeys({ tag: 'input', classes: 'plain' }, opts)
	addKeys({ wmax: '90%', box: true }, styles);
	let x = mDom(dParent, styles, opts);
	x.focus();
	x.addEventListener('keyup', ev => {
		if (ev.key == 'Enter') {
			mDummyFocus();
			if (isdef(opts.onEnter)) opts.onEnter(ev)
		}
	});
	return x;
}
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }

function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }

function addPeepToCrowd() {
	const peep = removeRandomFromArray(availablePeeps)
	const walk = getRandomFromArray(walks)({
		peep,
		props: resetPeep({
			peep,
			stage,
		})
	}).eventCallback('onComplete', () => {
		removePeepFromCrowd(peep)
		addPeepToCrowd()
	})
	peep.walk = walk
	crowd.push(peep)
	crowd.sort((a, b) => a.anchorY - b.anchorY)
	return peep
}
function addToolX(cropper, d) {
	let img = cropper.img;
	function createCropTool() {
		let rg = mRadioGroup(d, {}, 'rSizes', 'Select crop area: '); mClass(rg, 'input');
		let handler = cropper.setSize;
		mRadio('manual', [0, 0], 'rSizes', rg, {}, handler, 'rSizes', true)
		let [w, h] = [img.offsetWidth, img.offsetHeight];
		if (w >= 128 && h >= 128) mRadio('128 x 128 (emo)', [128, 128], 'rSizes', rg, {}, handler, 'rSizes', false)
		if (w >= 200 && h >= 200) mRadio('200 x 200 (small)', [200, 200], 'rSizes', rg, {}, handler, 'rSizes', false)
		if (w >= 300 && h >= 300) mRadio('300 x 300 (medium)', [300, 300], 'rSizes', rg, {}, handler, 'rSizes', false)
		if (w >= 400 && h >= 400) mRadio('400 x 400 (large)', [400, 400], 'rSizes', rg, {}, handler, 'rSizes', false)
		if (w >= 500 && h >= 500) mRadio('500 x 500 (xlarge)', [500, 500], 'rSizes', rg, {}, handler, 'rSizes', false)
		if (w >= 140 && h >= 200) mRadio('140 x 200 (card)', [140, 200], 'rSizes', rg, {}, handler, 'rSizes', false)
		else {
			let [w1, h1] = [w, w / .7];
			let [w2, h2] = [h * .7, h];
			if (w1 < w2) mRadio(`${w1} x ${h1} (card)`, [w1, h1], 'rSizes', rg, {}, handler, 'rSizes', false)
			else mRadio(`${w2} x ${h2} (card)`, [w2, h2], 'rSizes', rg, {}, handler, 'rSizes', false)
		}
		if (w >= 200 && h >= 140) mRadio('200 x 140 (landscape)', [200, 140], 'rSizes', rg, {}, handler, 'rSizes', false)
		else {
			let [w1, h1] = [w, w * .7];
			let [w2, h2] = [h / .7, h];
			if (w1 < w2) mRadio(`${w1} x ${h1} (landscape)`, [w1, h1], 'rSizes', rg, {}, handler, 'rSizes', false)
			else mRadio(`${w2} x ${h2} (landscape)`, [w2, h2], 'rSizes', rg, {}, handler, 'rSizes', false)
		}
		mDom(rg, { fz: 14, margin: 12 }, { html: '(or use mouse to select)' });
		return rg;
	}
	function createSquareTool() {
		let rg = mRadioGroup(d, {}, 'rSquare', 'Resize (cropped area) to height: '); mClass(rg, 'input');
		let handler = x => squareTo(cropper, x);
		mRadio(`${'just crop'}`, 0, 'rSquare', rg, {}, cropper.crop, 'rSquare', false)
		for (const h of [128, 200, 300, 400, 500, 600, 700, 800]) {
			mRadio(`${h}`, h, 'rSquare', rg, {}, handler, 'rSquare', false)
		}
		return rg;
	}
	let rgCrop = createCropTool();
	let rgResize = createSquareTool();
}
function adjustComplex(panData) {
	let [x0, y0] = [panData.posStart.x, panData.posStart.y];
	let [dx, dy] = [panData.mouse.x - panData.mouseStart.x, panData.mouse.y - panData.mouseStart.y];
	let [wImg, hImg] = [panData.img.width, panData.img.height];
	let ideal = panData.cropStartSize.w;
	let [cx0, cy0] = [panData.cropStartPos.l + ideal / 2, panData.cropStartPos.t + ideal / 2];
	let [cx, cy] = [cx0 + dx, cy0 + dy];
	cx = clamp(cx, ideal / 2, wImg - ideal / 2); cy = clamp(cy, ideal / 2, hImg - ideal / 2);
	let lNew = clamp(cx - ideal / 2, 0, wImg);
	let tNew = clamp(cy - ideal / 2, 0, hImg);
	let rNew = clamp(cx + ideal / 2, 0, wImg);
	let bNew = clamp(cy + ideal / 2, 0, hImg);
	let wNew = Math.min(Math.abs(cx - lNew) * 2, Math.abs(rNew - cx) * 2);
	let hNew = Math.min(Math.abs(cy - tNew) * 2, Math.abs(bNew - cy) * 2);
	mStyle(panData.dCrop, { left: cx - wNew / 2, top: cy - hNew / 2, w: wNew, h: hNew });
}
function adjustCropper(img, dc, sz) {
	let [w, h] = [img.width, img.height]; console.log('sz', w, h,)
	let [cx, cy, radx, rady, rad] = [w / 2, h / 2, sz / 2, sz / 2, sz / 2];
	mStyle(dc, { left: cx - radx, top: cy - rady, w: sz, h: sz });
}
function adjustCropperBy(dc, x, y, dx, dy, wImg, hImg, szIdeal) {
	console.log('_________\ndx', dx, 'dy', dy)
	if (nundef(wImg)) {
		mStyle(dc, { left: x + dx, top: y + dy }); //,w:sz,h:sz});
		return;
	}
	console.log('image sz', wImg, hImg)
	let [l, t, w, h] = [mGetStyle(dc, 'left'), mGetStyle(dc, 'top'), mGetStyle(dc, 'w'), mGetStyle(dc, 'h')]; console.log('dims', l, t, w, h);
	let [cx, cy] = [l + w / 2, t + h / 2];
	let [cxNew, cyNew] = [cx + dx, cy + dy]; console.log('new center', cxNew, cyNew)
	let newDist = Math.min(cxNew, cyNew, wImg - cxNew, hImg - cyNew); console.log('newDist', newDist)
	let wNew = Math.min(szIdeal, newDist * 2);
	let hNew = Math.min(szIdeal, newDist * 2);
	let xNew = cxNew - wNew / 2;
	let yNew = cyNew - hNew / 2;
	mStyle(dc, { left: xNew, top: yNew, w: wNew, h: hNew }); //,w:sz,h:sz});
}
function adjustCropperBySimple(dc, x, y, dx, dy) { mStyle(dc, { left: x + dx, top: y + dy }); }

function agColoredShape(g, shape, w, h, color) {
	SHAPEFUNCS[shape](g, w, h);
	gBg(g, color);
}
function allCondDict(d, func) {
	let res = [];
	for (const k in d) { if (func(d[k])) res.push(k); }
	return res;
}
function allNumbers(s, func) {
	let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (nundef(m)) return [];
	let arr = m.map(v => +v);
	if (isdef(func)) arr = arr.map(x => func(x));
	return arr;
}
function allPlToPlayer(name) {
	let allPl = DA.allPlayers[name];
	return jsCopyExceptKeys(allPl, ['div', 'isSelected']);
}
function alphaToHex(a01) {
	a01 = Math.round(a01 * 100) / 100;
	var alpha = Math.round(a01 * 255);
	var hex = (alpha + 0x10000).toString(16).slice(-2).toUpperCase();
	return hex;
}
function amIHuman(table) { return isPlayerHuman(table, getUname()); }

function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
	TO.titleInterval = setInterval(() => {
		let corner = CORNERS[WhichCorner++ % CORNERS.length];
		document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
	}, 1000);
}
function annotate(sp) {
	for (const k in sp) {
		let node = sp[k];
		node.pool = [];
		let pool = makePool(node);
		for (const oid in pool) {
			let o = pool[oid];
			if (!evalCond(o, node)) continue;
			if (nundef(o.RSG)) o.RSG = {};
			let rsg = o.RSG;
			rsg[k] = true;
			node.pool.push(oid);
		}
	}
}
function arrAllSameOrDifferent(arr) {
	if (arr.length === 0) {
		return true;
	}
	const allSame = arr.every(element => element === arr[0]);
	if (allSame) {
		return true;
	}
	const uniqueElements = new Set(arr);
	const allDifferent = uniqueElements.size === arr.length;
	return allDifferent;
}
function arrAverage(arr, prop) {
	if (isDict(arr)) arr = Object.values(arr);
	let n = arr.length; if (!n) return 0;
	let sum = arrSum(arr, prop);
	return sum / n;
}
function arrBalancedAverage(arr, prop) {
	if (arr.length != 2) return arrAverage(arr, prop);
	let o = arrMinMax(arr, x => x[prop]);
	let [min, max] = [o.min, o.max];
	if (max < min * 1000) return (min + max) / 2;
	let s = '' + max; //console.log('smax',s)
	let snew = '';
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (ch == '0' || ch == '.') snew += ch; else snew += '1';
	}
	let nnew = Number(snew);
	return (min + nnew) / 2;
}
function arrChildren(elem) { return [...toElem(elem).children]; }

function arrClear(arr) { arr.length = 0; return arr; }

function arrCycle(arr, count) { return arrRotate(arr, count); }

function arrDisjoint(ad1, ad2, prop) {
	console.log(isDict(ad1), isDict(ad2))
	if (isDict(ad1) && isDict(ad2)) return Object.keys(ad1).find(x => x in ad2);
	else return ad1.map(x => x[prop]).find(el => ad2.map(x => x[prop]) == el);
}
function arrFindKeywordFromIndex(keywords, words, iStart) {
	for (let i = iStart; i < words.length; i++) {
		let w = words[i];
		if (keywords.some(x => x == w)) return { i, w };
	}
	return null;
}
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }

function arrMax(arr, f) { return arrMinMax(arr, f).max; }

function arrMinMax(arr, func) {
	if (nundef(func)) func = x => x;
	else if (isString(func)) { let val = func; func = x => x[val]; }
	let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
	for (let i = 1, len = arr.length; i < len; i++) {
		let v = func(arr[i]);
		if (v < min) {
			min = v; imin = i;
		} else if (v > max) {
			max = v; imax = i;
		}
	}
	return { min: min, imin: imin, max: max, imax: imax, elmin: arr[imin], elmax: arr[imax] };
}
function arrMinus(arr, b) { if (isList(b)) return arr.filter(x => !b.includes(x)); else return arr.filter(x => x != b); }

function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }

function arrRemoveDuplicates(arr) { return Array.from(new Set(arr)); }

function arrRemovip(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function arrReplace1(arr, elweg, eldazu) {
	let i = arr.indexOf(elweg);
	arr[i] = eldazu;
	return arr;
}
function arrRotate(arr, count) {
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;
	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrShuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }

function arrSum(arr, props) {
	if (nundef(props)) return arr.reduce((a, b) => a + b);
	if (!isList(props)) props = [props];
	return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0);
}
function arrTake(arr, n = 0, from = 0) {
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
	} else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeFromTo(arr, a, b) { return takeFromTo(arr, a, b); }

function arrTakeWhile(arr, func) {
	let res = [];
	for (const a of arr) {
		if (func(a)) res.push(a); else break;
	}
	return res;
}
function arrWithout(arr, b) { return arrMinus(arr, b); }

function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
}
function bgImageFromPath(path) { return isdef(path) ? `url('${path}')` : null; }

function buyProgressCard(ev) {
	let o = evToAttrElem(ev, 'key');
	console.log('player buys', o.val);
	o.elem.remove();
	let spot = M.selectedCivSpot
	if (isdef(spot)) {
		spot.innerHTML = '';
		let [w, h] = [mGetStyle(spot, 'w'), mGetStyle(spot, 'h')];
		mAppend(spot, o.elem);
		mStyle(o.elem, { h: h, w: w });
		o.elem.onclick = () => selectCivSpot(spot)
		mClassRemove(M.selectedCivSpot, 'shadow');
		M.selectedCivSpot = null;
	}
}
function cBlank(dParent, styles = {}, opts = {}) {
	if (nundef(styles.h)) styles.h = valf(styles.sz, 100);
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';
	if (nundef(styles.rounding)) styles.rounding = Math.min(styles.w, styles.h) / 21;
	addKeys({ className: 'card' }, opts);
	let d = mDom(dParent, styles, opts);
	opts.type = 'card';
	addKeys(styles, opts);
	let item = mItem(d ? { div: d } : {}, opts);
	return item;
}
function cLandscape(dParent, styles = {}, opts = {}) {
	if (nundef(styles.w)) styles.w = 100;
	if (nundef(styles.h)) styles.h = styles.w * .65;
	return cBlank(dParent, styles, opts);
}
function cNumber(ckey, styles = {}, opts = {}) {
	addKeys({ border: 'silver', h: 100 }, styles);
	addKeys({ backcolor: BLUE, ov: .3, key: ckey, type: 'num' }, opts);
	let c = cPortrait(null, styles, opts);
	if (isNumeric(ckey)) { ckey = `${ckey}_blue`; }
	let sym = c.rank = stringBefore(ckey, '_');
	let color = c.suit = c.val = stringAfter(ckey, '_');
	let sz = c.h;
	let [sm, lg, w, h] = [sz / 8, sz / 4, c.w, c.h];
	let styleSmall = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	cPrintSym(c, sym, styleSmall, 'tl')
	cPrintSym(c, sym, styleSmall, 'tr')
	styleSmall.transform = 'rotate(180deg)';
	cPrintSym(c, sym, styleSmall, 'bl')
	cPrintSym(c, sym, styleSmall, 'br')
	let styleBig = { matop: (h - lg) / 2, family: 'algerian', fg: color, fz: lg, h: lg, w: w, hline: lg, align: 'center' }
	styleBig = { display: 'inline', family: 'algerian', fg: color, fz: lg, hline: lg }
	cPrintSym(c, sym, styleBig, 'cc')
	return c;
}
function cPortrait(dParent, styles = {}, opts = {}) {
	if (nundef(styles.h)) styles.h = 100;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	return cBlank(dParent, styles, opts);
}
function cPrintSym(card, sym, styles, pos) {
	let d = iDiv(card);
	let opts = {};
	if (isNumber(sym)) {
		opts.html = sym;
	} else if (sym.includes('/')) {
		opts.tag = 'img';
		opts.src = sym;
	}
	let d1 = mDom(d, styles, opts);
	mPlace(d1, pos, pos[0] == 'c' ? 0 : 2, pos[1] == 'c' ? 0 : 2);
}
function cRound(dParent, styles = {}, opts = {}) {
	styles.w = valf(styles.w, 100);
	styles.h = valf(styles.h, 100);
	styles.rounding = '50%';
	return cBlank(dParent, styles, opts);
}
function calcBotLevel(table) {
	let humanPlayers = dict2list(table.players).filter(x => x.playmode == 'human');
	if (isEmpty(humanPlayers) || getGameOption('use_level') == 'no') return null;
	let level = arrAverage(humanPlayers, 'level');
	return level;
}
function calcBotSpeed(table) {
	let speed = 2000 + Math.round(Math.random() * 2000);
	let botLevel = calcBotLevel(table);
	return botLevel ? botLevel == 1 ? speed : speed * 4 / botLevel : speed;
}
function calcHeightLeftUnder(div) {
	let hwin = window.innerHeight;
	let r = getRect(div);
	let top = r.b;
	let h = hwin - top;
	return h;
}
function calcLifespan(s) {
	let arr = allNumbers(s, Math.abs);
	let num, unit, lifespan;
	if (!isEmpty(arr)) {
		if (arr.length > 2) arr = arr.slice(0, 2)
		let n = arrAverage(arr);
		unit = s.includes('year') ? 'y' : s.includes('month') ? 'm' : s.includes('week') ? 'w' : s.includes('day') ? 'd' : s.includes('hour') ? 'h' : 'y';
		num = calcYears(n, unit);
		lifespan = yearsToReadable(num);
	} else {
		let s1 = s.toLowerCase();
		let words = toWords(s1);
		if (s1.includes('a few')) {
			unit = wordAfter(words, 'few');
			let n = calcYears(3, unit);
			arr.push(n);
		}
		if (s1.includes('several')) {
			unit = wordAfter(words, 'several'); //console.log('unit',unit)
			let n = calcYears(3, unit);
			arr.push(n);
			let next = wordAfter(words, unit);
			if (next == 'to') {
				unit = wordAfter(words, 'to'); //console.log('unit',unit)
				if (['day', 'week', 'month', 'year'].some(x => unit.startsWith(x))) {
					let n = calcYears(3, unit);
					arr.push(n);
				}
			}
		}
		let di = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20 };
		for (const w of Object.keys(di)) {
			if (s.includes(w)) {
				let n = calcYears(di[w], stringAfter(s, w));
				arr.push(n);
			}
		}
		let n = arrAverage(arr);
		unit = 'year';
		lifespan = yearsToReadable(n);
		num = allNumbers(lifespan)[0];
		unit = stringAfter(lifespan, ' ');
	}
	unit = unit[0];
	return { s, text: lifespan, num, unit };
}
function calcNumericInfo(str, diunit, base) {
	if (nundef(str)) return { str: '', num: 0, base, text: '' };
	let s = str.toLowerCase(); s = replaceAll(s, '-', ' ');
	let words1 = stringSplit(s);
	let words = words1.map(x => x == 'few' || x == 'several' ? 3 : x); //console.log(words)
	let arr = allNumbers(words.join(' ')); //console.log(arr)
	if (isEmpty(arr)) {
		console.log('could NOT find any numbers!!!!')
		return { str, num: 1, unit: base, text: s };
	}
	let num, unit, text;
	let units = Object.keys(diunit);
	let arrunits = [];
	let unitFound = base;
	for (const n of arr) {
		let i = words.indexOf('' + n); //console.log('...',n,arr,words,i); //return;
		unit = arrFindKeywordFromIndex(units, words, i);
		if (unit) {
			unitFound = unit.w;
			arrunits.push({ n, unit: unit.w });
		}
		words = words.slice(i + 1);
	}
	for (const o of arrunits) {
		o.nnorm = o.n * diunit[o.unit];
	}
	let avg = arrBalancedAverage(arrunits, 'nnorm'); //let av2=arrBalancedAverage(arrunits,'nnorm')
	unit = arrunits[0].unit;
	num = avg / diunit[unit];
	text = `${num.toFixed(1)} ${unit}`;
	return { str, num, unit, text, avg };
}
function calcOffsprings(str) {
	let s = str.toLowerCase(); s = replaceAll(s, '-', ' '); s = replaceAll(s, ',', '');
	if (s.includes('incub')) s = stringBefore(s, 'incub');
	let arr = allNumbers(s);
	if (isEmpty(arr) && s.includes('hundred') && s.includes('thousand')) { s = s.replace('hundred', '100 '); s = s.replace('thousand', '1000 '); arr = [100, 1000]; }
	else if (isEmpty(arr) && s.includes('hundred')) { s = s.replace('hundred', '100 '); arr = [100]; }
	else if (isEmpty(arr) && s.includes('thousand')) { s = s.replace('thousand', '1000 '); arr = [1000]; }
	else if (isEmpty(arr) && s.includes('ten')) { s = s.replace('ten', '10 '); arr = [10]; }
	else if (isEmpty(arr) && s.includes('dozen')) { s = s.replace('dozen', '20 '); arr = [20]; }
	let words = toWords(s).filter(x => x != 's');
	if (isEmpty(arr)) return 1;
	let newarr = [];
	for (const n of arr) {
		let w = wordAfter(words, n);
		if (isdef(w) && ['day', 'month', 'week', 'year'].some(x => w.includes(x))) break;
		newarr.push(n);
	}
	let num = arrAverage(newarr);
	let text = newarr.length > 1 ? `${newarr[0]}-${newarr[1]} children}` : `${num} child${num == 1 ? '' : 'ren'}`;
	return { str, num, unit: 'child', text };
}
function calcRestHeight(dtop) {
	let hwin = window.innerHeight;
	let r = getRect(dtop);
	let top = r.y;
	let hmax = hwin - top - 20;
	return hmax;
}
function calcRows(fontSize, fontFamily, content, maxWidth) {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	ctx.font = `${fontSize}px ${fontFamily}`;
	const words = ('' + content).split(' ');
	let line = '';
	let rows = 0;
	for (let i = 0; i < words.length; i++) {
		const testLine = line + words[i] + ' ';
		const metrics = ctx.measureText(testLine);
		const testWidth = metrics.width;
		if (testWidth > maxWidth && i > 0) {
			rows++;
			line = words[i] + ' ';
		} else {
			line = testLine;
		}
	}
	if (line.length > 0) {
		rows++;
	}
	return rows;
}
function calcScoreSum(table) {
	let res = 0;
	for (const name in table.players) {
		res += table.players[name].score;
	}
	return res;
}
function calcSize(str) {
	return calcNumericInfo(str, { cm: .01, centimeter: .01, centimeters: .01, mm: .001, millimeter: .001, millimeters: .001, meter: 1, meters: 1, m: 1 }, 'm');
}
async function calcUserPalette(name) {
	if (nundef(name)) name = U.name;
	let user = await getUser(name);
	let dParent = mPopup(null, { opacity: 0 });
	return await showPaletteFor(dParent, user.texture, user.color, user.blendMode);
}
function calcWeight(str) {
	return calcNumericInfo(str, { kg: 1, kilogram: 1, kilograms: 1, mg: .000001, milligram: .000001, milligrams: .000001, grams: .001, gram: .001, g: .001, ton: 1000, tons: 1000 }, 'kg');
}
function calcYears(n, unit) {
	let ch = unit[0];
	let frac = ch == 'y' ? 1 : ch == 'm' ? 12 : ch == 'w' ? 52 : ch == 'd' ? 365 : ch == 'h' ? 365 * 24 : 1;
	return n / frac;
}
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
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }

function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function cardRect(ctx, x, y, color) {
	let dark = '#635651';
	let light = '#D9C7BD';
	delta = 20;
	let ybar = y + 33;
	let o = findNextBar(ctx, x, x + 100, ybar, ybar + 20, color, 10);
	if (nundef(o)) o = findNextBar(ctx, x, x + 100, ybar, ybar + 20, color, 15);
	console.log('bar', o);
	let xnew = o.x;
	let o1 = findNextBar(ctx, xnew, xnew + 20, ybar, ybar + 20, dark, delta);
	if (nundef(o1)) o1 = findNextBar(ctx, xnew, xnew + 20, ybar, ybar + 20, dark, delta + 10);
	console.log('dark', o1)
	let xx = o1.x + 30;
	let o2 = findNextBar(ctx, xx, xx + 100, ybar, ybar + 20, color, delta);
	console.log('bar', o2)
	let xline = x + 33;
	let o3 = findNextLine(ctx, xline, xline + 20, y, y + 100, color)
	if (nundef(o3)) o3 = findNextLine(ctx, xline, xline + 20, y, y + 100, color, delta)
	console.log('line', o3)
	let ynew = o3.y;
	let o4 = findNextLine(ctx, xline, xline + 20, ynew, ynew + 20, dark, delta)
	if (nundef(o4)) o4 = findNextLine(ctx, xline, xline + 20, ynew, ynew + 20, dark, delta + 10)
	console.log('line', o4)
	ynew = o4.y + 80;
	let o5 = findNextLine(ctx, xline, xline + 20, ynew, ynew + 100, color)
	console.log('line', o5)
	return { x: o1.x, y: o4.y, w: o2.x - o1.x, h: o5.y - o4.y };
}
function checkToInput(ev, inp, grid) {
	let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
	let names = checklist.filter(x => x.checked).map(x => x.name);
	sortCheckboxes(grid);
	names.sort();
	inp.value = names.join(', ') + ', ';
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }

function chooseRandom(arr) { return rChoose(arr); }

function circleFromCenter(dParent, center, styles = {}) {
	mSizeSuccession(styles);
	let [left, top] = [center.x - styles.w / 2, center.y - styles.h / 2];
	let d = mDom(dParent, { position: 'absolute', left, top, round: true });
	mStyle(d, styles);
	return d;
}
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }

function clearBodyDiv(styles = {}, opts = {}) { document.body.innerHTML = ''; return mDom(document.body, styles, opts) }

function clearBodyReset100(styles = {}, opts = {}) {
	let body = document.body;
	body.setAttribute('style', '');
	body.innerHTML = '';
	copyKeys({ w: '100vw', h: '100vh', position: 'relative' }, styles)
	let d = mDom(document.body, styles, opts)
	return d;
}
function clearCell(cell) { mClear(cell); mStyle(cell, { opacity: 0 }); }

function clearElement(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function clearEvents() {
	for (const k in TO) { clearTimeout(TO[k]); TO[k] = null; }
	for (const k in ANIM) { if (isdef(ANIM[k])) ANIM[k].cancel(); ANIM[k] = null; }
	if (SLEEP_WATCHER) { SLEEP_WATCHER.cancel(); console.log('clearEvents: ACHTUNG SLEEP_WATCHER!!!') }
}
function clearFleetingMessage() {
	if (isdef(dFleetingMessage)) { dFleetingMessage.remove(); dFleetingMessage = null; }
}
function clearFlex(styles = {}) {
	let dp = clearBodyDiv({ bg: 'white', hmin: '100vh', padding: 0 });
	addKeys({ gap: 10, padding: 10 }, styles)
	let d = mDom(dp, styles); mFlexWrap(d);
	return d;
}
function clearMain() { UI.commands = {}; staticTitle(); clearEvents(); mClear('dMain'); mClear('dTitle'); clearMessage(); }

function clearMessage() { mStyle('dMessage', { h: 0 }); }

function clearParent(ev) { mClear(ev.target.parentNode); }

function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain);
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function clearZones() {
	for (const k in Zones) {
		clearElement(Zones[k].dData);
	}
}
async function clickFirstTable() {
	let table = Serverdata.tables.find(x => x.status != 'open' && x.playerNames.includes(getUname()));
	if (table) { await onclickTable(table.id); return T; }
}
function clickOnElemWithAttr(prop, val) {
	let d = document.querySelectorAll(`[${prop}="${val}"]`)[0];
	if (isdef(d)) d.click();
	return d;
}
async function clickOnGame(gamename) { await showGameMenu(gamename); }

async function clickOnPlayer(name) { return await showGameMenuPlayerDialog(name); }

function cloneIfNecessary(value, optionsArgument) {
	var clone = optionsArgument && optionsArgument.clone === true
	return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}
function closeLeftSidebar() { mClear('dLeft'); mStyle('dLeft', { w: 0, wmin: 0 }) }

function closePopup(name = 'dPopup') { if (isdef(mBy(name))) mBy(name).remove(); }

function cmdDisable(key) { mClass(mBy(key), 'disabled') }

function cmdEnable(key) { mClassRemove(mBy(key), 'disabled') }

function codeParseBlock(lines, i) {
	let l = lines[i];
	let type = l[0] == 'a' ? ithWord(l, 1) : ithWord(l, 0);
	let key = l[0] == 'a' ? ithWord(l, 2, true) : ithWord(l, 1, true);
	let code = l + '\n'; i++; l = lines[i];
	while (i < lines.length && !(['var', 'const', 'cla', 'func', 'async'].some(x => l.startsWith(x)) && !l.startsWith('}'))) {
		if (!(l.trim().startsWith('//') || isEmptyOrWhiteSpace(l))) code += l + '\n';
		i++; l = lines[i];
	}
	code = replaceAllSpecialChars(code, '\t', '  ');
	code = code.trim();
	return [{ key: key, type: type, code: code }, i];
}
function codeParseBlocks(text) {
	let lines = text.split('\r\n');
	lines = lines.map(x => removeTrailingComments(x));
	let i = 0, o = null, res = [];
	while (i < lines.length) {
		let l = lines[i];
		if (['var', 'const', 'cla', 'func', 'async'].some(x => l.startsWith(x))) {
			[o, iLineAfterBlock] = codeParseBlock(lines, i);
			i = iLineAfterBlock;
			res.push(o)
		} else i++;
	}
	return res;
}
async function codeParseFile(path) {
	let text = await route_path_text(path);
	let olist = codeParseBlocks(text);
	return olist;
}
async function codebaseExtendFromProject(project) {
	let globlist = await codeParseFile('../basejs/allghuge.js');
	let funclist = await codeParseFile('../basejs/allfhuge.js');
	let list = globlist.concat(funclist);
	let bykey = list2dict(list, 'key');
	let bytype = {};
	for (const k in bykey) { let o = bykey[k]; lookupAddIfToList(bytype, [o.type], o); }
	let htmlFile = `../${project}/index.html`;
	let html = await route_path_text(htmlFile);
	html = removeCommentLines(html, '<!--', '-->');
	let dirhtml = `../${project}`;
	let files = extractFilesFromHtml(html, htmlFile);
	files = files.filter(x => !x.includes('../all'));
	console.log('files', files)
	let [globtext, functext, functextold] = await codebaseFromFiles(files, bykey, bytype, list);
	return [globtext, functext, functextold];
}
async function codebaseFromFiles(files, bykey, bytype, list) {
	let olist = [];
	for (const path of files) {
		let opath = await codeParseFile(path);
		olist = olist.concat(opath);
	}
	let mytype = {}, mykey = {};
	for (const o of olist) { mykey[o.key] = o; }
	for (const k in mykey) { let o = mykey[k]; lookupAddIfToList(mytype, [o.type], o); }
	let dupltext = '';
	for (const k in mykey) {
		let onew = mykey[k];
		let oold = bykey[k];
		if (isdef(oold) && onew.code == oold.code) {
			console.log('override w/ SAME code', k);
		} else if (isdef(oold)) {
			console.log('override w/ DIFFERENT code', k);
			oold.oldcode = oold.code;
			oold.code = onew.code;
			dupltext += oold.oldcode + '\n' + oold.code + '\n';
		} else {
			bykey[k] = onew;
			lookupAddIfToList(bytype, [onew.type], onew);
			list.push(onew);
		}
	}
	let globtext = '', functext = '', functextold = '';
	for (const type of ['const', 'var', 'class']) {
		if (nundef(bytype[type])) continue;
		for (const o of bytype[type]) { if (!isEmptyOrWhiteSpace(o.code)) globtext += o.code + '\n'; }
	}
	let sortedFuncKeys = sortCaseInsensitive(bytype.function.map(x => x.key)).filter(x => !['step', 'Number'].includes(x));
	sortedFuncKeys.map(x => functext += isEmptyOrWhiteSpace(bykey[x].code) ? '' : (bykey[x].code + '\n'));
	sortedFuncKeys.map(x => functextold += (isdef(bykey[x].oldcode) ? bykey[x].oldcode : bykey[x].code) + '\n');
	return [globtext, functext, functextold]
}
function coin(percent = 50) { return Math.random() * 100 < percent; }

function collFilterImages(coll, s) {
	let di = {};
	for (const k of coll.masterKeys) { di[k] = true; }
	let list = isEmpty(s) ? Object.keys(di) : isdef(M.byCat[s]) ? M.byCat[s].filter(x => isdef(di[x])) : [];
	if (nundef(list) || isEmpty(list)) {
		list = [];
		for (const k of coll.masterKeys) {
			let o = M.superdi[k];
			if (k.includes(s) || o.friendly.toLowerCase().includes(s)) list.push(k);
		}
	}
	return list;
}
function collectCats(klist) {
	let cats = [];
	for (const k of klist) {
		M.superdi[k].cats.map(x => addIf(cats, x));
	}
	return cats;
}
function collectOptions() {
	let poss = getGameConfig(DA.gamename).options;
	let options = DA.options = {};
	if (nundef(poss)) return options;
	for (const p in poss) {
		let fs = mBy(`d_${p}`);
		let val = getCheckedRadios(fs)[0];
		options[p] = isNumber(val) ? Number(val) : val;
	}
	return options;
}
function collectPlayers() {
	let players = {};
	for (const name of DA.playerList) { players[name] = allPlToPlayer(name); }
	return players;
}
function colorBlendMode(c1, c2, blendMode) {
	function colorBurn(base, blend) {
		return (blend === 0) ? 0 : Math.max(0, 255 - Math.floor((255 - base) / blend));
	}
	function blendColorBurn(baseColor, blendColor) {
		let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
		let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
		let resultR = colorBurn(baseR, blendR);
		let resultG = colorBurn(baseG, blendG);
		let resultB = colorBurn(baseB, blendB);
		return colorRgbArgsToHex79(resultR, resultG, resultB);
	}
	function blendColorDodge(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		const dodge = (a, b) => (b === 255) ? 255 : Math.min(255, ((a << 8) / (255 - b)));
		let r = dodge(r1, r2);
		let g = dodge(g1, g2);
		let b = dodge(b1, b2);
		return colorRgbArgsToHex79(r, g, b);
	}
	function blendColor(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		let [h1, s1, l1] = colorRgbArgsToHsl01Array(r1, g1, b1);
		let [h2, s2, l2] = colorRgbArgsToHsl01Array(r2, g2, b2);
		let cfinal = colorHsl01ArgsToRgbArray(h2, s1, l1);
		return colorRgbArgsToHex79(...cfinal);
	}
	function blendDarken(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		let r = Math.min(r1, r2);
		let g = Math.min(g1, g2);
		let b = Math.min(b1, b2);
		return colorRgbArgsToHex79(r, g, b);
	}
	function difference(a, b) {
		return Math.abs(a - b);
	}
	function blendDifference(baseColor, blendColor) {
		let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
		let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
		let resultR = difference(baseR, blendR);
		let resultG = difference(baseG, blendG);
		let resultB = difference(baseB, blendB);
		return colorRgbArgsToHex79(resultR, resultG, resultB);
	}
	function exclusion(a, b) {
		a /= 255;
		b /= 255;
		return (a + b - 2 * a * b) * 255;
	}
	function blendExclusion(baseColor, blendColor) {
		let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
		let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
		let resultR = Math.round(exclusion(baseR, blendR));
		let resultG = Math.round(exclusion(baseG, blendG));
		let resultB = Math.round(exclusion(baseB, blendB));
		return colorRgbArgsToHex79(resultR, resultG, resultB);
	}
	function hardLight(a, b) {
		a /= 255;
		b /= 255;
		return (b < 0.5) ? (2 * a * b) : (1 - 2 * (1 - a) * (1 - b));
	}
	function blendHardLight(baseColor, blendColor) {
		let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
		let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
		let resultR = Math.round(hardLight(baseR, blendR) * 255);
		let resultG = Math.round(hardLight(baseG, blendG) * 255);
		let resultB = Math.round(hardLight(baseB, blendB) * 255);
		return colorRgbArgsToHex79(resultR, resultG, resultB);
	}
	function blendHue(baseColor, blendColor) {
		let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
		let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
		let [baseH, baseS, baseL] = colorRgbArgsToHsl01Array(baseR, baseG, baseB);
		let [blendH, blendS, blendL] = colorRgbArgsToHsl01Array(blendR, blendG, blendB);
		let [resultR, resultG, resultB] = colorHsl01ArgsToRgbArray(blendH, baseS, baseL);
		return colorRgbArgsToHex79(resultR, resultG, resultB);
	}
	function blendLighten(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		let r = Math.max(r1, r2);
		let g = Math.max(g1, g2);
		let b = Math.max(b1, b2);
		return colorRgbArgsToHex79(r, g, b);
	}
	function blendLuminosity(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		let [h1, s1, l1] = colorRgbArgsToHsl01Array(r1, g1, b1);
		let [h2, s2, l2] = colorRgbArgsToHsl01Array(r2, g2, b2);
		let [r, g, b] = colorHsl01ArgsToRgbArray(h1, s1, l2);
		return colorRgbArgsToHex79(r, g, b);
	}
	function blendMultiply(color1, color2) {
		let [r1, g1, b1] = colorHexToRgbArray(color1);
		let [r2, g2, b2] = colorHexToRgbArray(color2);
		let r = (r1 * r2) / 255;
		let g = (g1 * g2) / 255;
		let b = (b1 * b2) / 255;
		return colorRgbArgsToHex79(Math.round(r), Math.round(g), Math.round(b));
	}
	function blendNormal(baseColor, blendColor) {
		return blendColor;
	}
	function blendOverlay(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		const overlayCalculate = (a, b) => (a <= 128) ? (2 * a * b / 255) : (255 - 2 * (255 - a) * (255 - b) / 255);
		let r = overlayCalculate(r1, r2);
		let g = overlayCalculate(g1, g2);
		let b = overlayCalculate(b1, b2);
		return colorRgbArgsToHex79(r, g, b);
	}
	function blendSaturation(baseColor, blendColor) {
		let [r1, g1, b1] = colorHexToRgbArray(baseColor);
		let [r2, g2, b2] = colorHexToRgbArray(blendColor);
		let [h1, s1, l1] = colorRgbArgsToHsl01Array(r1, g1, b1);
		let [h2, s2, l2] = colorRgbArgsToHsl01Array(r2, g2, b2);
		let cfinal = colorHsl01ArgsToRgbArray(h1, s2, l1);
		return colorRgbArgsToHex79(...cfinal);
	}
	function blendScreen(color1, color2) {
		let [r1, g1, b1] = colorHexToRgbArray(color1);
		let [r2, g2, b2] = colorHexToRgbArray(color2);
		let r = 255 - (((255 - r1) * (255 - r2)) / 255);
		let g = 255 - (((255 - g1) * (255 - g2)) / 255);
		let b = 255 - (((255 - b1) * (255 - b2)) / 255);
		return colorRgbArgsToHex79(r, g, b);
	}
	function softLight(a, b) {
		a /= 255;
		b /= 255;
		let result;
		if (a < 0.5) {
			result = (2 * a - 1) * (b - b * b) + b;
		} else {
			result = (2 * a - 1) * (Math.sqrt(b) - b) + b;
		}
		return Math.min(Math.max(result * 255, 0), 255);
	}
	function blendSoftLight(baseColor, blendColor) {
		let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
		let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
		let resultR = Math.round(softLight(baseR, blendR));
		let resultG = Math.round(softLight(baseG, blendG));
		let resultB = Math.round(softLight(baseB, blendB));
		return colorRgbArgsToHex79(resultR, resultG, resultB);
	}
	let di = {
		darken: blendDarken, lighten: blendLighten, color: blendColor, colorBurn: blendColorBurn, colorDodge: blendColorDodge,
		difference: blendDifference, exclusion: blendExclusion, hardLight: blendHardLight, hue: blendHue,
		luminosity: blendLuminosity, multiply: blendMultiply, normal: blendNormal, overlay: blendOverlay,
		saturation: blendSaturation, screen: blendScreen, softLight: blendSoftLight
	};
	if (blendMode.includes('-')) blendMode = stringCSSToCamelCase(blendMode);
	let func = di[blendMode]; if (nundef(di)) { console.log('blendMode', blendMode); return c1; }
	c1hex = colorFrom(c1);
	c2hex = colorFrom(c2);
	let res = func(c1hex, c2hex);
	return res;
}
function colorCalculator(p, c0, c1, l) {
	function pSBCr(d) {
		let i = parseInt, m = Math.round, a = typeof c1 == 'string';
		let n = d.length,
			x = {};
		if (n > 9) {
			([r, g, b, a] = d = d.split(',')), (n = d.length);
			if (n < 3 || n > 4) return null;
			(x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
		} else {
			if (n == 8 || n == 6 || n < 4) return null;
			if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
			d = parseInt(d.slice(1), 16);
			if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
			else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
		}
		return x;
	}
	let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	h = c0.length > 9;
	h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
	f = pSBCr(c0);
	P = p < 0;
	t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
	p = P ? p * -1 : p;
	P = 1 - p;
	if (!f || !t) return null;
	if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
	else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
	a = f.a;
	t = t.a;
	f = a >= 0 || t >= 0;
	a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function colorComplement(color) {
	let [r, g, b] = colorHexToRgbArray(colorFrom(color));
	let compR = 255 - r;
	let compG = 255 - g;
	let compB = 255 - b;
	return colorRgbArgsToHex79(compR, compG, compB);
}
function colorContrastFromElem(elem, list = ['white', 'black']) {
	let bg = mGetStyle(elem, 'bg');
	return colorContrastPickFromList(bg, list);
}
function colorContrastPickFromList(color, colorlist = ['white', 'black']) {
	let contrast = 0;
	let result = null;
	let rgb = colorHexToRgbArray(colorFrom(color));
	for (c1 of colorlist) {
		let x = colorHexToRgbArray(colorFrom(c1));
		let c = colorGetContrast(rgb, x);
		if (c > contrast) { contrast = c; result = c1; }
	}
	return result;
}
function colorDark(c, percent = 50, log = true) {
	if (nundef(c)) c = rColor(); else c = colorFrom(c);
	let zero1 = -percent / 100;
	return colorCalculator(zero1, c, undefined, !log);
}
function colorDistance(color1, color2) {
	let [r1, g1, b1] = colorHexToRgbArray(colorFrom(color1));
	let [r2, g2, b2] = colorHexToRgbArray(colorFrom(color2));
	let distance = Math.sqrt(
		Math.pow(r2 - r1, 2) +
		Math.pow(g2 - g1, 2) +
		Math.pow(b2 - b1, 2)
	);
	return Number(distance.toFixed(2));
}
function colorDistanceHSL(color1, color2) {
	let hsl1 = hexToHSL(color1);
	let hsl2 = hexToHSL(color2);
	let hueDiff = Math.abs(hsl1.h - hsl2.h);
	let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
	let lightnessDistance = Math.abs(hsl1.l - hsl2.l) / 100;
	let distance = hueDistance + 0.5 * lightnessDistance;
	return distance;
}
function colorDistanceHue(color1, color2) {
	let c1 = colorO(color1);
	let c2 = colorO(color2);
	let hueDiff = Math.abs(c1.hue - c2.hue);
	let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
	let num = (hueDistance * 100).toFixed(2);
	return Number(num);
}
function colorDistanceHueLum(color1, color2) {
	let c1 = colorO(color1);
	let c2 = colorO(color2);
	let hueDiff = Math.abs(c1.hue - c2.hue);
	let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
	let lightnessDistance = Math.abs(c1.lightness - c2.lightness);
	let distance = hueDistance + lightnessDistance;
	return Number((distance * 100).toFixed(2));
}
function colorFarestNamed(inputColor, namedColors) {
	let maxDistance = 0;
	let nearestColor = null;
	namedColors.forEach(namedColor => {
		let distance = colorDistance(inputColor, namedColor.hex);
		if (distance > maxDistance) {
			maxDistance = distance;
			nearestColor = namedColor;
		}
	});
	return nearestColor;
}
function colorFrom(c, a) {
	c = colorToHex79(c);
	if (nundef(a)) return c;
	return c.substring(0, 7) + (a < 1 ? alphaToHex(a) : '');
}
function colorFromHsl(h, s = 100, l = 50) { return colorFrom({ h, s, l }); }

function colorFromHslNamed(h, s = 100, l = 50) { let x = colorFrom({ h, s, l }); return colorNearestNamed(x); }

function colorFromHue(h, s = 100, l = 50) { return colorFrom({ h, s, l }); }

function colorFromHueNamed(h, s = 100, l = 50) { return colorFromHslNamed(h, s, l); }

function colorFromHwb(h, wPercent, bPercent) {
	let [r, g, b] = colorHwb360ToRgbArray(h, wPercent, bPercent);
	return colorRgbArgsToHex79(r, g, b);
}
function colorFromNat(ncol, wPercent, bPercent) {
	return colorFromNcol(ncol, wPercent, bPercent);
}
function colorFromNcol(ncol, wPercent, bPercent) {
	let h = colorNcolToHue(ncol); console.log('hue', h);
	return colorFromHwb(h, wPercent, bPercent);
}
function colorFromRgb(r, g, b) { return colorFrom({ r, g, b }); }

function colorFromRgbNamed(r, g, b) { let x = colorFrom({ r, g, b }); return colorNearestNamed(x); }

function colorGetBlack(c) { return colorToHwb360Object(c).b; }

function colorGetBucket(c) {
	let buckets = 'red orange yellow lime green greencyan cyan cyanblue blue bluemagenta magenta magentared black'.split(' ');
	c = colorFrom(c);
	let hsl = colorHexToHsl360Object(c);
	let hue = hsl.h;
	let hshift = (hue + 16) % 360;
	let ib = Math.floor(hshift / 30);
	return buckets[ib];
}
function colorGetContrast(c1, c2) {
	function luminance(r, g, b) {
		var a = [r, g, b].map(function (v) {
			v /= 255;
			return v <= 0.03928
				? v / 12.92
				: Math.pow((v + 0.055) / 1.055, 2.4);
		});
		return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}
	let rgb1 = colorHexToRgbArray(colorFrom(c1));
	let rgb2 = colorHexToRgbArray(colorFrom(c2));
	var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	let res = (brightest + 0.05) / (darkest + 0.05);
	return Number(res.toFixed(3));
}
function colorGetDicolorList() {
	let di = M.dicolor;
	let list = [];
	for (const k in di) {
		let bucket = di[k];
		for (const name in bucket) {
			let o = { name, bucket: k, hex: bucket[name] };
			list.push(o);
		}
	}
	return list;
}
function colorGetHue(c) { return colorGetHue01(c) * 360; }

function colorGetHue01(c) {
	let hex = colorFrom(c);
	let hsl = colorHexToHsl01Array(hex);
	return hsl[0];
}
function colorGetLum(c) { return colorGetLum01(c) * 100; }

function colorGetLum01(c) {
	let hex = colorFrom(c);
	let hsl = colorHexToHsl01Array(hex);
	return hsl[2];
}
function colorGetPureHue(c) { c = colorO(c); return c.hue == 0 ? c.hex : colorFromHsl(c.hue, 100, 50); }

function colorGetSat(c) { return colorGetSat01(c) * 100; }

function colorGetSat01(c) {
	let hex = colorFrom(c);
	let hsl = colorHexToHsl01Array(hex);
	return hsl[1];
}
function colorGetWhite(c) { return colorToHwb360Object(c).w; }

function colorHex45ToHex79(c) {
	let r = c[1];
	let g = c[2];
	let b = c[3];
	if (c.length == 5) return `#${r}${r}${g}${g}${b}${b}${c[4]}${c[4]}`;
	return `#${r}${r}${g}${g}${b}${b}`;
}
function colorHex79ToRgbArray(c) {
	let r = 0, g = 0, b = 0;
	r = parseInt(c[1] + c[2], 16);
	g = parseInt(c[3] + c[4], 16);
	b = parseInt(c[5] + c[6], 16);
	if (c.length == 7) return [r, g, b];
	let a = parseInt(c[7] + c[8], 16) / 255;
	return [r, g, b, a];
}
function colorHexToHsl01Array(c) { return colorRgbArgsToHsl01Array(...colorHexToRgbArray(c)); }

function colorHexToHsl360Object(c) {
	let arr = colorHexToHsl01Array(c);
	return colorHsl01ArrayToHsl360Object(arr);
}
function colorHexToHsl360String(c) {
	let arr = colorHexToHsl01Array(c);
	let o = colorHsl01ArrayToHsl360Object(arr);
	if (nundef(o.a)) return `hsl(${o.h},${o.s}%,${o.l}%)`;
	return `hsla(${o.h},${o.s}%,${o.l}%,${o.a})`;
}
function colorHexToHslRounded(c) {
	let arr = colorHexToHsl01Array(c);
	let o = colorHsl01ArrayToHsl360Object(arr);
	return { h: Math.round(o.h), s: Math.round(o.s), l: Math.round(o.l) };
}
function colorHexToRgbArray(c) {
	if (c.length < 7) c = colorHex45ToHex79(c);
	return colorHex79ToRgbArray(c);
}
function colorHexToRgbObject(c) {
	let arr = colorHexToRgbArray(c);
	let o = { r: arr[0], g: arr[1], b: arr[2] };
	if (arr.length > 3) o.a = arr[3];
	return o;
}
function colorHexToRgbString(hex) {
	let o = colorHexToRgbObject(hex);
	if (nundef(o.a)) return `rgb(${o.r},${o.g},${o.b})`;
	return `rgba(${o.r},${o.g},${o.b},${o.a})`;
}
function colorHsl01ArgsToHex79(h, s, l, a) {
	let rgb = colorHsl01ArgsToRgbArray(h, s, l, a);
	let res = colorRgbArgsToHex79(rgb[0], rgb[1], rgb[2], rgb.length > 3 ? rgb[3] : null);
	return res;
}
function colorHsl01ArgsToRgbArray(h, s, l, a) {
	let r, g, b;
	function hue2rgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
	if (s === 0) {
		r = g = b = l;
	} else {
		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	let res = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	if (nundef(a) || a == 1) return res;
	res.push(a);
	return res;
}
function colorHsl01ArrayToHsl360Object(arr) {
	let res = { h: arr[0] * 360, s: arr[1] * 100, l: arr[2] * 100 };
	if (arr.length > 3) res.a = arr[3];
	return res;
}
function colorHsl01ObjectToHex79(c) {
	if (isdef(c.a)) return colorHsl01ArgsToHex79(c.h, c.s, c.l, c.a);
	return colorHsl01ArgsToHex79(c.h, c.s, c.l);
}
function colorHsl360ArgsToHex79(h, s, l, a) {
	let o01 = colorHsl360ArgsToHsl01Object(h, s, l, a);
	return colorHsl01ArgsToHex79(o01.h, o01.s, o01.l, o01.a)
}
function colorHsl360ArgsToHsl01Object(h, s, l, a) {
	let res = { h: h / 360, s: s / 100, l: l / 100 };
	if (isdef(a)) res.a = a;
	return res;
}
function colorHsl360ObjectToHex79(c) {
	let o01 = colorHsl360ArgsToHsl01Object(c.h, c.s, c.l, c.a);
	return colorHsl01ObjectToHex79(o01)
}
function colorHsl360StringToHex79(c) {
	let o360 = colorHsl360StringToHsl360Object(c);
	let o01 = colorHsl360ArgsToHsl01Object(o360.h, o360.s, o360.l, o360.a);
	return colorHsl01ObjectToHex79(o01);
}
function colorHsl360StringToHsl360Object(c) {
	let [h, s, l, a] = c.match(/\d+\.?\d*/g).map(Number);
	if (isdef(a) && a > 1) a /= 10;
	return { h, s, l, a };
}
function colorHueToNat(hue) {
	let x = Math.floor(hue / 60);
	let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
	let color = pure[x];
	let inc = hue % 60;
	return color.toUpperCase()[0] + inc;
}
function colorHueToNcol(hue) {
	let x = Math.floor(hue / 60);
	let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
	let color = pure[x];
	let inc = (hue % 60) / 0.6;
	return color.toUpperCase()[0] + toPercent(hue % 60, 60);
}
function colorHwb360ToRgbArray(h, w, b) {
	let [r, g, blue] = colorHsl01ArgsToRgbArray(h / 360, 1, 0.5);
	let whiteness = w / 100;
	let blackness = b / 100;
	r = Math.round((r / 255 * (1 - whiteness - blackness) + whiteness) * 255);
	g = Math.round((g / 255 * (1 - whiteness - blackness) + whiteness) * 255);
	b = Math.round((blue / 255 * (1 - whiteness - blackness) + whiteness) * 255);
	return [r, g, b];
}
function colorIdealText(bg, grayPreferred = false, nThreshold = 105) {
	let rgb = colorHexToRgbObject(colorFrom(bg));
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
}
function colorIsGrey(c, tolerance = 5) {
	let { r, g, b } = colorHexToRgbObject(colorFrom(c));
	return Math.abs(r - g) <= tolerance && Math.abs(r - b) <= tolerance && Math.abs(g - b) <= tolerance;
}
function colorIsHex79(c) { return isString(c) && c[0] == '#' && (c.length == 7 || c.length == 9); }

function colorLight(c, percent = 20, log = true) {
	if (nundef(c)) {
		return colorHsl360ArgsToHex79(rHue(), 100, 85);
	} else c = colorFrom(c);
	let zero1 = percent / 100;
	return colorCalculator(zero1, c, undefined, !log);
}
function colorNatToHue(ncol) {
	let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'].map(x => x.toUpperCase()[0]);
	let [letter, num] = [ncol[0], Number(ncol.substring(1))];
	let idx = pure.indexOf(letter);
	let hue = idx * 60 + num;
	return hue;
}
function colorNcolToHue(ncol) {
	let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'].map(x => x.toUpperCase()[0]);
	let [letter, num] = [ncol[0], Number(ncol.substring(1))];
	let idx = pure.indexOf(letter);
	let hue = idx * 60 + fromPercent(num, 60);
	return hue;
}
function colorNearestNamed(inputColor, namedColors) {
	if (nundef(namedColors)) namedColors = M.colorList;
	let minDistance = Infinity;
	let nearestColor = null;
	namedColors.forEach(namedColor => {
		let distance = colorDistance(inputColor, namedColor.hex);
		if (distance < minDistance) {
			minDistance = distance;
			nearestColor = namedColor;
		}
	});
	return nearestColor;
}
function colorO(c) {
	if (isDict(c)) return c;
	let hex = colorFrom(c);
	let o = w3color(hex);
	let named = colorNearestNamed(hex);
	let distance = Math.round(colorDistance(named.hex, hex));
	o.name = named.name;
	o.distance = distance;
	o.bucket = colorGetBucket(hex);
	o.hex = hex;
	return o;
}
function colorPalette(color, type = 'shade') { return colorShades(colorFrom(color)); }

function colorPaletteFromImage(img) {
	if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
	return ColorThiefObject.getPalette(img).map(x => colorFrom(x));
}
function colorPaletteFromUrl(path) {
	let img = mCreateFrom(`<img src='${path}' />`);
	let pal = colorPaletteFromImage(img);
	return pal;
}
function colorRgbArgsToHex79(r, g, b, a) {
	r = Math.round(r).toString(16).padStart(2, '0');
	g = Math.round(g).toString(16).padStart(2, '0');
	b = Math.round(b).toString(16).padStart(2, '0');
	if (nundef(a)) return `#${r}${g}${b}`;
	a = Math.round(a * 255).toString(16).padStart(2, '0');
	return `#${r}${g}${b}${a}`;
}
function colorRgbArgsToHsl01Array(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	let max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;
	if (max === min) {
		h = s = 0;
	} else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return [h, s, l];
}
function colorRgbArrayToHex79(arr) { return colorRgbArgsToHex79(...arr); }

function colorRgbStringToHex79(c) {
	let parts = c.split(',');
	let r = firstNumber(parts[0]);
	let g = firstNumber(parts[1]);
	let b = firstNumber(parts[2]);
	let a = parts.length > 3 ? Number(stringBefore(parts[3], ')')) : null;
	return colorRgbArgsToHex79(r, g, b, a);
}
function colorSample(d, color) {
	if (nundef(d)) return;
	mStyle(d, { bg: color, fg: colorIdealText(color) }); //, fg:colorIdealText(color) });  
	d.innerHTML = `${color}<br>${w3color(color).toHslString()}`;
}
function colorSchemeRYB() {
	let ryb = ['#FE2712', '#FC600A', '#FB9902', '#FCCC1A', '#FEFE33', '#B2D732', '#66B032', '#347C98', '#0247FE', '#4424D6', '#8601AF', '#C21460'];
	return ryb;
	console.log('w3color', w3color('deeppink'))
	for (const c of ryb) {
		let cw = w3color(c);
		console.log(cw.hue, cw.sat, cw.lightness, cw.ncol);
	}
}
function colorShades(color) {
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		let c = colorCalculator(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function colorSortByLightness(list) {
	let ext = list.map(x => colorO(x));
	let sorted = sortByDescending(ext, 'lightness').map(x => x.hex);
	return sorted;
}
function colorToHex79(c) {
	if (colorIsHex79(c)) return c;
	ColorDi = M.colorByName;
	let tString = isString(c), tArr = isList(c), tObj = isDict(c);
	if (tString && c[0] == '#') return colorHex45ToHex79(c);
	else if (tString && isdef(ColorDi) && lookup(ColorDi, [c])) return ColorDi[c].hex;
	else if (tString && c.startsWith('rand')) {
		let spec = capitalize(c.substring(4));
		let func = window['color' + spec];
		c = isdef(func) ? func() : rColor();
		assertion(colorIsHex79(c), 'ERROR coloFrom!!!!!!!!! (rand)');
		return c;
	} else if (tString && (c.startsWith('linear') || c.startsWith('radial'))) return c;
	else if (tString && c.startsWith('rgb')) return colorRgbStringToHex79(c);
	else if (tString && c.startsWith('hsl')) return colorHsl360StringToHex79(c);
	else if (tString && c == 'transparent') return '#00000000';
	else if (tString) { ensureColorDict(); let c1 = ColorDi[c]; assertion(isdef(c1), `UNKNOWN color ${c}`); return c1.hex; }
	else if (tArr && (c.length == 3 || c.length == 4) && isNumber(c[0])) return colorRgbArrayToHex79(c);
	else if (tArr) return colorToHex79(rChoose(tArr));
	else if (tObj && 'h' in c && c.h > 1) { return colorHsl360ObjectToHex79(c); } //console.log('!!!');
	else if (tObj && 'h' in c) return colorHsl01ObjectToHex79(c);
	else if (tObj && 'r' in c) return colorRgbArgsToHex79(c.r, c.g, c.b, c.a);
	assertion(false, `NO COLOR FOUND FOR ${c}`);
}
function colorToHwb360Object(c) {
	c = colorFrom(c);
	let [r, g, blue] = colorHexToRgbArray(c);
	let [h, s, l] = colorHexToHsl01Array(c); h *= 360;
	let w = 100 * Math.min(r, g, blue) / 255;
	let b = 100 * (1 - Math.max(r, g, blue) / 255);
	return { h, w, b };
}
function colorToHwbRounded(c) {
	let o = colorToHwb360Object(c);
	return { h: Math.round(o.h), w: Math.round(o.w), b: Math.round(o.b) };
}
function colorTrans(cAny, alpha = 0.5) { return colorFrom(cAny, alpha); }

function colorTurnHueBy(color, inc = 180) {
	let [r, g, b] = colorHexToRgbArray(colorFrom(color));
	let [h, s, l] = colorRgbArgsToHsl01Array(r, g, b); h *= 360;
	h = (h + inc) % 360;
	let [newR, newG, newB] = colorHsl01ArgsToRgbArray(h / 360, s, l);
	return colorRgbArgsToHex79(newR, newG, newB);
}
function colormapAsString() {
	let html = `
    <area style='cursor:pointer' shape='poly' coords='63,0,72,4,72,15,63,19,54,15,54,4' onclick='clickColor("#003366",-200,54)' onmouseover='mouseOverColor("#003366")' alt='#003366' />
    <area style='cursor:pointer' shape='poly' coords='81,0,90,4,90,15,81,19,72,15,72,4' onclick='clickColor("#336699",-200,72)' onmouseover='mouseOverColor("#336699")' alt='#336699' />
    <area style='cursor:pointer' shape='poly' coords='99,0,108,4,108,15,99,19,90,15,90,4' onclick='clickColor("#3366CC",-200,90)' onmouseover='mouseOverColor("#3366CC")' alt='#3366CC' />
    <area style='cursor:pointer' shape='poly' coords='117,0,126,4,126,15,117,19,108,15,108,4' onclick='clickColor("#003399",-200,108)' onmouseover='mouseOverColor("#003399")' alt='#003399' />
    <area style='cursor:pointer' shape='poly' coords='135,0,144,4,144,15,135,19,126,15,126,4' onclick='clickColor("#000099",-200,126)' onmouseover='mouseOverColor("#000099")' alt='#000099' />
    <area style='cursor:pointer' shape='poly' coords='153,0,162,4,162,15,153,19,144,15,144,4' onclick='clickColor("#0000CC",-200,144)' onmouseover='mouseOverColor("#0000CC")' alt='#0000CC' />
    <area style='cursor:pointer' shape='poly' coords='171,0,180,4,180,15,171,19,162,15,162,4' onclick='clickColor("#000066",-200,162)' onmouseover='mouseOverColor("#000066")' alt='#000066' />
    <area style='cursor:pointer' shape='poly' coords='54,15,63,19,63,30,54,34,45,30,45,19' onclick='clickColor("#006666",-185,45)' onmouseover='mouseOverColor("#006666")' alt='#006666' />
    <area style='cursor:pointer' shape='poly' coords='72,15,81,19,81,30,72,34,63,30,63,19' onclick='clickColor("#006699",-185,63)' onmouseover='mouseOverColor("#006699")' alt='#006699' />
    <area style='cursor:pointer' shape='poly' coords='90,15,99,19,99,30,90,34,81,30,81,19' onclick='clickColor("#0099CC",-185,81)' onmouseover='mouseOverColor("#0099CC")' alt='#0099CC' />
    <area style='cursor:pointer' shape='poly' coords='108,15,117,19,117,30,108,34,99,30,99,19' onclick='clickColor("#0066CC",-185,99)' onmouseover='mouseOverColor("#0066CC")' alt='#0066CC' />
    <area style='cursor:pointer' shape='poly' coords='126,15,135,19,135,30,126,34,117,30,117,19' onclick='clickColor("#0033CC",-185,117)' onmouseover='mouseOverColor("#0033CC")' alt='#0033CC' />
    <area style='cursor:pointer' shape='poly' coords='144,15,153,19,153,30,144,34,135,30,135,19' onclick='clickColor("#0000FF",-185,135)' onmouseover='mouseOverColor("#0000FF")' alt='#0000FF' />
    <area style='cursor:pointer' shape='poly' coords='162,15,171,19,171,30,162,34,153,30,153,19' onclick='clickColor("#3333FF",-185,153)' onmouseover='mouseOverColor("#3333FF")' alt='#3333FF' />
    <area style='cursor:pointer' shape='poly' coords='180,15,189,19,189,30,180,34,171,30,171,19' onclick='clickColor("#333399",-185,171)' onmouseover='mouseOverColor("#333399")' alt='#333399' />
    <area style='cursor:pointer' shape='poly' coords='45,30,54,34,54,45,45,49,36,45,36,34' onclick='clickColor("#669999",-170,36)' onmouseover='mouseOverColor("#669999")' alt='#669999' />
    <area style='cursor:pointer' shape='poly' coords='63,30,72,34,72,45,63,49,54,45,54,34' onclick='clickColor("#009999",-170,54)' onmouseover='mouseOverColor("#009999")' alt='#009999' />
    <area style='cursor:pointer' shape='poly' coords='81,30,90,34,90,45,81,49,72,45,72,34' onclick='clickColor("#33CCCC",-170,72)' onmouseover='mouseOverColor("#33CCCC")' alt='#33CCCC' />
    <area style='cursor:pointer' shape='poly' coords='99,30,108,34,108,45,99,49,90,45,90,34' onclick='clickColor("#00CCFF",-170,90)' onmouseover='mouseOverColor("#00CCFF")' alt='#00CCFF' />
    <area style='cursor:pointer' shape='poly' coords='117,30,126,34,126,45,117,49,108,45,108,34' onclick='clickColor("#0099FF",-170,108)' onmouseover='mouseOverColor("#0099FF")' alt='#0099FF' />
    <area style='cursor:pointer' shape='poly' coords='135,30,144,34,144,45,135,49,126,45,126,34' onclick='clickColor("#0066FF",-170,126)' onmouseover='mouseOverColor("#0066FF")' alt='#0066FF' />
    <area style='cursor:pointer' shape='poly' coords='153,30,162,34,162,45,153,49,144,45,144,34' onclick='clickColor("#3366FF",-170,144)' onmouseover='mouseOverColor("#3366FF")' alt='#3366FF' />
    <area style='cursor:pointer' shape='poly' coords='171,30,180,34,180,45,171,49,162,45,162,34' onclick='clickColor("#3333CC",-170,162)' onmouseover='mouseOverColor("#3333CC")' alt='#3333CC' />
    <area style='cursor:pointer' shape='poly' coords='189,30,198,34,198,45,189,49,180,45,180,34' onclick='clickColor("#666699",-170,180)' onmouseover='mouseOverColor("#666699")' alt='#666699' />
    <area style='cursor:pointer' shape='poly' coords='36,45,45,49,45,60,36,64,27,60,27,49' onclick='clickColor("#339966",-155,27)' onmouseover='mouseOverColor("#339966")' alt='#339966' />
    <area style='cursor:pointer' shape='poly' coords='54,45,63,49,63,60,54,64,45,60,45,49' onclick='clickColor("#00CC99",-155,45)' onmouseover='mouseOverColor("#00CC99")' alt='#00CC99' />
    <area style='cursor:pointer' shape='poly' coords='72,45,81,49,81,60,72,64,63,60,63,49' onclick='clickColor("#00FFCC",-155,63)' onmouseover='mouseOverColor("#00FFCC")' alt='#00FFCC' />
    <area style='cursor:pointer' shape='poly' coords='90,45,99,49,99,60,90,64,81,60,81,49' onclick='clickColor("#00FFFF",-155,81)' onmouseover='mouseOverColor("#00FFFF")' alt='#00FFFF' />
    <area style='cursor:pointer' shape='poly' coords='108,45,117,49,117,60,108,64,99,60,99,49' onclick='clickColor("#33CCFF",-155,99)' onmouseover='mouseOverColor("#33CCFF")' alt='#33CCFF' />
    <area style='cursor:pointer' shape='poly' coords='126,45,135,49,135,60,126,64,117,60,117,49' onclick='clickColor("#3399FF",-155,117)' onmouseover='mouseOverColor("#3399FF")' alt='#3399FF' />
    <area style='cursor:pointer' shape='poly' coords='144,45,153,49,153,60,144,64,135,60,135,49' onclick='clickColor("#6699FF",-155,135)' onmouseover='mouseOverColor("#6699FF")' alt='#6699FF' />
    <area style='cursor:pointer' shape='poly' coords='162,45,171,49,171,60,162,64,153,60,153,49' onclick='clickColor("#6666FF",-155,153)' onmouseover='mouseOverColor("#6666FF")' alt='#6666FF' />
    <area style='cursor:pointer' shape='poly' coords='180,45,189,49,189,60,180,64,171,60,171,49' onclick='clickColor("#6600FF",-155,171)' onmouseover='mouseOverColor("#6600FF")' alt='#6600FF' />
    <area style='cursor:pointer' shape='poly' coords='198,45,207,49,207,60,198,64,189,60,189,49' onclick='clickColor("#6600CC",-155,189)' onmouseover='mouseOverColor("#6600CC")' alt='#6600CC' />
    <area style='cursor:pointer' shape='poly' coords='27,60,36,64,36,75,27,79,18,75,18,64' onclick='clickColor("#339933",-140,18)' onmouseover='mouseOverColor("#339933")' alt='#339933' />
    <area style='cursor:pointer' shape='poly' coords='45,60,54,64,54,75,45,79,36,75,36,64' onclick='clickColor("#00CC66",-140,36)' onmouseover='mouseOverColor("#00CC66")' alt='#00CC66' />
    <area style='cursor:pointer' shape='poly' coords='63,60,72,64,72,75,63,79,54,75,54,64' onclick='clickColor("#00FF99",-140,54)' onmouseover='mouseOverColor("#00FF99")' alt='#00FF99' />
    <area style='cursor:pointer' shape='poly' coords='81,60,90,64,90,75,81,79,72,75,72,64' onclick='clickColor("#66FFCC",-140,72)' onmouseover='mouseOverColor("#66FFCC")' alt='#66FFCC' />
    <area style='cursor:pointer' shape='poly' coords='99,60,108,64,108,75,99,79,90,75,90,64' onclick='clickColor("#66FFFF",-140,90)' onmouseover='mouseOverColor("#66FFFF")' alt='#66FFFF' />
    <area style='cursor:pointer' shape='poly' coords='117,60,126,64,126,75,117,79,108,75,108,64' onclick='clickColor("#66CCFF",-140,108)' onmouseover='mouseOverColor("#66CCFF")' alt='#66CCFF' />
    <area style='cursor:pointer' shape='poly' coords='135,60,144,64,144,75,135,79,126,75,126,64' onclick='clickColor("#99CCFF",-140,126)' onmouseover='mouseOverColor("#99CCFF")' alt='#99CCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,60,162,64,162,75,153,79,144,75,144,64' onclick='clickColor("#9999FF",-140,144)' onmouseover='mouseOverColor("#9999FF")' alt='#9999FF' />
    <area style='cursor:pointer' shape='poly' coords='171,60,180,64,180,75,171,79,162,75,162,64' onclick='clickColor("#9966FF",-140,162)' onmouseover='mouseOverColor("#9966FF")' alt='#9966FF' />
    <area style='cursor:pointer' shape='poly' coords='189,60,198,64,198,75,189,79,180,75,180,64' onclick='clickColor("#9933FF",-140,180)' onmouseover='mouseOverColor("#9933FF")' alt='#9933FF' />
    <area style='cursor:pointer' shape='poly' coords='207,60,216,64,216,75,207,79,198,75,198,64' onclick='clickColor("#9900FF",-140,198)' onmouseover='mouseOverColor("#9900FF")' alt='#9900FF' />
    <area style='cursor:pointer' shape='poly' coords='18,75,27,79,27,90,18,94,9,90,9,79' onclick='clickColor("#006600",-125,9)' onmouseover='mouseOverColor("#006600")' alt='#006600' />
    <area style='cursor:pointer' shape='poly' coords='36,75,45,79,45,90,36,94,27,90,27,79' onclick='clickColor("#00CC00",-125,27)' onmouseover='mouseOverColor("#00CC00")' alt='#00CC00' />
    <area style='cursor:pointer' shape='poly' coords='54,75,63,79,63,90,54,94,45,90,45,79' onclick='clickColor("#00FF00",-125,45)' onmouseover='mouseOverColor("#00FF00")' alt='#00FF00' />
    <area style='cursor:pointer' shape='poly' coords='72,75,81,79,81,90,72,94,63,90,63,79' onclick='clickColor("#66FF99",-125,63)' onmouseover='mouseOverColor("#66FF99")' alt='#66FF99' />
    <area style='cursor:pointer' shape='poly' coords='90,75,99,79,99,90,90,94,81,90,81,79' onclick='clickColor("#99FFCC",-125,81)' onmouseover='mouseOverColor("#99FFCC")' alt='#99FFCC' />
    <area style='cursor:pointer' shape='poly' coords='108,75,117,79,117,90,108,94,99,90,99,79' onclick='clickColor("#CCFFFF",-125,99)' onmouseover='mouseOverColor("#CCFFFF")' alt='#CCFFFF' />
    <area style='cursor:pointer' shape='poly' coords='126,75,135,79,135,90,126,94,117,90,117,79' onclick='clickColor("#CCCCFF",-125,117)' onmouseover='mouseOverColor("#CCCCFF")' alt='#CCCCFF' />
    <area style='cursor:pointer' shape='poly' coords='144,75,153,79,153,90,144,94,135,90,135,79' onclick='clickColor("#CC99FF",-125,135)' onmouseover='mouseOverColor("#CC99FF")' alt='#CC99FF' />
    <area style='cursor:pointer' shape='poly' coords='162,75,171,79,171,90,162,94,153,90,153,79' onclick='clickColor("#CC66FF",-125,153)' onmouseover='mouseOverColor("#CC66FF")' alt='#CC66FF' />
    <area style='cursor:pointer' shape='poly' coords='180,75,189,79,189,90,180,94,171,90,171,79' onclick='clickColor("#CC33FF",-125,171)' onmouseover='mouseOverColor("#CC33FF")' alt='#CC33FF' />
    <area style='cursor:pointer' shape='poly' coords='198,75,207,79,207,90,198,94,189,90,189,79' onclick='clickColor("#CC00FF",-125,189)' onmouseover='mouseOverColor("#CC00FF")' alt='#CC00FF' />
    <area style='cursor:pointer' shape='poly' coords='216,75,225,79,225,90,216,94,207,90,207,79' onclick='clickColor("#9900CC",-125,207)' onmouseover='mouseOverColor("#9900CC")' alt='#9900CC' />
    <area style='cursor:pointer' shape='poly' coords='9,90,18,94,18,105,9,109,0,105,0,94' onclick='clickColor("#003300",-110,0)' onmouseover='mouseOverColor("#003300")' alt='#003300' />
    <area style='cursor:pointer' shape='poly' coords='27,90,36,94,36,105,27,109,18,105,18,94' onclick='clickColor("#009933",-110,18)' onmouseover='mouseOverColor("#009933")' alt='#009933' />
    <area style='cursor:pointer' shape='poly' coords='45,90,54,94,54,105,45,109,36,105,36,94' onclick='clickColor("#33CC33",-110,36)' onmouseover='mouseOverColor("#33CC33")' alt='#33CC33' />
    <area style='cursor:pointer' shape='poly' coords='63,90,72,94,72,105,63,109,54,105,54,94' onclick='clickColor("#66FF66",-110,54)' onmouseover='mouseOverColor("#66FF66")' alt='#66FF66' />
    <area style='cursor:pointer' shape='poly' coords='81,90,90,94,90,105,81,109,72,105,72,94' onclick='clickColor("#99FF99",-110,72)' onmouseover='mouseOverColor("#99FF99")' alt='#99FF99' />
    <area style='cursor:pointer' shape='poly' coords='99,90,108,94,108,105,99,109,90,105,90,94' onclick='clickColor("#CCFFCC",-110,90)' onmouseover='mouseOverColor("#CCFFCC")' alt='#CCFFCC' />
    <area style='cursor:pointer' shape='poly' coords='117,90,126,94,126,105,117,109,108,105,108,94' onclick='clickColor("#FFFFFF",-110,108)' onmouseover='mouseOverColor("#FFFFFF")' alt='#FFFFFF' />
    <area style='cursor:pointer' shape='poly' coords='135,90,144,94,144,105,135,109,126,105,126,94' onclick='clickColor("#FFCCEE",-110,126)' onmouseover='mouseOverColor("#FFCCEE")' alt='#FFCCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,90,162,94,162,105,153,109,144,105,144,94' onclick='clickColor("#FFAAEE",-110,144)' onmouseover='mouseOverColor("#FFAAEE")' alt='#FF33DD' />
    <area style='cursor:pointer' shape='poly' coords='171,90,180,94,180,105,171,109,162,105,162,94' onclick='clickColor("#FF88EE",-110,162)' onmouseover='mouseOverColor("#FF88EE")' alt='#FF66FF' />
    <area style='cursor:pointer' shape='poly' coords='189,90,198,94,198,105,189,109,180,105,180,94' onclick='clickColor("#FF14EE",-110,180)' onmouseover='mouseOverColor("#FF14EE")' alt='#FF00FF' />
    <area style='cursor:pointer' shape='poly' coords='207,90,216,94,216,105,207,109,198,105,198,94' onclick='clickColor("#CC00CC",-110,198)' onmouseover='mouseOverColor("#CC00CC")' alt='#CC00CC' />
    <area style='cursor:pointer' shape='poly' coords='225,90,234,94,234,105,225,109,216,105,216,94' onclick='clickColor("#660066",-110,216)' onmouseover='mouseOverColor("#660066")' alt='#660066' />
    <area style='cursor:pointer' shape='poly' coords='18,105,27,109,27,120,18,124,9,120,9,109' onclick='clickColor("#336600",-95,9)' onmouseover='mouseOverColor("#336600")' alt='#336600' />
    <area style='cursor:pointer' shape='poly' coords='36,105,45,109,45,120,36,124,27,120,27,109' onclick='clickColor("#009900",-95,27)' onmouseover='mouseOverColor("#009900")' alt='#009900' />
    <area style='cursor:pointer' shape='poly' coords='54,105,63,109,63,120,54,124,45,120,45,109' onclick='clickColor("#66FF33",-95,45)' onmouseover='mouseOverColor("#66FF33")' alt='#66FF33' />
    <area style='cursor:pointer' shape='poly' coords='72,105,81,109,81,120,72,124,63,120,63,109' onclick='clickColor("#99FF66",-95,63)' onmouseover='mouseOverColor("#99FF66")' alt='#99FF66' />
    <area style='cursor:pointer' shape='poly' coords='90,105,99,109,99,120,90,124,81,120,81,109' onclick='clickColor("#CCFF99",-95,81)' onmouseover='mouseOverColor("#CCFF99")' alt='#CCFF99' />
    <area style='cursor:pointer' shape='poly' coords='108,105,117,109,117,120,108,124,99,120,99,109' onclick='clickColor("#FFFFCC",-95,99)' onmouseover='mouseOverColor("#FFFFCC")' alt='#FFFFCC' />
    <area style='cursor:pointer' shape='poly' coords='126,105,135,109,135,120,126,124,117,120,117,109' onclick='clickColor("#FFCCCC",-95,117)' onmouseover='mouseOverColor("#FFCCCC")' alt='#FFCCCC' />
    <area style='cursor:pointer' shape='poly' coords='144,105,153,109,153,120,144,124,135,120,135,109' onclick='clickColor("#FF99CC",-95,135)' onmouseover='mouseOverColor("#FF99CC")' alt='#FF99CC' />
    <area style='cursor:pointer' shape='poly' coords='162,105,171,109,171,120,162,124,153,120,153,109' onclick='clickColor("#FF66CC",-95,153)' onmouseover='mouseOverColor("#FF66CC")' alt='#FF66CC' />
    <area style='cursor:pointer' shape='poly' coords='180,105,189,109,189,120,180,124,171,120,171,109' onclick='clickColor("#FF33CC",-95,171)' onmouseover='mouseOverColor("#FF33CC")' alt='#FF33CC' />
    <area style='cursor:pointer' shape='poly' coords='198,105,207,109,207,120,198,124,189,120,189,109' onclick='clickColor("#CC0099",-95,189)' onmouseover='mouseOverColor("#CC0099")' alt='#CC0099' />
    <area style='cursor:pointer' shape='poly' coords='216,105,225,109,225,120,216,124,207,120,207,109' onclick='clickColor("#993399",-95,207)' onmouseover='mouseOverColor("#993399")' alt='#993399' />
    <area style='cursor:pointer' shape='poly' coords='27,120,36,124,36,135,27,139,18,135,18,124' onclick='clickColor("#333300",-80,18)' onmouseover='mouseOverColor("#333300")' alt='#333300' />
    <area style='cursor:pointer' shape='poly' coords='45,120,54,124,54,135,45,139,36,135,36,124' onclick='clickColor("#669900",-80,36)' onmouseover='mouseOverColor("#669900")' alt='#669900' />
    <area style='cursor:pointer' shape='poly' coords='63,120,72,124,72,135,63,139,54,135,54,124' onclick='clickColor("#99FF33",-80,54)' onmouseover='mouseOverColor("#99FF33")' alt='#99FF33' />
    <area style='cursor:pointer' shape='poly' coords='81,120,90,124,90,135,81,139,72,135,72,124' onclick='clickColor("#CCFF66",-80,72)' onmouseover='mouseOverColor("#CCFF66")' alt='#CCFF66' />
    <area style='cursor:pointer' shape='poly' coords='99,120,108,124,108,135,99,139,90,135,90,124' onclick='clickColor("#FFFF99",-80,90)' onmouseover='mouseOverColor("#FFFF99")' alt='#FFFF99' />
    <area style='cursor:pointer' shape='poly' coords='117,120,126,124,126,135,117,139,108,135,108,124' onclick='clickColor("#FFCC99",-80,108)' onmouseover='mouseOverColor("#FFCC99")' alt='#FFCC99' />
    <area style='cursor:pointer' shape='poly' coords='135,120,144,124,144,135,135,139,126,135,126,124' onclick='clickColor("#FF9999",-80,126)' onmouseover='mouseOverColor("#FF9999")' alt='#FF9999' />
    <area style='cursor:pointer' shape='poly' coords='153,120,162,124,162,135,153,139,144,135,144,124' onclick='clickColor("#FF6699",-80,144)' onmouseover='mouseOverColor("#FF6699")' alt='#FF6699' />
    <area style='cursor:pointer' shape='poly' coords='171,120,180,124,180,135,171,139,162,135,162,124' onclick='clickColor("#FF3399",-80,162)' onmouseover='mouseOverColor("#FF3399")' alt='#FF3399' />
    <area style='cursor:pointer' shape='poly' coords='189,120,198,124,198,135,189,139,180,135,180,124' onclick='clickColor("#CC3399",-80,180)' onmouseover='mouseOverColor("#CC3399")' alt='#CC3399' />
    <area style='cursor:pointer' shape='poly' coords='207,120,216,124,216,135,207,139,198,135,198,124' onclick='clickColor("#990099",-80,198)' onmouseover='mouseOverColor("#990099")' alt='#990099' />
    <area style='cursor:pointer' shape='poly' coords='36,135,45,139,45,150,36,154,27,150,27,139' onclick='clickColor("#666633",-65,27)' onmouseover='mouseOverColor("#666633")' alt='#666633' />
    <area style='cursor:pointer' shape='poly' coords='54,135,63,139,63,150,54,154,45,150,45,139' onclick='clickColor("#99CC00",-65,45)' onmouseover='mouseOverColor("#99CC00")' alt='#99CC00' />
    <area style='cursor:pointer' shape='poly' coords='72,135,81,139,81,150,72,154,63,150,63,139' onclick='clickColor("#CCFF33",-65,63)' onmouseover='mouseOverColor("#CCFF33")' alt='#CCFF33' />
    <area style='cursor:pointer' shape='poly' coords='90,135,99,139,99,150,90,154,81,150,81,139' onclick='clickColor("#FFFF66",-65,81)' onmouseover='mouseOverColor("#FFFF66")' alt='#FFFF66' />
    <area style='cursor:pointer' shape='poly' coords='108,135,117,139,117,150,108,154,99,150,99,139' onclick='clickColor("#FFCC66",-65,99)' onmouseover='mouseOverColor("#FFCC66")' alt='#FFCC66' />
    <area style='cursor:pointer' shape='poly' coords='126,135,135,139,135,150,126,154,117,150,117,139' onclick='clickColor("#FF9966",-65,117)' onmouseover='mouseOverColor("#FF9966")' alt='#FF9966' />
    <area style='cursor:pointer' shape='poly' coords='144,135,153,139,153,150,144,154,135,150,135,139' onclick='clickColor("#FF6666",-65,135)' onmouseover='mouseOverColor("#FF6666")' alt='#FF6666' />
    <area style='cursor:pointer' shape='poly' coords='162,135,171,139,171,150,162,154,153,150,153,139' onclick='clickColor("#FF0066",-65,153)' onmouseover='mouseOverColor("#FF0066")' alt='#FF0066' />
    <area style='cursor:pointer' shape='poly' coords='180,135,189,139,189,150,180,154,171,150,171,139' onclick='clickColor("#CC6699",-65,171)' onmouseover='mouseOverColor("#CC6699")' alt='#CC6699' />
    <area style='cursor:pointer' shape='poly' coords='198,135,207,139,207,150,198,154,189,150,189,139' onclick='clickColor("#993366",-65,189)' onmouseover='mouseOverColor("#993366")' alt='#993366' />
    <area style='cursor:pointer' shape='poly' coords='45,150,54,154,54,165,45,169,36,165,36,154' onclick='clickColor("#999966",-50,36)' onmouseover='mouseOverColor("#999966")' alt='#999966' />
    <area style='cursor:pointer' shape='poly' coords='63,150,72,154,72,165,63,169,54,165,54,154' onclick='clickColor("#CCCC00",-50,54)' onmouseover='mouseOverColor("#CCCC00")' alt='#CCCC00' />
    <area style='cursor:pointer' shape='poly' coords='81,150,90,154,90,165,81,169,72,165,72,154' onclick='clickColor("#FFFF00",-50,72)' onmouseover='mouseOverColor("#FFFF00")' alt='#FFFF00' />
    <area style='cursor:pointer' shape='poly' coords='99,150,108,154,108,165,99,169,90,165,90,154' onclick='clickColor("#FFCC00",-50,90)' onmouseover='mouseOverColor("#FFCC00")' alt='#FFCC00' />
    <area style='cursor:pointer' shape='poly' coords='117,150,126,154,126,165,117,169,108,165,108,154' onclick='clickColor("#FF9933",-50,108)' onmouseover='mouseOverColor("#FF9933")' alt='#FF9933' />
    <area style='cursor:pointer' shape='poly' coords='135,150,144,154,144,165,135,169,126,165,126,154' onclick='clickColor("#FF6600",-50,126)' onmouseover='mouseOverColor("#FF6600")' alt='#FF6600' />
    <area style='cursor:pointer' shape='poly' coords='153,150,162,154,162,165,153,169,144,165,144,154' onclick='clickColor("#FF5050",-50,144)' onmouseover='mouseOverColor("#FF5050")' alt='#FF5050' />
    <area style='cursor:pointer' shape='poly' coords='171,150,180,154,180,165,171,169,162,165,162,154' onclick='clickColor("#CC0066",-50,162)' onmouseover='mouseOverColor("#CC0066")' alt='#CC0066' />
    <area style='cursor:pointer' shape='poly' coords='189,150,198,154,198,165,189,169,180,165,180,154' onclick='clickColor("#660033",-50,180)' onmouseover='mouseOverColor("#660033")' alt='#660033' />
    <area style='cursor:pointer' shape='poly' coords='54,165,63,169,63,180,54,184,45,180,45,169' onclick='clickColor("#996633",-35,45)' onmouseover='mouseOverColor("#996633")' alt='#996633' />
    <area style='cursor:pointer' shape='poly' coords='72,165,81,169,81,180,72,184,63,180,63,169' onclick='clickColor("#CC9900",-35,63)' onmouseover='mouseOverColor("#CC9900")' alt='#CC9900' />
    <area style='cursor:pointer' shape='poly' coords='90,165,99,169,99,180,90,184,81,180,81,169' onclick='clickColor("#FF9900",-35,81)' onmouseover='mouseOverColor("#FF9900")' alt='#FF9900' />
    <area style='cursor:pointer' shape='poly' coords='108,165,117,169,117,180,108,184,99,180,99,169' onclick='clickColor("#CC6600",-35,99)' onmouseover='mouseOverColor("#CC6600")' alt='#CC6600' />
    <area style='cursor:pointer' shape='poly' coords='126,165,135,169,135,180,126,184,117,180,117,169' onclick='clickColor("#FF3300",-35,117)' onmouseover='mouseOverColor("#FF3300")' alt='#FF3300' />
    <area style='cursor:pointer' shape='poly' coords='144,165,153,169,153,180,144,184,135,180,135,169' onclick='clickColor("#FF0000",-35,135)' onmouseover='mouseOverColor("#FF0000")' alt='#FF0000' />
    <area style='cursor:pointer' shape='poly' coords='162,165,171,169,171,180,162,184,153,180,153,169' onclick='clickColor("#CC0000",-35,153)' onmouseover='mouseOverColor("#CC0000")' alt='#CC0000' />
    <area style='cursor:pointer' shape='poly' coords='180,165,189,169,189,180,180,184,171,180,171,169' onclick='clickColor("#990033",-35,171)' onmouseover='mouseOverColor("#990033")' alt='#990033' />
    <area style='cursor:pointer' shape='poly' coords='63,180,72,184,72,195,63,199,54,195,54,184' onclick='clickColor("#663300",-20,54)' onmouseover='mouseOverColor("#663300")' alt='#663300' />
    <area style='cursor:pointer' shape='poly' coords='81,180,90,184,90,195,81,199,72,195,72,184' onclick='clickColor("#996600",-20,72)' onmouseover='mouseOverColor("#996600")' alt='#996600' />
    <area style='cursor:pointer' shape='poly' coords='99,180,108,184,108,195,99,199,90,195,90,184' onclick='clickColor("#CC3300",-20,90)' onmouseover='mouseOverColor("#CC3300")' alt='#CC3300' />
    <area style='cursor:pointer' shape='poly' coords='117,180,126,184,126,195,117,199,108,195,108,184' onclick='clickColor("#993300",-20,108)' onmouseover='mouseOverColor("#993300")' alt='#993300' />
    <area style='cursor:pointer' shape='poly' coords='135,180,144,184,144,195,135,199,126,195,126,184' onclick='clickColor("#990000",-20,126)' onmouseover='mouseOverColor("#990000")' alt='#990000' />
    <area style='cursor:pointer' shape='poly' coords='153,180,162,184,162,195,153,199,144,195,144,184' onclick='clickColor("#800000",-20,144)' onmouseover='mouseOverColor("#800000")' alt='#800000' />
    <area style='cursor:pointer' shape='poly' coords='171,180,180,184,180,195,171,199,162,195,162,184' onclick='clickColor("#993333",-20,162)' onmouseover='mouseOverColor("#993333")' alt='#993333' />
   `;
	return html;
}
function colormapAsStringOrig() {
	let html = `
    <area style='cursor:pointer' shape='poly' coords='63,0,72,4,72,15,63,19,54,15,54,4' onclick='clickColor("#003366",-200,54)' onmouseover='mouseOverColor("#003366")' alt='#003366' />
    <area style='cursor:pointer' shape='poly' coords='81,0,90,4,90,15,81,19,72,15,72,4' onclick='clickColor("#336699",-200,72)' onmouseover='mouseOverColor("#336699")' alt='#336699' />
    <area style='cursor:pointer' shape='poly' coords='99,0,108,4,108,15,99,19,90,15,90,4' onclick='clickColor("#3366CC",-200,90)' onmouseover='mouseOverColor("#3366CC")' alt='#3366CC' />
    <area style='cursor:pointer' shape='poly' coords='117,0,126,4,126,15,117,19,108,15,108,4' onclick='clickColor("#003399",-200,108)' onmouseover='mouseOverColor("#003399")' alt='#003399' />
    <area style='cursor:pointer' shape='poly' coords='135,0,144,4,144,15,135,19,126,15,126,4' onclick='clickColor("#000099",-200,126)' onmouseover='mouseOverColor("#000099")' alt='#000099' />
    <area style='cursor:pointer' shape='poly' coords='153,0,162,4,162,15,153,19,144,15,144,4' onclick='clickColor("#0000CC",-200,144)' onmouseover='mouseOverColor("#0000CC")' alt='#0000CC' />
    <area style='cursor:pointer' shape='poly' coords='171,0,180,4,180,15,171,19,162,15,162,4' onclick='clickColor("#000066",-200,162)' onmouseover='mouseOverColor("#000066")' alt='#000066' />
    <area style='cursor:pointer' shape='poly' coords='54,15,63,19,63,30,54,34,45,30,45,19' onclick='clickColor("#006666",-185,45)' onmouseover='mouseOverColor("#006666")' alt='#006666' />
    <area style='cursor:pointer' shape='poly' coords='72,15,81,19,81,30,72,34,63,30,63,19' onclick='clickColor("#006699",-185,63)' onmouseover='mouseOverColor("#006699")' alt='#006699' />
    <area style='cursor:pointer' shape='poly' coords='90,15,99,19,99,30,90,34,81,30,81,19' onclick='clickColor("#0099CC",-185,81)' onmouseover='mouseOverColor("#0099CC")' alt='#0099CC' />
    <area style='cursor:pointer' shape='poly' coords='108,15,117,19,117,30,108,34,99,30,99,19' onclick='clickColor("#0066CC",-185,99)' onmouseover='mouseOverColor("#0066CC")' alt='#0066CC' />
    <area style='cursor:pointer' shape='poly' coords='126,15,135,19,135,30,126,34,117,30,117,19' onclick='clickColor("#0033CC",-185,117)' onmouseover='mouseOverColor("#0033CC")' alt='#0033CC' />
    <area style='cursor:pointer' shape='poly' coords='144,15,153,19,153,30,144,34,135,30,135,19' onclick='clickColor("#0000FF",-185,135)' onmouseover='mouseOverColor("#0000FF")' alt='#0000FF' />
    <area style='cursor:pointer' shape='poly' coords='162,15,171,19,171,30,162,34,153,30,153,19' onclick='clickColor("#3333FF",-185,153)' onmouseover='mouseOverColor("#3333FF")' alt='#3333FF' />
    <area style='cursor:pointer' shape='poly' coords='180,15,189,19,189,30,180,34,171,30,171,19' onclick='clickColor("#333399",-185,171)' onmouseover='mouseOverColor("#333399")' alt='#333399' />
    <area style='cursor:pointer' shape='poly' coords='45,30,54,34,54,45,45,49,36,45,36,34' onclick='clickColor("#669999",-170,36)' onmouseover='mouseOverColor("#669999")' alt='#669999' />
    <area style='cursor:pointer' shape='poly' coords='63,30,72,34,72,45,63,49,54,45,54,34' onclick='clickColor("#009999",-170,54)' onmouseover='mouseOverColor("#009999")' alt='#009999' />
    <area style='cursor:pointer' shape='poly' coords='81,30,90,34,90,45,81,49,72,45,72,34' onclick='clickColor("#33CCCC",-170,72)' onmouseover='mouseOverColor("#33CCCC")' alt='#33CCCC' />
    <area style='cursor:pointer' shape='poly' coords='99,30,108,34,108,45,99,49,90,45,90,34' onclick='clickColor("#00CCFF",-170,90)' onmouseover='mouseOverColor("#00CCFF")' alt='#00CCFF' />
    <area style='cursor:pointer' shape='poly' coords='117,30,126,34,126,45,117,49,108,45,108,34' onclick='clickColor("#0099FF",-170,108)' onmouseover='mouseOverColor("#0099FF")' alt='#0099FF' />
    <area style='cursor:pointer' shape='poly' coords='135,30,144,34,144,45,135,49,126,45,126,34' onclick='clickColor("#0066FF",-170,126)' onmouseover='mouseOverColor("#0066FF")' alt='#0066FF' />
    <area style='cursor:pointer' shape='poly' coords='153,30,162,34,162,45,153,49,144,45,144,34' onclick='clickColor("#3366FF",-170,144)' onmouseover='mouseOverColor("#3366FF")' alt='#3366FF' />
    <area style='cursor:pointer' shape='poly' coords='171,30,180,34,180,45,171,49,162,45,162,34' onclick='clickColor("#3333CC",-170,162)' onmouseover='mouseOverColor("#3333CC")' alt='#3333CC' />
    <area style='cursor:pointer' shape='poly' coords='189,30,198,34,198,45,189,49,180,45,180,34' onclick='clickColor("#666699",-170,180)' onmouseover='mouseOverColor("#666699")' alt='#666699' />
    <area style='cursor:pointer' shape='poly' coords='36,45,45,49,45,60,36,64,27,60,27,49' onclick='clickColor("#339966",-155,27)' onmouseover='mouseOverColor("#339966")' alt='#339966' />
    <area style='cursor:pointer' shape='poly' coords='54,45,63,49,63,60,54,64,45,60,45,49' onclick='clickColor("#00CC99",-155,45)' onmouseover='mouseOverColor("#00CC99")' alt='#00CC99' />
    <area style='cursor:pointer' shape='poly' coords='72,45,81,49,81,60,72,64,63,60,63,49' onclick='clickColor("#00FFCC",-155,63)' onmouseover='mouseOverColor("#00FFCC")' alt='#00FFCC' />
    <area style='cursor:pointer' shape='poly' coords='90,45,99,49,99,60,90,64,81,60,81,49' onclick='clickColor("#00FFFF",-155,81)' onmouseover='mouseOverColor("#00FFFF")' alt='#00FFFF' />
    <area style='cursor:pointer' shape='poly' coords='108,45,117,49,117,60,108,64,99,60,99,49' onclick='clickColor("#33CCFF",-155,99)' onmouseover='mouseOverColor("#33CCFF")' alt='#33CCFF' />
    <area style='cursor:pointer' shape='poly' coords='126,45,135,49,135,60,126,64,117,60,117,49' onclick='clickColor("#3399FF",-155,117)' onmouseover='mouseOverColor("#3399FF")' alt='#3399FF' />
    <area style='cursor:pointer' shape='poly' coords='144,45,153,49,153,60,144,64,135,60,135,49' onclick='clickColor("#6699FF",-155,135)' onmouseover='mouseOverColor("#6699FF")' alt='#6699FF' />
    <area style='cursor:pointer' shape='poly' coords='162,45,171,49,171,60,162,64,153,60,153,49' onclick='clickColor("#6666FF",-155,153)' onmouseover='mouseOverColor("#6666FF")' alt='#6666FF' />
    <area style='cursor:pointer' shape='poly' coords='180,45,189,49,189,60,180,64,171,60,171,49' onclick='clickColor("#6600FF",-155,171)' onmouseover='mouseOverColor("#6600FF")' alt='#6600FF' />
    <area style='cursor:pointer' shape='poly' coords='198,45,207,49,207,60,198,64,189,60,189,49' onclick='clickColor("#6600CC",-155,189)' onmouseover='mouseOverColor("#6600CC")' alt='#6600CC' />
    <area style='cursor:pointer' shape='poly' coords='27,60,36,64,36,75,27,79,18,75,18,64' onclick='clickColor("#339933",-140,18)' onmouseover='mouseOverColor("#339933")' alt='#339933' />
    <area style='cursor:pointer' shape='poly' coords='45,60,54,64,54,75,45,79,36,75,36,64' onclick='clickColor("#00CC66",-140,36)' onmouseover='mouseOverColor("#00CC66")' alt='#00CC66' />
    <area style='cursor:pointer' shape='poly' coords='63,60,72,64,72,75,63,79,54,75,54,64' onclick='clickColor("#00FF99",-140,54)' onmouseover='mouseOverColor("#00FF99")' alt='#00FF99' />
    <area style='cursor:pointer' shape='poly' coords='81,60,90,64,90,75,81,79,72,75,72,64' onclick='clickColor("#66FFCC",-140,72)' onmouseover='mouseOverColor("#66FFCC")' alt='#66FFCC' />
    <area style='cursor:pointer' shape='poly' coords='99,60,108,64,108,75,99,79,90,75,90,64' onclick='clickColor("#66FFFF",-140,90)' onmouseover='mouseOverColor("#66FFFF")' alt='#66FFFF' />
    <area style='cursor:pointer' shape='poly' coords='117,60,126,64,126,75,117,79,108,75,108,64' onclick='clickColor("#66CCFF",-140,108)' onmouseover='mouseOverColor("#66CCFF")' alt='#66CCFF' />
    <area style='cursor:pointer' shape='poly' coords='135,60,144,64,144,75,135,79,126,75,126,64' onclick='clickColor("#99CCFF",-140,126)' onmouseover='mouseOverColor("#99CCFF")' alt='#99CCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,60,162,64,162,75,153,79,144,75,144,64' onclick='clickColor("#9999FF",-140,144)' onmouseover='mouseOverColor("#9999FF")' alt='#9999FF' />
    <area style='cursor:pointer' shape='poly' coords='171,60,180,64,180,75,171,79,162,75,162,64' onclick='clickColor("#9966FF",-140,162)' onmouseover='mouseOverColor("#9966FF")' alt='#9966FF' />
    <area style='cursor:pointer' shape='poly' coords='189,60,198,64,198,75,189,79,180,75,180,64' onclick='clickColor("#9933FF",-140,180)' onmouseover='mouseOverColor("#9933FF")' alt='#9933FF' />
    <area style='cursor:pointer' shape='poly' coords='207,60,216,64,216,75,207,79,198,75,198,64' onclick='clickColor("#9900FF",-140,198)' onmouseover='mouseOverColor("#9900FF")' alt='#9900FF' />
    <area style='cursor:pointer' shape='poly' coords='18,75,27,79,27,90,18,94,9,90,9,79' onclick='clickColor("#006600",-125,9)' onmouseover='mouseOverColor("#006600")' alt='#006600' />
    <area style='cursor:pointer' shape='poly' coords='36,75,45,79,45,90,36,94,27,90,27,79' onclick='clickColor("#00CC00",-125,27)' onmouseover='mouseOverColor("#00CC00")' alt='#00CC00' />
    <area style='cursor:pointer' shape='poly' coords='54,75,63,79,63,90,54,94,45,90,45,79' onclick='clickColor("#00FF00",-125,45)' onmouseover='mouseOverColor("#00FF00")' alt='#00FF00' />
    <area style='cursor:pointer' shape='poly' coords='72,75,81,79,81,90,72,94,63,90,63,79' onclick='clickColor("#66FF99",-125,63)' onmouseover='mouseOverColor("#66FF99")' alt='#66FF99' />
    <area style='cursor:pointer' shape='poly' coords='90,75,99,79,99,90,90,94,81,90,81,79' onclick='clickColor("#99FFCC",-125,81)' onmouseover='mouseOverColor("#99FFCC")' alt='#99FFCC' />
    <area style='cursor:pointer' shape='poly' coords='108,75,117,79,117,90,108,94,99,90,99,79' onclick='clickColor("#CCFFFF",-125,99)' onmouseover='mouseOverColor("#CCFFFF")' alt='#CCFFFF' />
    <area style='cursor:pointer' shape='poly' coords='126,75,135,79,135,90,126,94,117,90,117,79' onclick='clickColor("#CCCCFF",-125,117)' onmouseover='mouseOverColor("#CCCCFF")' alt='#CCCCFF' />
    <area style='cursor:pointer' shape='poly' coords='144,75,153,79,153,90,144,94,135,90,135,79' onclick='clickColor("#CC99FF",-125,135)' onmouseover='mouseOverColor("#CC99FF")' alt='#CC99FF' />
    <area style='cursor:pointer' shape='poly' coords='162,75,171,79,171,90,162,94,153,90,153,79' onclick='clickColor("#CC66FF",-125,153)' onmouseover='mouseOverColor("#CC66FF")' alt='#CC66FF' />
    <area style='cursor:pointer' shape='poly' coords='180,75,189,79,189,90,180,94,171,90,171,79' onclick='clickColor("#CC33FF",-125,171)' onmouseover='mouseOverColor("#CC33FF")' alt='#CC33FF' />
    <area style='cursor:pointer' shape='poly' coords='198,75,207,79,207,90,198,94,189,90,189,79' onclick='clickColor("#CC00FF",-125,189)' onmouseover='mouseOverColor("#CC00FF")' alt='#CC00FF' />
    <area style='cursor:pointer' shape='poly' coords='216,75,225,79,225,90,216,94,207,90,207,79' onclick='clickColor("#9900CC",-125,207)' onmouseover='mouseOverColor("#9900CC")' alt='#9900CC' />
    <area style='cursor:pointer' shape='poly' coords='9,90,18,94,18,105,9,109,0,105,0,94' onclick='clickColor("#003300",-110,0)' onmouseover='mouseOverColor("#003300")' alt='#003300' />
    <area style='cursor:pointer' shape='poly' coords='27,90,36,94,36,105,27,109,18,105,18,94' onclick='clickColor("#009933",-110,18)' onmouseover='mouseOverColor("#009933")' alt='#009933' />
    <area style='cursor:pointer' shape='poly' coords='45,90,54,94,54,105,45,109,36,105,36,94' onclick='clickColor("#33CC33",-110,36)' onmouseover='mouseOverColor("#33CC33")' alt='#33CC33' />
    <area style='cursor:pointer' shape='poly' coords='63,90,72,94,72,105,63,109,54,105,54,94' onclick='clickColor("#66FF66",-110,54)' onmouseover='mouseOverColor("#66FF66")' alt='#66FF66' />
    <area style='cursor:pointer' shape='poly' coords='81,90,90,94,90,105,81,109,72,105,72,94' onclick='clickColor("#99FF99",-110,72)' onmouseover='mouseOverColor("#99FF99")' alt='#99FF99' />
    <area style='cursor:pointer' shape='poly' coords='99,90,108,94,108,105,99,109,90,105,90,94' onclick='clickColor("#CCFFCC",-110,90)' onmouseover='mouseOverColor("#CCFFCC")' alt='#CCFFCC' />
    <area style='cursor:pointer' shape='poly' coords='117,90,126,94,126,105,117,109,108,105,108,94' onclick='clickColor("#FFFFFF",-110,108)' onmouseover='mouseOverColor("#FFFFFF")' alt='#FFFFFF' />
    <area style='cursor:pointer' shape='poly' coords='135,90,144,94,144,105,135,109,126,105,126,94' onclick='clickColor("#FFCCFF",-110,126)' onmouseover='mouseOverColor("#FFCCFF")' alt='#FFCCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,90,162,94,162,105,153,109,144,105,144,94' onclick='clickColor("#FF99FF",-110,144)' onmouseover='mouseOverColor("#FF99FF")' alt='#FF99FF' />
    <area style='cursor:pointer' shape='poly' coords='171,90,180,94,180,105,171,109,162,105,162,94' onclick='clickColor("#FF66FF",-110,162)' onmouseover='mouseOverColor("#FF66FF")' alt='#FF66FF' />
    <area style='cursor:pointer' shape='poly' coords='189,90,198,94,198,105,189,109,180,105,180,94' onclick='clickColor("#FF00FF",-110,180)' onmouseover='mouseOverColor("#FF00FF")' alt='#FF00FF' />
    <area style='cursor:pointer' shape='poly' coords='207,90,216,94,216,105,207,109,198,105,198,94' onclick='clickColor("#CC00CC",-110,198)' onmouseover='mouseOverColor("#CC00CC")' alt='#CC00CC' />
    <area style='cursor:pointer' shape='poly' coords='225,90,234,94,234,105,225,109,216,105,216,94' onclick='clickColor("#660066",-110,216)' onmouseover='mouseOverColor("#660066")' alt='#660066' />
    <area style='cursor:pointer' shape='poly' coords='18,105,27,109,27,120,18,124,9,120,9,109' onclick='clickColor("#336600",-95,9)' onmouseover='mouseOverColor("#336600")' alt='#336600' />
    <area style='cursor:pointer' shape='poly' coords='36,105,45,109,45,120,36,124,27,120,27,109' onclick='clickColor("#009900",-95,27)' onmouseover='mouseOverColor("#009900")' alt='#009900' />
    <area style='cursor:pointer' shape='poly' coords='54,105,63,109,63,120,54,124,45,120,45,109' onclick='clickColor("#66FF33",-95,45)' onmouseover='mouseOverColor("#66FF33")' alt='#66FF33' />
    <area style='cursor:pointer' shape='poly' coords='72,105,81,109,81,120,72,124,63,120,63,109' onclick='clickColor("#99FF66",-95,63)' onmouseover='mouseOverColor("#99FF66")' alt='#99FF66' />
    <area style='cursor:pointer' shape='poly' coords='90,105,99,109,99,120,90,124,81,120,81,109' onclick='clickColor("#CCFF99",-95,81)' onmouseover='mouseOverColor("#CCFF99")' alt='#CCFF99' />
    <area style='cursor:pointer' shape='poly' coords='108,105,117,109,117,120,108,124,99,120,99,109' onclick='clickColor("#FFFFCC",-95,99)' onmouseover='mouseOverColor("#FFFFCC")' alt='#FFFFCC' />
    <area style='cursor:pointer' shape='poly' coords='126,105,135,109,135,120,126,124,117,120,117,109' onclick='clickColor("#FFCCCC",-95,117)' onmouseover='mouseOverColor("#FFCCCC")' alt='#FFCCCC' />
    <area style='cursor:pointer' shape='poly' coords='144,105,153,109,153,120,144,124,135,120,135,109' onclick='clickColor("#FF99CC",-95,135)' onmouseover='mouseOverColor("#FF99CC")' alt='#FF99CC' />
    <area style='cursor:pointer' shape='poly' coords='162,105,171,109,171,120,162,124,153,120,153,109' onclick='clickColor("#FF66CC",-95,153)' onmouseover='mouseOverColor("#FF66CC")' alt='#FF66CC' />
    <area style='cursor:pointer' shape='poly' coords='180,105,189,109,189,120,180,124,171,120,171,109' onclick='clickColor("#FF33CC",-95,171)' onmouseover='mouseOverColor("#FF33CC")' alt='#FF33CC' />
    <area style='cursor:pointer' shape='poly' coords='198,105,207,109,207,120,198,124,189,120,189,109' onclick='clickColor("#CC0099",-95,189)' onmouseover='mouseOverColor("#CC0099")' alt='#CC0099' />
    <area style='cursor:pointer' shape='poly' coords='216,105,225,109,225,120,216,124,207,120,207,109' onclick='clickColor("#993399",-95,207)' onmouseover='mouseOverColor("#993399")' alt='#993399' />
    <area style='cursor:pointer' shape='poly' coords='27,120,36,124,36,135,27,139,18,135,18,124' onclick='clickColor("#333300",-80,18)' onmouseover='mouseOverColor("#333300")' alt='#333300' />
    <area style='cursor:pointer' shape='poly' coords='45,120,54,124,54,135,45,139,36,135,36,124' onclick='clickColor("#669900",-80,36)' onmouseover='mouseOverColor("#669900")' alt='#669900' />
    <area style='cursor:pointer' shape='poly' coords='63,120,72,124,72,135,63,139,54,135,54,124' onclick='clickColor("#99FF33",-80,54)' onmouseover='mouseOverColor("#99FF33")' alt='#99FF33' />
    <area style='cursor:pointer' shape='poly' coords='81,120,90,124,90,135,81,139,72,135,72,124' onclick='clickColor("#CCFF66",-80,72)' onmouseover='mouseOverColor("#CCFF66")' alt='#CCFF66' />
    <area style='cursor:pointer' shape='poly' coords='99,120,108,124,108,135,99,139,90,135,90,124' onclick='clickColor("#FFFF99",-80,90)' onmouseover='mouseOverColor("#FFFF99")' alt='#FFFF99' />
    <area style='cursor:pointer' shape='poly' coords='117,120,126,124,126,135,117,139,108,135,108,124' onclick='clickColor("#FFCC99",-80,108)' onmouseover='mouseOverColor("#FFCC99")' alt='#FFCC99' />
    <area style='cursor:pointer' shape='poly' coords='135,120,144,124,144,135,135,139,126,135,126,124' onclick='clickColor("#FF9999",-80,126)' onmouseover='mouseOverColor("#FF9999")' alt='#FF9999' />
    <area style='cursor:pointer' shape='poly' coords='153,120,162,124,162,135,153,139,144,135,144,124' onclick='clickColor("#FF6699",-80,144)' onmouseover='mouseOverColor("#FF6699")' alt='#FF6699' />
    <area style='cursor:pointer' shape='poly' coords='171,120,180,124,180,135,171,139,162,135,162,124' onclick='clickColor("#FF3399",-80,162)' onmouseover='mouseOverColor("#FF3399")' alt='#FF3399' />
    <area style='cursor:pointer' shape='poly' coords='189,120,198,124,198,135,189,139,180,135,180,124' onclick='clickColor("#CC3399",-80,180)' onmouseover='mouseOverColor("#CC3399")' alt='#CC3399' />
    <area style='cursor:pointer' shape='poly' coords='207,120,216,124,216,135,207,139,198,135,198,124' onclick='clickColor("#990099",-80,198)' onmouseover='mouseOverColor("#990099")' alt='#990099' />
    <area style='cursor:pointer' shape='poly' coords='36,135,45,139,45,150,36,154,27,150,27,139' onclick='clickColor("#666633",-65,27)' onmouseover='mouseOverColor("#666633")' alt='#666633' />
    <area style='cursor:pointer' shape='poly' coords='54,135,63,139,63,150,54,154,45,150,45,139' onclick='clickColor("#99CC00",-65,45)' onmouseover='mouseOverColor("#99CC00")' alt='#99CC00' />
    <area style='cursor:pointer' shape='poly' coords='72,135,81,139,81,150,72,154,63,150,63,139' onclick='clickColor("#CCFF33",-65,63)' onmouseover='mouseOverColor("#CCFF33")' alt='#CCFF33' />
    <area style='cursor:pointer' shape='poly' coords='90,135,99,139,99,150,90,154,81,150,81,139' onclick='clickColor("#FFFF66",-65,81)' onmouseover='mouseOverColor("#FFFF66")' alt='#FFFF66' />
    <area style='cursor:pointer' shape='poly' coords='108,135,117,139,117,150,108,154,99,150,99,139' onclick='clickColor("#FFCC66",-65,99)' onmouseover='mouseOverColor("#FFCC66")' alt='#FFCC66' />
    <area style='cursor:pointer' shape='poly' coords='126,135,135,139,135,150,126,154,117,150,117,139' onclick='clickColor("#FF9966",-65,117)' onmouseover='mouseOverColor("#FF9966")' alt='#FF9966' />
    <area style='cursor:pointer' shape='poly' coords='144,135,153,139,153,150,144,154,135,150,135,139' onclick='clickColor("#FF6666",-65,135)' onmouseover='mouseOverColor("#FF6666")' alt='#FF6666' />
    <area style='cursor:pointer' shape='poly' coords='162,135,171,139,171,150,162,154,153,150,153,139' onclick='clickColor("#FF0066",-65,153)' onmouseover='mouseOverColor("#FF0066")' alt='#FF0066' />
    <area style='cursor:pointer' shape='poly' coords='180,135,189,139,189,150,180,154,171,150,171,139' onclick='clickColor("#CC6699",-65,171)' onmouseover='mouseOverColor("#CC6699")' alt='#CC6699' />
    <area style='cursor:pointer' shape='poly' coords='198,135,207,139,207,150,198,154,189,150,189,139' onclick='clickColor("#993366",-65,189)' onmouseover='mouseOverColor("#993366")' alt='#993366' />
    <area style='cursor:pointer' shape='poly' coords='45,150,54,154,54,165,45,169,36,165,36,154' onclick='clickColor("#999966",-50,36)' onmouseover='mouseOverColor("#999966")' alt='#999966' />
    <area style='cursor:pointer' shape='poly' coords='63,150,72,154,72,165,63,169,54,165,54,154' onclick='clickColor("#CCCC00",-50,54)' onmouseover='mouseOverColor("#CCCC00")' alt='#CCCC00' />
    <area style='cursor:pointer' shape='poly' coords='81,150,90,154,90,165,81,169,72,165,72,154' onclick='clickColor("#FFFF00",-50,72)' onmouseover='mouseOverColor("#FFFF00")' alt='#FFFF00' />
    <area style='cursor:pointer' shape='poly' coords='99,150,108,154,108,165,99,169,90,165,90,154' onclick='clickColor("#FFCC00",-50,90)' onmouseover='mouseOverColor("#FFCC00")' alt='#FFCC00' />
    <area style='cursor:pointer' shape='poly' coords='117,150,126,154,126,165,117,169,108,165,108,154' onclick='clickColor("#FF9933",-50,108)' onmouseover='mouseOverColor("#FF9933")' alt='#FF9933' />
    <area style='cursor:pointer' shape='poly' coords='135,150,144,154,144,165,135,169,126,165,126,154' onclick='clickColor("#FF6600",-50,126)' onmouseover='mouseOverColor("#FF6600")' alt='#FF6600' />
    <area style='cursor:pointer' shape='poly' coords='153,150,162,154,162,165,153,169,144,165,144,154' onclick='clickColor("#FF5050",-50,144)' onmouseover='mouseOverColor("#FF5050")' alt='#FF5050' />
    <area style='cursor:pointer' shape='poly' coords='171,150,180,154,180,165,171,169,162,165,162,154' onclick='clickColor("#CC0066",-50,162)' onmouseover='mouseOverColor("#CC0066")' alt='#CC0066' />
    <area style='cursor:pointer' shape='poly' coords='189,150,198,154,198,165,189,169,180,165,180,154' onclick='clickColor("#660033",-50,180)' onmouseover='mouseOverColor("#660033")' alt='#660033' />
    <area style='cursor:pointer' shape='poly' coords='54,165,63,169,63,180,54,184,45,180,45,169' onclick='clickColor("#996633",-35,45)' onmouseover='mouseOverColor("#996633")' alt='#996633' />
    <area style='cursor:pointer' shape='poly' coords='72,165,81,169,81,180,72,184,63,180,63,169' onclick='clickColor("#CC9900",-35,63)' onmouseover='mouseOverColor("#CC9900")' alt='#CC9900' />
    <area style='cursor:pointer' shape='poly' coords='90,165,99,169,99,180,90,184,81,180,81,169' onclick='clickColor("#FF9900",-35,81)' onmouseover='mouseOverColor("#FF9900")' alt='#FF9900' />
    <area style='cursor:pointer' shape='poly' coords='108,165,117,169,117,180,108,184,99,180,99,169' onclick='clickColor("#CC6600",-35,99)' onmouseover='mouseOverColor("#CC6600")' alt='#CC6600' />
    <area style='cursor:pointer' shape='poly' coords='126,165,135,169,135,180,126,184,117,180,117,169' onclick='clickColor("#FF3300",-35,117)' onmouseover='mouseOverColor("#FF3300")' alt='#FF3300' />
    <area style='cursor:pointer' shape='poly' coords='144,165,153,169,153,180,144,184,135,180,135,169' onclick='clickColor("#FF0000",-35,135)' onmouseover='mouseOverColor("#FF0000")' alt='#FF0000' />
    <area style='cursor:pointer' shape='poly' coords='162,165,171,169,171,180,162,184,153,180,153,169' onclick='clickColor("#CC0000",-35,153)' onmouseover='mouseOverColor("#CC0000")' alt='#CC0000' />
    <area style='cursor:pointer' shape='poly' coords='180,165,189,169,189,180,180,184,171,180,171,169' onclick='clickColor("#990033",-35,171)' onmouseover='mouseOverColor("#990033")' alt='#990033' />
    <area style='cursor:pointer' shape='poly' coords='63,180,72,184,72,195,63,199,54,195,54,184' onclick='clickColor("#663300",-20,54)' onmouseover='mouseOverColor("#663300")' alt='#663300' />
    <area style='cursor:pointer' shape='poly' coords='81,180,90,184,90,195,81,199,72,195,72,184' onclick='clickColor("#996600",-20,72)' onmouseover='mouseOverColor("#996600")' alt='#996600' />
    <area style='cursor:pointer' shape='poly' coords='99,180,108,184,108,195,99,199,90,195,90,184' onclick='clickColor("#CC3300",-20,90)' onmouseover='mouseOverColor("#CC3300")' alt='#CC3300' />
    <area style='cursor:pointer' shape='poly' coords='117,180,126,184,126,195,117,199,108,195,108,184' onclick='clickColor("#993300",-20,108)' onmouseover='mouseOverColor("#993300")' alt='#993300' />
    <area style='cursor:pointer' shape='poly' coords='135,180,144,184,144,195,135,199,126,195,126,184' onclick='clickColor("#990000",-20,126)' onmouseover='mouseOverColor("#990000")' alt='#990000' />
    <area style='cursor:pointer' shape='poly' coords='153,180,162,184,162,195,153,199,144,195,144,184' onclick='clickColor("#800000",-20,144)' onmouseover='mouseOverColor("#800000")' alt='#800000' />
    <area style='cursor:pointer' shape='poly' coords='171,180,180,184,180,195,171,199,162,195,162,184' onclick='clickColor("#993333",-20,162)' onmouseover='mouseOverColor("#993333")' alt='#993333' />
   `;
	return html;
}
function colorsFromBFA(bg, fg, alpha) {
	if (fg == 'contrast') {
		if (bg != 'inherit') bg = colorFrom(bg, alpha);
		fg = colorIdealText(bg);
	} else if (bg == 'contrast') {
		fg = colorFrom(fg);
		bg = colorIdealText(fg);
	} else {
		if (isdef(bg) && bg != 'inherit') bg = colorFrom(bg, alpha);
		if (isdef(fg) && fg != 'inherit') fg = colorFrom(fg);
	}
	return [bg, fg];
}
function conslog(s) { console.log(s, window[s]) }

function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }

function copyKeys(ofrom, oto, except = {}, only = null) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
	return oto;
}
function correctFuncName(specType) {
	switch (specType) {
		case 'list': specType = 'liste'; break;
		case 'dict': specType = 'dicti'; break;
		case undefined: specType = 'panel'; break;
	}
	return specType;
}
async function correctUsersDeleteKeyImageKey() {
	for (const name in Serverdata.users) {
		let u = Serverdata.users[name];
		delete u.key;
		delete u.imageKey;
		await postUserChange(u, true);
	}
}
function createBatchGridCells(d, w, h, styles = {}, opts = {}) {
	let gap = valf(styles.gap, 4);
	if (nundef(styles.w)) styles.w = 128;
	if (nundef(styles.h)) styles.h = styles.w;
	if (nundef(styles.margin)) styles.margin = gap;
	let sz = styles.w + styles.margin;
	let cols = Math.floor((w - 20) / sz);
	let rows = Math.floor((h - 20) / sz);
	let dGrid = mGrid(rows, cols, d, { margin: 'auto', gap })
	let cells = [];
	for (let i = 0; i < rows * cols; i++) {
		let d = mDom(dGrid, styles, opts);
		mCenterCenterFlex(d);
		cells.push(d);
	}
	return { dGrid, cells, rows, cols };
}
function createConfirmationModal(dParent, question) {
	const modal = document.createElement("div");
	modal.classList.add("modal");
	const modalContent = document.createElement("div");
	modalContent.classList.add("modal-content");
	const questionText = document.createElement("p");
	questionText.textContent = question;
	modalContent.appendChild(questionText);
	const yesButton = document.createElement("button");
	yesButton.textContent = "Yes";
	yesButton.addEventListener("click", () => {
		modal.style.display = "none"; // Close the modal
	});
	modalContent.appendChild(yesButton);
	const noButton = document.createElement("button");
	noButton.textContent = "No";
	noButton.addEventListener("click", () => {
		modal.style.display = "none"; // Close the modal
	});
	modalContent.appendChild(noButton);
	modal.appendChild(modalContent);
	dParent.appendChild(modal);
}
function createGamePlayer(name, gamename, opts = {}) {
	let pl = userToPlayer(name, gamename);
	copyKeys(opts, pl);
	return pl;
}
function createInteractiveCanvas(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const scale = 300 / Math.min(img.width, img.height);
			const scaledWidth = img.width * scale;
			const scaledHeight = img.height * scale;
			const canvas = document.createElement('canvas');
			canvas.width = scaledWidth;
			canvas.height = scaledHeight;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
			let isDragging = false;
			let rect = { x: 100, y: 100, width: 50, height: 50 }; // Initial rectangle properties
			let dragOffsetX, dragOffsetY;
			function isMouseInRect(x, y) {
				return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
			}
			function draw() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
				ctx.fillStyle = 'red';
				ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
			}
			canvas.addEventListener('mousedown', (event) => {
				const rect = canvas.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				if (isMouseInRect(x, y)) {
					isDragging = true;
					dragOffsetX = x - rect.x;
					dragOffsetY = y - rect.y;
				}
			});
			canvas.addEventListener('mousemove', (event) => {
				if (isDragging) {
					const rect = canvas.getBoundingClientRect();
					const x = event.clientX - rect.left;
					const y = event.clientY - rect.top;
					rect.x = x - dragOffsetX;
					rect.y = y - dragOffsetY;
					draw();
				}
			});
			canvas.addEventListener('mouseup', () => {
				isDragging = false;
			});
			draw();
			resolve(canvas);
		};
		img.onerror = reject;
		img.src = src;
	});
}
function createOpenTable(gamename, players, options) {
	let me = getUname();
	let playerNames = [me];
	assertion(me in players, "_createOpenTable without owner!!!!!")
	for (const name in players) { addIf(playerNames, name); }
	let table = {
		status: 'open',
		id: generateTableId(),
		fen: null,
		game: gamename,
		owner: playerNames[0],
		friendly: generateTableName(),
		players,
		playerNames: playerNames,
		options
	};
	return table;
}
function createPanZoomCanvas(parentElement, src, wCanvas, hCanvas) {
	const canvas = document.createElement('canvas');
	canvas.width = wCanvas;
	canvas.height = hCanvas;
	parentElement.appendChild(canvas);
	const ctx = canvas.getContext('2d');
	let image = new Image();
	image.src = src;
	let scale = 1;
	let originX = 0;
	let originY = 0;
	let startX = 0;
	let startY = 0;
	let isDragging = false;
	image.onload = () => {
		if (image.width < canvas.width) canvas.width = image.width;
		if (image.height < canvas.height) canvas.height = image.height;
		const scaleX = canvas.width / image.width;
		const scaleY = canvas.height / image.height;
		scale = Math.min(scaleX, scaleY, 1);
		originX = (canvas.width - image.width * scale) / 2;
		originY = (canvas.height - image.height * scale) / 2;
		draw();
	};
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.translate(originX, originY);
		ctx.scale(scale, scale);
		ctx.drawImage(image, 0, 0);
		ctx.restore();
	}
	canvas.addEventListener('mousedown', (e) => {
		isDragging = true;
		startX = e.clientX - originX;
		startY = e.clientY - originY;
		canvas.style.cursor = 'grabbing';
	});
	canvas.addEventListener('mousemove', (e) => {
		if (isDragging) {
			originX = e.clientX - startX;
			originY = e.clientY - startY;
			draw();
		}
	});
	canvas.addEventListener('mouseup', () => {
		isDragging = false;
		canvas.style.cursor = 'grab';
	});
	canvas.addEventListener('mouseout', () => {
		isDragging = false;
		canvas.style.cursor = 'grab';
	});
	canvas.addEventListener('wheel', (e) => {
		e.preventDefault();
		const zoom = Math.exp(e.deltaY * -0.0005);
		scale *= zoom;
		if (scale >= 1) scale = 1;
		const mouseX = e.clientX - canvas.offsetLeft;
		const mouseY = e.clientY - canvas.offsetTop;
		originX = mouseX - (mouseX - originX) * zoom;
		originY = mouseY - (mouseY - originY) * zoom;
		draw();
	});
	let touchStartX = 0;
	let touchStartY = 0;
	canvas.addEventListener('touchstart', (e) => {
		if (e.touches.length === 1) {
			isDragging = true;
			touchStartX = e.touches[0].clientX - originX;
			touchStartY = e.touches[0].clientY - originY;
			canvas.style.cursor = 'grabbing';
		}
	});
	canvas.addEventListener('touchmove', (e) => {
		if (e.touches.length === 1 && isDragging) {
			originX = e.touches[0].clientX - touchStartX;
			originY = e.touches[0].clientY - touchStartY;
			draw();
		}
	});
	canvas.addEventListener('touchend', () => {
		isDragging = false;
		canvas.style.cursor = 'grab';
	});
	return canvas;
}
function createScaledCanvasFromImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const scale = 300 / Math.min(img.width, img.height);
			const scaledWidth = img.width * scale;
			const scaledHeight = img.height * scale;
			const canvas = document.createElement('canvas');
			canvas.width = scaledWidth;
			canvas.height = scaledHeight;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
			resolve(canvas);
		};
		img.onerror = reject;
		img.src = src;
	});
}
function cropOrExpandImageAndGetDataUrl(imageSrc, x, y) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous'; // CORS permission for cross-origin images
		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = 300;
			canvas.height = 300;
			const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
			const scaledWidth = img.width * scale;
			const scaledHeight = img.height * scale;
			const dx = isdef(x) ? x * scale : (canvas.width - scaledWidth) / 2;
			const dy = isdef(y) ? y * scale : (canvas.height - scaledHeight) / 2;
			ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
			const dataUrl = canvas.toDataURL();
			resolve(dataUrl);
		};
		img.onerror = (error) => reject(error);
		img.src = imageSrc;
	});
}
function cropTo(tool, wnew, hnew) {
	let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
	let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
	let xnew = x + (wnew - w) / 2;
	let ynew = y + (hnew - h) / 2;
	redrawImage(img, dParent, xnew, ynew, wnew, wnew, wnew, hnew, () => setRect(0, 0, wnew, hnew))
}
function deckDeal(deck, n) { return deck.splice(0, n); }

function deepMerge(target, source) {
	if (Array.isArray(target) && Array.isArray(source)) {
		return mergeArrays(target, source);
	} else if (isObject(target) && isObject(source)) {
		const output = Object.assign({}, target);
		Object.keys(source).forEach(key => {
			if (isObject(source[key]) || Array.isArray(source[key])) {
				if (!(key in target)) {
					Object.assign(output, { [key]: source[key] });
				} else {
					output[key] = deepMerge(target[key], source[key]);
				}
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
		return output;
	}
	return source;
}
function deepMergeConcatLists(target, source) {
	if (Array.isArray(target) && Array.isArray(source)) {
		return [...target, ...source];
	} else if (isObject(target) && isObject(source)) {
		const output = Object.assign({}, target);
		Object.keys(source).forEach(key => {
			if (isObject(source[key])) {
				if (!(key in target)) {
					Object.assign(output, { [key]: source[key] });
				} else {
					output[key] = deepMergeConcatLists(target[key], source[key]);
				}
			} else if (Array.isArray(source[key])) {
				output[key] = target[key] ? deepMergeConcatLists(target[key], source[key]) : source[key];
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
		return output;
	}
	return source;
}
function deepMergeIndex(target, source) {
	if (typeof target !== 'object' || typeof source !== 'object') {
		throw new Error('Both arguments must be objects');
	}
	for (const key in source) {
		if (source.hasOwnProperty(key)) {
			if (target.hasOwnProperty(key)) {
				if (typeof target[key] === 'object' && typeof source[key] === 'object') {
					target[key] = deepMergeIndex(target[key], source[key]);
				} else {
					target[key] = source[key];
				}
			} else {
				target[key] = source[key];
			}
		}
	}
	return target;
}
function deepMergeOverrideLists(target, source) {
	let output = Object.assign({}, source);
	if (isObject(source) && isObject(target)) {
		Object.keys(target).forEach(key => {
			if (isObject(target[key])) {
				if (!(key in source))
					Object.assign(output, { [key]: target[key] });
				else
					output[key] = deepMergeOverrideLists(source[key], target[key]);
			} else {
				Object.assign(output, { [key]: target[key] });
			}
		});
	}
	return output;
}
function deepmerge(target, source, optionsArgument) {
	var array = Array.isArray(source);
	var options = optionsArgument || { arrayMerge: defaultArrayMerge }
	var arrayMerge = options.arrayMerge || defaultArrayMerge
	if (array) {
		return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
	} else {
		return mergeObject(target, source, optionsArgument)
	}
}
function deepmergeOverride(base, drueber) { return mergeOverrideArrays(base, drueber); }

function defaultArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function (e, i) {
		if (typeof destination[i] === 'undefined') {
			destination[i] = cloneIfNecessary(e, optionsArgument)
		} else if (isMergeableObject(e)) {
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) {
			destination.push(cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}
async function deleteEvent(id) {
	let result = await simpleUpload('postEvent', { id });
	delete Items[id];
	mBy(id).remove();
}
function deleteKeyFromLocalSuperdi(k) {
	delete M.superdi[k];
	let fri = item.friendly;
	let lst = M.byFriendly[fri];
	removeInPlace(lst, k); if (isEmpty(lst)) { delete M.byFriendly[fri]; removeInPlace(M.names, fri); }
	for (const cat of item.cats) {
		let lst = M.byCat[cat];
		removeInPlace(lst, k); if (isEmpty(lst)) { delete M.byCat[cat]; removeInPlace(M.categories, cat); }
	}
}
function detectSessionType() {
	let loc = window.location.href;
	DA.sessionType =
		loc.includes('vidulus') ? 'vps' :
			loc.includes('telecave') ? 'telecave' : loc.includes('8080') ? 'php'
				: loc.includes(':40') ? 'nodejs'
					: loc.includes(':60') ? 'flask' : 'live';
	return DA.sessionType;
}
function dict2list(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); } else { o = { value: val }; }
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function disableButton(b) { mClass(toElem(b), 'disabled') }

function disableUI() { mShield('dGameDiv'); }

function doYourThing(inp, grid) {
	let words = extractWords(inp.value, ' ').map(x => x.toLowerCase());
	let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
	let allNames = checklist.map(x => x.name);
	let names = checklist.filter(x => x.checked).map(x => x.name);
	for (const w of words) {
		if (!allNames.includes(w)) {
			let div = mCheckbox(grid, w);
			let chk = div.firstChild;
			chk.checked = true;
			chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
			needToSortChildren = true;
		} else {
			let chk = checklist.find(x => x.name == w);
			if (!chk.checked) chk.checked = true;
		}
	}
	for (const name of names) {
		if (!words.includes(name)) {
			let chk = checklist.find(x => x.name == name);
			chk.checked = false;
		}
	}
	sortCheckboxes(grid);
	words.sort();
	inp.value = words.join(', ') + ', ';
}
function downloadAsText(s, filename, ext = 'txt') {
	saveFileAtClient(
		filename + "." + ext,
		"data:application/text",
		new Blob([s], { type: "" }));
}
function downloadAsYaml(o, filename) {
	let y = jsyaml.dump(o);
	downloadAsText(y, filename, 'yaml');
}
function drag(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoords(ev, $(elem));
	draggedElement = elem;
}
function draw() {
	background(51);
	for (let i = 0; i < tree.length; i++) {
		tree[i].show();
		if (jittering) tree[i].jitter();
	}
	for (let i = 0; i < leaves.length; i++) {
		let l = leaves[i].current;
		noStroke();
		fill(0, 255, 100, 100);
		ellipse(l.x, l.y, 8, 8);
		if (jittering) leaves[i].current.y += random(0, 2);
	}
}
function drawHexBoard(topside, side, dParent, styles = {}, itemStyles = {}, opts = {}) {
	addKeys({ box: true }, styles);
	let dOuter = mDom(dParent, styles, opts);
	let d = mDom(dOuter, { position: 'relative', });
	let [centers, rows, maxcols] = hexBoardCenters(topside, side);
	let [w, h] = mSizeSuccession(itemStyles, 24);
	let gap = valf(opts.gap, -.5);
	let items = [];
	if (gap != 0) copyKeys({ w: w - gap, h: h - gap }, itemStyles);
	for (const c of centers) {
		let dhex = hexFromCenter(d, { x: c.x * w, y: c.y * h }, itemStyles);
		let item = { div: dhex, cx: c.x, cy: c.y, row: c.row, col: c.col };
		items.push(item);
	}
	let [wBoard, hBoard] = [maxcols * w, rows * h * .75 + h * .25];
	mStyle(d, { w: wBoard, h: hBoard });
	return { div: dOuter, topside, side, centers, rows, maxcols, boardShape: 'hex', w, h, wBoard, hBoard, items }
}
function drawPix(ctx, x, y, color = 'red', sz = 5) {
	ctx.fillStyle = color;
	ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz)
}
function drawPixFrame(ctx, x, y, color = 'red', sz = 5) {
	ctx.strokeStyle = color;
	ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz)
}
function drawShape(key, dParent, styles, classes, sizing) {
	if (nundef(styles)) styles = { w: 96, h: 96, bg: 'random' };
	if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
	let d = mDiv(dParent, styles, null, null, classes, sizing);
	if (key == 'circle' || key == 'ellipse') mStyle(d, { rounding: '50%' });
	else mStyle(d, { 'clip-path': PolyClips[key] });
	return d;
}
function drop(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev);
	targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
async function editDetailsFor(key, anchor) {
	let content = valf(lookup(M.details, [key]), {});
	console.log(content)
	let result = await mGather(anchor, {}, { content, type: 'multiText', title: M.superdi[key].friendly });
	if (!result) return;
	let res = await updateDetails(result, key);
}
function empty(arr) {
	let result = arr === undefined || !arr || (isString(arr) && (arr == 'undefined' || arr == '')) || (Array.isArray(arr) && arr.length == 0) || emptyDict(arr);
	testHelpers(typeof arr, result ? 'EMPTY' : arr);
	return result;
}
function emptyDict(obj) {
	let test = Object.entries(obj).length === 0 && obj.constructor === Object;
	return test;
}
function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}
function enableDataDrop(elem, onDropCallback) {
	const originalBorderStyle = elem.style.border;
	elem.addEventListener('dragover', ev => { ev.preventDefault(); }); // Prevent default behavior for dragover and drop events to allow drop
	elem.addEventListener('dragenter', ev => {
		console.log(ev);
		let els = ev.srcElement;
		if (isAncestorOf(els, elem)) return;
		elem.style.border = '2px solid red';
	});
	elem.addEventListener('drop', ev => {
		ev.preventDefault();
		elem.style.border = originalBorderStyle;
		console.log('border', elem.style.border)
		onDropCallback(ev, elem);
	});
}
function enableImageDrop(element, onDropCallback) {
	const originalBorderStyle = element.style.border;
	element.addEventListener('dragover', function (event) {
		event.preventDefault();
	});
	element.addEventListener('dragenter', function (event) {
		element.style.border = '2px solid red';
	});
	element.addEventListener('drop', function (event) {
		event.preventDefault();
		element.style.border = originalBorderStyle;
		const files = event.dataTransfer.files;
		if (files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) { // Check if the dropped file is an image
				onDropCallback(file);
			}
		}
	});
	element.addEventListener('dragleave', function (event) {
		element.style.border = originalBorderStyle;
	});
}
async function encryptData(data) {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);
	const publicKey = await crypto.subtle.importKey(
		'jwk',
		{ kty: 'RSA', e: 'AQAB', n: 'your_public_key_here' },
		{ name: 'RSA-OAEP', hash: 'SHA-256' },
		false,
		['encrypt']
	);
	const encryptedBuffer = await crypto.subtle.encrypt(
		{ name: 'RSA-OAEP' },
		publicKey,
		dataBuffer
	);
	return new Uint8Array(encryptedBuffer).toString();
}
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }

function ensureColorDict() {
	if (isdef(ColorDi)) return;
	ColorDi = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorDi[names[i].toLowerCase()] = { hex: '#' + hexes[i] };
	}
	const newcolors = {
		black: { hex: '#000000', D: 'schwarz' },
		blue: { hex: '#0000ff', D: 'blau' },
		BLUE: { hex: '#4363d8', E: 'blue', D: 'blau' },
		BLUEGREEN: { hex: '#004054', E: 'bluegreen', D: 'blaugrün' },
		BROWN: { hex: '#96613d', E: 'brown', D: 'braun' },
		deepyellow: { hex: '#ffed01', E: 'yellow', D: 'gelb' },
		FIREBRICK: { hex: '#800000', E: 'darkred', D: 'rotbraun' },
		gold: { hex: 'gold', D: 'golden' },
		green: { hex: 'green', D: 'grün' },
		GREEN: { hex: '#3cb44b', E: 'green', D: 'grün' },
		grey: { hex: 'grey', D: 'grau' },
		lightblue: { hex: 'lightblue', D: 'hellblau' },
		LIGHTBLUE: { hex: '#42d4f4', E: 'lightblue', D: 'hellblau' },
		lightgreen: { hex: 'lightgreen', D: 'hellgrün' },
		LIGHTGREEN: { hex: '#afff45', E: 'lightgreen', D: 'hellgrün' },
		lightyellow: { hex: '#fff620', E: 'lightyellow', D: 'gelb' },
		NEONORANGE: { hex: '#ff6700', E: 'neonorange', D: 'neonorange' },
		NEONYELLOW: { hex: '#efff04', E: 'neonyellow', D: 'neongelb' },
		olive: { hex: 'olive', D: 'oliv' },
		OLIVE: { hex: '#808000', E: 'olive', D: 'oliv' },
		orange: { hex: 'orange', D: 'orange' },
		ORANGE: { hex: '#f58231', E: 'orange', D: 'orange' },
		PINK: { hex: 'deeppink', D: 'rosa' },
		pink: { hex: 'pink', D: 'rosa' },
		purple: { hex: 'purple', D: 'lila' },
		PURPLE: { hex: '#911eb4', E: 'purple', D: 'lila' },
		red: { hex: 'red', D: 'rot' },
		RED: { hex: '#e6194B', E: 'red', D: 'rot' },
		skyblue: { hex: 'skyblue', D: 'himmelblau' },
		SKYBLUE: { hex: 'deepskyblue', D: 'himmelblau' },
		teal: { hex: '#469990', D: 'blaugrün' },
		TEAL: { hex: '#469990', E: 'teal', D: 'blaugrün' },
		transparent: { hex: '#00000000', E: 'transparent', D: 'transparent' },
		violet: { hex: 'violet', E: 'violet', D: 'violett' },
		VIOLET: { hex: 'indigo', E: 'violet', D: 'violett' },
		white: { hex: 'white', D: 'weiss' },
		yellow: { hex: 'yellow', D: 'gelb' },
		yelloworange: { hex: '#ffc300', E: 'yellow', D: 'gelb' },
		YELLOW: { hex: '#ffe119', E: 'yellow', D: 'gelb' },
	};
	for (const k in newcolors) {
		let cnew = newcolors[k];
		if (cnew.hex[0] != '#' && isdef(ColorDi[k])) cnew.hex = ColorDi[k].hex;
		ColorDi[k] = cnew;
	}
}
function ensureColorNames() {
	if (isdef(ColorNames)) return;
	ColorNames = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorNames[names[i].toLowerCase()] = '#' + hexes[i];
	}
}
function enterInterruptState() {
	clearTimeouts();
	if (isdef(G.instance)) G.instance.clear();
	auxOpen = true;
}
function error(msg) {
	let fname = getFunctionsNameThatCalledThisFunction();
	console.log(fname, 'ERROR!!!!! ', msg);
}
function evNoBubble(ev) { ev.preventDefault(); ev.cancelBubble = true; }

function evToAttr(ev, attr) {
	let elem = ev.target;
	let val = null;
	while (nundef(val) && isdef(elem)) {
		val = elem.getAttribute(attr);
		if (isdef(val)) return val;
		elem = elem.parentNode;
	}
	return null;
}
function evToAttrElem(ev, attr) {
	let elem = ev.target;
	let val = null;
	while (nundef(val) && isdef(elem)) {
		val = elem.getAttribute(attr);
		if (isdef(val)) return { val, elem };
		elem = elem.parentNode;
	}
	return null;
}
function evToClass(ev, className) {
	let elem = findParentWithClass(ev.target, className);
	return elem;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evalCond(o, condKey, condVal) {
	let func = FUNCTIONS[condKey];
	if (isString(func)) func = window[func];
	if (nundef(func)) {
		if (nundef(o[condKey])) return null;
		if (isList(condVal)) {
			for (const v of condVal) if (o[condKey] == v) return true;
			return null;
		} else {
			return isdef(o[condKey]) ? o[condKey] == condVal : null;
		}
	}
	return func(o, condVal);
}
function evalConds(o, conds) {
	for (const [f, v] of Object.entries(conds)) {
		if (!evalCond(o, f, v)) return false;
	}
	return true;
}
function exitToAddon(callback) {
	AD.callback = callback;
	enterInterruptState(); auxOpen = false;
	AD.run();
}
function extendRect(r4) { r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h; }

function extractColors(s, colors) {
	let words = toWords(s);
	words = words.map(x => strRemoveTrailing(x, 'ish')).map(x => x.toLowerCase());
	if (nundef(colors)) colors = Object.keys(M.colorByName);
	let res = [];
	for (const w of words) {
		for (const c of colors) {
			if (w == c) res.push(c);
		}
	}
	return res;
}
function extractFilesFromHtml(html, htmlfile, ext = 'js') {
	let prefix = ext == 'js' ? 'script src="' : 'link rel="stylesheet" href="';
	let dirhtml = stringBeforeLast(htmlfile, '/');
	let project = stringAfter(dirhtml, '/'); if (project.includes('/')) project = stringBefore(project, '/');
	let parts = html.split(prefix);
	parts.shift();
	let files = parts.map(x => stringBefore(x, '"'));
	files = files.filter(x => !x.includes('alibs/') && !x.includes('assets/'));
	let files2 = [];
	for (const f of files) {
		if (f.startsWith(dirhtml)) { files2.push(f); continue; }
		if (f.startsWith('./')) { files2.push(dirhtml + f.substring(1)); continue; }
		if (f.startsWith('../') && stringCount(dirhtml, '../') == 1) {
			files2.push(f); continue;
		}
		if (!f.includes('/')) { files2.push(dirhtml + '/' + f); continue; }
		if (isLetter(f[0])) { files2.push(dirhtml + '/' + f); continue; }
		console.log('PROBLEM!', f)
	}
	files = files2;
	return files;
}
function extractFoodAndType(s) {
	let carni = ['mouse', 'bird', 'fish', 'beetle', 'spider', 'animal', 'frog', 'lizard', 'worm', 'deer', 'zebra', 'shrimp', 'squid', 'snail'];
	let insecti = ['worm', 'ant', 'insect', 'moth', 'flies', 'grasshopper',]
	let herbi = ['grass', 'grasses', 'leaves', 'fruit', 'flowers', 'grain', 'berries', 'plant', 'bamboo', 'tree', 'wood', 'reed', 'twig', 'crops', 'herbs'];
	s = s.toLowerCase();
	let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
	let di = { herbi, carni, insecti };
	let types = [];
	let contained = [];
	for (const type in di) {
		let arr = di[type];
		for (const a of arr) {
			let w = strRemoveTrailing(a, 's');
			if (words.includes(w)) {
				addIf(contained, a);
				addIf(types, type);
				continue;
			}
		}
	}
	let type;
	for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
		if (s.includes(t)) type = t + 'vorous';
	}
	if (nundef(type)) {
		if (isEmpty(types)) { type = 'unknown' }
		if (types.includes('herbi') && types.length >= 2) type = 'omnivorous';
		else if (types.length >= 2) type = 'carnivorous';
		else type = types[0] + 'vorous';
	}
	return [contained, type];
}
function extractFoodType(s, easy = true, key = null) {
	s = s.toLowerCase();
	let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
	if (easy) {
		for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
			if (s.includes(t)) return t + 'vorous';
		}
	}
	let herbi = M.byCat.plant; herbi = herbi.concat(['plant', 'berries', 'grasses', 'leave', 'tree', 'twig', 'fruit', 'grass', 'grain']);
	let carni = M.byCat.animal; carni = carni.concat(['animal'])
	let insecti = ['insect', 'worm', 'ant', 'fly', 'flies']
	let di = { herbi, carni, insecti };
	let types = [];
	let contained = [];
	for (const type in di) {
		let arr = di[type];
		for (const a of arr) {
			let w = strRemoveTrailing(a, 's'); //console.log('w',w)
			let o = M.superdi[a];
			if (isdef(o) && words.includes(o.friendly) || words.includes(w)) {
				let cont = {};
				if (o) { cont.key = a; cont.cats = o.cats; cont.friendly = o.friendly }
				else cont.key = w;
				addIf(contained, cont);
				addIf(types, type);
				continue;
			}
		}
	}
	if (isEmpty(types)) { return 'unknown' }
	if (types.includes('herbi') && types.length >= 2) return 'omnivorous';
	else if (types.length >= 2) return 'carnivorous';
	else return types[0] + 'vorous';
}
function extractFoods(s) {
	s = s.toLowerCase();
	let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
	let herbi = M.byCat.plant; herbi = herbi.concat(['plant', 'berries', 'grasses', 'leave', 'tree', 'twig', 'fruit', 'grass', 'grain']);
	let carni = M.byCat.animal; carni = carni.concat(['animal'])
	let insecti = ['insect', 'worm', 'ant', 'fly', 'flies']
	let di = { herbi, carni, insecti };
	let types = [];
	let contained = [];
	for (const type in di) {
		let arr = di[type];
		for (const a of arr) {
			let w = strRemoveTrailing(a, 's'); //console.log('w',w)
			let o = M.superdi[a];
			if (isdef(o) && words.includes(o.friendly) || words.includes(w)) {
				let cont = {};
				if (o) { cont.key = a; cont.cats = o.cats; cont.friendly = o.friendly }
				else cont.key = w;
				addIf(contained, cont);
				addIf(types, type);
				continue;
			}
		}
	}
	return [contained, types];
}
function extractHabitat(str, ignore = []) {
	let s = str.toLowerCase();
	let habit = [];
	let di = M.habitat;
	for (const k in di) {
		if (k == 'geo') continue;
		for (const hab of di[k]) {
			if (ignore.includes(hab)) continue;
			if (s.includes(hab)) { addIf(habit, k); break; }
		}
	}
	return habit;
}
function extractSpecies(s) {
	s = s.toLowerCase();
	let words = toWords(s);
	if (words.length <= 2) { s = s.replace('suborder', ''); s = s.replace('genus', ''); return s.trim(); }
	s = s.replace(' x ', ', ');
	if (s.includes('hybrid')) return s;
	if (s.includes('including')) return arrTake(toWords(stringAfter(s, 'including')), 2).join(' ');
	if (s.includes('suborder')) return wordAfter(s, 'suborder');
	let firstTwo = arrTake(words, 2).join(' '); //console.log(slower);
	return firstTwo;
}
function extractTime(input) {
	const regex = /\b([0-9]|1[0-9]|2[0-3])[h:]*\S*\b/g;
	const match = input.match(regex);
	if (match) {
		let time = match[0];
		let text = input.replace(time, '').trim();
		return [time, text];
	} else {
		return ['', input];
	}
}
function extractWords(s, allowed) {
	let specialChars = toLetters(' ,-.!?;:');
	if (isdef(allowed)) specialChars = arrMinus(specialChars, toLetters(allowed));
	let parts = splitAtAnyOf(s, specialChars.join('')).map(x => x.trim());
	return parts.filter(x => !isEmpty(x));
}
function fillFormFromObject(inputs, wIdeal, df, db, styles, opts) {
	let popup = mDom(df, { margin: 10 }); //mPopup(df, { margin: 100 }); //mStyle(popup,{left:10})
	mDom(popup, {}, { html: 'paste your information into the text area' })
	let ta = mDom(popup, {}, { tag: 'textarea', rows: 20, cols: 80 });
	let b = mButton('Parse To Form', () => { onclickPasteDetailObject(ta.value, inputs, wIdeal, df, styles, opts); }, db, { maright: 10 }, 'button', 'bParseIntoForm');
	mInsert(db, b);
}
function fillMultiForm(dict, inputs, wIdeal, df, styles, opts) {
	mClear(df);
	for (const k in dict) {
		let [content, val] = [k, dict[k]]; console.log(content, val)
		mDom(df, {}, { html: `${content}:` });
		let inp = mDom(df, styles, opts);
		inp.rows = calcRows(styles.fz, styles.family, val, wIdeal);
		inp.value = val;
		inputs.push({ name: content, inp: inp });
		mNewline(df)
	}
}
function findAllFoodTypes() {
	let res = [];
	for (const k in M.details) {
		let o = M.details[k];
		let food = o.food.toLowerCase();
		let type = null;
		for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
			if (food.includes(t)) type = t;
		}
		if (!type) type = food;
		addIf(res, type);
	}
	return res;
}
function findAttributeInAncestors(elem, attr) {
	let val;
	while (elem && nundef(val = elem.getAttribute(attr))) { elem = elem.parentNode; }
	return val;
}
function findBottomLine(ct, w, h, cgoal) {
	let [_, restlist] = findPointsBoth(ct, 0, w, h - 30, h, cgoal, 20);
	let o = nextLine(ct, restlist, 'green');
	return o.val;
}
function findColor(colorhex) {
	let x, y;
	colormap = document.getElementById("colormap");
	areas = colormap.getElementsByTagName("area");
	for (i = 0; i < areas.length; i++) {
		areacolor = areas[i].getAttribute("onmouseover").replace('mouseOverColor("', '');
		areacolor = areacolor.replace('")', '');
		if (areacolor.toLowerCase() == colorhex) {
			cc = areas[i].getAttribute("onclick").replace(')', '').split(",");
			y = Number(cc[1]);
			x = Number(cc[2]);
		}
	}
	return [x, y];
}
function findDarkBars(ctx, w, h, cgoal, diffleft, diffright) {
	let [restlist, _] = findPoints(ctx, 0, w, 0, h, cgoal, 20);
	let num = 201;
	let colors = ['yellow', 'orange', 'red', 'pink', 'violet', 'blue', 'teal', 'green', 'sienna', 'grey', 'black'], i = 0;
	let res = [];
	while (num > 100 && i < colors.length) {
		let color = colors[i++];
		let o = nextBar(ctx, restlist, color);
		restlist = o.rest;
		num = o.line.length;
		res.push(o)
	}
	console.log('result', res);
	let diff = 243;
	let cand = res.filter(o => o.val >= 40 && o.val <= 500);
	let [kleinere, groessere] = findMidlines(cand, diff);
	let topmost, bottommost;
	for (const l3 of res) {
		let distleft = kleinere.val - l3.val;
		let distright = l3.val - groessere.val;
		if (isWithinDelta(distleft, diffleft, 2)) {
			topmost = l3;
		}
		if (isWithinDelta(distright, diffright, 2)) {
			bottommost = l3;
		}
	}
	let [ytop, ybottom] = [nundef(topmost) ? 0 : topmost.val, nundef(bottommost) ? w : bottommost.val]
	return [ytop, kleinere.val, groessere.val, ybottom, topmost, kleinere, groessere, bottommost];
}
function findDarkLines(ctx, w, h, cgoal) {
	let [_, restlist] = findPoints(ctx, 0, w, 0, h, cgoal, 20);
	let y, num = 201;
	let colors = ['yellow', 'orange', 'red', 'pink', 'violet', 'blue', 'crimson', 'seagreen', 'skyblue', 'teal', 'green', 'sienna', 'grey', 'black'], i = 0;
	let res = [];
	while (i < colors.length) {
		let color = colors[i++];
		let o = nextLine(ctx, restlist, color);
		if (!o.line) { console.log('o', o); break; }
		restlist = o.rest;
		num = o.line.length;
		if (num > 112) res.push(o)
	}
	console.log('result', res);
	let diff = 261, diff2 = 22;
	let [kleinere, groessere] = findMidlines(res, diff);
	let topmost, bottommost;
	for (const l3 of res) {
		if (isWithinDelta(kleinere.val - l3.val, diff2, 2)) {
			topmost = l3;
		}
		if (isWithinDelta(l3.val - groessere.val, diff2, 2)) {
			bottommost = l3;
		}
	}
	let [ytop, ybottom] = [nundef(topmost) ? 0 : topmost.val, nundef(bottommost) ? h : bottommost.val]
	return [ytop, kleinere.val, groessere.val, ybottom, topmost, kleinere, groessere, bottommost];
}
function findDragTarget(ev) {
	let targetElem = ev.target;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	return targetElem;
}
function findEdgeHor(ctx, x1, x2, h, cgoal, lighting = true) {
	let [list, _] = findPoints(ctx, x1, x2, 0, h, cgoal, 20);
	if (lighting) list = list.filter(o => isLightAfter(ctx, o.x, o.y) && isLightBefore(ctx, o.x, o.y));
	let vfreq = findMostFrequentVal(list, 'x');
	return list.filter(o => o.x == vfreq);
}
function findEdgeVert(ctx, y1, y2, w, cgoal, lighting = true) {
	let [_, list] = findPoints(ctx, 0, w, y1, y2, cgoal, 20);
	let vfreq = findMostFrequentVal(list, 'y');
	return list.filter(o => o.y == vfreq);
}
function findEdgesApart(list, dx, dy, prop) {
	list.map(o => o.nei = findPointAtDistance(o, dx, dy, list, 10))
	list = list.filter(o => o.nei)
	let vfreq = findMostFrequentVal(list, prop); console.log(prop, vfreq)
	let good = list.filter(o => isWithinDelta(o[prop], vfreq, 3));
	let rest = list.filter(o => !isWithinDelta(o[prop], vfreq, 3));
	vfreq = findMostFrequentVal(rest, prop); console.log(prop, vfreq)
	let good2 = list.filter(o => o[prop] == vfreq);
	list = good.concat(good2);
	return list;
}
function findLeftLine(ct, w, h, cgoal, xStart = 0) {
	let [restlist, _] = findPointsBoth(ct, xStart, xStart + 40, 0, h, cgoal, 20);
	let o = nextBar(ct, restlist, 'red');
	return o.val;
}
function findMidlines(res, diff) {
	let mid1, mid2;
	for (const l1 of res) {
		for (const l2 of res) {
			if (isWithinDelta(Math.abs(l1.val - l2.val), diff, 2)) {
				mid1 = l1; mid2 = l2;
			}
		}
		if (isdef(mid1)) break;
	}
	let kleinere = mid1.val < mid2.val ? mid1 : mid2;
	let groessere = mid1 == kleinere ? mid2 : mid1;
	return [kleinere, groessere];
}
function findMostFrequentVal(arr, prop, delta = 0) {
	if (!Array.isArray(arr) || arr.length === 0) {
		return null;
	}
	let frequencyMap = new Map();
	for (let i = 0; i < arr.length; i++) {
		const val = arr[i][prop];
		frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
	}
	let mostFrequentY;
	let maxFrequency = 0;
	for (let [val, frequency] of frequencyMap) {
		if (frequency > maxFrequency) {
			mostFrequentY = val;
			maxFrequency = frequency;
		}
	}
	return mostFrequentY;
}
function findNextBar(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
	for (let x = x1; x < x2; x++) {
		for (let y = y1; y < y2; y++) {
			let c = isPix(ctx, x, y, cgoal, delta);
			if (c) {
				drawPixFrame(ctx, x - 1, y - 1, 'red', 3)
				let len = 1, yy = y + 1; xx = x;
				while (yy < y2) {
					let p = getPixRgb(ctx, xx, yy);
					let c1 = isPix(ctx, xx, yy, cgoal, delta + 10);
					yy++;
					if (c1) len++;
				}
				return { c, x, y, len };
			}
		}
	}
}
function findNextLine(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
	for (let y = y1; y < y2; y++) {
		for (let x = x1; x < x2; x++) {
			let c = isPix(ctx, x, y, cgoal, delta);
			if (c) {
				drawPixFrame(ctx, x - 1, y - 1, 'red', 3)
				let len = 1, xx = x + 1; yy = y;
				while (xx < x2) {
					let p = getPixRgb(ctx, xx, yy);
					let c1 = isPix(ctx, xx, yy, cgoal, delta + 10);
					xx++;
					if (c1) len++;
				}
				return { c, x, y, len };
			}
		}
	}
}
function findParentWithClass(elem, className) { while (elem && !mHasClass(elem, className)) { elem = elem.parentNode; } return elem; }

function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }

function findPointAtDistance(pt, dx, dy, list, delta = 0) {
	for (const p1 of list) {
		if (isWithinDelta(Math.abs(pt.x - p1.x), dx, delta) && isWithinDelta(Math.abs(pt.y - p1.y), dy, delta)) return p1;
	}
	return null;
}
function findPoints(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
	let p;
	let resy = [], resx = [];
	for (let y = y1; y < y2; y++) {
		for (let x = x1; x < x2; x++) {
			p = isPixDark(ctx, x, y);
			if (p) {
				let l = isLightBeforeV(ctx, x, y);
				let d = isLightAfterV(ctx, x, y);
				if (l || d) resy.push({ x, y })
				l = isLightBefore(ctx, x, y);
				d = isLightAfter(ctx, x, y);
				if (l || d) resx.push({ x, y })
			}
		}
	}
	return [resx, resy];
}
function findPointsBoth(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
	let p;
	let resy = [], resx = [];
	for (let y = y1; y < y2; y++) {
		for (let x = x1; x < x2; x++) {
			p = isPix(ctx, x, y, cgoal, delta);
			if (p) {
				let l = isLightBeforeV(ctx, x, y);
				let d = isLightAfterV(ctx, x, y);
				if (l && d) resy.push({ x, y })
				l = isLightBefore(ctx, x, y);
				d = isLightAfter(ctx, x, y);
				if (l && d) resx.push({ x, y })
			}
		}
	}
	return [resx, resy];
}
function findRectSample(ctx, x1, x2, y1, y2, cgoal, sz = 4, lightCounts = false) {
	let p;
	for (let yStart = y1; yStart <= y2; yStart += sz) {
		for (let xStart = x1; xStart <= x2; xStart += sz) {
			let found = true;
			for (let x = xStart; x < xStart + sz; x++) {
				for (let y = yStart; y < yStart + sz; y++) {
					p = isPix(ctx, x, y, cgoal, 20);
					if (lightCounts && isPix(ctx, x, y, 'white', 10)) p = true;
					if (!p) { found = false; break; }
				}
				if (!found) break;
			}
			if (found) return true;
		}
	}
	return false;
}
function findRightLine(ct, w, h, cgoal) {
	let [restlist, _] = findPointsBoth(ct, w - 40, w, 0, h, cgoal, 20);
	let o = nextBar(ct, restlist, 'orange');
	return o.val;
}
function findTopLine(ct, w, h, cgoal) {
	let [_, restlist] = findPointsBoth(ct, 0, w, 0, 40, cgoal, 20);
	let o = nextLine(ct, restlist, 'blue');
	return o.val;
}
function findUniqueSuperdiKey(friendly) {
	console.log('friendly', friendly)
	let name = friendly;
	let i = 1;
	let imgname = null;
	while (true) {
		let o = M.superdi[name];
		if (nundef(o)) { break; }
		console.log(o.colls.includes('emo'))
		if (isdef(o.img) && isdef(o.photo) || ['emo', 'fa6', 'icon'].every(x => !o.colls.includes(x))) { name = friendly + (i++); continue; }
		else if (isdef(o.img)) { imgname = 'photo'; break; }
		else { imgname = 'img'; break; }
	}
	return [name, imgname];
}
function first(arr) {
	return arr.length > 0 ? arr[0] : null;
}
function firstCond(arr, func) {
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;
	}
	return null;
}
function firstCondDictKeys(dict, func) {
	for (const k in dict) { if (func(k)) return k; }
	return null;
}
function firstNumber(s) {
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function fisherYates(arr) {
	if (arr.length == 2 && coin()) { return arr; }
	var rnd, temp;
	let last = arr[0];
	for (var i = arr.length - 1; i; i--) {
		rnd = Math.random() * i | 0;
		temp = arr[i];
		arr[i] = arr[rnd];
		arr[rnd] = temp;
	}
	return arr;
}
function fishgame() {
	function setup(table) { wsSetup(table); }
	function stats(table) { wsStats(table); }
	function present(table) { wsPresent(table); }
	async function activate(table, items) {
		await instructionStandard(table, 'may pick your initial cards'); //browser tab and instruction if any
		for (const item of items) {
			let d = iDiv(item);
			d.onclick = wsOnclickCard;
		}
		return;
		if (!isMyTurn(table)) { return; }
		for (const item of items) {
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = ev => onclickCard(table, item, items);
		}
		if (isEmpty(table.fen.cards)) return gameoverScore(table);
		if (amIHuman(table) && table.options.gamemode == 'multi') return;
		let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : getUname();
		if (nundef(name)) return;
		await botMove(name, table, items);
	}
	async function botMove(name, table, items) {
		let ms = rChoose(range(2000, 5000));
		TO.bot = setTimeout(async () => {
			let item = rChoose(items);
			toggleItemSelection(item);
			TO.bot1 = setTimeout(async () => await evalMove(name, table, item.key), 500);
		}, rNumber(ms, ms + 2000));
	}
	async function onclickCard(table, item, items) {
		toggleItemSelection(item);
		try { await mSleep(200); } catch (err) { return; }
		await evalMove(getUname(), table, item.key);
	}
	async function evalMove(name, table, key) {
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let id = table.id;
		let step = table.step;
		let best = arrMinMax(table.fen.cards).min;
		let succeed = key == best;
		if (succeed) {
			table.players[name].score += 1;
			let fen = table.fen;
			let newCards = deckDeal(fen.deck, 1);
			if (newCards.length > 0) arrReplace1(fen.cards, key, newCards[0]); else removeInPlace(fen.cards, key);
		} else {
			table.players[name].score -= 1;
		}
		lookupAddToList(table, ['moves'], { step, name, move: key, change: succeed ? '+1' : '-1', score: table.players[name].score });
		let o = { id, name, step, table };
		if (succeed) o.stepIfValid = step + 1;
		let res = await mPostRoute('table', o);
	}
	return { setup, present, stats, activate };
}
function fleetingMessage(msg, d, styles, ms, fade) {
	if (isString(msg)) {
		dFleetingMessage.innerHTML = msg;
		mStyle(dFleetingMessage, styles);
	} else {
		mAppend(dFleetingMessage, msg);
	}
	if (fade) Animation1 = mAnimate(dFleetingMessage, 'opacity', [1, .4, 0], null, ms, 'ease-in', 0, 'both');
	return dFleetingMessage;
}
function formatLegend(key) {
	return key.includes('per') ? stringBefore(key, '_') + '/' + stringAfterLast(key, '_')
		: key.includes('_') ? replaceAll(key, '_', ' ') : key;
}
function from01ToPercent(x) { return Math.round(Number(x) * 100); }

function fromNormalized(s, sep = '_') {
	let x = replaceAll(s, sep, ' ');
	let words = toWords(x).map(x => capitalize(x)).join(' ');
	return words;
}
function fromPercent(n, total) { return Math.round(n * total / 100); }

function fromPercentTo01(x, nDecimals = 2) { return Number((Number(x) / 100).toFixed(nDecimals)); }

function gBg(g, color) { g.setAttribute('fill', color); }

function gCanvas(area, w, h, color, originInCenter = true) {
	let dParent = mBy(area);
	let div = stage3_prepContainer(dParent);
	div.style.width = w + 'px';
	div.style.height = h + 'px';
	let svg = gSvg();
	let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;`
	svg.setAttribute('style', style);
	mColor(svg, color);
	div.appendChild(svg);
	let g = gG();
	if (originInCenter) g.style.transform = "translate(50%, 50%)";
	svg.appendChild(g);
	return g;
}
function gCreate(tag) { return document.createElementNS('http:/' + '/www.w3.org/2000/svg', tag); }

function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }

function gFg(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }

function gHex(w, h) { let pts = size2hex(w, h); return gPoly(pts); }

function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }

function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }

function gPos(g, x, y) { g.style.transform = `translate(${x}px, ${y}px)`; }

function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }

function gRounding(r, rounding) {
	r.setAttribute('rx', rounding);
	r.setAttribute('ry', rounding);
}
function gSet() {
	function set_fen() {
		let items = Session.items;
		let fen = items.map(x => x.fen).join(',');
		return fen;
	}
	function set_prompt(g, fen) {
		let [n, rows, cols] = [g.num_attrs, g.rows, g.cols];
		let all_attrs = gSet_attributes();
		let attrs_in_play = arrTake(get_keys(all_attrs), n);
		let deck = g.deck = make_set_deck(n);
		shuffle(deck);
		let goal = Goal = { set: make_goal_set(deck, g.prob_different), cards: [] };
		let dCards = stdRowsColsContainer(dTable, cols, styles = { bg: 'transparent' });
		let card_styles = { w: cols > 4 ? 130 : 160 };
		let items = g.items = [];
		let deck_rest = arrWithout(deck, goal.set);
		let fens = choose(deck_rest, rows * cols - 3);
		let all_fens = goal.set.concat(fens);
		shuffle(all_fens);
		if (isdef(fen)) { all_fens = fen.split(','); }
		for (const f of all_fens) {
			let item = create_set_card(f, dCards, card_styles);
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = set_interact;
			if (Goal.set.includes(item.fen)) Goal.cards.push(item);
			items.push(item);
		}
		g.selected = [];
		return items;
	}
	function set_interact(ev) {
		ev.cancelBubble = true;
		if (!canAct()) { console.log('no act'); return; }
		let id = evToId(ev);
		if (isdef(Items[id])) {
			let item = Items[id];
			toggleSelectionOfPicture(item, Session.selected);
			if (Session.selected.length == 3) {
				let correct = check_complete_set(Session.selected.map(x => x.fen));
				if (correct) {
					Selected = { isCorrect: true, feedbackUI: Session.selected.map(x => iDiv(x)) };
				} else {
					Selected = { isCorrect: false, correctUis: Goal.cards.map(x => iDiv(x)), feedbackUI: null, animation: 'onPulse1' };
				}
				set_eval();
			}
		}
	}
	function set_eval() {
		if (!canAct()) return;
		uiActivated = false; clear_timeouts();
		IsAnswerCorrect = Selected.isCorrect;
		race_set_fen();
		race_update_my_score(IsAnswerCorrect ? 1 : 0);
		let delay = show_feedback(IsAnswerCorrect);
		setTimeout(() => {
			in_game_open_prompt_off();
			clear_table_events();
			race_send_move();
		}, delay);
	}
	return {
		prompt: set_prompt,
		fen: set_fen,
	}
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
	let el = gG();
	if (nundef(shape)) shape = 'rect';
	if (shape != 'line') agColoredShape(el, shape, w, h, color);
	else gStroke(el, color, w);
	if (isdef(rounding) && shape == 'rect') {
		let r = el.children[0];
		gRounding(r, rounding);
	}
	return el;
}
function gSize(g, w, h, shape = null, iChild = 0) {
	let el = (getTypeOf(g) != 'g') ? g : g.children[iChild];
	let t = getTypeOf(el);
	switch (t) {
		case 'rect': el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2); break;
		case 'ellipse': el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2); break;
		default:
			if (shape) {
				switch (shape) {
					case 'hex': let pts = size2hex(w, h); el.setAttribute('points', pts); break;
				}
			}
	}
	return el;
}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }

function gSvg() { return gCreate('svg'); }

async function gameoverScore(table) {
	table.winners = getPlayersWithMaxScore(table);
	table.status = 'over';
	table.turn = [];
	let id = table.id;
	let name = getUname();
	let step = table.step;
	let stepIfValid = step + 1;
	let o = { id, name, step, stepIfValid, table };
	let res = await mPostRoute('table', o); //console.log(res);
}
function generateEventId(tsDay, tsCreated) { return `${rLetter()}_${tsDay}_${tsCreated}`; }

function generatePizzaSvg(sz) {
	let colors = Array.from(arguments).slice(1);
	let numSlices = colors.length;
	const radius = sz / 2;
	const centerX = radius;
	const centerY = radius;
	const angleStep = (2 * Math.PI) / numSlices;
	const svgParts = [];
	svgParts.push(`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">`);
	for (let i = 0; i < numSlices; i++) {
		const startAngle = i * angleStep;
		const endAngle = (i + 1) * angleStep;
		const x1 = centerX + radius * Math.cos(startAngle);
		const y1 = centerY + radius * Math.sin(startAngle);
		const x2 = centerX + radius * Math.cos(endAngle);
		const y2 = centerY + radius * Math.sin(endAngle);
		const largeArcFlag = angleStep > Math.PI ? 1 : 0;
		const pathData = [
			`M ${centerX},${centerY}`, // Move to the center
			`L ${x1},${y1}`,           // Line to the start of the arc
			`A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`, // Arc to the end of the slice
			`Z`                        // Close the path
		].join(' ');
		svgParts.push(`<path d="${pathData}" fill="${colors[i]}" />`);
	}
	svgParts.push('</svg>');
	return svgParts.join('\n');
}
function generateRandomWords(n, unique = false) {
	const sampleWords = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'victoria plum', 'watermelon', 'xigua', 'yuzu', 'zucchini'];
	let randomWords = [];
	for (let i = 0; i < n; i++) {
		const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];
		randomWords.push(randomWord);
	}
	return randomWords;
}
function generateTableId() { return rUniqueId(20); }

function generateTableName(n) {
	let existing = Serverdata.tables.map(x => x.friendly);
	while (true) {
		let cap = rChoose(M.capital);
		let parts = cap.split(' ');
		if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
		cap = cap.trim();
		let arr = ['battle of ', 'rally of ', 'showdown in ', 'summit of ', 'joust of ', 'tournament of ', 'rendezvous in ', 'soirée in ', 'festival of '];//,'encounter in ']; //['battle of ', 'war of ']
		let s = (n == 2 ? 'duel of ' : rChoose(arr)) + cap;
		if (!existing.includes(s)) return s;
	}
}
function getAbstractSymbol(n) {
	if (nundef(n)) n = rChoose(range(1, 100));
	else if (isList(n)) n = rChoose(n);
	return `abstract_${String(n).padStart(3, '0')}`;
}
function getAllHabitats() {
	let res = [];
	for (const k in M.details) {
		let hab = M.details[k].habitat;
		toWords(hab.toLowerCase()).map(x => addIf(res, x));
	}
	res.sort();
	return res;
}
function getBar(ctx, list, val) {
	let res = list.filter(p => isWithinDelta(p.x, val, 2) && (isLightBefore(ctx, p.x, p.y) || isLightAfter(ctx, p.x, p.y)));
	return res;
}
function getBeautifulColors() {
	let res = getColormapColors();
	res = res.concat(colorSchemeRYB());
	res = res.concat(levelColors.concat(modernColors.concat(Object.values(playerColors).concat(vibrantColors.concat(childrenRoomColors.concat(deepRichColors)))))).map(x => w3color(x));
	for (const o of res) o.hex = o.toHexString();
	return res;
}
function getBestContrastingColor(color) {
	let [r, g, b] = colorHexToRgbArray(colorFrom(color));
	let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return (yiq >= 128) ? '#000000' : '#FFFFFF';
}
function getBlendCSS(blcanvas) {
	const blendModes = {
		'source-over': 'normal',
		'lighter': 'normal',
		'copy': 'normal'
	};
	return valf(blendModes[blcanvas], blcanvas);
}
function getBlendCanvas(blendMode = 'normal') {
	const blendModeMapping = {
		'normal': 'source-over',       // Default blending mode
		'multiply': 'multiply',
		'screen': 'screen',
		'overlay': 'overlay',
		'darken': 'darken',
		'lighten': 'lighten',
		'color-dodge': 'color-dodge',
		'saturation': 'saturation',
		'color': 'color',
		'luminosity': 'luminosity',
		'pass-through': 'source-over' // This is a made-up value for cases where no blending is applied
	};
	return valf(blendModeMapping[blendMode], blendMode);
}
function getBlendModesCSS() {
	return 'normal|multiply|screen|overlay|darken|lighten|color-dodge|saturation|color|luminosity'.split('|');
}
function getBlendModesCanvas() {
	const blendModes = [
		'source-over',
		'lighter',
		'copy',
		'multiply',
		'screen',
		'overlay',
		'darken',
		'lighten',
		'color-dodge',
		'color-burn',
		'hard-light',
		'soft-light',
		'difference',
		'exclusion',
		'hue',
		'saturation',
		'color',
		'luminosity'
	];
	return blendModes;
}
function getBrowser() {
	var userAgent = navigator.userAgent;
	if (userAgent.match(/chrome|chromium|crios/i)) {
		return "Chrome";
	}
	else if (userAgent.match(/firefox|fxios/i)) {
		return "Firefox";
	}
	else if (userAgent.match(/safari/i)) {
		return "Safari";
	}
	else if (userAgent.match(/msie|trident/i)) {
		return "Internet Explorer";
	}
	else if (userAgent.match(/edg/i)) {
		return "Edge";
	}
	else {
		return "Other";
	}
}
function getButtonCaptionName(name) { return `bTest${name}`; }

function getButtonCaptionNames(table) { return isdef(table) ? table.playerNames : ['felix', 'gul', 'amanda', 'lauren', 'mimi']; }

function getButtonId(key) { return 'b' + capitalize(key); }

function getCSSVariable(varname) { return getCssVar(varname); }

async function getCanvasCtx(d, styles = {}, opts = {}) {
	opts.tag = 'canvas';
	let cv = mDom(d, styles, opts);
	let ctx = cv.getContext('2d');
	let fill = valf(styles.fill, styles.bg);
	if (fill) {
		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, cv.width, cv.height);
	}
	let bgBlend = styles.bgBlend;
	if (bgBlend) ctx.globalCompositeOperation = bgBlend;
	let src = valf(opts.src, opts.path);
	if (src) {
		let isRepeat = src.includes('ttrans');
		let imgStyle = isRepeat ? {} : { w: cv.width, h: cv.height };
		let img = await imgAsync(null, imgStyle, { src });
		if (bgBlend) ctx.globalCompositeOperation = bgBlend;
		if (isRepeat) {
			const pattern = ctx.createPattern(img, 'repeat');
			ctx.fillStyle = pattern;
			ctx.fillRect(0, 0, cv.width, cv.height);
		} else ctx.drawImage(img, 0, 0, cv.width, cv.height);
	}
	return { cv, ctx };
}
function getCheckedNames(dParent) {
	let checks = Array.from(dParent.querySelectorAll('input[type="checkbox"]')); //dParent.getElementsByTagName('input'));
	let res = [];
	for (const ch of checks) {
		if (ch.checked) res.push(ch.name);
	}
	return res;
}
function getCheckedRadios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		if (ch.checked) list.push(ch.value);
	}
	return list;
}
function getCivSpot(civ, row, col, fact = 1) {
	let rAdvisor = { x: 11, y: 27, w: 87, h: 136 }; //von persia
	let rColony1 = { x: 10, y: 193, w: 87, h: 137 }; //von japan
	let rColony2 = { x: 122, y: 192, w: 87, h: 136 }; //von india
	let rColonyUpPersia = { x: 122, y: 26, w: 87, h: 136 }; //von portugal
	let rBuilding1 = { x: 132, y: 26, w: 87, h: 136 }; //von portugal
	let rBuilding1Persia = { x: 243, y: 26, w: 87, h: 136 }; //von persia
	let rBuilding2 = { x: 243, y: 28, w: 87, h: 136 };
	let dxBuildings = rBuilding2.x - (rBuilding1.x + rBuilding1.w);
	let rWic = { x: 700, y: 26, w: 87, h: 136 }; //calculated
	let rLastWonder = { x: 700, y: 193, w: 87, h: 136 };
	let rWonder = { x: 674, y: 193, w: 87, h: 136 };
	let dxWonders = 25;
	for (const r of [rAdvisor, rColony1, rColony2, rColonyUpPersia, rBuilding1, rBuilding1Persia, rBuilding2, rWic, rLastWonder, rWonder]) {
		r.x *= fact; r.y *= fact; r.w *= fact; r.h *= fact;
	}
	dxBuildings *= fact;
	dxWonders *= fact;
	if (row == 0 && col == 0) return rAdvisor;
	if (row == 0 && col == 1 && civ == 'persia') return rColonyUpPersia;
	if (row == 0 && col == 1) return rBuilding1;
	if (row == 0 && col == 2 && civ == 'persia') return rBuilding1Persia;
	if (row == 0 && col == 2) return rBuilding2;
	if (row == 0 && col == 6) return rWic;
	let r, dist;
	if (row == 0) {
		r = rBuilding2;
		dist = dxBuildings + r.w
		return { x: r.x + dist * (col - 2), y: r.y, w: r.w, h: r.h };
	}
	if (row == 1 && col == 0) return rColony1;
	if (row == 1 && col == 1 && civ != 'china' && civ != 'poland') return rColony2;
	if (row == 1 && col == 6) return rLastWonder;
	r = rLastWonder;
	dist = dxWonders + r.w;
	return { x: r.x - dist * (6 - col), y: r.y, w: r.w, h: r.h };
}
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
}
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
}
function getColormapColors() {
	let s = colormapAsStringOrig();
	let parts = s.split('clickColor("');
	let colors = [];
	for (const p of parts) { if (p.startsWith('#')) colors.push(p.substring(0, 7)); }
	return colors;
}
function getCssVar(varname) { return getComputedStyle(document.body).getPropertyValue(varname); }

function getDetailedSuperdi(key) {
	let o = M.superdi[key];
	let details = valf(M.details[key], M.details[o.friendly]);
	if (nundef(details)) return null;
	addKeys(details, o);
	o.key = key;
	o.class = o.class.toLowerCase();
	if (isdef(o.lifespan)) o.olifespan = calcLifespan(o.lifespan);
	if (isdef(o.food)) {
		[o.foodlist, o.foodtype] = extractFoodAndType(o.food);
		let foodTokens = [];
		if (['berries', 'fruit'].some(x => o.foodlist.includes(x))) foodTokens.push('cherries');
		if (['fish', 'shrimp', 'squid'].some(x => o.foodlist.includes(x))) foodTokens.push('fish');
		if (['wheat', 'grain', 'crops'].some(x => o.foodlist.includes(x))) foodTokens.push('grain');
		if (o.foodtype.startsWith('insect')) foodTokens.push('worm');
		else if (o.foodtype.startsWith('carni')) foodTokens.push('mouse');
		else if (o.foodtype.startsWith('omni')) foodTokens.push('omni');
		else if (o.foodtype.startsWith('herbi')) foodTokens.push('seedling');
		o.foodTokens = arrTake(foodTokens, 3);
	}
	if (isdef(o.offsprings)) o.ooffsprings = calcOffsprings(o.offsprings);
	if (isdef(o.weight)) { o.oweight = calcWeight(o.weight); o.nweight = o.oweight.avg; }
	if (isdef(o.size)) { o.osize = calcSize(o.size); o.nsize = o.osize.avg; }
	if (isdef(o.species)) {
		let x = o.species; o.longSpecies = x; o.species = extractSpecies(x);
	}
	if (isdef(o.habitat)) {
		let text = o.habitat;
		let hlist = o.hablist = extractHabitat(text, ['coastal']);
		let habTokens = [];
		if (['wetland'].some(x => hlist.includes(x))) { habTokens.push('wetland'); } //colors.push('lightblue'); imgs.push('../assets/games/wingspan/wetland.png'); }
		if (['dwellings', 'grassland', 'desert'].some(x => hlist.includes(x))) { habTokens.push('grassland'); } //{ colors.push('goldenrod'); imgs.push('../assets/games/wingspan/grassland2.png'); }
		if (['forest', 'mountain', 'ice'].some(x => hlist.includes(x))) { habTokens.push('forest'); } //{ colors.push('emerald'); imgs.push('../assets/games/wingspan/forest1.png'); }
		o.habTokens = habTokens;
	}
	let colors = ['turquoise', 'bluegreen', 'teal', 'brown', 'gray', 'green', 'violet', 'blue', 'black', 'yellow', 'white', 'lavender', 'orange', 'buff', 'red', 'pink', 'golden', 'cream', 'grey', 'sunny', 'beige'];
	if (isdef(o.color)) o.colors = extractColors(o.color, colors);
	o = sortDictionary(o);
	return o;
}
function getDetails(key) {
	let o = getSuperdi(key);
	let de = valf(M.details[key], M.details[o.friendly]);
	return valf(de, {});
}
function getDivId(key) { return 'd' + capitalize(key); }

function getDynId(loc, oid) { return loc + '@' + oid; }

async function getEvent(id, cachedOk = true) {
	let res = lookup(Serverdata, ['events', id]);
	if (!cachedOk) Serverdata.events[id] = await mGetRoute('event', { id });
	return res;
}
function getEventValue(o) {
	if (isEmpty(o.time)) return o.text;
	return o.time + ' ' + stringBefore(o.text, '\n');
}
async function getEvents(cachedOk = false) {
	if (!cachedOk) Serverdata.events = await mGetRoute('events');
	return Serverdata.events;
}
function getFunctionsNameThatCalledThisFunction() {
	let c1 = getFunctionsNameThatCalledThisFunction.caller;
	if (nundef(c1)) return 'no caller!';
	let c2 = c1.caller;
	if (nundef(c2)) return 'no caller!';
	return c2.name;
}
function getGameColor(gamename) { return getGameConfig(gamename).color; }

function getGameConfig(gamename) { return Serverdata.config.games[gamename]; }

function getGameFriendly(gamename) { return getGameConfig(gamename).friendly; }

function getGameOption(prop) { return lookup(T, ['options', prop]); }

function getGameOptions(gamename) { return getGameConfig(gamename).options; }

function getGamePlayerOptions(gamename) { return getGameConfig(gamename).ploptions; }

function getGamePlayerOptionsAsDict(gamename) { return valf(getGamePlayerOptions(gamename), {}); }

function getGameProp(prop) { return getGameConfig(T.game)[prop]; }

function getGameValues() {
	let user = U.id;
	let game = G.id;
	let level = G.level;
	let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList };
	settings = mergeOverride(settings, DB.settings);
	if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
	if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
	let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
	next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
	next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
	delete settings.levels;
	Speech.setLanguage(settings.language);
	return settings;
}
function getHeaderNames(arr) {
	let di = { dateof: 'date', sender_name: 'from', sender_owner: 'owner', receiver_name: 'to', receiver_owner: 'owner', description: 'note' };
	let headers = arr.map(x => valf(di[x], x));
	return headers;
}
function getIdKey(elem) { let id = mBy(elem).id; return id.substring(1).toLowerCase(); }

function getImageData(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'Anonymous'; // To avoid CORS issues
		img.src = src;
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			let data = canvas.toDataURL('image/png');
			resolve(data);
		};
		img.onerror = (err) => {
			reject(new Error('Failed to load image'));
		};
	});
}
function getItem(k) { return infoToItem(Syms[k]); }

function getLevelColor(n) {
	const levelColors = [LIGHTBLUE, BLUE, GREEN, YELLOW, 'orange', RED, '#222',
		GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue', 'deeppink', //** MAXLEVEL 10 */
		TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE, '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'palegreen', '#e6194B'];
	return levelColors[n - 1];
}
function getLine(ctx, list, val) {
	let res = list.filter(p => isWithinDelta(p.y, val, 2) && (isLightBeforeV(ctx, p.x, p.y) || isLightAfterV(ctx, p.x, p.y)));
	let ls = sortBy(res, 'x');
	let segments = [], seg = [];
	let i = -1; let lastx = -1;
	while (++i < ls.length) {
		let el = ls[i];
		if (lastx >= 0 && el.x > lastx + 1) {
			segments.push(seg); seg = [];
		} else {
			if (el.x != lastx) seg.push(el);
		}
		lastx = el.x;
	}
	segments.push(seg);
	let len = 0, best = null;
	for (const s of segments) { if (s.length > len) { len = s.length; best = s } }
	return best;
}
function getListAndDicts(list) {
	let dicts = {}, lists = [];
	for (const arg of Array.from(arguments).slice(1)) {
		lists.push(list2dict(list, arg));
	}
	return [list].concat(lists);
}
function getListAndDictsForDicolors() {
	let bucketlist = Object.keys(M.dicolor);
	bucketlist = arrCycle(bucketlist, 8);
	let dicolorlist = [];
	for (const bucket of bucketlist) {
		let list = dict2list(M.dicolor[bucket]);
		for (const c of list) {
			let o = w3color(c.value);
			o.name = c.id;
			o.hex = c.value;
			o.bucket = bucket;
			dicolorlist.push(o);
		}
	}
	let byhex = list2dict(dicolorlist, 'hex');
	let byname = list2dict(dicolorlist, 'name');
	return [dicolorlist, byhex, byname];
}
function getMenu() { return isdef(Menu) ? Menu.key : null; }

function getMotto() {
	let list = [
		`Let's play!`, 'Enjoy this beautiful space!', 'First vacation day!', 'No place like home!',
		'You are free!', 'Nothing to do here!', `Don't worry, be happy!`, `Good times ahead!`,
		'Right here, right now', 'Life is a dream', 'Dream away!', 'Airport forever', 'All is well',
		`Let the world spin!`
	];
	return rChoose(list);
}
function getMouseCoordinates(event) {
	const image = event.target;
	const offsetX = event.clientX +
		(window.scrollX !== undefined ? window.scrollX : (document.documentElement || document.body.parentNode || document.body).scrollLeft) -
		12;
	const offsetY = event.clientY +
		(window.scrollY !== undefined ? window.scrollY : (document.documentElement || document.body.parentNode || document.body).scrollTop) -
		124;
	return { x: offsetX, y: offsetY };
}
function getMouseCoordinatesRelativeToElement(ev, elem) {
	if (nundef(elem)) elem = ev.target;
	const rect = elem.getBoundingClientRect();
	const x = ev.clientX - rect.left;
	const y = ev.clientY - rect.top;
	return { x, y };
}
function getMyColors1() {
	const colors = [
		{ hex: '#336699', name: 'Dark Slate Blue', bucket: 'blue' },
		{ hex: '#3366cc', name: 'Royal Blue', bucket: 'blue' },
		{ hex: '#000099', name: 'Dark Blue', bucket: 'blue' },
		{ hex: '#0000cc', name: 'Medium Blue', bucket: 'blue' },
		{ hex: '#000066', name: 'Navy Blue', bucket: 'blue' },
		{ hex: '#006666', name: 'Medium Teal', bucket: 'cyanblue' },
		{ hex: '#006699', name: 'Sea Bluegreen', bucket: 'cyanblue' },
		{ hex: '#0099cc', name: 'Deep Sky Blue', bucket: 'cyanblue' },
		{ hex: '#0066cc', name: 'Dodger Blue', bucket: 'cyanblue' },
		{ hex: '#0033cc', name: 'Bright Blue', bucket: 'blue' },
		{ hex: '#3333ff', name: 'Electric Blue', bucket: 'blue' },
		{ hex: '#009999', name: 'Strong Cyan', bucket: 'cyan' },
		{ hex: '#33cccc', name: 'Sea Sky', bucket: 'cyan' },
		{ hex: '#0099ff', name: 'Spring Sky', bucket: 'cyanblue' },
		{ hex: '#0066ff', name: 'Brilliant Blue', bucket: 'cyanblue' },
		{ hex: '#3366ff', name: 'Summer Sky', bucket: 'blue' },
		{ hex: '#3333cc', name: 'Indigo Sky', bucket: 'blue' },
		{ hex: '#339966', name: 'Sea Green', bucket: 'greencyan' },
		{ hex: '#00ffcc', name: 'Aquagreen', bucket: 'cyan' },
		{ hex: '#33ccff', name: 'Light Sky Blue', bucket: 'cyanblue' },
		{ hex: '#6699ff', name: 'Light Royal Blue', bucket: 'blue' },
		{ hex: '#6600ff', name: 'Vivid Violet', bucket: 'bluemagenta' },
		{ hex: '#6600cc', name: 'Deep Purple', bucket: 'bluemagenta' },
		{ hex: '#339933', name: 'Forest Green', bucket: 'green' },
		{ hex: '#00cc66', name: 'Medium Spring Green', bucket: 'greencyan' },
		{ hex: '#00ff99', name: 'Spring Green', bucket: 'greencyan' },
		{ hex: '#66ffcc', name: 'Light Aqua', bucket: 'cyan' },
		{ hex: '#66ffff', name: 'bleach', bucket: 'cyan' },
		{ hex: '#66ccff', name: 'Light Azure', bucket: 'cyanblue' },
		{ hex: '#99ccff', name: 'Pale Sky Blue', bucket: 'cyanblue' },
		{ hex: '#9999ff', name: 'Pale Lilac', bucket: 'bluemagenta' },
		{ hex: '#9966ff', name: 'Medium Violet', bucket: 'bluemagenta' },
		{ hex: '#9933ff', name: 'Electric Lilac', bucket: 'bluemagenta' },
		{ hex: '#9900ff', name: 'Bright Violet', bucket: 'bluemagenta' },
		{ hex: '#00cc00', name: 'Lime Green', bucket: 'green' },
		{ hex: '#66ff99', name: 'Spearmint', bucket: 'greencyan' },
		{ hex: '#99ffcc', name: 'Pale Mint', bucket: 'greencyan' },
		{ hex: '#ccffff', name: 'Very Pale Cyan', bucket: 'cyan' },
		{ hex: '#cc66ff', name: 'Medium Orchid', bucket: 'magenta' },
		{ hex: '#cc33ff', name: 'Bright Orchid', bucket: 'magenta' },
		{ hex: '#9900cc', name: 'Dark Violet', bucket: 'bluemagenta' },
		{ hex: '#003300', name: 'Dark Green', bucket: 'green' },
		{ hex: '#009933', name: 'Jungle Green', bucket: 'green' },
		{ hex: '#33cc33', name: 'Light Green', bucket: 'green' },
		{ hex: '#99ff99', name: 'Pale Green', bucket: 'green' },
		{ hex: '#ccffcc', name: 'Very Pale Green', bucket: 'green' },
		{ hex: '#ffccff', name: 'Rosa', bucket: 'magenta' },
		{ hex: '#ffcccc', name: 'Pale Pink', bucket: 'magenta' },
		{ hex: '#ff99ff', name: 'Light Pink', bucket: 'magenta' },
		{ hex: '#ff66ff', name: 'Magentapink', bucket: 'magenta' },
		{ hex: '#660066', name: 'Purple', bucket: 'magenta' },
		{ hex: '#336600', name: 'Young Olive', bucket: 'green' },
		{ hex: '#009900', name: 'Strong Green', bucket: 'green' },
		{ hex: '#66ff33', name: 'Spring Leaf', bucket: 'yellowgreen' },
		{ hex: '#99ff66', name: 'Light Lime', bucket: 'yellowgreen' },
		{ hex: '#ccff99', name: 'Very Light Green', bucket: 'yellowgreen' },
		{ hex: '#cc0099', name: 'Strong Magenta', bucket: 'magenta' },
		{ hex: '#993399', name: 'Dark Magenta', bucket: 'magenta' },
		{ hex: '#333300', name: 'Very Dark Olive', bucket: 'green' },
		{ hex: '#669900', name: 'Olive Drab', bucket: 'yellowgreen' },
		{ hex: '#99ff33', name: 'Light Chartreuse', bucket: 'yellowgreen' },
		{ hex: '#ccff66', name: 'Pale Yellow Green', bucket: 'yellowgreen' },
		{ hex: '#ff6699', name: 'Light Red Violet', bucket: 'magenta' },
		{ hex: '#ff3399', name: 'Deep Pink', bucket: 'magenta' },
		{ hex: '#cc3399', name: 'Medium Red Violet', bucket: 'magenta' },
		{ hex: '#990099', name: 'Dark Red Violet', bucket: 'magenta' },
		{ hex: '#99cc00', name: 'Lime', bucket: 'yellowgreen' },
		{ hex: '#ccff33', name: 'Light Lime Green', bucket: 'yellowgreen' },
		{ hex: '#ffcc66', name: 'Light Orange', bucket: 'orangeyellow' },
		{ hex: '#ff6666', name: 'Dark Salmon', bucket: 'red' },
		{ hex: '#ff0066', name: 'Hot Pink', bucket: 'magenta' },
		{ hex: '#cc6699', name: 'Medium Pink', bucket: 'magenta' },
		{ hex: '#993366', name: 'Dark Mauve', bucket: 'magenta' },
		{ hex: '#ff5050', name: 'Strawberry', bucket: 'red' },
		{ hex: '#cc0066', name: 'Vivid Raspberry', bucket: 'magenta' },
		{ hex: '#660033', name: 'Dark Red', bucket: 'red' },
		{ hex: '#996633', name: 'Medium Brown', bucket: 'orange' },
		{ hex: '#cc6600', name: 'Orange Brown', bucket: 'orange' },
		{ hex: '#ff3300', name: 'Red Orange', bucket: 'orangered' },
		{ hex: '#cc0000', name: 'Jolly Red', bucket: 'red' },
		{ hex: '#990033', name: 'Dark Crimson', bucket: 'red' },
		{ hex: '#663300', name: 'Darkbrown', bucket: 'orange' },
		{ hex: '#cc3300', name: 'Carrot', bucket: 'orangered' },
		{ hex: '#993333', name: 'Indian Red', bucket: 'red' },
		{ hex: '#fc600a', name: 'Tangerine', bucket: 'orange' },
		{ hex: '#fccc1a', name: 'Bright Yellow', bucket: 'yellow' },
		{ hex: '#b2d732', name: 'Lime Green', bucket: 'yellowgreen' },
		{ hex: '#4424d6', name: 'Violetblue', bucket: 'bluemagenta' },
		{ hex: '#c21460', name: 'Raspberry', bucket: 'magenta' },
		{ hex: '#afff45', name: 'Apple Green', bucket: 'yellowgreen' },
		{ hex: '#42d4f4', name: 'Sky Blue', bucket: 'cyanblue' },
		{ hex: '#ffe119', name: 'Sunshine Yellow', bucket: 'yellow' },
		{ hex: '#e6194b', name: 'Deep Raspberry', bucket: 'red' },
		{ hex: '#3cb44b', name: 'Pleasant Green', bucket: 'green' },
		{ hex: '#4363d8', name: 'Cobalt Blue', bucket: 'blue' },
		{ hex: '#911eb4', name: 'Violet', bucket: 'bluemagenta' },
		{ hex: '#fff620', name: 'Buttercup Yellow', bucket: 'yellow' },
		{ hex: '#f58231', name: 'Orange', bucket: 'orange' },
		{ hex: '#ffd8b1', name: 'Peach', bucket: 'orangeyellow' },
		{ hex: '#000075', name: 'Deep Blue', bucket: 'blue' },
		{ hex: '#ff6f61', name: 'Watermelon', bucket: 'orangered' },
		{ hex: '#c68e17', name: 'Caramel', bucket: 'yellow' },
		{ hex: '#f7cac9', name: 'Light Pink', bucket: 'magenta' },
		{ hex: '#009b77', name: 'Seaglass', bucket: 'cyan' },
		{ hex: '#dd4124', name: 'Rust Red', bucket: 'orangered' },
		{ hex: '#d65076', name: 'Blush', bucket: 'magenta' },
		{ hex: '#efc050', name: 'Goldenrod', bucket: 'orangeyellow' },
		{ hex: '#9b2335', name: 'Carmine', bucket: 'red' },
		{ hex: '#e15d44', name: 'Terracotta', bucket: 'orangered' },
		{ hex: '#bc243c', name: 'Red', bucket: 'red' },
		{ hex: '#c3447a', name: 'Berry Pink', bucket: 'magenta' },
		{ hex: '#ffd662', name: 'Banana', bucket: 'orangeyellow' },
		{ hex: '#f4b9b8', name: 'Pale Blush', bucket: 'magenta' },
		{ hex: '#ff968a', name: 'Light Coral', bucket: 'orangered' },
		{ hex: '#83781b', name: 'Olive', bucket: 'yellowgreen' },
		{ hex: '#d01013', name: 'Scarlet', bucket: 'red' },
		{ hex: '#58a813', name: 'Lawn Green', bucket: 'yellowgreen' },
		{ hex: '#fad302', name: 'Golden Yellow', bucket: 'yellow' },
		{ hex: '#55038c', name: 'Deep Violet', bucket: 'bluemagenta' },
		{ hex: '#ed527a', name: 'Raspberry Pink', bucket: 'magenta' },
		{ hex: '#d99559', name: 'Sand', bucket: 'orange' },
		{ hex: '#049dd9', name: 'Ocean Blue', bucket: 'cyanblue' },
		{ hex: '#ff4057', name: 'Salmon Pink', bucket: 'orangered' },
		{ hex: '#00b8a9', name: 'Sea Green', bucket: 'greencyan' },
		{ hex: '#f46036', name: 'Orange Red', bucket: 'orangered' },
		{ hex: '#e71d36', name: 'Crimson Red', bucket: 'red' },
		{ hex: '#2ec4b6', name: 'Aqua', bucket: 'cyan' },
		{ hex: '#ffd166', name: 'Apricot', bucket: 'orangeyellow' },
		{ hex: '#06d6a0', name: 'Medium Spring Green', bucket: 'greencyan' },
		{ hex: '#ef476f', name: 'Pale Red', bucket: 'orangered' },
		{ hex: '#26547c', name: 'Winter Blue', bucket: 'blue' },
		{ hex: '#ff9f1c', name: 'Vivid Orange', bucket: 'orange' },
		{ hex: '#00bbf9', name: 'Bright Sky Blue', bucket: 'cyanblue' },
		{ hex: '#118ab2', name: 'Blue Green', bucket: 'cyanblue' },
		{ hex: '#073b4c', name: 'Dark Teal', bucket: 'cyanblue' },
		{ hex: '#ffd32d', name: 'Bright Yellow', bucket: 'yellow' },
		{ hex: '#8338ec', name: 'Bright Purple', bucket: 'bluemagenta' },
		{ hex: '#fb5607', name: 'Bright Orange Red', bucket: 'orangered' },
		{ hex: '#ff006e', name: 'Hot Magenta', bucket: 'magenta' },
		{ hex: '#3a86ff', name: 'Bright Blue', bucket: 'blue' },
		{ hex: '#ffbe0b', name: 'Bright Yellow Orange', bucket: 'orangeyellow' },
		{ hex: '#ff006e', name: 'Hot Magenta', bucket: 'magenta' },
		{ hex: '#f94144', name: 'Strong Red', bucket: 'red' },
		{ hex: '#f3722c', name: 'Deep Orange', bucket: 'orangered' },
		{ hex: '#9b5de5', name: 'Bright Violet', bucket: 'bluemagenta' },
		{ hex: '#f15bb5', name: 'Light Magenta', bucket: 'magenta' },
		{ hex: '#fee440', name: 'Bright Yellow', bucket: 'yellow' },
		{ hex: '#00f5d4', name: 'Bright Aqua', bucket: 'cyan' },
		{ hex: '#7209b7', name: 'Dark Purple', bucket: 'bluemagenta' },
		{ hex: '#ff9aa2', name: 'Light Pink', bucket: 'magenta' },
		{ hex: '#ffb7b2', name: 'Light Blush', bucket: 'magenta' },
		{ hex: '#ffdac1', name: 'Peach Puff', bucket: 'orangeyellow' },
		{ hex: '#e2f0cb', name: 'Pale Green', bucket: 'yellowgreen' },
		{ hex: '#b5ead7', name: 'Mint Green', bucket: 'greencyan' },
		{ hex: '#fddb3a', name: 'Bright Yellow', bucket: 'yellow' },
		{ hex: '#f49ac2', name: 'Orchid Pink', bucket: 'magenta' },
		{ hex: '#836fff', name: 'Medium Slate Blue', bucket: 'bluemagenta' },
		{ hex: '#ffd1dc', name: 'Pale Blush Pink', bucket: 'magenta' },
		{ hex: '#a23bec', name: 'Bright Purple', bucket: 'bluemagenta' },
		{ hex: '#450920', name: 'Dark Crimson', bucket: 'red' },
		{ hex: '#004346', name: 'Dark Cyan', bucket: 'cyan' },
		{ hex: '#540b0e', name: 'Dark Maroon', bucket: 'red' },
		{ hex: '#0b132b', name: 'Dark Blue', bucket: 'blue' },
		{ hex: '#3c1874', name: 'Deep Purple', bucket: 'bluemagenta' },
		{ hex: '#08415c', name: 'Dark Cyan Blue', bucket: 'cyanblue' },
		{ hex: '#650d1b', name: 'Deep Red', bucket: 'red' },
		{ hex: '#005f73', name: 'Teal Blue', bucket: 'cyanblue' },
		{ hex: '#6622cc', name: 'Bright Violet', bucket: 'bluemagenta' },
		{ hex: '#6a040f', name: 'Dark Red', bucket: 'red' },
		{ hex: '#230c33', name: 'Dark Purple', bucket: 'bluemagenta' },
		{ hex: '#3a0ca3', name: 'Dark Violet', bucket: 'bluemagenta' },
		{ hex: '#240046', name: 'Very Dark Violet', bucket: 'bluemagenta' },
		{ hex: '#10002b', name: 'Midnight Purple', bucket: 'bluemagenta' }
	];
	let res = [];
	for (const c of colors) {
		let o = w3color(c.hex);
		o.name = transformColorName(c.name);
		o.bucket = c.bucket;
		o.hex = c.hex;
		res.push(o)
	}
	return res;
}
function getMyColors2() {
	const colors = [
		{ hex: '#669999', name: 'Desaturated Cyan', bucket: 'cyan' },
		{ hex: '#666699', name: 'Dark Lavender', bucket: 'bluemagenta' },
		{ hex: '#ffffff', name: 'White', bucket: 'black' },
		{ hex: '#a9a9a9', name: 'Dark Gray', bucket: 'blue' },
		{ hex: '#000000', name: 'Black', bucket: 'black' },
		{ hex: '#cb99c9', name: 'Lavender Pink', bucket: 'magenta' },
		{ hex: '#aec6cf', name: 'Pastel Blue', bucket: 'cyanblue' },
		{ hex: '#dea5a4', name: 'Pastel Red', bucket: 'red' },
		{ hex: '#779ecb', name: 'Periwinkle', bucket: 'bluemagenta' },
		{ hex: '#b39eb5', name: 'Pastel Purple', bucket: 'bluemagenta' },
		{ hex: '#cfcfc4', name: 'Light Gray', bucket: 'black' },
		{ hex: '#666633', name: 'Dark Olive Green', bucket: 'yellowgreen' },
		{ hex: '#999966', name: 'Pale Olive', bucket: 'yellowgreen' },
		{ hex: '#347c98', name: 'Steel Blue', bucket: 'cyanblue' },
		{ hex: '#469990', name: 'Teal', bucket: 'cyan' },
		{ hex: '#6b5b95', name: 'Royal Purple', bucket: 'bluemagenta' },
		{ hex: '#88b04b', name: 'Lime Green', bucket: 'yellowgreen' },
		{ hex: '#92a8d1', name: 'Pale Blue', bucket: 'cyanblue' },
		{ hex: '#955251', name: 'Rosewood', bucket: 'red' },
		{ hex: '#b565a7', name: 'Orchid', bucket: 'magenta' },
		{ hex: '#45b8ac', name: 'Medium Turquoise', bucket: 'cyan' },
		{ hex: '#5b5ea6', name: 'Medium Blue', bucket: 'blue' },
		{ hex: '#dfcfbe', name: 'Beige Grey', bucket: 'yellow' },
		{ hex: '#55b4b0', name: 'Dark Turquoise', bucket: 'cyan' },
		{ hex: '#7fcdcd', name: 'Light Cyan', bucket: 'cyan' },
		{ hex: '#98b4d4', name: 'Pale Blue', bucket: 'cyanblue' },
		{ hex: '#8d9440', name: 'Olive', bucket: 'yellowgreen' },
		{ hex: '#a4b086', name: 'Sage Green', bucket: 'yellowgreen' },
		{ hex: '#774d8e', name: 'Purple', bucket: 'bluemagenta' },
		{ hex: '#6e81a0', name: 'Slate Blue', bucket: 'cyanblue' },
		{ hex: '#5a7247', name: 'Military Green', bucket: 'yellowgreen' },
		{ hex: '#d2c29d', name: 'Pale Tan', bucket: 'yellow' },
		{ hex: '#f2e2e0', name: 'Very Pale Pink', bucket: 'magenta' },
		{ hex: '#e1ede9', name: 'Very Pale Cyan', bucket: 'cyan' },
		{ hex: '#5e3d26', name: 'Dark Brown', bucket: 'orange' },
		{ hex: '#a65f46', name: 'Copper Brown', bucket: 'orange' },
		{ hex: '#48bf84', name: 'Light Emerald', bucket: 'greencyan' },
		{ hex: '#90be6d', name: 'Light Olive Green', bucket: 'yellowgreen' },
		{ hex: '#577590', name: 'Airforce Greyblue', bucket: 'blue' },
		{ hex: '#c7ceea', name: 'Lavender Blue', bucket: 'bluemagenta' },
		{ hex: '#2b2d42', name: 'Gun Grey', bucket: 'blue' },
		{ hex: '#3f3351', name: 'Dark Lavender', bucket: 'bluemagenta' },
		{ hex: '#423629', name: 'Dark Taupe', bucket: 'orange' },
		{ hex: '#283618', name: 'Dark Olive', bucket: 'yellowgreen' },
		{ hex: '#462255', name: 'Purple', bucket: 'bluemagenta' },
		{ hex: '#1b263b', name: 'Prussian Blue', bucket: 'blue' },
		{ hex: '#353535', name: 'Dark Gray', bucket: 'black' },
		{ hex: '#101820', name: 'Eerie Black', bucket: 'black' },
		{ hex: '#1a1423', name: 'Raisin Black', bucket: 'black' },
		{ hex: '#4a4e69', name: 'Independence2', bucket: 'bluemagenta' },
		{ hex: '#264653', name: 'Greengrey', bucket: 'cyanblue' }
	];
	let res = [];
	for (const c of colors) {
		let o = w3color(c.hex);
		o.name = transformColorName(c.name);
		o.bucket = c.bucket;
		o.hex = c.hex;
		res.push(o)
	}
	return res;
}
function getNavBg() { return mGetStyle('dNav', 'bg'); }

function getNow() { return Date.now(); }

function getO(n, R) { let oid = n.oid; if (isdef(oid)) return R.getO(oid); else return null; }

function getPaletteFromCanvas(canvas) {
	if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
	const dataUrl = canvas.toDataURL();
	const img = new Image();
	img.src = dataUrl;
	return new Promise((resolve, reject) => {
		img.onload = () => {
			const palette = ColorThiefObject.getPalette(img);
			resolve(palette ? palette.map(x => colorFrom(x)) : ['black', 'white']);
		};
		img.onerror = () => {
			reject(new Error('Failed to load the image from canvas.'));
		};
	});
}
function getParams(areaName, oSpec, oid) {
	let params = oSpec.params ? oSpec.params : {};
	let panels = oSpec.panels ? oSpec.panels : [];
	let num = panels.length;
	let or = params.orientation ? params.orientation == 'h' ? 'rows'
		: 'columns' : DEF_ORIENTATION;
	let split = params.split ? params.split : DEF_SPLIT;
	let bg = oSpec.color ? oSpec.color : randomColor();
	let fg = bg ? colorIdealText(bg) : null;
	let id = oSpec.id ? oSpec.id : areaName;
	if (oid) { id = getDynId(id, oid); }
	let parent = mBy(areaName);
	if (oSpec.id) {
		parent.id = id;
		addAREA(id, oSpec);
		parent.innerHTML = id;
	}
	if (bg) { mColor(parent, bg, fg); }
	return [num, or, split, bg, fg, id, panels, parent];
}
function getPixRgb(ctx, x, y) {
	var pix = ctx.getImageData(x, y, 1, 1).data;
	var red = pix[0]; var green = pix[1]; var blue = pix[2];
	return { r: red, g: green, b: blue };
}
function getPlayerProp(prop) { let pl = T.players[getUname()]; return pl[prop]; }

function getPlayersWithMaxScore(table) {
	let list = dict2list(table.players, 'name');
	list = sortByDescending(list, 'score');
	maxlist = arrTakeWhile(list, x => x.score == list[0].score);
	return maxlist.map(x => x.name);
}
function getPlaymode(idOrTable, name) {
	if (isDict(idOrTable)) {
		let table = idOrTable;
		return table.players[name].playmode;
	} else if (T) {
		return T.id == idOrTable ? T.players[name].playmode : 'wrong table';
	} else return 'NO table!';
}
function getPresentableDetails(o) {
	if (!o || nundef(M.details[o.key])) return null;
	let di = {};
	for (const key in o) {
		if ('cats colls fa fa6 img photo text key friendly ga name'.includes(key)) continue;
		let val = o[key];
		if (!isLiteral(val)) continue;
		di[key] = val;
	}
	return di;
}
function getRadioValue(prop) {
	let fs = mBy(`d_${prop}`);
	if (nundef(fs)) return null;
	let val = getCheckedRadios(fs)[0];
	return isNumber(val) ? Number(val) : val;
}
function getRandomFromArray(array) { return (array[randomIndex(array) | 0]) }

function getRect(elem, relto) {
	if (isString(elem)) elem = document.getElementById(elem);
	let res = elem.getBoundingClientRect();
	if (isdef(relto)) {
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r = { x: res.left, y: res.top, w: res.width, h: res.height };
	addKeys({ l: r.x, t: r.y, r: r.x + r.w, b: r.y + r.h }, r);
	return r;
}
function getRectInt(elem, relto) {
	if (isString(elem)) elem = document.getElementById(elem);
	let res = elem.getBoundingClientRect();
	if (isdef(relto)) {
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r4 = { x: Math.round(res.left), y: Math.round(res.top), w: Math.round(res.width), h: Math.round(res.height) };
	extendRect(r4);
	return r4;
}
function getRelCoords(ev, elem) {
	let x = ev.pageX - elem.offset().left;
	let y = ev.pageY - elem.offset().top;
	return { x: x, y: y };
}
function getServerurl() {
	let type = detectSessionType();
	let server = type == 'vps' ? 'https://server.vidulusludorum.com' : 'http://localhost:3000';
	return server;
}
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }

function getSuperdi(key) { return valf(M.superdi[key], {}); }

function getTable() { assertion(!Tid, `getTable!!! ${T.id} !!! ${Tid}`); return T; }

function getTextureStyle(bg, t) {
	let bgRepeat = t.includes('marble_') || t.includes('wall') ? 'no-repeat' : 'repeat';
	let bgSize = t.includes('marble_') || t.includes('wall') ? `cover` : t.includes('ttrans') ? '' : 'auto';
	let bgImage = `url('${t}')`;
	let bgBlend = t.includes('ttrans') ? 'normal' : (t.includes('marble_') || t.includes('wall')) ? 'luminosity' : 'multiply';
	return { bg, bgImage, bgSize, bgRepeat, bgBlend };
}
async function getTextures() {
	M.textures = (await mGetFiles(`../assets/textures`)).map(x => `../assets/textures/${x}`);
	return M.textures;
}
function getThemeDark() { return getCSSVariable('--bgNav'); }

function getThemeFg() { return getCSSVariable('--fgButton'); }

function getTid() { return Tid; }

function getTimestamp() { return Date.now(); }

function getTurnPlayers(table) {
	return table.turn.join(', ');
}
function getTypeOf(param) {
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
function getUname() { return U.name; }

async function getUser(name, cachedOk = false) {
	let res = lookup(Serverdata, ['users', name]);
	if (!res || !cachedOk) res = await mGetRoute('user', { name });
	if (!res) {
		let key = isdef(M.superdi[name]) ? name : rChoose(Object.keys(M.superdi))
		res = await postUserChange({ name, color: rChoose(M.playerColors), key });
	}
	Serverdata.users[name] = res;
	return res;
}
function getUserColor(uname) { return Serverdata.users[uname].color; }

function getUserOptionsForGame(name, gamename) { return lookup(Serverdata.users, [name, 'games', gamename]); }

function getWaitingHtml(sz = 30) { return `<img src="../assets/icons/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }

function hFunc(content, funcname, arg1, arg2, arg3) {
	let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function hexBoardCenters(topside, side) {
	if (nundef(topside)) topside = 4;
	if (nundef(side)) side = topside;
	let [rows, maxcols] = [side + side - 1, topside + side - 1];
	assertion(rows % 2 == 1, `hex with even rows ${rows} top:${topside} side:${side}!`);
	let centers = [];
	let cols = topside;
	let y = 0.5;
	for (i of range(rows)) {
		let n = cols;
		let x = (maxcols - n) / 2 + .5;
		for (const c of range(n)) {
			centers.push({ x, y, row: i + 1, col: x * 2 }); x++;
		}
		y += .75
		if (i < (rows - 1) / 2) cols += 1; else cols -= 1;
	}
	assertion(cols == topside - 1, `END OF COLS WRONG ${cols}`)
	return [centers, rows, maxcols];
}
function hexFromCenter(dParent, center, styles = {}, opts = {}) {
	let [w, h] = mSizeSuccession(styles);
	let [left, top] = [center.x - w / 2, center.y - h / 2];
	let d = mDom(dParent, { position: 'absolute', left, top, 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }, opts);
	mStyle(d, styles);
	return d;
}
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (nundef(elem)) return;
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function highlightPlayerItem(item) { mStyle(iDiv(item), { bg: getUserColor(item.name), fg: 'white', border: `white` }); }

async function homeOnclickDeleteBlog() {
	let ta = mByTag('textarea');
	if (nundef(ta)) return;
	let val = ta.value;
	let me = getUname();
	if (isEmptyOrWhiteSpace(val)) return;
	U.blog = [];
	await postUserChange();
}
async function homeOnclickEditBlog() {
	let ta = mByTag('textarea');
	if (nundef(ta)) return;
	ta.value = U.blog.map(x => x.text).join('\n');
}
async function homeOnclickSaveBlog() {
	let ta = mByTag('textarea');
	if (nundef(ta)) return;
	let val = ta.value;
	let me = getUname();
	if (isEmptyOrWhiteSpace(val)) return;
	lookupAddToList(U, ['blog'], { text: val, ts: getNow() });
	await postUserChange();
}
function homeSidebar(wmin = 150) {
	mStyle('dLeft', { wmin });
	let d = mDom('dLeft', { wmin: wmin - 10, matop: 20, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
	let gap = 5;
	let stylesTitles = { matop: 10, bg: '#ffffff80', fg: 'black' };
	let cmds = {};
	cmds.homeNew = mCommand(d, 'homeNew', 'New Entry'); mNewline(d, gap);
	UI.commands = cmds;
}
function hourglassUpdate() {
}
function iAdd(item, liveprops = {}, addprops = {}) {
	let id, l;
	if (isString(item)) { id = item; item = valf(Items[id], {}); }
	let el = valf(liveprops.div, liveprops.ui, iDiv(item), null);
	id = valnwhite(addprops.id, item.id, (el ? el.id : getUID()), getUID());
	item.id = id; if (nundef(Items[id])) Items[id] = item; if (el) el.id = id;
	if (nundef(item.live)) item.live = {};
	l = item.live;
	for (const k in liveprops) {
		let val = liveprops[k];
		if (nundef(val)) { continue; }
		l[k] = val;
		if (isdef(val.id) && val.id != id) { lookupAddIfToList(val, ['memberOf'], id); }
	}
	if (isdef(addprops)) copyKeys(addprops, item);
	return item;
}
function iDiv(i) { return isdef(i.live) ? i.live.div : valf(i.div, i.ui, i); } //isdef(i.div) ? i.div : i; }

function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }

async function imgAsIsInDiv(url, dParent) {
	let d = mDom(dParent, { bg: 'pink', wmin: 128, hmin: 128, display: 'inline-block', align: 'center', margin: 10 }, { className: 'imgWrapper' });
	let sz = 300;
	let img = await imgAsync(d, {}, { tag: 'img', src: url });
	let [w, h] = [img.width, img.height]; console.log('sz', w, h);
	let scale = sz / img.height;
	return [img, scale];
}
function imgAsync(dParent, styles, opts) {
	let path = opts.src;
	delete opts.src;
	addKeys({ tag: 'img' }, opts); //if forget
	return new Promise((resolve, reject) => {
		const img = mDom(dParent, styles, opts);
		img.onload = () => {
			resolve(img);
		};
		img.onerror = (error) => {
			reject(error);
		};
		img.src = path;
	});
}
function imgBackground(d, src) {
	d.style.backgroundImage = `url('${src}')`; //../assets/games/nations/civs/civ_${pl1.civ}.png')`;
	d.style.backgroundSize = 'cover';
}
async function imgCrop(img, dc, wOrig, hOrig) {
	let dims = mGetStyles(dc, ['left', 'top', 'w', 'h']); console.log('dims', dims);
	let wScale = img.width / wOrig;
	let hScale = img.height / hOrig;
	console.log('scale', wScale, hScale, wOrig, hOrig, img.width, img.height)
	let d1 = mDom(document.body, { margin: 10 });
	let canvas = mDom(d1, {}, { tag: 'canvas', width: dims.w, height: dims.h });
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, dims.left / wScale, dims.top / hScale, (dims.w) / wScale, img.height / hScale, 0, 0, dims.w, dims.h)
}
function imgExpand(img, dc, sz) { img.width += 20; adjustCropper(img, dc, sz); return [img.width, img.height]; }

function imgMeasure(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous'; // CORS permission for cross-origin images
		img.onload = () => {
			resolve({ img, w: img.width, h: img.height });
		};
		img.onerror = (error) => {
			reject(error);
		};
		img.src = src;
	});
}
function imgReset(img, dc, sz, w, h) { img.width = w; img.height = h; adjustCropper(img, dc, sz); return [w, h]; }

async function imgScaledToHeightInDiv(url, dParent, sz = 300) {
	let d = mDom(dParent, { bg: 'pink', wmin: 128, hmin: 128, display: 'inline-block', align: 'center', margin: 10 }, { className: 'imgWrapper' });
	let img = await imgAsync(d, {}, { tag: 'img', src: url });
	let [w, h] = [img.width, img.height]; console.log('orig', w, h);
	let scale = sz / img.height;
	img.width *= scale;
	img.height *= scale;
	mStyle(img, { w: img.width, h: img.height })
	return [img, scale];
}
function imgSquish(img, dc, sz) { let w = mGetStyle(dc, 'w'); if (img.width == w) return; else { img.width = Math.max(img.width - 20, w); adjustCropper(img, dc, sz); return [img.width, img.height]; } }

function imgToDataUrl(img) {
	const canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	const dataUrl = canvas.toDataURL('image/png');
	return dataUrl;
}
async function imgToServer(canvas, path) {
	let dataUrl = canvas.toDataURL('image/png');
	let o = { image: dataUrl, filename: path };
	console.log('...postImage o', o)
	let resp = await mPostRoute('postImage', o);
	return resp;
}
function infoToItem(x) { let item = { info: x, key: x.key }; item.id = iRegister(item); return item; }

function initCodingUI() {
	mStyle('dMain', { bg: 'silver' });
	[dTable, dSidebar] = mCols100('dMain', '1fr auto', 0);
	let [dtitle, dta] = mRows100(dTable, 'auto 1fr', 2);
	mDiv(dtitle, { padding: 10, fg: 'white', fz: 24 }, null, 'OUTPUT:');
	AU.ta = mTextArea100(dta, { fz: 20, padding: 10, family: 'opensans' });
}
function initCrowd() {
	while (availablePeeps.length) {
		addPeepToCrowd().walk.progress(Math.random())
	}
}
function inpToChecklist(ev, grid) {
	let key = ev.key;
	let inp = ev.target;
	if (key == 'Backspace') {
		let s = inp.value;
		let cursorPos = inp.selectionStart;
		let ch = cursorPos == 0 ? null : inp.value[cursorPos - 1];
		if (!ch || isWhiteSpace(ch)) {
			doYourThing(inp, grid);
		}
		console.log('Backspace', ch);
		return;
	}
	if (key == 'Enter') ev.preventDefault();
	if (isExpressionSeparator(key) || key == 'Enter') doYourThing(inp, grid);
}
async function instructionStandard(table, instruction) {
	let myTurn = isMyTurn(table);
	if (!myTurn) staticTitle(table); else animatedTitle();
	if (nundef(instruction)) return;
	let styleInstruction = { display: 'flex', 'justify-content': 'center', 'align-items': 'center' };
	let dinst = mBy('dInstruction'); mClear(dinst);
	let html;
	if (myTurn) {
		styleInstruction.maleft = -30;
		html = `
        ${getWaitingHtml()}
        <span style="color:red;font-weight:bold;max-height:25px">You</span>
        &nbsp;${instruction};
        `;
	} else { html = `waiting for: ${getTurnPlayers(table)}` }
	mDom(dinst, styleInstruction, { html });
}
function instructionUpdate() {
}
function intersection(arr1, arr2) {
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function intersectionOfArrays() {
	let arrs = arguments[0]; console.log('arrs', arrs);
	if (!arrs.every(Array.isArray)) arrs = Array.from(arguments);
	return arrs.reduce((acc, array) => acc.filter(element => array.includes(element)));
}
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }

function isAlphanumeric(s) { for (const ch of s) { if (!isLetter(ch) && !isDigit(ch)) return false; } return isLetter(s[0]); }

function isAncestorOf(elem, elemAnc) {
	while (elem) {
		if (elem === elemAnc) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}
function isAtLeast(n, num = 1) { return n >= num; }

function isBetween(n, a, b) { return n >= a && n <= b }

function isCloseTo(n, m, acc = 10) { return Math.abs(n - m) <= acc + 1; }

function isColor(s) { return isdef(M.colorByName[s]); }

function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }

function isDigit(s) { return /^[0-9]$/i.test(s); }

function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }

function isExactly(n, num = 1) { return n == num; }

function isExpressionSeparator(ch) { return ',-.!?;:'.includes(ch); }

function isFilename(s) { return s.includes('../'); }

function isGrayColor(color, diff = 60) {
	const rgb = colorHexToRgbObject(color);
	return Math.abs(rgb.r - rgb.g) + Math.abs(rgb.r - rgb.b) + Math.abs(rgb.g - rgb.b) < 3 * diff;
}
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }

function isLightAfter(ctx, x, y) {
	for (let p = x + 1; p < x + 4; p++) if (isPixLight(ctx, p, y)) return true;
	return false;
}
function isLightAfterV(ctx, x, y) {
	for (let p = y + 1; p < y + 5; p++) if (isPixLight(ctx, x, p)) return true;
	return false;
}
function isLightBefore(ctx, x, y) {
	for (let p = x - 4; p < x - 1; p++) if (isPixLight(ctx, p, y)) return true;
	return false;
}
function isLightBeforeV(ctx, x, y) {
	for (let p = y - 4; p < y - 1; p++) if (isPixLight(ctx, x, p)) return true;
	return false;
}
function isList(arr) { return Array.isArray(arr); }

function isLiteral(x) { return isString(x) || isNumber(x); }

function isMergeableObject(val) {
	var nonNullObject = val && typeof val === 'object'
	return nonNullObject
		&& Object.prototype.toString.call(val) !== '[object RegExp]'
		&& Object.prototype.toString.call(val) !== '[object Date]'
}
function isMyTurn(table) { return table.turn.includes(getUname()) }

function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }

function isNumeric(x) { return !isNaN(+x); }

function isObject(item) { return item && typeof item === 'object' && !Array.isArray(item); }

function isPix(ctx, x, y, color, delta = 10) {
	let rgb = colorHexToRgbObject(colorFrom(color));
	let p = getPixRgb(ctx, x, y);
	let found = isWithinDelta(p.r, rgb.r, delta) && isWithinDelta(p.g, rgb.g, delta) && isWithinDelta(p.b, rgb.b, delta);
	return found ? p : null;
}
function isPixDark(ctx, x, y) {
	var pix = ctx.getImageData(x, y, 1, 1).data;
	var red = pix[0]; var green = pix[1]; var blue = pix[2];
	return green < 100 && blue < 100;
}
function isPixLight(ctx, x, y) {
	var pix = ctx.getImageData(x, y, 1, 1).data;
	var red = pix[0]; var green = pix[1]; var blue = pix[2];
	return red + green + blue > 520;
}
function isPlayerHuman(table, name) { return table.players[name].playmode != 'bot'; }

function isPointOutsideOf(form, x, y) { const r = form.getBoundingClientRect(); return (x < r.left || x > r.right || y < r.top || y > r.bottom); }

function isSameDate(date1, date2) {
	return date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate();
}
function isSameTableOpen(id) { return T && T.id == id; }

function isSet(x) { return (isDict(x) && (x.set || x._set)); }

function isString(param) { return typeof param == 'string'; }

function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }

function isTimeForAddon() {
	if (nundef(ADS)) return false;
	if (isEmpty(U.avAddons)) return false;
	if (isdef(AD) && AD.running && AD.checkEndCondition()) {
		console.log('END!')
		AD.die();
		U.addons[AD.key].open = false;
		AD = null;
	}
	if (isdef(AD)) return AD.isTimeForAddon();
	let open = allCondDict(U.addons, x => x.open == true);
	if (isEmpty(open)) {
		console.log('open is empty! choosing a random addon!')
		let k = chooseRandom(U.avAddons);
		AD = new ADS[k].cl(k, ADS[k], {});
	} else if (open.length == 1) {
		let k = open[0];
		AD = new ADS[k].cl(k, ADS[k], U.addons[k]);
	} else {
		let k = chooseRandom(open);
		AD = new ADS[k].cl(k, ADS[k], U.addons[k]);
	}
	return AD.isTimeForAddon();
}
function isWhiteSpace(s) { let white = new RegExp(/^\s$/); return white.test(s.charAt(0)); }

function isWithinDelta(n, goal, delta) { return isBetween(n, goal - delta, goal + delta) }

function isWordSeparator(ch) { return ' ,-.!?;:'.includes(ch); }

function isdef(x) { return x !== null && x !== undefined && x !== 'undefined'; }

function ithWord(s, n, allow_) {
	let ws = toWords(s, allow_);
	return ws[Math.min(n, ws.length - 1)];
}
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }

function jsCopyExceptKeys(o, keys = []) {
	if (!isDict(o)) return jsCopy(o);
	let onew = {};
	for (const k in o) { if (keys.includes(k)) continue; onew[k] = o[k]; }
	return JSON.parse(JSON.stringify(onew));
}
function jsonToYaml(o) { let y = jsyaml.dump(o); return y; }

function keyDownHandler(ev) {
	if (IsControlKeyDown && MAGNIFIER_IMAGE) return;
	if (!MAGNIFIER_IMAGE && ev.key == 'Control') {
		IsControlKeyDown = true;
		let hoveredElements = document.querySelectorAll(":hover");
		let cand = Array.from(hoveredElements).find(x => mHasClass(x, 'magnifiable'));
		if (isdef(cand)) showDetailsAndMagnify(cand);
	}
}
function keyUpHandler(ev) {
	if (ev.key == 'Control') {
		IsControlKeyDown = false;
		mMagnifyOff();
		if (isdef(mBy('hallo'))) mBy('hallo').remove();
	}
}
function last(arr) {
	return arr.length > 0 ? arr[arr.length - 1] : null;
}
function lastOfLanguage(key, language) {
	let y = symbolDict[key];
	let w = y[language];
	let last = stringAfterLast(w, '|');
	return last.trim();
}
function lastWord(s) { return arrLast(toWords(s)); }

function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
	let di = {};
	for (const a of arr) {
		let key = typeof (a) == 'object' ? a[keyprop] : a;
		if (uniqueKeys) lookupSet(di, [key], a);
		else lookupAddToList(di, [key], a);
	}
	return di;
}
function liste(areaName, oSpec, oid, o) {
	let [num, or, split, bg, fg, id, panels, parent] = getParams(areaName, oSpec, oid);
	parent.style.display = 'inline-grid';
	return parent;
}
async function loadAndMakeInteractive(imageUrl) {
	try {
		const canvas = await createInteractiveCanvas(imageUrl);
		document.body.appendChild(canvas);
	} catch (error) {
		console.error("Error loading image:", error);
	}
}
async function loadAndScaleImage(imageUrl) {
	try {
		const canvas = await createScaledCanvasFromImage(imageUrl);
		document.body.appendChild(canvas);
	} catch (error) {
		console.error("Error loading image:", error);
	}
}
async function loadAssets() {
	M = await mGetYaml('../y/m.yaml');
	M.superdi = await mGetYaml('../y/superdi.yaml');
	M.details = await mGetYaml('../y/details.yaml');
	let [di, byColl, byFriendly, byCat, allImages] = [M.superdi, {}, {}, {}, {}];
	for (const k in di) {
		let o = di[k];
		for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
		for (const coll of o.colls) lookupAddIfToList(byColl, [coll], k);
		lookupAddIfToList(byFriendly, [o.friendly], k)
		if (isdef(o.img)) {
			let fname = stringAfterLast(o.img, '/')
			allImages[fname] = { fname, path: o.img, k };
		}
	}
	M.allImages = allImages;
	M.byCat = byCat;
	M.byCollection = byColl;
	M.byFriendly = byFriendly;
	M.categories = Object.keys(byCat); M.categories.sort();
	M.collections = Object.keys(byColl); M.collections.sort();
	M.names = Object.keys(byFriendly); M.names.sort();
	let textures = await mGetFiles(`../assets/textures`);
	M.textures = textures.map(x => `../assets/textures/${x}`); //console.log('textures',M.textures)
	M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);
	[M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
}
function loadImageAsync(src, img) {
	return new Promise((resolve, reject) => {
		img.onload = async () => {
			resolve(img);
		};
		img.onerror = (error) => {
			reject(error);
		};
		img.src = src;
	});
}
function logItems() { Object.keys(Items).sort().forEach(k => console.log('Items', Items[k])); }

function lookup(dict, keys) {
	if (nundef(dict)) return null;
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue;
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}
		if (nundef(k)) continue;
		if (nundef(d[k])) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function mAdjustPage(wmargin) {
	let r = getRect('dBuffer');
	let r2 = getRect('dExtra');
	let [w, h] = [window.innerWidth - wmargin, window.innerHeight - (r.h + r2.h)];
	mStyle('dMain', { w, h });
	mStyle('dPage', { w, h });
}
function mAnchorTo(elem, dAnchor, align = 'bl') {
	let rect = dAnchor.getBoundingClientRect();
	let drect = elem.getBoundingClientRect();
	let [v, h] = [align[0], align[1]];
	let vPos = v == 'b' ? { top: rect.bottom } : v == 'c' ? { top: rect.top } : { top: rect.top - drect.height };
	let hPos = h == 'l' ? { left: rect.left } : v == 'c' ? { left: rect.left } : { right: window.innerWidth - rect.right };
	let posStyles = { position: 'absolute' };
	addKeys(vPos, posStyles);
	addKeys(hPos, posStyles);
	mStyle(elem, posStyles);
}
function mAnimate(elem, prop, valist, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0, forwards = 'none') {
	let kflist = [];
	for (const perc in valist) {
		let o = {};
		let val = valist[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: forwards, easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mAppend(d, child) { toElem(d).appendChild(child); return child; }

function mButton(caption, handler, dParent, styles, classes, id) {
	let x = mCreate('button');
	x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) toElem(dParent).appendChild(x);
	if (isdef(styles)) mStyle(x, styles);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(id)) x.id = id;
	return x;
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
function mBy(id) { return document.getElementById(id); }

function mByAttr(key, val) {
	const selector = val ? `[${key}="${val}"]` : `[${key}]`;
	let list = Array.from(document.querySelectorAll(selector));
	return (list.length == 1) ? list[0] : list;
}
function mByTag(tag) { return document.getElementsByTagName(tag)[0]; }

function mCenterCenter(d, gap) { mCenterCenterFlex(d, gap); }

function mCenterCenterFlex(d, gap) { mCenterFlex(d, true, true, true, gap); }

function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true, gap = null) {
	let styles = { display: 'flex' };
	if (hCenter) styles['justify-content'] = 'center';
	styles['align-content'] = vCenter ? 'center' : 'flex-start';
	if (wrap) styles['flex-wrap'] = 'wrap';
	if (gap) styles.gap = gap;
	mStyle(d, styles);
}
function mCheckbox(dg, name, value) {
	let di = mDom(dg, { display: 'inline-block' });
	let chk = mDom(di, {}, { tag: 'input', type: 'checkbox', id: getUID('c'), name: name });
	if (isdef(value)) chk.checked = value;
	let label = mDom(di, {}, { tag: 'label', html: name, for: chk.id });
	return di;
}
function mClass(d) {
	d = toElem(d);
	if (arguments.length == 2) {
		let arg = arguments[1];
		if (isString(arg) && arg.indexOf(' ') > 0) { arg = [toWords(arg)]; }
		else if (isString(arg)) arg = [arg];
		if (isList(arg)) {
			for (let i = 0; i < arg.length; i++) {
				d.classList.add(arg[i]);
			}
		}
	} else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClassRemove(d) { d = toElem(d); for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }

function mClear(d) {
	toElem(d).innerHTML = '';
}
function mClearAllSelections() {
	let arr = Array.from(document.getElementsByClassName('framedPicture'));//find all visible uis for selected images
	arr.forEach(mUnselect);
	UI.selectedImages = [];
}
function mClip(shape, d) {
	if (shape == 'circle' || shape == 'ellipse') mStyle(d, { rounding: '50%' });
	else mStyle(d, { 'clip-path': PolyClips[shape] });
}
function mCluster(olist, func, fout) {
	let res = {};
	if (nundef(fout)) fout = x => x
	for (const o of olist) {
		for (const x of func(o)) { lookupAddIfToList(res, [x], fout(o)) }
	}
	return res;
}
function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
	let styles = { opacity: 1, display: 'flex', aitems: 'stretch', 'flex-flow': 'nowrap' };
	mStyle(dParent, styles);
	let res = [];
	for (let i = 0; i < chflex.length; i++) {
		let bg = isdef(bgs) ? bgs[i] : null;
		let d1 = mDiv(dParent, { flex: chflex[i], bg: bg });
		res.push(d1);
	}
	return res;
}
function mColor(d, bg, fg) { return mStyle(d, { 'background-color': bg, 'color': fg }); }

function mColorPicker(dParent, handler) {
	dParent = mDom(dParent); mFlex(dParent);
	async function mCPClick(item, board) {
		let selitems = board.items.filter(x => x.isSelected == true); selitems.map(x => toggleItemSelection(x))
		toggleItemSelection(item);
		mClassRemove(iDiv(item), 'hexframe');
		mStyle(iDiv(board), item.color);
		let dh = mBy('dHslTable');
		mClear(dh);
		hslTables(dh, item.color)
		if (isdef(handler)) handler(item.color);
	}
	async function mCPEnter(item, board) {
		mStyle(iDiv(board), { bg: item.color });
	}
	async function mCPLeave(item, board) {
		let selitem = board.items.find(x => x.isSelected == true);
		if (isdef(selitem)) mStyle(iDiv(board), { bg: selitem.color });
	}
	let board = drawHexBoard(7, 7, dParent, { bg: 'transparent', padding: 10 }, { w: 20, h: 22, classes: 'hexframe' }); //, {padding:10});
	let tables = mDom(dParent, {}, { id: 'dHslTable' });
	let colors = getColormapColors();
	let i = 0;
	for (const item of board.items) {
		let bg = colors[i++];
		item.color = bg;
		let dhex = iDiv(item);
		dhex.onmouseenter = () => mCPEnter(item, board);
		dhex.onmouseleave = () => mCPLeave(item, board);
		dhex.onclick = () => mCPClick(item, board);
		mStyle(dhex, { bg });
	}
	function getColor() { let item = board.items.find(x => x.isSelected == true); return lookup(item, ['color']); }
	function setColor() { let item = rChoose(board.items); mCPClick(item, board); return item; }
	return { board, getColor, setColor };
}
function mColorPickerHex(dParent, colors) {
	dParent = mDom(dParent);
	let board = drawHexBoard(7, 7, dParent, { bg: 'transparent', padding: 10 }, { w: 20, h: 22 });
	board.dSample = mDom(dParent, { w: 200, hmin: 40, margin: 'auto', align: 'center' });
	let i = 0;
	for (const item of board.items) {
		let bg = colors[i++];
		item.color = bg;
		let dhex = iDiv(item);
		dhex.onmouseenter = () => onenterHex(item, board);
		dhex.onmouseleave = () => onleaveHex(item, board);
		dhex.onclick = () => onclickHex(item, board);
		mStyle(dhex, { bg });
	}
	return board;
}
function mCols100(dParent, spec, gap = 4) {
	let grid = mDiv(dParent, { padding: gap, gap: gap, box: true, display: 'grid', h: '100%', w: '100%' })
	grid.style.gridTemplateColumns = spec;
	let res = [];
	for (const i of range(stringCount(spec, ' ') + 1)) {
		let d = mDiv(grid, { h: '100%', w: '100%', box: true })
		res.push(d);
	}
	return res;
}
function mCommand(dParent, key, html, opts = {}) {
	if (nundef(html)) html = capitalize(key);
	let close = valf(opts.close, () => { console.log('close', key) });
	let save = valf(opts.save, false);
	let open = valf(opts.open, window[`onclick${capitalize(key)}`]);
	let d = mDom(dParent, { display: 'inline-block' }, { key: key });
	let a = mDom(d, {}, { id: `${key}`, key: `${key}`, tag: 'a', href: '#', html: html, className: 'nav-link', onclick: onclickCommand })
	let cmd = { dParent, elem: d, div: a, key, open, close, save };
	addKeys(opts, cmd);
	return cmd;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }

function mCreateFrom(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
	return div.firstChild;
}
function mCropResizePan(dParent, img, dButtons) {
	let [worig, horig] = [img.offsetWidth, img.offsetHeight];
	mStyle(dParent, { w: worig, h: horig, position: 'relative' });
	const cropBox = mDom(dParent, { position: 'absolute', left: 0, top: 0, w: worig, h: horig }, { className: 'crop-box' });
	const messageBox = mDom(cropBox, { bg: '#ffffff80', fg: 'black', cursor: 'move' });
	let sz = 16;
	const centerBox = mDom(cropBox, { bg: 'red', w: sz, h: sz, rounding: '50%', position: 'absolute' });
	const wHandle = mDom(cropBox, { cursor: 'ew-resize', bg: 'red', w: sz, h: sz, right: -sz / 2, top: '50%', rounding: '50%', position: 'absolute' });
	const hHandle = mDom(cropBox, { cursor: 'ns-resize', bg: 'red', w: sz, h: sz, left: '50%', bottom: -sz / 2, rounding: '50%', position: 'absolute' });
	const whHandle = mDom(cropBox, { cursor: 'nwse-resize', bg: 'red', w: sz, h: sz, right: -sz / 2, bottom: -sz / 2, rounding: '50%', position: 'absolute' });
	let isResizing = null;
	let resizeStartW;
	let resizeStartH;
	function startResize(e) {
		e.preventDefault(); evNoBubble(e);
		isResizing = e.target == wHandle ? 'w' : e.target == hHandle ? 'h' : 'wh';
		[resizeStartW, resizeStartH] = [parseInt(cropBox.style.width), parseInt(cropBox.style.height)];
		document.addEventListener('mousemove', resize);
		document.addEventListener('mouseup', stopResize);
	}
	function resize(e) {
		if (!isResizing) return;
		e.preventDefault(); evNoBubble(e);
		let newWidth, newHeight;
		if (isResizing == 'w') {
			newWidth = e.clientX;
			newHeight = img.height;
		} else if (isResizing == 'h') {
			newWidth = img.width;
			newHeight = e.clientY;
		} else if (isResizing == 'wh') {
			newHeight = e.clientY;
			let aspectRatio = img.width / img.height;
			newWidth = aspectRatio * newHeight;
		}
		[img, dParent].map(x => mStyle(x, { w: newWidth, h: newHeight }));
		setRect(0, 0, newWidth, newHeight);
	}
	function stopResize() {
		isResizing = null;
		document.removeEventListener('mousemove', resize);
		document.removeEventListener('mouseup', stopResize);
		let [wnew, hnew] = [parseInt(cropBox.style.width), parseInt(cropBox.style.height)]
		redrawImage(img, dParent, 0, 0, resizeStartW, resizeStartH, wnew, hnew, () => setRect(0, 0, wnew, hnew))
	}
	function resizeTo(wnew, hnew) {
		if (hnew == 0) hnew = img.height;
		if (wnew == 0) {
			let aspectRatio = img.width / img.height;
			wnew = aspectRatio * hnew;
		}
		redrawImage(img, dParent, 0, 0, img.width, img.height, wnew, hnew, () => setRect(0, 0, wnew, hnew))
	}
	let isCropping = false;
	let cropStartX;
	let cropStartY;
	function startCrop(ev) {
		ev.preventDefault();
		isCropping = true;
		let pt = getMouseCoordinates(ev);
		[cropStartX, cropStartY] = [pt.x, pt.y - 24];
		document.addEventListener('mousemove', crop); //cropCenter);
		document.addEventListener('mouseup', stopCrop);
	}
	function crop(ev) {
		ev.preventDefault();
		if (isCropping) {
			evNoBubble(ev);
			let pt = getMouseCoordinates(ev);
			let [mouseX, mouseY] = [pt.x, pt.y];
			const width = Math.abs(mouseX - cropStartX);
			const height = Math.abs(mouseY - cropStartY);
			const left = Math.min(mouseX, cropStartX);
			const top = Math.min(mouseY, cropStartY);
			setRect(left, top, width, height);
		}
	}
	function cropX(e) {
		e.preventDefault();
		if (isCropping) {
			const mouseX = e.clientX - dParent.offsetLeft;
			const mouseY = e.clientY - dParent.offsetTop;
			const width = Math.abs(mouseX - cropStartX);
			const height = 300;
			const left = Math.min(mouseX, cropStartX);
			const top = 0;
			setRect(left, top, width, height);
		}
	}
	function cropCenter(e) {
		e.preventDefault();
		if (isCropping) {
			const mouseX = e.clientX - dParent.offsetLeft;
			const mouseY = e.clientY - dParent.offsetTop;
			const radiusX = Math.abs(mouseX - cropStartX);
			const radiusY = Math.abs(mouseY - cropStartY);
			const centerX = cropStartX;
			const centerY = cropStartY;
			const width = radiusX * 2;
			const height = radiusY * 2;
			const left = centerX - radiusX;
			const top = centerY - radiusY;
			setRect(left, top, width, height);
		}
	}
	function stopCrop() {
		isCropping = false;
		document.removeEventListener('mousemove', crop);
		document.removeEventListener('mouseup', stopCrop);
	}
	function cropImage() {
		let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
		redrawImage(img, dParent, x, y, w, h, w, h, () => setRect(0, 0, w, h))
	}
	function cropTo(wnew, hnew) {
		let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
		let xnew = x + (wnew - w) / 2;
		let ynew = y + (hnew - h) / 2;
		redrawImage(img, dParent, xnew, ynew, wnew, wnew, wnew, hnew, () => setRect(0, 0, wnew, hnew))
	}
	let isPanning = false;
	let panStartX;
	let panStartY;
	let cboxX;
	let cboxY;
	function startPan(e) {
		e.preventDefault(); evNoBubble(e);
		isPanning = true;
		panStartX = e.clientX - dParent.offsetLeft;
		panStartY = e.clientY - dParent.offsetTop;
		cboxX = parseInt(cropBox.style.left)
		cboxY = parseInt(cropBox.style.top)
		document.addEventListener('mousemove', pan); //cropCenter);
		document.addEventListener('mouseup', stopPan);
	}
	function pan(e) {
		e.preventDefault();
		if (isPanning) {
			evNoBubble(e);
			const mouseX = e.clientX - dParent.offsetLeft;
			const mouseY = e.clientY - dParent.offsetTop;
			let diffX = panStartX - mouseX;
			let diffY = panStartY - mouseY;
			const left = cboxX - diffX
			const top = cboxY - diffY
			setRect(left, top, parseInt(cropBox.style.width), parseInt(cropBox.style.height));
		}
	}
	function stopPan() {
		isPanning = false;
		document.removeEventListener('mousemove', crop);
		document.removeEventListener('mouseup', stopCrop);
	}
	function getRect() { return ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x])); }
	function setRect(left, top, width, height) {
		mStyle(cropBox, { left: left, top: top, w: width, h: height });
		messageBox.innerHTML = `size: ${Math.round(width)} x ${Math.round(height)}`;
		mStyle(centerBox, { left: width / 2 - 5, top: height / 2 - 5 });
	}
	function show_cropbox() { cropBox.style.display = 'block' }
	function hide_cropbox() { cropBox.style.display = 'none' }
	function setSize(wnew, hnew) {
		if (isList(wnew)) [wnew, hnew] = wnew;
		if (wnew == 0 || hnew == 0) {
			setRect(0, 0, worig, horig);
			return;
		}
		let [x, y, w, h] = getRect();
		let [cx, cy] = [x + w / 2, y + h / 2];
		let [xnew, ynew] = [cx - (wnew / 2), cy - (hnew / 2)];
		setRect(xnew, ynew, wnew, hnew);
	}
	wHandle.addEventListener('mousedown', startResize);
	hHandle.addEventListener('mousedown', startResize);
	whHandle.addEventListener('mousedown', startResize);
	cropBox.addEventListener('mousedown', startCrop);
	messageBox.addEventListener('mousedown', startPan);
	setRect(0, 0, worig, horig);
	return {
		cropBox: cropBox,
		dParent: dParent,
		elem: cropBox,
		img: img,
		messageBox: messageBox,
		crop: cropImage,
		getRect: getRect,
		hide: hide_cropbox,
		resizeTo: resizeTo,
		setRect: setRect,
		setSize: setSize,
		show: show_cropbox,
	}
}
function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
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
function mDatalist(dParent, list, opts = {}) {
	var mylist = list;
	var opts = opts;
	addKeys({ alpha: true, filter: 'contains' }, opts);
	let d = mDiv(toElem(dParent));
	let optid = getUID('dl');
	let inp = mDom(d, { w: 180, maleft: 4 }, { tag: 'input', className: 'input', placeholder: valf(opts.placeholder, '') });
	if (isdef(opts.value)) inp.value = opts.value;
	let datalist = mDom(d, {}, { tag: 'datalist', id: optid, className: 'datalist' });
	var elem = d;
	for (const w of mylist) { mDom(datalist, {}, { tag: 'option', value: w }); }
	inp.setAttribute('list', optid);
	if (opts.onupdate) {
		inp.addEventListener('keyup', opts.onupdate);
	} else if (isdef(opts.edit)) {
		inp.onmousedown = () => inp.value = '';
	} else {
		inp.onblur = () => {
			const isValueSelected = list.includes(inp.value);
			if (!isValueSelected) {
				inp.value = inp.getAttribute('prev_value'); // Restore the previous value if no selection is made
			}
		}
		inp.onmousedown = () => { inp.setAttribute('prev_value', inp.value); inp.value = ''; }
	}
	return {
		list: mylist,
		elem: elem,
		inpElem: inp,
		listElem: datalist,
		opts: opts,
	}
}
function mDiv(dParent, styles, id, inner, classes, sizing) {
	dParent = toElem(dParent);
	let d = mCreate('div');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }
	return d;
}
function mDom(dParent, styles = {}, opts = {}) {
	let tag = valf(opts.tag, 'div');
	let d = document.createElement(tag);
	if (isdef(dParent)) mAppend(dParent, d);
	if (tag == 'textarea') styles.wrap = 'hard';
	const aliases = {
		classes: 'className',
		inner: 'innerHTML',
		html: 'innerHTML',
		w: 'width',
		h: 'height',
	};
	for (const opt in opts) {
		let name = valf(aliases[opt], opt), val = opts[opt];
		if (['style', 'tag', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
		else d.setAttribute(name, val);
	}
	mStyle(d, styles);
	return d;
}
function mDom100(dParent, styles = {}, opts = {}) { copyKeys({ w100: true, h100: true, box: true }, styles); return mDom(dParent, styles, opts); }

function mDropZone(dropZone, onDrop) {
	dropZone.setAttribute('allowDrop', true)
	dropZone.addEventListener('dragover', function (event) {
		event.preventDefault();
		dropZone.style.border = '2px dashed #007bff';
	});
	dropZone.addEventListener('dragleave', function (event) {
		event.preventDefault();
		dropZone.style.border = '2px dashed #ccc';
	});
	dropZone.addEventListener('drop', function (event) {
		event.preventDefault();
		dropZone.style.border = '2px dashed #ccc';
		const files = event.dataTransfer.files;
		if (files.length > 0) {
			const reader = new FileReader();
			reader.onload = ev => {
				onDrop(ev.target.result);
			};
			reader.readAsDataURL(files[0]);
		}
	});
	return dropZone;
}
function mDropZone1(dropZone, onDrop) {
	dropZone.addEventListener('dragover', function (event) {
		event.preventDefault();
		dropZone.style.border = '2px dashed #007bff';
	});
	dropZone.addEventListener('dragleave', function (event) {
		event.preventDefault();
		dropZone.style.border = '2px dashed #ccc';
	});
	dropZone.addEventListener('drop', function (evDrop) {
		evDrop.preventDefault();
		dropZone.style.border = '2px dashed #ccc';
		const files = evDrop.dataTransfer.files;
		if (files.length > 0) {
			const reader = new FileReader();
			reader.onload = evReader => {
				onDrop(evReader.target.result, dropZone);
			};
			reader.readAsDataURL(files[0]);
		}
	});
	return dropZone;
}
function mDummyFocus() {
	if (nundef(mBy('dummy'))) addDummy(document.body, 'cc');
	mBy('dummy').focus();
}
function mExists(d) { return isdef(toElem(d)); }

function mFlex(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
}
function mFlexLine(d, startEndCenter = 'center') { mStyle(d, { display: 'flex', 'justify-content': startEndCenter, 'align-items': 'center' }); }

function mFlexV(d) { mStyle(d, { display: 'flex', 'align-items': 'center' }); }

function mFlexVWrap(d) { mStyle(d, { display: 'flex', 'align-items': 'center', 'flex-flow': 'row wrap' }); }

function mFlexWrap(d) { mFlex(d, 'w'); }

function mGadget(name, styles = {}, opts = {}) {
	let d = document.body;
	let dialog = mDom(d, { w100: true, h100: true }, { className: 'reset', tag: 'dialog', id: `modal_${name}` });
	addKeys({ position: 'fixed', display: 'inline-block', padding: 12, box: true }, styles)
	let form = mDom(dialog, styles, { autocomplete: 'off', tag: 'form', method: 'dialog' });
	let inp = mDom(form, { outline: 'none', w: 130 }, { className: 'input', name: name, tag: 'input', type: 'text', placeholder: valf(opts.placeholder, `<enter ${name}>`) });
	mDom(form, { display: 'none' }, { tag: 'input', type: 'submit' });
	return { name, dialog, form, inp }
}
async function mGetFiles(dir) {
	let server = getServerurl();
	let data = await mGetJsonCors(`${server}/filenames?directory=${dir}`);
	return data.files;
}
async function mGetJsonCors(url) {
	let res = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		mode: 'cors' // Set CORS mode to enable cross-origin requests
	});
	let json = await res.json();
	return json;
}
async function mGetRoute(route, o = {}) {
	let server = getServerurl();
	server += `/${route}?`;
	for (const k in o) { server += `${k}=${o[k]}&`; }
	const response = await fetch(server, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		mode: 'cors',
	});
	return tryJSONParse(await response.text());
}
function mGetStyle(elem, prop) {
	let val;
	elem = toElem(elem);
	if (prop == 'bg') { val = getStyleProp(elem, 'background-color'); if (isEmpty(val)) return getStyleProp(elem, 'background'); }
	else if (isdef(STYLE_PARAMS[prop])) { val = getStyleProp(elem, STYLE_PARAMS[prop]); }
	else {
		switch (prop) {
			case 'vmargin': val = stringBefore(elem.style.margin, ' '); break;
			case 'hmargin': val = stringAfter(elem.style.margin, ' '); break;
			case 'vpadding': val = stringBefore(elem.style.padding, ' '); break;
			case 'hpadding': val = stringAfter(elem.style.padding, ' '); break;
			case 'box': val = elem.style.boxSizing; break;
			case 'dir': val = elem.style.flexDirection; break;
		}
	}
	if (nundef(val)) val = getStyleProp(elem, prop);
	if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mGetStyles(elem, proplist) {
	let res = {};
	for (const p of proplist) { res[p] = mGetStyle(elem, p) }
	return res;
}
async function mGetText(path = '../base/assets/m.txt') {
	let res = await fetch(path);
	let text = await res.text();
	return text;
}
async function mGetYaml(path = '../base/assets/m.txt') {
	let res = await fetch(path);
	let text = await res.text();
	let di = jsyaml.load(text);
	return di;
}
function mGrid(rows, cols, dParent, styles = {}) {
	[rows, cols] = [Math.ceil(rows), Math.ceil(cols)]
	addKeys({ display: 'inline-grid', gridCols: 'repeat(' + cols + ',1fr)' }, styles);
	if (rows) styles.gridRows = 'repeat(' + rows + ',auto)';
	else styles.overy = 'auto';
	let d = mDiv(dParent, styles);
	return d;
}
function mGridFromElements(dParent, elems, maxHeight, numColumns) {
	dParent.innerHTML = '';
	let cols = `repeat(${numColumns}, 1fr)`; //'repeat(auto-fill, minmax(0, 1fr))';
	let grid = mDom(dParent, { display: 'inline-grid', gridCols: cols, gap: 10, padding: 4, overy: 'auto', hmax: maxHeight })
	elems.forEach(x => mAppend(grid, x));
	return grid;
}
function mGridFromItems(dParent, items, maxHeight, numColumns) { return mGridFromElements(dParent, items.map(x => iDiv(x)), maxHeight, numColumns); }

function mHasClass(el, className) {
	if (el.classList) return el.classList.contains(className);
	else {
		let x = !!el.className;
		return isString(x) && !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
	}
}
function mIfNotRelative(d) { d = toElem(d); if (isEmpty(d.style.position)) d.style.position = 'relative'; }

function mInput(dParent, styles, id, placeholder, classtr = 'input', tabindex = null, value = '', selectOnClick = false, type = "text") {
	let html = `<input type="${type}" autocomplete="off" ${selectOnClick ? 'onclick="this.select();"' : ''} id=${id} class="${classtr}" placeholder="${valf(placeholder, '')}" tabindex="${tabindex}" value="${value}">`;
	let d = mAppend(dParent, mCreateFrom(html));
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mInsert(dParent, el, index = 0) { dParent.insertBefore(el, dParent.childNodes[index]); return el; }

function mItem(liveprops = {}, opts = {}) {
	let id = valf(opts.id, getUID());
	let item = opts;
	item.live = liveprops;
	item.id = id;
	let d = iDiv(item); if (isdef(d)) d.id = id;
	Items[id] = item;
	return item;
}
function mLMR(dParent) {
	dParent = toElem(dParent);
	let d = mDom(dParent, { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-flow': 'row nowrap' });
	let stflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let [l, m, r] = [mDom(d, stflex), mDom(d, stflex), mDom(d, stflex)];
	return [d, l, m, r];
}
function mLinebreak(dParent, gap) {
	dParent = toElem(dParent);
	let d;
	let display = getComputedStyle(dParent).display;
	if (display == 'flex') {
		d = mDiv(dParent, { fz: 2, 'flex-basis': '100%', h: 0, w: '100%' }, null, ' &nbsp; ');
	} else {
		d = mDiv(dParent, {}, null, '<br>');
	}
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }
	return d;
}
function mMagnify(elem, scale = 5) {
	elem.classList.add(`topmost`);
	MAGNIFIER_IMAGE = elem;
	const rect = elem.getBoundingClientRect();
	let [w, h] = [rect.width * scale, rect.height * scale];
	let [cx, cy] = [rect.width / 2 + rect.left, rect.height / 2 + rect.top];
	let [l, t, r, b] = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
	let originX = 'center';
	let originY = 'center';
	let [tx, ty] = [0, 0];
	if (l < 0) { tx = -l / scale; }
	if (t < 0) { ty = -t / scale; }
	if (r > window.innerWidth) { tx = -(r - window.innerWidth) / scale; }
	if (b > window.innerHeight) { ty = -(b - window.innerHeight) / scale; }
	elem.style.transform = `scale(${scale}) translate(${tx}px,${ty}px)`;
	elem.style.transformOrigin = `${originX} ${originY}`;
}
function mMagnifyOff() {
	if (!MAGNIFIER_IMAGE) return;
	let elem = MAGNIFIER_IMAGE;
	MAGNIFIER_IMAGE = null;
	elem.classList.remove(`topmost`); //magnify4`); 
	elem.style.transform = null;
}
function mMenu(dParent, key) { let [d, l, m, r] = mLMR(dParent); return { dParent, elem: d, l, m, r, key, cur: null }; }

function mNewline(d, gap = 1) { mDom(d, { h: gap }); }

function mNode(o, dParent, title, isSized = false) {
	let d = mCreate('div');
	mYaml(d, o);
	let pre = d.getElementsByTagName('pre')[0];
	pre.style.fontFamily = 'inherit';
	if (isdef(title)) mInsert(d, mText(title));
	if (isdef(dParent)) mAppend(dParent, d);
	if (isDict(o)) d.style.textAlign = 'left';
	if (isSized) addClass(d, 'centered');
	return d;
}
function mOnEnter(elem, handler) {
	elem.addEventListener('keydown', ev => {
		if (ev.key == 'Enter') {
			ev.preventDefault();
			mDummyFocus();
			if (handler) handler(ev);
		}
	});
}
function mOnEnterInput(elem, handler) {
	elem.addEventListener('keydown', ev => {
		if (ev.key == 'Enter') {
			ev.preventDefault();
			mDummyFocus();
			if (handler) handler(ev.target.value);
		}
	});
}
async function mOnclick(menu) {
	UI.nav.activate(menu);
	if (isdef(menu)) await window[`onclick${capitalize(menu)}`](); //eval(`onclick${capitalize(menu)}()`);}
}
function mPizza(dParent, sz) {
	let args = Array.from(arguments).slice(2);
	args = args.map(x => colorFrom(x))
	if (args.lenght == 0) return mDom(dParent, { w: sz, h: sz, border: 'silver', round: true });
	else if (args.length == 1) return mDom(dParent, { bg: args[0], w: sz, h: sz, border: 'silver', round: true });
	let html = generatePizzaSvg(sz, ...args);
	let el = mCreateFrom(html);
	let d = mDom(dParent, { patop: 4 }); //,{patop:4});
	mAppend(d, el);
	return el;
}
function mPlace(elem, pos, offx, offy) {
	elem = toElem(elem);
	pos = pos.toLowerCase();
	let dParent = elem.parentNode; mIfNotRelative(dParent);
	let hor = valf(offx, 0);
	let vert = isdef(offy) ? offy : hor;
	if (pos[0] == 'c' || pos[1] == 'c') {
		let dpp = dParent.parentNode;
		let opac = mGetStyle(dParent, 'opacity'); //console.log('opac', opac);
		if (nundef(dpp)) { mAppend(document.body, dParent); mStyle(dParent, { opacity: 0 }) }
		let rParent = getRect(dParent);
		let [wParent, hParent] = [rParent.w, rParent.h];
		let rElem = getRect(elem);
		let [wElem, hElem] = [rElem.w, rElem.h];
		if (nundef(dpp)) { dParent.remove(); mStyle(dParent, { opacity: valf(opac, 1) }) }
		switch (pos) {
			case 'cc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert + (hParent - hElem) / 2 }); break;
			case 'tc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert }); break;
			case 'bc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, bottom: vert }); break;
			case 'cl': mStyle(elem, { position: 'absolute', left: hor, top: vert + (hParent - hElem) / 2 }); break;
			case 'cr': mStyle(elem, { position: 'absolute', right: hor, top: vert + (hParent - hElem) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	elem.style.position = 'absolute';
	let kvert = di[pos[0]], khor = di[pos[1]];
	elem.style[kvert] = vert + 'px'; elem.style[khor] = hor + 'px';
}
function mPopup(dParent, styles = {}, opts = {}) {
	if (nundef(dParent)) dParent = document.body;
	if (isdef(mBy(opts.id))) mRemove(opts.id);
	mIfNotRelative(dParent);
	let animation = 'diamond-in-center .5s ease-in-out'; let transition = 'opacity .5s ease-in-out';
	addKeys({ animation, bg: 'white', fg: 'black', padding: 20, rounding: 12, top: 50, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }, styles);
	let popup = mDom(dParent, styles, opts);
	mButtonX(popup);
	return popup;
}
function mPos(d, x, y, unit = 'px') { mStyle(d, { left: x, top: y, position: 'absolute' }, unit); }

async function mPostRoute(route, o = {}) {
	let server = getServerurl();
	server += `/${route}`;
	const response = await fetch(server, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		mode: 'cors',
		body: JSON.stringify(o)
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	} else {
		return 'ERROR 1';
	}
}
function mPrompt(gadget) {
	return new Promise((resolve, reject) => {
		gadget.dialog.showModal();
		gadget.form.onsubmit = (ev) => {
			ev.preventDefault();
			resolve(gadget.inp.value);
			gadget.inp.value = '';
			gadget.dialog.close();
		};
	});
}
function mRadio(label, val, name, dParent, styles = {}, onchangeHandler, group_id, is_on) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles, group_id + '_' + val);
	let id = isdef(group_id) ? `i_${group_id}_${val}` : getUID();
	let type = isdef(group_id) ? 'radio' : 'checkbox';
	let checked = isdef(is_on) ? is_on : false;
	let inp = mCreateFrom(`<input class='radio' id='${id}' type="${type}" name="${name}" value="${val}">`);
	if (checked) inp.checked = true;
	let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(onchangeHandler)) {
		inp.onchange = ev => {
			ev.cancelBubble = true;
			if (onchangeHandler == 'toggle') {
			} else if (isdef(onchangeHandler)) {
				onchangeHandler(ev.target.checked, name, val);
			}
		};
	}
	return d;
}
function mRadioGroup(dParent, styles, id, legend, legendstyles) {
	let dOuter = mDom(dParent, { bg: 'white', rounding: 10, margin: 4 })
	let f = mCreate('fieldset');
	f.id = id;
	if (isdef(styles)) mStyle(f, styles);
	if (isdef(legend)) {
		let l = mCreate('legend');
		l.innerHTML = legend;
		mAppend(f, l);
		if (isdef(legendstyles)) { mStyle(l, legendstyles); }
	}
	mAppend(dOuter, f);
	return f;
}
function mRemove(elem) {
	elem = toElem(elem); if (nundef(elem)) return;
	var a = elem.attributes, i, l, n;
	if (a) {
		for (i = a.length - 1; i >= 0; i -= 1) {
			n = a[i].name;
			if (typeof elem[n] === 'function') {
				elem[n] = null;
			}
		}
	}
	a = elem.childNodes;
	if (a) {
		l = a.length;
		for (i = a.length - 1; i >= 0; i -= 1) {
			mRemove(elem.childNodes[i]);
		}
	}
	elem.remove();
}
function mRemoveClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }

function mRemoveIfExists(d) { d = toElem(d); if (isdef(d)) d.remove(); }

function mRise(d, ms = 800) {
	toElem(d).animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mRows100(dParent, spec, gap = 4) {
	let grid = mDiv(dParent, { padding: gap, gap: gap, box: true, display: 'grid', h: '100%', w: '100%' })
	grid.style.gridTemplateRows = spec;
	let res = [];
	for (const i of range(stringCount(spec, ' ') + 1)) {
		let d = mDiv(grid, { h: '100%', w: '100%', box: true })
		res.push(d);
	}
	return res;
}
function mSelect(elem) { mClass(elem, 'framedPicture'); }

function mShield(dParent, styles = {}, id = null, classnames = null, hideonclick = false) {
	addKeys({ bg: '#00000020' }, styles);
	dParent = toElem(dParent);
	let d = mDiv(dParent, styles, id, classnames);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	if (hideonclick) d.onclick = ev => { evNoBubble(ev); d.remove(); };
	else d.onclick = ev => { evNoBubble(ev); };
	mClass(d, 'topmost');
	return d;
}
function mSidebar(dParent = 'dLeft', wmin = 170, styles = {}, opts = {}) {
	dParent = toElem(dParent);
	mStyle(dParent, { wmin: wmin, patop: 25 });
	let d = mDom(dParent, styles, opts);
	return { wmin, d }
}
function mSizeSuccession(styles = {}, szDefault = 100, fromWidth = true) {
	let [w, h] = [styles.w, styles.h];
	if (fromWidth) {
		w = valf(w, styles.sz, h, szDefault);
		h = valf(h, styles.sz, w, szDefault);
	} else {
		h = valf(h, styles.sz, w, szDefault);
		w = valf(w, styles.sz, h, szDefault);
	}
	return [w, h];
}
function mSleep(ms = 1000) {
	return new Promise(
		(res, rej) => {
			if (ms > 10000) { ms = 10000; }
			if (isdef(TO.SLEEPTIMEOUT)) clearTimeout(TO.SLEEPTIMEOUT);
			TO.SLEEPTIMEOUT = setTimeout(res, ms);
			setTimeout(() => {
				try {
					rej(`PROMISE REJECT ${isdef(TO.SLEEPTIMEOUT)}`);
				} catch (err) {
					console.log(`WTF!!!!!!!!!!!!!!!!!!`, err);
				}
			}, ms + 1);
		});
}
function mStyle(elem, styles = {}, unit = 'px') {
	elem = toElem(elem);
	let style = styles = jsCopy(styles);
	if (isdef(styles.w100)) style.w = '100%';
	if (isdef(styles.h100)) style.h = '100%';
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = colorsFromBFA(styles.bg, styles.fg, styles.alpha);
	}
	if (isdef(styles.vpadding) || isdef(styles.hpadding)) {
		styles.padding = valf(styles.vpadding, 0) + unit + ' ' + valf(styles.hpadding, 0) + unit;
	}
	if (isdef(styles.vmargin) || isdef(styles.hmargin)) {
		styles.margin = valf(styles.vmargin, 0) + unit + ' ' + valf(styles.hmargin, 0) + unit;
	}
	if (isdef(styles.upperRounding) || isdef(styles.lowerRounding)) {
		let rtop = '' + valf(styles.upperRounding, 0) + unit;
		let rbot = '' + valf(styles.lowerRounding, 0) + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	}
	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	if (isdef(styles.round)) { elem.style.setProperty('border-radius', '50%'); }
	for (const k in styles) {
		if (['round', 'box'].includes(k)) continue;
		let val = styles[k];
		let key = k;
		if (isdef(STYLE_PARAMS[k])) key = STYLE_PARAMS[k];
		else if (k == 'font' && !isString(val)) {
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k.includes('class')) {
			mClass(elem, styles[k]);
		} else if (k == 'border') {
			if (isNumber(val)) val = `solid ${val}px ${isdef(styles.fg) ? styles.fg : '#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'ajcenter') {
			elem.style.setProperty('justify-content', 'center');
			elem.style.setProperty('align-items', 'center');
		} else if (k == 'layout') {
			if (val[0] == 'f') {
				val = val.slice(1);
				elem.style.setProperty('display', 'flex');
				elem.style.setProperty('flex-wrap', 'wrap');
				let hor, vert;
				if (val.length == 1) hor = vert = 'center';
				else {
					let di = { c: 'center', s: 'start', e: 'end' };
					hor = di[val[1]];
					vert = di[val[2]];
				}
				let justStyle = val[0] == 'v' ? vert : hor;
				let alignStyle = val[0] == 'v' ? hor : vert;
				elem.style.setProperty('justify-content', justStyle);
				elem.style.setProperty('align-items', alignStyle);
				switch (val[0]) {
					case 'v': elem.style.setProperty('flex-direction', 'column'); break;
					case 'h': elem.style.setProperty('flex-direction', 'row'); break;
				}
			} else if (val[0] == 'g') {
				val = val.slice(1);
				elem.style.setProperty('display', 'grid');
				let n = allNumbers(val);
				let cols = n[0];
				let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
				elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
				elem.style.setProperty('place-content', 'center');
			}
		} else if (k == 'layflex') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex', '0 1 auto');
			elem.style.setProperty('flex-wrap', 'wrap');
			if (val == 'v') { elem.style.setProperty('writing-mode', 'vertical-lr'); }
		} else if (k == 'laygrid') {
			elem.style.setProperty('display', 'grid');
			let n = allNumbers(val);
			let cols = n[0];
			let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
			elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
			elem.style.setProperty('place-content', 'center');
		}
		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else if (key == 'wrap') { if (val == 'hard') elem.setAttribute('wrap', 'hard'); else elem.style.flexWrap = 'wrap'; }
		else if (k.startsWith('dir')) {
			isCol = val[0] == 'c';
			elem.style.setProperty('flex-direction', 'column');
		} else if (key == 'flex') {
			if (isNumber(val)) val = '' + val + ' 1 0%';
			elem.style.setProperty(key, makeUnitString(val, unit));
		} else {
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}
function mSwitch(dParent, styles = {}, opts = {}) {
	addKeys({ id: 'dSwitch', val: '' }, opts);
	let inpid = `inp${opts.id}`
	let html = `
      <label class="switch">
        <input id='${inpid}' type="checkbox" ${opts.val}>
        <span class="slider round"></span>
      </label>
    `;
	opts.html = html
	let d = mDom(dParent, styles, opts);
	return { div: d, inp: mBy(inpid) };
}
function mSym(key, dParent, styles = {}, pos, classes) {
	let info = Syms[key];
	styles.display = 'inline-block';
	let family = info.family;
	styles.family = family;
	let sizes;
	if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
	else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
	else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
	else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
	else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
	else { sizes = mSymSizeToFz(info, 25); }
	styles.fz = sizes.fz;
	styles.w = sizes.w;
	styles.h = sizes.h;
	styles.align = 'center';
	if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }
	let x = mDiv(dParent, styles, null, info.text);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mSymSizeToBox(info, w, h) {
	let fw = w / info.w;
	let fh = h / info.h;
	let f = Math.min(fw, fh);
	return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }

function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }

function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }

function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	if (isdef(className)) mClass(t, className);
	if (isdef(styles)) mStyle(t, styles);
	if (showheaders) {
		let code = `<tr>`;
		for (const h of headers) {
			code += `<th>${h}</th>`
		}
		code += `</tr>`;
		t.innerHTML = code;
	}
	return t;
}
function mTableCol(r, val) {
	let col = mCreate('td');
	mAppend(r, col);
	if (isdef(val)) col.innerHTML = val;
	return col;
}
function mTableCommandify(rowitems, di) {
	for (const item of rowitems) {
		for (const index in di) {
			let colitem = item.colitems[index];
			colitem.div.innerHTML = di[index](item, colitem.val);
		}
	}
}
function mTableRow(t, o, headers, id) {
	let elem = mCreate('tr');
	if (isdef(id)) elem.id = id;
	mAppend(t, elem);
	let colitems = [];
	for (const k of headers) {
		let val = isdef(o[k]) ? isDict(o[k]) ? JSON.stringify(o[k]) : isList(o[k]) ? o[k].join(', ') : o[k] : '';
		let col = mTableCol(elem, val);
		colitems.push({ div: col, key: k, val: val });
	}
	return { div: elem, colitems: colitems };
}
function mTableStylify(rowitems, di) {
	for (const item of rowitems) {
		for (const index in di) {
			let colitem = item.colitems[index];
			mStyle(colitem.div, di[index]);
		}
	}
}
function mText(text, dParent, styles, classes) {
	if (!isString(text)) text = text.toString();
	let d = mDiv(dParent);
	if (!isEmpty(text)) { d.innerHTML = text; }
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mTextArea100(dParent, styles = {}) {
	mCenterCenterFlex(dParent)
	let html = `<textarea style="width:100%;height:100%;box-sizing:border-box" wrap="hard"></textarea>`;
	let t = mCreateFrom(html);
	mStyle(t, styles);
	mAppend(dParent, t);
	return t;
}
function mUnselect(elem) { mClassRemove(elem, 'framedPicture'); }

function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
}
function makeArrayWithParts(keys) {
	let arr = []; keys[0].split('_').map(x => arr.push([]));
	for (const key of keys) {
		let parts = key.split('_');
		for (let i = 0; i < parts.length; i++) arr[i].push(parts[i]);
	}
	return arr;
}
function makeDefaultPool(fromData) {
	if (nundef(fromData) || isEmpty(fromData.table) && isEmpty(fromData.players)) return {};
	if (nundef(fromData.table)) fromData.table = {};
	let data = jsCopy(fromData.table);
	for (const k in fromData.players) {
		data[k] = jsCopy(fromData.players[k]);
	}
	return data;
}
function makePool(cond, source, R) {
	if (nundef(cond)) return [];
	else if (cond == 'all') return source;
	let pool = [];
	for (const oid of source) {
		let o = R.getO(oid);
		if (!evalConds(o, cond)) continue;
		pool.push(oid);
	}
	return pool;
}
function makeSVG(tag, attrs) {
	var el = "<" + tag;
	for (var k in attrs)
		el += " " + k + "=\"" + attrs[k] + "\"";
	return el + "/>";
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
function measureElement(el) {
	let info = window.getComputedStyle(el, null);
	return { w: info.width, h: info.height };
}
function measureFieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	let labels = fs.getElementsByTagName('label');
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		wmax = Math.max(wmax, r1.w);
	}
	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
	}
	let wneeded = Math.max(wt, wo) + 10;
	mStyle(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function measureHeight(elem) { return mGetStyle(elem, 'h') }

function measureHeightOfTextStyle(dParent, styles = {}) {
	let d = mDom(dParent, styles, { html: 'Hql' });
	let s = measureElement(d);
	d.remove();
	return firstNumber(s.h);
}
function measureWidth(elem) { return mGetStyle(elem, 'w') }

function menuCloseCalendar() { closePopup(); delete DA.calendar; clearMain(); }

function menuCloseCurrent(menu) {
	let curKey = lookup(menu, ['cur']);
	if (curKey) {
		let cur = menu.commands[curKey];
		if (nundef(cur)) return;
		mClassRemove(iDiv(cur), 'activeLink'); //unselect cur command
		cur.close();
	}
}
function menuCloseGames() { clearMain(); }

function menuCloseHome() { closeLeftSidebar(); clearMain(); }

async function menuCloseSettings() { delete DA.settings; closeLeftSidebar(); clearMain(); }

function menuCloseSimple() { closeLeftSidebar(); clearMain(); }

function menuCloseTable() { if (T) Tid = T.id; T = null; delete DA.pendingChanges; clearMain(); }

function menuCommand(dParent, menuKey, key, html, open, close) {
	let cmd = mCommand(dParent, key, html, { open, close });
	let a = iDiv(cmd);
	a.setAttribute('key', `${menuKey}_${key}`);
	a.onclick = onclickMenu;
	cmd.menuKey = menuKey;
	return cmd;
}
function menuDisable(menu, key) { mClass(iDiv(menu.commands[key]), 'disabled') }

function menuEnable(menu, key) { mClassRemove(iDiv(menu.commands[key]), 'disabled') }

async function menuOpen(menu, key, defaultKey = 'settings') {
	let cmd = menu.commands[key];
	if (nundef(cmd)) { console.log('abandon', key); await switchToMainMenu(defaultKey); return; }
	menu.cur = key;
	mClass(iDiv(cmd), 'activeLink'); //console.log('cmd',cmd)
	if (isdef(mBy('dExtra'))) await updateExtra();
	await cmd.open();
}
function mergeArrays(target, source) {
	function getKey(item) { return item.key || item.id || item.name; }
	const merged = Array.from(target);
	const keyMap = {};
	target.forEach((item, index) => {
		const k = getKey(item);
		if (k) keyMap[k] = index;
	});
	source.forEach((item) => {
		const k = getKey(item);
		if (k && keyMap[k] !== undefined) {
			merged[keyMap[k]] = deepMerge(target[keyMap[k]], item);
		} else {
			merged.push(item);
		}
	});
	return merged;
}
function mergeDynSetNodes(o) {
	let merged = {};
	let interpool = null;
	for (const nodeId in o.RSG) {
		let node = jsCopy(dynSpec[nodeId]);
		let pool = node.pool;
		if (pool) {
			if (!interpool) interpool = pool;
			else interpool = intersection(interpool, pool);
		}
		merged = deepmerge(merged, node);
	}
	merged.pool = interpool;
	return merged;
}
function mergeIncludingPrototype(oid, o) {
	let merged = mergeDynSetNodes(o);
	merged.oid = oid;
	let t = merged.type;
	let info;
	if (t && PROTO[t]) {
		info = deepmerge(merged, jsCopy(PROTO[t]));
	} else info = merged;
	return info;
}
function mergeObject(target, source, optionsArgument) {
	var destination = {}
	if (isMergeableObject(target)) {
		Object.keys(target).forEach(function (key) {
			destination[key] = cloneIfNecessary(target[key], optionsArgument)
		})
	}
	Object.keys(source).forEach(function (key) {
		if (!isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneIfNecessary(source[key], optionsArgument)
		} else {
			destination[key] = deepmerge(target[key], source[key], optionsArgument)
		}
	})
	return destination;
}
function mergeOverride(base, drueber) { return _deepMerge(base, drueber, { arrayMerge: _overwriteMerge }); }

function mergeOverrideArrays(base, drueber) {
	return deepmerge(base, drueber, { arrayMerge: overwriteMerge });
}
function mimali(c, m) {
	let seasonColors = 'winter_blue midnightblue light_azure capri spring_frost light_green deep_green summer_sky yellow_pantone orange pale_fallen_leaves timberwolf'.split(' ');
	let c2 = seasonColors[m - 1];
	let colors = paletteMix(c, c2, 6).slice();
	let wheel = [];
	for (const x of colors) {
		let pal1 = paletteShades(x);
		for (const i of range(7)) wheel.push(pal1[i + 2]);
	}
	return wheel;
}
function mixColors(c1, c2, c2Weight01) {
	let [color1, color2] = [colorFrom(c1), colorFrom(c2)]
	const hex1 = color1.substring(1);
	const hex2 = color2.substring(1);
	const r1 = parseInt(hex1.substring(0, 2), 16);
	const g1 = parseInt(hex1.substring(2, 4), 16);
	const b1 = parseInt(hex1.substring(4, 6), 16);
	const r2 = parseInt(hex2.substring(0, 2), 16);
	const g2 = parseInt(hex2.substring(2, 4), 16);
	const b2 = parseInt(hex2.substring(4, 6), 16);
	const r = Math.floor(r1 * (1 - c2Weight01) + r2 * c2Weight01);
	const g = Math.floor(g1 * (1 - c2Weight01) + g2 * c2Weight01);
	const b = Math.floor(b1 * (1 - c2Weight01) + b2 * c2Weight01);
	const hex = colorRgbArgsToHex79(r, g, b);
	return hex;
}
function modifyStat(name, prop, val) {
	let id = `stat_${name}_${prop}`;
	console.log('id', id)
	let ui = mBy(id);
	console.log('ui', ui)
	if (isdef(ui)) ui.innerHTML = val;
}
function name2id(name) { return 'd_' + name.split(' ').join('_'); }

function nextBar(ctx, rest, color) {
	list = rest;
	let val = findMostFrequentVal(list, 'x');
	rest = list.filter(p => !isWithinDelta(p.x, val, 2));
	let line = getBar(ctx, list, val);
	line.map(p => drawPix(ctx, p.x, p.y, color));
	return { val, line, rest, color };
}
function nextLine(ctx, rest, color) {
	list = rest;
	let val = findMostFrequentVal(list, 'y');
	rest = list.filter(p => !isWithinDelta(p.y, val, 2));
	let line = getLine(ctx, list, val);
	if (line) line.map(p => drawPix(ctx, p.x, p.y, color));
	return { val, line, rest, color };
}
function normalizeString(s, sep = '_', keep = []) {
	s = s.toLowerCase().trim();
	let res = '';
	for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i]) || keep.includes(s[i])) res += s[i]; else res += sep; }
	return res;
}
function nundef(x) { return x === null || x === undefined || x === 'undefined'; }

async function onEventEdited(id, text, time) {
	console.log('onEventEdited', id, text, time)
	let e = Items[id];
	if (nundef(time)) {
		[time, text] = extractTime(text);
	}
	e.time = time;
	e.text = text;
	let result = await simpleUpload('postUpdateEvent', e);
	console.log('result', result)
	Items[id] = lookupSetOverride(Serverdata, ['events', id], e);
	mBy(id).firstChild.value = getEventValue(e);
	closePopup();
}
async function onchangeBotSwitch(ev) {
	let elem = ev.target;
	assertion(T, "NO TABLE!!!!!!!!!!!!!!!")
	let name = getUname();
	let id = T.id;
	let playmode = (elem.checked) ? 'bot' : 'human';
	let olist = [{ keys: ['players', name, 'playmode'], val: playmode }];
	let res = await mPostRoute(`olist`, { id, name, olist }); //console.log(res)
}
async function onclickAddSelected() {
	let keys = UI.selectedImages;
	let cmd = UI.commands.addSelected;
	let collist = M.collections.filter(x => !simpleLocked(x)).map(x => ({ name: x, value: false }));
	let result = await mGather(iDiv(cmd), {}, { content: collist, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing added'); simpleClearSelections(); return; }
	assertion(isList(result), 'uiCadgetTypeChecklist result is NOT a list!!!')
	let di = {}, changed = false;
	for (const key of keys) {
		let o = M.superdi[key];
		for (const collname of result) {
			if (o.colls.includes(collname)) continue;
			changed = true;
			o.colls.push(collname);
			di[key] = o;
		}
	}
	if (!changed) { console.log('nothing added'); simpleClearSelections(); return; }
	console.log('items changed:', Object.keys(di));
	await updateSuperdi(di);
	simpleInit();
}
function onclickClear(inp, grid) {
	inp.value = '';
	let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]'));
	checklist.map(x => x.checked = false);
	sortCheckboxes(grid);
}
async function onclickClearPlayers() {
	let me = getUname();
	DA.playerList = [me];
	for (const name in DA.allPlayers) {
		if (name != me) unselectPlayerItem(DA.allPlayers[name]);
	}
	assertion(!isEmpty(DA.playerList), "uname removed from playerList!!!!!!!!!!!!!!!")
	DA.lastName = me;
	mRemoveIfExists('dPlayerOptions')
}
async function onclickColor(color) {
	let hex = colorToHex79(color);
	U.color = hex; delete U.fg;
	await updateUserTheme()
}
async function onclickCommand(ev) {
	let key = evToAttr(ev, 'key'); //console.log(key);
	let cmd = key == 'user' ? UI.nav.commands.user : UI.commands[key];
	assertion(isdef(cmd), `command ${key} not in UI!!!`)
	await cmd.open();
}
function onclickDay(d, styles) {
	let tsDay = d.id;
	let tsCreated = Date.now();
	let id = generateEventId(tsDay, tsCreated);
	let uname = U ? getUname() : 'guest';
	let o = { id: id, created: tsCreated, day: tsDay, time: '', text: '', user: uname, shared: false, subscribers: [] };
	Items[id] = o;
	let x = uiTypeEvent(d, o, styles);
	x.inp.focus();
}
async function onclickDeleteCollection(name) {
	if (nundef(name) && UI.collSecondary.isOpen) name = UI.collSecondary.name;
	if (nundef(name)) name = await mGather(iDiv(UI.deleteCollection), 'name');
	if (!name) return;
	if (collLocked(name)) { showMessage(`collection ${name} cannot be deleted!!!!`); return; }
	let proceed = await mGather(iDiv(UI.deleteCollection), {}, { type: 'yesNo', content: `delete collection ${name}?` });
	if (proceed) await collDelete(name);
	if (UI.collSecondary.isOpen && UI.collSecondary.name == name) collCloseSecondary();
	if (UI.collPrimary.name == name) { UI.collPrimary.name = 'all'; collOpenPrimary(); }
}
async function onclickDeleteSelected() {
	let selist = UI.selectedImages;
	let di = {}, deletedKeys = {};
	for (const k of selist) {
		let o = collKeyCollnameFromSelkey(k);
		let key = o.key;
		let collname = o.collname;
		if (collLocked(collname)) continue;
		if (nundef(deletedKeys[collname])) deletedKeys[collname] = [];
		await collDeleteOrRemove(key, collname, di, deletedKeys[collname]);
	}
	if (isEmpty(di) && Object.keys(deletedKeys).every(x => isEmpty(deletedKeys[x]))) {
		showMessage(`ERROR: cannot delete selected items!!!`);
		collClearSelections();
		return;
	}
	console.log('deletedKeys dict: ', deletedKeys);
	for (const k in deletedKeys) {
		let res = await mPostRoute('postUpdateSuperdi', { di, deletedKeys: deletedKeys[k], collname: k });
		console.log('postUpdateSuperdi', k, res)
		di = {};
	}
	await loadAssets();
	collPostReload();
}
async function onclickDeleteTable(id) {
	let res = await mPostRoute('deleteTable', { id });
}
async function onclickEditDetails() {
	let key = UI.selectedImages[0];
	let cmd = UI.commands.simpleNew;
	await editDetailsFor(key, iDiv(cmd));
}
function onclickExistingEvent(ev) { evNoBubble(ev); showEventOpen(evToId(ev)); }

async function onclickGameMenuItem(ev) {
	let gamename = evToAttr(ev, 'gamename');
	await showGameMenu(gamename);
}
async function onclickGameMenuPlayer(ev) {
	let name = evToAttr(ev, 'username'); //console.log('name',name); return;
	let shift = ev.shiftKey;
	await showGameMenuPlayerDialog(name, shift);
}
function onclickHex(item, board) {
	toggleItemSelectionUnique(item, board.items);
	if (isdef(board.handler)) board.handler(item, board);
}
async function onclickHome() { UI.nav.activate(); await showDashboard(); }

async function onclickHomeNew() {
	let d = mDom('dMain'); mCenterCenterFlex(d);
	let dt = mDom(d, { fg: getThemeFg(), box: true, w100: true, padding: 20 }, { html: `${me}'s blog` });
	mDom(dt, { w100: true, margin: 'auto' }, { tag: 'textarea', rows: 15 });
	let db = mDom(dt);
	mButton('Save', homeOnclickSaveBlog, db, {}, 'button');
}
async function onclickJoinTable(id) {
	let table = Serverdata.tables.find(x => x.id == id);
	let me = getUname();
	assertion(table.status == 'open', 'too late to join! game has already started!')
	assertion(!table.playerNames.includes(me), `${me} already joined!!!`);
	table.players[me] = createGamePlayer(me, table.game);
	table.playerNames.push(me);
	let res = await mPostRoute('postTable', { id, players: table.players, playerNames: table.playerNames });
}
async function onclickLeaveTable(id) {
	let table = Serverdata.tables.find(x => x.id == id);
	let me = getUname();
	assertion(table.status == 'open', 'too late to leave! game has already started!')
	assertion(table.playerNames.includes(me), `${me} NOT in joined players!!!!`);
	delete table.players[me];
	removeInPlace(table.playerNames, me);
	let res = await mPostRoute('postTable', { id, players: table.players, playerNames: table.playerNames });
}
function onclickMenu(ev) {
	let keys = evToAttr(ev, 'key');
	let [menuKey, cmdKey] = keys.split('_');
	let menu = UI[menuKey];
	switchToMenu(menu, cmdKey);
}
async function onclickNATIONS() {
	if (nundef(M.natCards)) M.natCards = await mGetYaml('../assets/games/nations/cards.yaml');
	M.civs = ['america', 'arabia', 'china', 'egypt', 'ethiopia', 'greece', 'india', 'japan', 'korea', 'mali', 'mongolia', 'persia', 'poland', 'portugal', 'rome', 'venice', 'vikings'];
	let player = M.player = { civ: rChoose(M.civs) };
	M.ages = { 1: { events: [], progress: [] }, 2: { events: [], progress: [] }, 3: { events: [], progress: [] }, 4: { events: [], progress: [] } };
	for (const k in M.natCards) {
		let c = M.natCards[k];
		if (c.age == 0) continue;
		let age = c.age == 0 ? 1 : c.age;
		if (c.Type == 'event') M.ages[age].events.push(k); else M.ages[age].progress.push(k);
	}
	M.age = 1;
	M.events = M.ages[M.age].events;
	M.progress = M.ages[M.age].progress;
	arrShuffle(M.progress);
	arrShuffle(M.events);
	let d1 = mDiv('dMain'); mFlex(d1);
	UI.coll.rows = 3; UI.coll.cols = 7;
	let bg = getNavBg();
	let h = 180;
	let dcost = M.costGrid = mGrid(UI.coll.rows, 1, d1, { 'align-self': 'start' });
	for (let cost = 3; cost >= 1; cost--) {
		let d2 = mDom(dcost, { display: 'flex', 'justify-content': 'center', 'flex-flow': 'column', box: true, margin: 2, h: h, overflow: 'hidden' }, {});
		for (let i = 0; i < cost; i++) mDom(d2, { h: 40 }, { tag: 'img', src: `../assets/games/nations/templates/gold.png` });
	}
	UI.coll.grid = mGrid(UI.coll.rows, UI.coll.cols, d1, { 'align-self': 'start' });
	UI.coll.cells = [];
	for (let i = 0; i < UI.coll.rows * UI.coll.cols; i++) {
		let d = mDom(UI.coll.grid, { box: true, margin: 2, h: h, overflow: 'hidden' });
		mCenterCenterFlex(d);
		UI.coll.cells.push(d);
	}
	let n = UI.coll.rows * UI.coll.cols;
	M.market = [];
	for (let i = 0; i < n; i++) {
		let k = M.progress.shift();
		M.market.push(k);
		let card = M.natCards[k];
		let img = mDom(UI.coll.cells[i], { h: h, w: 115 }, { tag: 'img', src: `../assets/games/nations/cards/${k}.png` });
		img.setAttribute('key', k)
		img.onclick = buyProgressCard;
	}
	mDom('dMain', { h: 20 })
	let dciv = mDom('dMain', { w: 800, h: 420, maleft: 52, bg: 'red', position: 'relative' });
	let iciv = await loadImageAsync(`../assets/games/nations/civs/civ_${player.civ}.png`, mDom(dciv, { position: 'absolute' }, { tag: 'img' }));
	M.civCells = [];
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 7; j++) {
			let r = getCivSpot(player.civ, i, j);
			let [dx, dy, dw, dh] = [10, 10, 15, 20]
			let d = mDom(dciv, { box: true, w: r.w + dw, h: r.h + dh, left: r.x - dx, top: r.y - dy, position: 'absolute', overflow: 'hidden' });
			mCenterCenterFlex(d);
			M.civCells.push(d);
			d.onclick = () => selectCivSpot(d);
		}
	}
}
async function onclickOpenToJoinGame() {
	let options = collectOptions();
	let players = collectPlayers();
	mRemove('dGameMenu');
	let t = createOpenTable(DA.gamename, players, options);
	let res = await mPostRoute('postTable', t);
}
function onclickPasteDetailObject(text, inputs, wIdeal, df, styles, opts) {
	function parseToInputs(o) {
		let keys = Object.keys(o);
		if (keys.length == 1) { o = o[keys[0]]; }
		let onorm = {};
		for (const k in o) {
			let k1 = normalizeString(k);
			onorm[k1] = o[k];
		}
		if (isEmpty(inputs)) {
			mBy('bParseIntoForm').remove();
			fillMultiForm(o, inputs, wIdeal, df, styles, opts);
		} else {
			for (const oinp of inputs) {
				let k = normalizeString(oinp.name);
				if (isdef(o[k])) oinp.inp.value = o[k];
			}
		}
	}
	try {
		let o = jsyaml.load(text);
		if (isdef(o)) parseToInputs(o);
	} catch {
		try {
			let o = JSON.parse(text);
			if (isdef(o)) parseToInputs(o);
		} catch { showMessage('text cannot be parsed into yaml or json object!') }
	}
}
async function onclickPlan() { await showCalendarApp(); }

async function onclickPlay() {
	await showTables('onclickPlay');
	showGames();
}
async function onclickSetAvatar(ev) { await simpleSetAvatar(UI.selectedImages[0]); }

async function onclickSettAddYourTheme() {
	let nameEntered = await mGather(iDiv(UI.commands.settAddYourTheme));
	let name = normalizeString(nameEntered);
	let ohne = replaceAll(name, '_', '');
	if (isEmpty(ohne)) { showMessage(`name ${nameEntered} is not valid!`); return; }
	let o = {};
	for (const s of ['color', 'texture', 'blendMode', 'fg']) {
		if (isdef(U[s])) o[s] = U[s];
	}
	o.name = name;
	let themes = lookup(Serverdata.config, ['themes']);
	let key = isdef(themes[name]) ? rUniqueId(6, 'th') : name;
	Serverdata.config.themes[key] = o;
	await mPostRoute('postConfig', Serverdata.config);
	await onclickSettTheme();
}
async function onclickSettBlendMode() {
	if (isEmpty(U.texture)) {
		showMessage('You need to set a Texture in order to set a Blend Mode!');
		return;
	}
	localStorage.setItem('settingsMenu', 'settBlendMode')
	showBlendModes();
}
async function onclickSettColor() {
	localStorage.setItem('settingsMenu', 'settColor')
	await showColors();
}
async function onclickSettDeleteTheme() {
	let nameEntered = await mGather(iDiv(UI.commands.settDeleteTheme));
	let name = normalizeString(nameEntered);
	if (!lookup(Serverdata.config, ['themes', name])) { showMessage(`theme ${name} does not exist!`); return; }
	delete Serverdata.config.themes[name];
	await mPostRoute('postConfig', Serverdata.config);
	await onclickSettTheme();
}
async function onclickSettFg() {
	localStorage.setItem('settingsMenu', 'settFg')
	await showTextColors();
}
async function onclickSettMyTheme() {
	localStorage.setItem('settingsMenu', 'settMyTheme')
	let dSettings = mBy('dSettingsMenu'); mClear(dSettings);
	let d = mDom(dSettings, { h: '100vh', bg: U.color })
	let dOuter = mDom(d, { padding: 25 }); // { padding: 10, gap: 10, margin:'auto', w:500, align:'center', bg:'white' }); //mCenterFlex(dParent);
	mCenterFlex(dOuter)
	let ui = await uiTypePalette(dOuter, U.color, U.fg, U.texture, U.blendMode);
}
async function onclickSettRemoveTexture() {
	if (isEmpty(U.texture)) return;
	for (const prop of ['texture', 'palette', 'blendMode', 'bgImage', 'bgSize', 'bgBlend', 'bgRepeat']) delete U[prop];
	await updateUserTheme();
}
async function onclickSettResetAll() {
	assertion(isdef(DA.settings), "NO DA.settings!!!!!!!!!!!!!!!")
	if (JSON.stringify(U) == JSON.stringify(DA.settings)) return;
	U = jsCopy(DA.settings);
	await postUserChange(U, true);
	setUserTheme();
	await settingsOpen();
	settingsCheck();
}
async function onclickSettTexture() {
	localStorage.setItem('settingsMenu', 'settTexture')
	await showTextures();
}
async function onclickSettTheme() {
	localStorage.setItem('settingsMenu', 'settTheme')
	await showThemes();
}
async function onclickSimple() {
	let name = valf(localStorage.getItem('sisi'), 'tierspiel'); //console.log(name);
	simpleSidebar(150);
	mAdjustPage(150);
	let div = mDom100('dMain');
	let sisi = UI.simple = { name, div };
	let [w, h, bg, fg] = [sisi.w, sisi.h, sisi.bg, sisi.fg] = [mGetStyle(div, 'w'), mGetStyle(div, 'h'), getNavBg(), getThemeFg()];
	let d1 = mDom(div); mCenterFlex(d1)
	let dMenu = sisi.dMenu = mDom(d1, { gap: 10, padding: 12 }, { className: 'title' }); mFlexVWrap(dMenu);
	let dInstruction = sisi.dInstruction = mDom(d1, { w100: true, align: 'center', fg }, { html: '* press Control key when hovering to magnify image! *' })
	let dBatch = sisi.dBatch = mDom(d1);
	let cellStyles = { bg, fg: 'contrast', box: true, margin: 8, w: 128, h: 128, overflow: 'hidden' };
	let o = createBatchGridCells(dBatch, w * .9, h * .9, cellStyles);
	addKeys(o, sisi);
	mStyle(dInstruction, { w: mGetStyle(sisi.dGrid, 'w') });
	mLinebreak(d1)
	sisi.dPageIndex = mDom(d1, { fg });
	simpleInit(name, sisi);
	sisi.isOpen = true;
	sisi.dInstruction.innerHTML = '* press Ctrl while hovering over an image for details *'; //'* drag images into the shaded area *'
	let grid = sisi.dGrid;
	mStyle(grid, { bg: '#00000030' })
	enableDataDrop(grid, simpleOnDropImage)
}
async function onclickSimpleClearSelections(ev) { simpleClearSelections(); }

async function onclickSimpleNew(name) {
	let cmd = lookup(UI.commands, ['simpleNew']); assertion(cmd, "UI.commands.simpleNew!!!!!")
	if (nundef(name)) name = await mGather(iDiv(cmd));
	if (!name) return;
	name = normalizeString(name);
	if (isEmpty(name)) {
		showMessage(`ERROR! you need to enter a valid name!!!!`);
		return;
	}
	if (M.collections.includes(name)) {
		showMessage(`collection ${name} already exists!`);
	}
	M.collections.push(name); M.collections.sort();
	if (name != UI.simple) simpleInit(name, UI.simple);
}
async function onclickSimpleRemove() {
	let selist = UI.selectedImages;
	let di = {};
	for (const key of selist) {
		let collname = UI.simple.name;
		if (simpleLocked(collname)) continue;
		let item = M.superdi[key];
		removeInPlace(item.colls, collname);
		di[key] = item;
	}
	if (isEmpty(di)) {
		showMessage(`ERROR: cannot delete selected items!!!`);
		simpleClearSelections();
		return;
	}
	await updateSuperdi(di);
	simpleInit()
}
async function onclickSimpleSelectAll(ev) {
	let sisi = UI.simple;
	for (const cell of sisi.cells) {
		let d = cell.firstChild;
		if (nundef(d)) break;
		mSelect(d);
	}
	for (const k of sisi.keys) { addIf(UI.selectedImages, k); }
	simpleCheckCommands();
}
async function onclickSimpleSelectPage(ev) {
	let sisi = UI.simple;
	for (const cell of sisi.cells) {
		let d = cell.firstChild;
		if (nundef(d)) break;
		mSelect(d);
		let o = sisi.items[d.id];
		addIf(UI.selectedImages, o.key);
	}
	simpleCheckCommands();
}
async function onclickStartGame() {
	await saveDataFromPlayerOptionsUI(DA.gamename);
	let options = collectOptions();
	let players = collectPlayers();
	await startGame(DA.gamename, players, options);
}
async function onclickStartTable(id) {
	let table = Serverdata.tables.find(x => x.id == id);
	if (nundef(table)) table = await mGetRoute('table', { id });
	if (!table) { showMessage('table deleted!'); return await showTables('showTable'); }
	console.log('table', jsCopy(table));
	table = setTableToStarted(table);
	let res = await mPostRoute('postTable', table);
}
async function onclickTable(id) {
	Tid = id;
	await switchToMainMenu('table');
}
async function onclickTableMenu() {
	let id = getTid();
	if (nundef(id)) {
		let me = getUname();
		let table = Serverdata.tables.find(x => x.status == 'started' && x.turn.includes(me));
		if (nundef(table)) table = Serverdata.tables.find(x => x.status == 'started' && x.playerNames.includes(me));
		if (nundef(table)) table = Serverdata.tables.find(x => x.status != 'open' && x.playerNames.includes(me));
		if (nundef(table)) table = Serverdata.tables.find(x => x.status != 'open');
		if (isdef(table)) id = table.id;
	}
	if (isdef(id)) { Tid = null; await showTable(id); } else await switchToMainMenu('play');
}
async function onclickTest() { console.log('nations!!!!'); }

async function onclickTextColor(fg) {
	let hex = colorToHex79(fg);
	U.fg = hex;
	await updateUserTheme();
}
async function onclickTexture(item) {
	U.texture = pathFromBgImage(item.bgImage);
	await updateUserTheme();
}
async function onclickThemeSample(ev) {
	let key = evToAttr(ev, 'theme');
	let theme = jsCopyExceptKeys(Serverdata.config.themes[key], ['name']);
	copyKeys(theme, U);
	await updateUserTheme();
}
async function onclickUser() {
	let uname = await mGather(iDiv(UI.nav.commands.user), { w: 100, margin: 0 }, { content: 'username', align: 'br', placeholder: ' <username> ' });
	if (!uname) return;
	await switchToUser(uname);
}
async function ondropPreviewImage(dParent, url, key) {
	if (isdef(key)) {
		let o = M.superdi[key];
		UI.imgColl.value = o.cats[0];
		UI.imgName.value = o.friendly;
	}
	assertion(dParent == UI.dDrop, `problem bei ondropPreviewImage parent:${dParent}, dDrop:${UI.dDrop}`)
	dParent = UI.dDrop;
	let dButtons = UI.dButtons;
	let dTool = UI.dTool;
	dParent.innerHTML = '';
	dButtons.innerHTML = '';
	dTool.innerHTML = '';
	let img = UI.img = mDom(dParent, {}, { tag: 'img', src: url });
	img.onload = async () => {
		img.onload = null;
		UI.img_orig = new Image(img.offsetWidth, img.offsetHeight);
		UI.url = url;
		let tool = UI.cropper = mCropResizePan(dParent, img);
		addToolX(tool, dTool)
		mDom(dButtons, { w: 120 }, { tag: 'button', html: 'Upload', onclick: onclickUpload, className: 'input' })
		mButton('Restart', () => ondropPreviewImage(url), dButtons, { w: 120, maleft: 12 }, 'input');
	}
}
async function ondropShowImage(url, dDrop) {
	mClear(dDrop);
	let img = await imgAsync(dDrop, { hmax: 300 }, { src: url });
	console.log('img dims', img.width, img.height); //works!!!
	mStyle(dDrop, { w: img.width, h: img.height + 30, align: 'center' });
	mDom(dDrop, { fg: colorContrastPickFromList(dDrop, ['blue', 'lime', 'yellow']) }, { className: 'blink', html: 'DONE! now click on where you think the image should be centered!' })
	console.log('DONE! now click on where you think the image should be centered!')
	img.onclick = storeMouseCoords;
}
function onenterHex(item, board) {
	colorSample(board.dSample, item.color);
}
function onleaveHex(item, board) {
	let selitem = board.items.find(x => x.isSelected == true);
	if (nundef(selitem)) return;
	colorSample(board.dSample, selitem.color);
}
async function onsockConfig(x) {
	console.log('SOCK::config', x)
	Serverdata.config = x; console.log(Serverdata.config);
}
async function onsockEvent(x) {
	console.log('SOCK::event', x)
	if (isdef(Serverdata.events)) Serverdata.events[x.id] = x;
}
async function onsockMerged(x) {
	if (!isSameTableOpen(x.id)) return;
	await showTable(x);
}
async function onsockPending(id) {
	if (!isSameTableOpen(id)) return;
	await showTable(id);
}
async function onsockSuperdi(x) {
	console.log('SOCK::superdi', x)
}
async function onsockTable(x) {
	let [msg, id, turn, isNew] = [x.msg, x.id, x.turn, x.isNew];
	let menu = getMenu();
	let me = getUname();
	if (turn.includes(me) && menu == 'play') { Tid = id; await switchToMainMenu('table'); }
	else if (menu == 'table') await showTable(id);
	else if (menu == 'play') await showTables();
}
async function onsockTables(x) {
	let menu = getMenu();
	if (menu == 'play') await showTables('onsockTables');
	else if (menu == 'table') {
		assertion(isdef(T), "menu table but no table!!!")
		let id = T.id;
		let exists = x.find(t => t.id == id);
		if (nundef(exists)) { Tid = T = null; await switchToMenu(UI.nav, 'play'); }
	}
}
function openGameMenuFor(gamename) { clickOnElemWithAttr('gamename', gamename); }

function openPopup(name = 'dPopup') {
	closePopup();
	let popup = document.createElement('div');
	popup.id = name;
	let defStyle = { padding: 25, bg: 'white', fg: 'black', zIndex: 100000, rounding: 12, position: 'fixed', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', wmin: 300, hmin: 100, border: '1px solid #ccc', };
	mStyle(popup, defStyle);
	mButtonX(popup, null, 25, 4);
	document.body.appendChild(popup);
	return popup;
}
function overwriteMerge(destinationArray, sourceArray, options) { return sourceArray }

function pSBC(p, c0, c1, l) {
	let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	h = c0.length > 9;
	h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
	f = pSBCr(c0);
	P = p < 0;
	t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
	p = P ? p * -1 : p;
	P = 1 - p;
	if (!f || !t) return null;
	if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
	else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
	a = f.a;
	t = t.a;
	f = a >= 0 || t >= 0;
	a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function pSBCr(d) {
	let i = parseInt, m = Math.round, a = typeof c1 == 'string';
	let n = d.length,
		x = {};
	if (n > 9) {
		([r, g, b, a] = d = d.split(',')), (n = d.length);
		if (n < 3 || n > 4) return null;
		(x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
	} else {
		if (n == 8 || n == 6 || n < 4) return null;
		if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
		d = parseInt(d.slice(1), 16);
		if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
		else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
	}
	return x;
}
function paletteAddDistanceTo(pal, color, key, distfunc = colorGetContrast) {
	let opal = isDict(pal[0]) ? pal : paletteToObjects(pal);
	for (let i = 0; i < pal.length; i++) {
		let o = opal[i];
		o[`dist_${key}`] = distfunc(o.hex, color);
	}
	return opal;
}
function paletteContrastVariety(pal, n = 20) {
	pal = pal.map(x => colorO(x));
	let res = [];
	['white', 'black'].map(x => res.push(colorO(x)));
	let o = paletteGetBestContrasting(pal, pal[0], pal[1]).best;
	res.push(o)
	let pal2 = jsCopy(pal).filter(x => x.hex != o.hex);
	res.push(colorO(colorGetPureHue(o)));
	let o2 = paletteGetBestContrasting(pal2, pal[0], pal[1]).best;
	res.push(o2)
	res.push(colorO(colorGetPureHue(o2)))
	res.push(colorO(colorComplement(pal[0].hex)));
	res.push(colorO(colorComplement(pal[1].hex)));
	[60, 120, 180, 240, 300].map(x => {
		res.push(colorO(colorTurnHueBy(pal[0].hex, x)));
		res.push(colorO(colorTurnHueBy(pal[1].hex, x)));
	});
	['silver', 'dimgray', '#ff0000', '#ffff00'].map(x => res.push(colorO(x)));
	res = res.map(x => x.hex); res = arrRemoveDuplicates(res);
	let palContrast = res.slice(0, 2);
	let sorted = colorSortByLightness(res.slice(2));
	let i = 0;
	while (i < sorted.length) {
		let hex = sorted[i];
		let ok = true;
		for (const h1 of palContrast) {
			let d = colorDistance(hex, h1);
			if (d < 70) { ok = false; break; }
		}
		if (ok) palContrast.push(hex);
		i++;
	}
	if (n < palContrast.length) palContrast = palContrast.slice(0, n)
	return palContrast;
}
function paletteGetBestContrasting(pal) {
	let clist = Array.from(arguments).slice(1).map(x => colorO(x));
	pal = pal.map(x => colorO(x));
	let best = null, dbest = 0;
	for (const p of pal) {
		let arr = clist.map(x => colorDistanceHue(p, x));
		let dmax = arrMinMax(arr).min;
		if (dmax > dbest) {
			best = p; dbest = dmax;
		}
	}
	if (dbest == 0) best = pal[4];
	return { best, dbest };
}
function paletteMix(startColor, endColor, numSteps) {
	const colors = [];
	let step = 0;
	while (step < numSteps) {
		const currentColor = mixColors(startColor, endColor, step / numSteps);
		colors.push(currentColor);
		step++;
	}
	return colors;
}
function palettePureHue(pal) {
	let p2 = pal.map(x => colorGetPureHue(x));
	return pal.map(x => colorO(colorGetPureHue(x)));
}
function paletteShades(color, from = -0.8, to = 0.8, step = 0.2) {
	let res = [];
	for (let frac = from; frac <= to; frac += step) {
		let c = colorCalculator(frac, color, undefined, true);
		res.push(c);
	}
	return res;
}
function paletteShadesBi(color, turnHueBy = 180, from = -0.8, to = 0.8, step = 0.4) {
	let bi = [color, colorTurnHueBy(color, turnHueBy)];
	let res = jsCopy(bi);
	for (const c1 of bi) {
		for (let frac = from; frac <= to; frac += step) {
			let c = colorCalculator(frac, c1, undefined, true);
			addIf(res, c);
		}
	}
	return res;
}
function paletteShadesHues(color, n = 2, turnHueBy = 30, from = -0.5, to = 0.5, step = 0.5) {
	let list = [color];
	for (let i = 1; i < n; i++) list.push(colorTurnHueBy(color, i * turnHueBy))
	let res = jsCopy(list);
	if (n == 2) { from = -.8; to = .8; step = .4; }
	for (const c1 of list) {
		for (let frac = from; frac <= to; frac += step) {
			let c = colorCalculator(frac, c1, undefined, true);
			addIf(res, c);
		}
	}
	return res;
}
function paletteShadesQuad(color, from = -0.5, to = 0.5, step = 0.5) {
	let tri = [color, colorTurnHueBy(color, 90), colorTurnHueBy(color, 180), colorTurnHueBy(color, 270)];
	let res = jsCopy(tri);
	for (const c1 of tri) {
		for (let frac = from; frac <= to; frac += step) {
			let c = colorCalculator(frac, c1, undefined, true);
			addIf(res, c);
		}
	}
	return res;
}
function paletteShadesTri(color, from = -0.5, to = 0.5, step = 0.5) {
	let tri = [color, colorTurnHueBy(color, 120), colorTurnHueBy(color, 240)];
	let res = jsCopy(tri);
	for (const c1 of tri) {
		for (let frac = from; frac <= to; frac += step) {
			let c = colorCalculator(frac, c1, undefined, true);
			addIf(res, c);
		}
	}
	return res;
}
function paletteToObjects(pal) { return pal.map(x => colorO(x)); }

function paletteTrans(color, from = 0.1, to = 1, step = 0.2) {
	let res = [];
	for (let frac = from; frac <= to; frac += step) {
		let c = colorTrans(color, frac);
		res.push(c);
	}
	return res;
}
function paletteTransWhiteBlack(n = 9) {
	let c = colorHex('white');
	let pal = [c];
	let [iw, ib] = [Math.floor(n / 2) - 1, Math.floor((n - 1) / 2) - 1];
	let [incw, incb] = [1 / (iw + 1), 1 / (ib + 1)];
	for (let i = 1; i < iw; i++) {
		let alpha = i * incw;
		pal.push(colorTrans(c, alpha));
	}
	pal.push('transparent');
	c = colorHex('black');
	for (let i = 1; i < ib; i++) {
		let alpha = i * incb;
		pal.push(colorTrans(c, alpha));
	}
	pal.push(c);
	return pal;
}
function pathFromBgImage(bgImage) { return bgImage.substring(5, bgImage.length - 2); }

function playerStatCount(key, n, dParent, styles = {}, opts = {}) {
	let sz = valf(styles.sz, 16);
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'center', fz: sz, align: 'center' }, styles);
	let d = mDiv(dParent, styles);
	let o = M.superdi[key];
	if (typeof key == 'function') key(d, { h: sz, hline: sz, w: '100%', fg: 'grey' });
	else if (isFilename(key)) showim2(key, d, { h: sz, hline: sz, w: '100%', fg: 'grey' }, opts);
	else if (isdef(o)) showim2(key, d, { h: sz, hline: sz, w: '100%', fg: 'grey' }, opts);
	else mText(key, d, { h: sz, fz: sz, w: '100%' });
	d.innerHTML += `<span ${isdef(opts.id) ? `id='${opts.id}'` : ''} style="font-weight:bold;color:inherit">${n}</span>`;
	return d;
}
function pluralOf(s, n) {
	di = { food: '', child: 'ren' };
	return s + (n == 0 || n > 1 ? valf(di[s.toLowerCase()], 's') : '');
}
function polyPointsFrom(w, h, x, y, pointArr) {
	x -= w / 2;
	y -= h / 2;
	let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
	let newpts = [];
	for (const p of pts) {
		newp = { X: p[0], Y: Math.round(p[1]) };
		newpts.push(newp);
	}
	pts = newpts;
	let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' ');
	return sPoints;
}
function posXY(d1, dParent, x, y, unit = 'px', position = 'absolute') {
	if (nundef(position)) position = 'absolute';
	if (dParent && !dParent.style.position) dParent.style.setProperty('position', 'relative');
	d1.style.setProperty('position', position);
	if (isdef(x)) d1.style.setProperty('left', makeUnitString(x, unit));
	if (isdef(y)) d1.style.setProperty('top', makeUnitString(y, unit));
}
async function postEventChange(data) {
	return Serverdata.events[data.id] = await mPostRoute('postEvent', data);
}
async function postImage(img, path) {
	let dataUrl = imgToDataUrl(img);
	let o = { image: dataUrl, filename: path };
	let resp = await mPostRoute('postImage', o);
	console.log('resp', resp); //sollte path enthalten!
}
async function postUserChange(data, override = false) {
	data = valf(data, U);
	return Serverdata.users[data.name] = override ? await mPostRoute('overrideUser', data) : await mPostRoute('postUser', data);
}
function present() {
	if (Settings.perspective == 'me') presentFor(me);
	else presentAll();
}
function presentAll() {
	clearZones();
	for (const pl of T.players) {
		let zone = Zones[pl.id];
		pl.hand.showDeck(zone.dData, 'right', 0, false);
	}
	showTrick();
}
function presentExtraWorker(item, dParent, styles = {}) {
	let sz = styles.sz;
	addKeys({ paright: 10, bg: 'white', rounding: '50%', hmargin: 8, h: 30, position: 'relative' }, styles)
	let d = mDom(dParent, styles); mFlex(d);
	let img = mDom(d, { h: '100%' }, { tag: 'img', src: '../assets/games/nations/templates/worker.png' })
	let img2 = mDom(d, { h: sz * 2 / 3, w: sz * 2 / 3, position: 'absolute', top: '17%', left: '40%' }, { tag: 'img', src: `../assets/games/nations/templates/${item.o.res}.png` });
	return d;
}
function presentFor(me) {
	clearElement(dTable);
	let others = arrWithout(T.players, [me]);
	for (const pl of others) {
		pl.hand.showDeck(dTable, 'right', 0, false);
	}
	mLinebreak(dTable);
	T.trick.showDeck(dTable, 'right', 20, true);
	mLinebreak(dTable);
	me.hand.showDeck(dTable, 'right', 0, false);
	showFleetingMessage('click to play a card!');
}
function presentImageCropper(url) {
	let d = mDom('dMain', { position: 'absolute', h: 500, w: 500, bg: 'navy' });
	let img = mDom(d, { w: 300, h: 300, 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: url });
}
function presentStandardBGA() {
	let dTable = mDom('dMain');
	mClass('dPage', 'wood');
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dTable); mFlexWrap(dOpenTable)
	mDom(dRechts, {}, { id: 'dStats' });
}
function presentStandardRoundTable() {
	d = mDom('dMain'); mCenterFlex(d);
	mDom(d, { className: 'instruction' }, { id: 'dInstruction' }); mLinebreak(d); // instruction
	mDom(d, {}, { id: 'dStats' }); mLinebreak(d);
	let minTableSize = 400;
	let dTable = mDom(d, { hmin: minTableSize, wmin: minTableSize, margin: 20, round: true, className: 'wood' }, { id: 'dTable' });
	mCenterCenter(dTable);
}
function proceed(nextLevel) {
	if (nundef(nextLevel)) nextLevel = currentLevel;
	if (nextLevel > MAXLEVEL) {
		let iGame = gameSequence.indexOf(currentGame) + 1;
		if (iGame == gameSequence.length) {
			soundGoodBye();
			mClass(document.body, 'aniSlowlyDisappear');
			show(dLevelComplete);
			dLevelComplete.innerHTML = 'CONGRATULATIONS! You are done!';
		} else {
			let nextGame = gameSequence[iGame];
			setGoal(nextGame);
		}
	} else if (LevelChange) startLevel(nextLevel);
	else startRound();
}
function rBgFor() { for (const d of Array.from(arguments)) { mStyle(d, { bg: rColor() }) } }

function rBlend() { return rBlendCanvas(); }

function rBlendCSS() { return rChoose(getBlendModesCSS()); }

function rBlendCanvas() { return rChoose(getBlendModesCanvas()); }

function rChoose(arr, n = 1, func = null, exceptIndices = null) {
	if (isDict(arr)) arr = dict2list(arr, 'key');
	let indices = arrRange(0, arr.length - 1);
	if (isdef(exceptIndices)) {
		for (const i of exceptIndices) removeInPlace(indices, i);
	}
	if (isdef(func)) indices = indices.filter(x => func(arr[x]));
	if (n == 1) {
		let idx = Math.floor(Math.random() * indices.length);
		return arr[indices[idx]];
	}
	arrShuffle(indices);
	return indices.slice(0, n).map(x => arr[x]);
}
function rColor(lum100OrAlpha01 = 1, alpha01 = 1, hueVari = 60) {
	let c;
	if (lum100OrAlpha01 <= 1) {
		c = '#';
		for (let i = 0; i < 6; i++) { c += rChoose(['f', 'c', '9', '6', '3', '0']); }
		alpha01 = lum100OrAlpha01;
	} else {
		let hue = rHue(hueVari);
		let sat = 100;
		let b = isNumber(lum100OrAlpha01) ? lum100OrAlpha01 : lum100OrAlpha01 == 'dark' ? 25 : lum100OrAlpha01 == 'light' ? 75 : 50;
		c = colorHsl360ArgsToHex79(hue, sat, b);
	}
	return alpha01 < 1 ? colorTrans(c, alpha01) : c;
}
function rHue(vari = 36) { return (rNumber(0, vari) * Math.round(360 / vari)) % 360; }

function rLetter(except) { return rLetters(1, except)[0]; }

function rLetters(n, except = []) {
	let all = 'abcdefghijklmnopqrstuvwxyz';
	for (const l of except) all = all.replace(l, '');
	return rChoose(toLetters(all), n);
}
function rNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rTexture() { return rChoose(valf(M.textures, [])); }

function rUniqueId(n = 10, prefix = '') { return prefix + rChoose(toLetters('0123456789abcdefghijklmnopqABCDEFGHIJKLMNOPQRSTUVWXYZ_'), n).join(''); }

function rWord(n = 6) { return rLetters(n).join(''); }

function rWords(n = 1) {
	let words = getColorNames().map(x => x.toLowerCase());
	let arr = rChoose(words, n);
	return arr;
}
function randomColor() { return rColor(); }

function randomIndex(array) { return randomRange(0, array.length) | 0 }

function randomNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomRange(min, max) { return min + Math.random() * (max - min) }

function range(f, t, st = 1) {
	if (nundef(t)) {
		t = f - 1;
		f = 0;
	}
	let arr = [];
	for (let i = f; i <= t; i += st) {
		arr.push(i);
	}
	return arr;
}
function redrawImage(img, dParent, x, y, wold, hold, w, h, callback) {
	let canvas = mDom(null, {}, { tag: 'canvas', width: w, height: h });
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, x, y, wold, hold, 0, 0, w, h);
	const imgDataUrl = canvas.toDataURL('image/png'); // Change format as needed
	img.onload = () => {
		img.onload = null;
		img.width = w;
		img.height = h;
		mStyle(img, { w: w, h: h });
		mStyle(dParent, { w: w, h: h });
		callback();
	}
	img.src = imgDataUrl;
	return imgDataUrl;
}
function reload() {
	console.log('reload!!!')
	if (radio_contacts.checked == true) get_contacts();
	else if (radio_chat.checked == true) get_chats();
	else if (radio_games.checked == true) get_games();
	else if (radio_play.checked == true) get_play();
}
function removeCommentLines(text, cstart, cend) {
	let lines = text.split('\n');
	let inComment = false, res = '';
	for (const line of lines) {
		let lt = line.trim();
		if (lt.startsWith(cstart) && lt.endsWith(cend)) { continue; }
		if (lt.startsWith(cstart)) { inComment = true; continue; }
		if (lt.endsWith(cend)) { inComment = false; continue; }
		res += line + '\n';
	}
	return res;
}
function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function removeFromArray(array, i) { return array.splice(i, 1)[0] }

function removeInPlace(arr, el) {
	arrRemovip(arr, el);
}
function removeItemFromArray(array, item) { return removeFromArray(array, array.indexOf(item)) }

function removePeepFromCrowd(peep) {
	removeItemFromArray(crowd, peep)
	availablePeeps.push(peep)
}
function removeRandomFromArray(array) { return removeFromArray(array, randomIndex(array)) }

function removeTrailingComments(line) {
	let icomm = line.indexOf('//');
	let ch = line[icomm - 1];
	if (icomm <= 0 || ch == "'" || ':"`'.includes(ch)) return line;
	if ([':', '"', "'", '`'].some(x => line.indexOf(x) >= 0 && line.indexOf(x) < icomm)) return line;
	return line.substring(0, icomm);
}
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }

function resetPeep({ stage, peep }) {
	const direction = Math.random() > 0.5 ? 1 : -1
	const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
	const startY = stage.height - peep.height + offsetY
	let startX
	let endX
	if (direction === 1) {
		startX = -peep.width
		endX = stage.width
		peep.scaleX = 1
	} else {
		startX = stage.width + peep.width
		endX = 0
		peep.scaleX = -1
	}
	peep.x = startX
	peep.y = startY
	peep.anchorY = startY
	return {
		startX,
		startY,
		endX
	}
}
function resetRound() {
	clearTimeouts();
	clearFleetingMessage();
	clearEvents();
}
async function resetUsers() {
	for (const name in Serverdata.users) {
		let uold = Serverdata.users[name];
		let unew = {};
		let list = ['name', 'key', 'color', 'bgImage', 'bgBlend', 'bgRepeat', 'bgSize'];
		for (const s of list) unew[s] = uold[s];
		await postUserChange(unew, true);
	}
	console.log(Serverdata.users);
}
function resize() {
	stage.width = Canvas.clientWidth
	stage.height = Canvas.clientHeight
	Canvas.width = stage.width * devicePixelRatio
	Canvas.height = stage.height * devicePixelRatio
	crowd.forEach((peep) => {
		peep.walk.kill()
	})
	crowd.length = 0
	availablePeeps.length = 0
	availablePeeps.push(...allPeeps)
	initCrowd()
}
function resizeTo(tool, wnew, hnew) {
	let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
	if (hnew == 0) hnew = img.height;
	if (wnew == 0) {
		let aspectRatio = img.width / img.height;
		wnew = aspectRatio * hnew;
	}
	redrawImage(img, dParent, 0, 0, img.width, img.height, wnew, hnew, () => setRect(0, 0, wnew, hnew))
}
function root(areaName) {
	setTableSize(areaName, 400, 300);
	UIROOT = jsCopy(SPEC.staticSpec.root);
	for (const k in AREAS) delete AREAS[k];
	PROTO = {};
	INFO = {};
	staticArea(areaName, UIROOT);
	addAREA('root', UIROOT);
}
async function rotateAndWriteAge(img, card) {
	let diStage = { 0: 'I', 1: 'I', 2: 'II', 3: 'III', 4: 'II II' };
	let [w, h] = [img.width, img.height];
	mDom('dExtra', { h: 4 })
	let cv2 = mDom('dExtra', {}, { tag: 'canvas', width: h, height: w });
	let ctx2 = cv2.getContext('2d');
	ctx2.translate(h, 0)
	ctx2.rotate(90 * Math.PI / 180);
	ctx2.drawImage(img, 0, 0, w, h);
	mDom('dExtra', { h: 4 })
	let cv3 = mDom('dExtra', {}, { tag: 'canvas', width: h, height: w });
	let ctx3 = cv3.getContext('2d');
	ctx3.drawImage(cv2, 0, 0);
	let x = cv3.width / 2;
	let y = cv3.height;
	ctx3.fillStyle = 'white';
	ctx3.font = '20px Arial';
	ctx3.textAlign = 'center';
	let text = diStage(card.age);
	ctx3.fillText(text, x, y);
	return cv3;
}
function sameList(l1, l2) {
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
async function saveAndUpdatePlayerOptions(allPl, gamename) {
	let name = allPl.name;
	let poss = getGamePlayerOptionsAsDict(gamename);
	if (nundef(poss)) return;
	let opts = {};
	for (const p in poss) { allPl[p] = getRadioValue(p); if (p != 'playmode') opts[p] = allPl[p]; }
	let id = 'dPlayerOptions'; mRemoveIfExists(id); //dont need UI anymore
	let oldOpts = valf(getUserOptionsForGame(name, gamename), {});
	let changed = false;
	for (const p in poss) {
		if (p == 'playmode') continue;
		if (oldOpts[p] != opts[p]) { changed = true; break; }
	}
	if (changed) {
		let games = valf(Serverdata.users[name].games, {});
		games[gamename] = opts;
		await postUserChange({ name, games })
	}
}
async function saveDataFromPlayerOptionsUI(gamename) {
	let id = 'dPlayerOptions';
	let lastAllPl = DA.lastAllPlayerItem;
	let dold = mBy(id);
	if (isdef(dold)) { await saveAndUpdatePlayerOptions(lastAllPl, gamename); dold.remove(); }
}
function saveFileAtClient(name, type, data) {
	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
	let a = document.createElement('a');
	a.style.display = 'none';
	let url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	simulateClick(a);
	setTimeout(function () {
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
function savePanZoomCanvas(canvas) {
	if (canvas) {
		const dataURL = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.href = dataURL;
		link.download = 'canvas-image.png';
		link.click();
	}
}
function scaleAnimation(elem) {
	elem = toElem(elem);
	let ani = elem.animate([
		{ transform: 'scale(1)' },
		{ transform: 'scale(1.3)' },
	], {
		duration: 1000,
		easing: 'ease-in-out',
		iterations: 2,
		direction: 'alternate'
	});
	return ani;
}
function selPrep(fen, autosubmit = false) {
	A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: autosubmit };
}
function selectAddItems(items, callback = null, instruction = null) {
	let fen = T.fen;
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.di = {};
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mStyle(dInstruction, { 'align-content': 'center', 'justify-content': 'center' })
	dInstruction.innerHTML = (isMyTurn(table) ? `${getWaitingHtml()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` + "&nbsp;" + instruction : `waiting for: ${getTurnPlayers(table)}`);
	let buttonstyle = { maleft: 25, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itemtype = isdef(item.itemtype) ? item.itemtype : is_card(item) ? 'card' : isdef(M.superdi[item.key]) ? 'sym' : isdef(item.o) ? 'container' : isdef(item.src) ? 'img' : 'string';
		let [el, o, d1, fz, fg] = [null, item.o, dInstruction, 30, 'grey'];
		if (type == 'sym') {
			if (isdef(o.img)) { el = mDom(d1, { h: fz, hmargin: 8, 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` }); }
			else if (isdef(o.text)) el = mDom(d1, { hmargin: 8, fz: fz, hline: fz, family: 'emoNoto', fg: fg, display: 'inline' }, { html: o.text });
			else if (isdef(o.fa6)) el = mDom(d1, { hmargin: 8, fz: fz - 2, hline: fz, family: 'fa6', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
			else if (isdef(o.fa)) el = mDom(d1, { hmargin: 8, fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
			else if (isdef(o.ga)) el = mDom(d1, { hmargin: 8, fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
		} else if (isdef(item.present)) {
			el = item.present(item, d1, { sz: fz, fg: fg });
		} else assertion(false, `WRONG ITEM TYPE ${type}`)
		mStyle(el, { cursor: 'pointer' })
		el.id = getUID(); A.di[el.id] = item;
		el.onclick = callback;
	}
}
function selectCivSpot(d) {
	if (isdef(M.selectedCivSpot)) mClassRemove(M.selectedCivSpot, 'shadow');
	M.selectedCivSpot = d;
	mClass(d, 'shadow')
}
function selectExtraWorker(item) {
}
function selectText(el) {
	if (el instanceof HTMLTextAreaElement) { el.select(); return; }
	var sel, range;
	if (window.getSelection && document.createRange) {
		sel = window.getSelection();
		if (sel.toString() == '') {
			window.setTimeout(function () {
				range = document.createRange();
				range.selectNodeContents(el);
				sel.removeAllRanges();
				sel.addRange(range);
			}, 1);
		}
	} else if (document.selection) {
		sel = document.selection.createRange();
		if (sel.text == '') {
			range = document.body.createTextRange();
			range.moveToElementText(el);
			range.select();
		}
	}
}
function setColors(bg, fg) {
	let [realBg, bgContrast, bgNav, fgNew, fgContrast] = calculateGoodColors(bg, fg);
	setCssVar('--bgBody', realBg);
	setCssVar('--bgButton', 'transparent')
	setCssVar('--bgButtonActive', bgContrast)
	setCssVar('--bgNav', bgNav)
	setCssVar('--fgButton', fgNew)
	setCssVar('--fgButtonActive', fgNew)
	setCssVar('--fgButtonDisabled', 'silver')
	setCssVar('--fgButtonHover', fgContrast)
	setCssVar('--fgTitle', fgNew)
	setCssVar('--fgSubtitle', fgContrast);
}
function setCssVar(varname, val) { document.body.style.setProperty(varname, val); }

function setDropPosition(ev, elem, targetElem, dropPos) {
	if (dropPos == 'mouse') {
		var elm = $(targetElem);
		x = ev.pageX - elm.offset().left - dragStartOffset.x;
		y = ev.pageY - elm.offset().top - dragStartOffset.y;
		posXY(elem, targetElem, x, y);
	} else if (dropPos == 'none') {
		return;
	} else if (dropPos == 'center') {
		elem.style.position = elem.style.left = elem.style.top = '';
		elem.classList.add('centeredTL');
	} else if (dropPos == 'centerCentered') {
		elem.style.position = elem.style.left = elem.style.top = '';
		elem.classList.add('centerCentered');
	} else {
		dropPos(ev, elem, targetElem);
	}
}
function setGoal(index) {
	if (nundef(index)) {
		let rnd = G.numPics < 2 ? 0 : randomNumber(0, G.numPics - 2);
		if (G.numPics >= 2 && rnd == lastPosition && coin(70)) rnd = G.numPics - 1;
		index = rnd;
	}
	lastPosition = index;
	Goal = Pictures[index];
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	let keys = jsCopy(keySets[key]);
	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x));
	}
	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];
		info.best = info[lang];
		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		let isMatch = true;
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}
	if (isdef(nMin)) {
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}
	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }
	if (isdef(nMin)) console.assert(primary.length >= nMin);
	if (nundef(allowDuplicates)) {
		primary = removeDuplicates(primary);
	}
	return primary;
}
function setLanguage(x) { currentLanguage = x; startLevel(); }

async function setPlayerNotPlaying(item, gamename) {
	await saveDataFromPlayerOptionsUI(gamename);
	removeInPlace(DA.playerList, item.name);
	mRemoveIfExists('dPlayerOptions');
	unselectPlayerItem(item);
}
async function setPlayerPlaying(allPlItem, gamename) {
	let [name, da] = [allPlItem.name, allPlItem.div];
	addIf(DA.playerList, name);
	highlightPlayerItem(allPlItem);
	await saveDataFromPlayerOptionsUI(gamename);
	let id = 'dPlayerOptions';
	DA.lastAllPlayerItem = allPlItem;
	let poss = getGamePlayerOptions(gamename);
	if (nundef(poss)) return;
	let dParent = mBy('dGameMenu');
	let bg = getUserColor(name);
	let rounding = 6;
	let d1 = mDom(dParent, { bg: colorLight(bg, 50), border: `solid 2px ${bg}`, rounding, display: 'inline-block', hpadding: 3, rounding }, { id });
	mDom(d1, {}, { html: `${name}` }); //title
	d = mDom(d1, {}); mCenterFlex(d);
	mCenterCenter(d);
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(',');
			let legend = formatLegend(key);
			let fs = mRadioGroup(d, {}, `d_${key}`, legend);
			let handler = key == 'playmode' ? updateUserImageToBotHuman(name) : null;
			for (const v of list) { let r = mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, handler, key, false); }
			let userval = lookup(DA.allPlayers, [name, p]);
			let chi = fs.children;
			for (const ch of chi) {
				let id = ch.id;
				if (nundef(id)) continue;
				let radioval = stringAfterLast(id, '_');
				if (isNumber(radioval)) radioval = Number(radioval);
				if (userval == radioval) ch.firstChild.checked = true;
				else if (nundef(userval) && `${radioval}` == arrLast(list)) ch.firstChild.checked = true;
			}
			measureFieldset(fs);
		}
	}
	let r = getRectInt(da, mBy('dGameMenu'));
	let rp = getRectInt(d1);
	let [y, w, h] = [r.y - rp.h - 4, rp.w, rp.h];
	let x = r.x - rp.w / 2 + r.w / 2;
	if (x < 0) x = r.x - 22;
	if (x > window.innerWidth - w - 100) x = r.x - w + r.w + 14;
	mIfNotRelative(dParent);
	mPos(d1, x, y);
	mButtonX(d1, ev => saveAndUpdatePlayerOptions(allPlItem, gamename), 18, 3, 'dimgray');
}
function setPlayersToMulti() {
	for (const name in DA.allPlayers) {
		lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'human');
		updateUserImageToBotHuman(name, 'human');
	}
	setRadioValue('playmode', 'human');
}
function setPlayersToSolo() {
	for (const name in DA.allPlayers) {
		if (name == getUname()) continue;
		lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'bot');
		updateUserImageToBotHuman(name, 'bot');
	}
	let popup = mBy('dPlayerOptions');
	if (isdef(popup) && popup.firstChild.innerHTML.includes(getUname())) return;
	setRadioValue('playmode', 'bot');
}
function setRadioValue(prop, val) {
	let input = mBy(`i_${prop}_${val}`);
	if (nundef(input)) return;
	input.checked = true;
}
function setRect(elem, options) {
	let r = getRect(elem);
	elem.rect = r;
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`);
	if (isDict(options)) {
		if (options.hgrow) mStyle(elem, { hmin: r.h });
		else if (options.hfix) mStyle(elem, { h: r.h });
		else if (options.hshrink) mStyle(elem, { hmax: r.h });
		if (options.wgrow) mStyle(elem, { wmin: r.w });
		else if (options.wfix) mStyle(elem, { w: r.w });
		else if (options.wshrink) mStyle(elem, { wmax: r.w });
	}
	return r;
}
function setScoresSameOrHigher(told, tnew) {
	if (nundef(told)) return true;
	let [plold, plnew] = [told.players, tnew.players];
	for (const name in plnew) {
		if (plold[name].score + plold[name].incScore != plnew[name].score) return false;
		plnew[name].incScore = 0;
	}
	return true;
}
function setTableSize(w, h, unit = 'px') {
	let d = mBy('areaTable');
	mStyle(d, { 'min-width': w, 'min-height': h }, unit);
}
function setTableToStarted(table) {
	table.status = 'started';
	table.step = 0;
	table.moves = [];
	table.fen = DA.funcs[table.game].setup(table);
	return table;
}
function setTexture(item) {
	let d = document.body;
	let bgImage = valf(item.bgImage, bgImageFromPath(item.texture), '');
	let bgBlend = valf(item.bgBlend, item.blendMode, '');
	d.style.backgroundColor = valf(item.color, item.bg, '');
	d.style.backgroundImage = bgImage;
	d.style.backgroundSize = bgImage.includes('marble') || bgImage.includes('wall') ? '100vw 100vh' : '';
	d.style.backgroundRepeat = 'repeat';
	d.style.backgroundBlendMode = bgBlend;
}
function setUserTheme() {
	setColors(U.color, U.fg);
	setTexture(U);
	settingsCheck();
}
function settingsCheck() {
	if (isdef(DA.settings)) {
		cmdDisable(UI.commands.settResetAll.key);
		for (const k in DA.settings) {
			if (isLiteral(U[k]) && DA.settings[k] != U[k]) {
				cmdEnable(UI.commands.settResetAll.key); break;
			}
		}
	}
}
async function settingsOpen() {
	DA.settings = jsCopy(U);
	mClear('dMain');
	let d = mDom('dMain', {}, { id: 'dSettingsMenu' }); // { padding: 0, overy: 'auto', hmax: '100vh' }, { id: 'dSettingsMenu' }); //,calcRestHeight('dMain') }, { id: 'dSettingsMenu' });
	let submenu = valf(localStorage.getItem('settingsMenu'), 'settTheme');
	settingsSidebar();
	await UI.commands[submenu].open();
	settingsCheck();
}
function settingsSidebar() {
	let wmin = 170;
	mStyle('dLeft', { wmin: wmin });
	let d = mDom('dLeft', { wmin: wmin - 10, margin: 10, matop: 160, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
	let gap = 5;
	UI.commands.settMyTheme = mCommand(d, 'settMyTheme', 'My Theme', { save: true }); mNewline(d, gap);
	UI.commands.settTheme = mCommand(d, 'settTheme', 'Themes', { save: true }); mNewline(d, gap);
	UI.commands.settColor = mCommand(d, 'settColor', 'Color', { save: true }); mNewline(d, gap);
	UI.commands.settFg = mCommand(d, 'settFg', 'Text Color', { save: true }); mNewline(d, gap);
	UI.commands.settTexture = mCommand(d, 'settTexture', 'Texture', { save: true }); mNewline(d, gap);
	UI.commands.settBlendMode = mCommand(d, 'settBlendMode', 'Blend Mode', { save: true }); mNewline(d, 2 * gap);
	UI.commands.settRemoveTexture = mCommand(d, 'settRemoveTexture', 'Remove Texture'); mNewline(d, gap);
	UI.commands.settResetAll = mCommand(d, 'settResetAll', 'Revert Settings'); mNewline(d, gap);
	UI.commands.settAddYourTheme = mCommand(d, 'settAddYourTheme', 'Add Your Theme'); mNewline(d, gap);
	UI.commands.settDeleteTheme = mCommand(d, 'settDeleteTheme', 'Delete Theme'); mNewline(d, gap);
}
function show(elem, isInline = false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline ? 'inline-block' : null;
	}
	return elem;
}
async function showBlendMode(dParent, blendCSS) {
	let src = U.texture;
	let fill = U.color;
	let bgBlend = getBlendCanvas(blendCSS);
	let d1 = mDom(dParent);
	let ca = await getCanvasCtx(d1, { w: 300, h: 200, fill, bgBlend }, { src });
	let palette = await getPaletteFromCanvas(ca.cv);
	palette.unshift(fill); palette.splice(8);
	showPaletteMini(d1, palette);
	d1.onclick = async () => {
		U.palette = palette;
		U.blendMode = blendCSS;
		await updateUserTheme();
	}
}
async function showBlendModes() {
	let d = mBy('dSettingsMenu'); mClear(d);
	let dParent = mDom(d, { padding: 10, gap: 10 }); mFlexWrap(dParent);
	let list = arrMinus(getBlendModesCSS(), ['saturation', 'color']);
	for (const blendMode of list) { await showBlendMode(dParent, blendMode); }
}
async function showCalendarApp() {
	if (!U) { console.log('you have to be logged in to use this menu!!!'); return; }
	showTitle('Calendar');
	let d1 = mDiv('dMain', { w: 800, h: 800, margin: 20 }); //, bg: 'white' })
	let x = DA.calendar = await uiTypeCalendar(d1);
}
function showChatMessage(o) {
	let d = mBy('dChatWindow'); if (nundef(d)) return;
	if (o.user == getUname()) mDom(d, { align: 'right' }, { html: `${o.msg}` })
	else mDom(d, { align: 'left' }, { html: `${o.user}: ${o.msg}` })
}
function showChatWindow() {
	let dChat = mDom('dRight', { padding: 10, fg: 'white', box: true }, { id: 'dChat', html: 'Chatbox' });
	UI.chatInput = mInput(dChat, { w: 260 }, 'inpChat', '<your message>', 'input', 1);
	UI.chatWindow = mDom(dChat, {}, { id: 'dChatWindow' });
	mOnEnter(UI.chatInput, ev => {
		let inp = ev.target;
		Socket.emit('message', { user: getUname(), msg: ev.target.value });
		ev.target.value = '';
	});
}
function showColor(dParent, c) {
	let [bg, name, bucket] = isDict(c) ? [c.hex, c.name, c.bucket] : [c, c, c];
	return mDom(dParent, { align: 'center', wmin: 120, padding: 2, bg, fg: colorIdealText(bg) }, { html: name + (bg != name ? `<br>${bg}` : '') });
}
function showColorBox(c, skeys = 'name hex hue sat lum', dParent = null, styles = {}) {
	let bg = c.hex;
	let fg = colorIdealText(bg);
	let keys = toWords(skeys);
	let st = jsCopy(styles)
	addKeys({ bg, fg, align: 'center' }, st);
	let textStyles = { weight: 'bold' };
	let d2 = mDom(dParent, st, { class: 'colorbox', dataColor: bg });
	mDom(d2, textStyles, { html: c[keys[0]] });
	let html = '';
	for (let i = 1; i < keys.length; i++) {
		let key = keys[i];
		let val = c[key];
		if (isNumber(val)) val = Number(val);
		if (val <= 1) val = from01ToPercent(val);
		html += `${key}:${val}<br>`;
	}
	let dmini = mDom(d2, {}, { html });
	let item = jsCopy(c);
	item.div = dmini;
	item.dOuter = d2;
	return item;
}
function showColorBoxes(w3extlist, skeys, dParent, styles = {}) {
	let d1 = mDom(dParent, { gap: 12, padding: 12 }); mFlexWrap(d1);
	let items = [];
	for (var c of w3extlist) {
		let item = showColorBox(c, skeys, d1, styles); items.push(item);
		items.push(item);
	}
	return items;
}
function showColorFromHue(dParent, hue, s = 100, l = 50) {
	let c = colorHsl360ArgsToHex79(hue, s, l);
	let w3 = colorNearestNamed(c, M.colorList);
	let d1 = showObject(w3, ['name', 'hex', 'bucket', 'hue'], dParent, { bg: w3.hex, wmin: 120 });
	d1.innerHTML += colorGetBucket(w3.hex);
}
async function showColors() {
	let d = mBy('dSettingsMenu'); mClear(d);
	let di = M.dicolor;
	let bucketlist = 'yellow orangeyellow orange orangered red magentapink magenta bluemagenta blue cyanblue cyan greencyan green yellowgreen'.split(' ');
	bucketlist = arrCycle(bucketlist, 8);
	for (const bucket of bucketlist) {
		let list = dict2list(di[bucket]);
		let clist = [];
		for (const c of list) {
			let o = w3color(c.value);
			o.name = c.id;
			o.hex = c.value;
			clist.push(o);
		}
		let sorted = sortByFunc(clist, x => -x.lightness);
		_showPaletteNames(d, sorted);
	}
	let divs = document.getElementsByClassName('colorbox');
	for (const div of divs) {
		mStyle(div, { cursor: 'pointer' })
		div.onclick = async () => onclickColor(div.getAttribute('dataColor'));
	}
}
async function showDashboard() {
	let me = getUname();
	if (me == 'guest') { mDom('dMain', { align: 'center', className: 'section' }, { html: 'click username in upper right corner to log in' }); return; }
	homeSidebar(150);
	mAdjustPage(150);
	let div = mDom100('dMain');
	let d1 = mDom(div); mCenterFlex(d1)
	let dta = mDom(d1, { gap: 10, padding: 12 }, { className: 'section' });
	let dblog = mDom(d1, { w100: true, align: 'center' });
	let blog = U.blog;
	if (nundef(blog)) return;
	for (const bl of blog) {
		let dx = mDom(dblog, {}, { className: 'section', html: bl.text });
	}
}
function showDeck(keys, dParent, splay, w, h) {
	let d = mDiv(dParent);
	mStyle(d, { display: 'block', position: 'relative', bg: 'green', padding: 25 });
	let gap = 10;
	let ovPercent = 20;
	let overlap = w * ovPercent / 100;
	let x = y = gap;
	for (let i = 0; i < keys.length; i++) {
		let k = keys[i];
		let c = zInno(k, d);
		mAppend(d, c.div);
		mStyle(c.div, { position: 'absolute', left: x, top: y });
		c.row = 0;
		c.col = i;
		x += overlap;
		Pictures.push(c);
	}
	d.style.width = (x - overlap + w) + 'px';
	console.log(Pictures[0])
	console.log(Pictures[0].div)
	d.style.height = firstNumber(Pictures[0].div.style.height) + 'px';
}
function showDetailsAndMagnify(elem) {
	let key = elem.firstChild.getAttribute('key'); //console.log('key',key)
	if (nundef(key)) return;
	let o = getDetailedSuperdi(key);
	MAGNIFIER_IMAGE = elem;
	if (nundef(o)) { mMagnify(elem); return; }
	let d = mPopup(null, {}, { id: 'hallo' });
	let title = fromNormalized(valf(o.name, o.friendly));
	mDom(d, {}, { tag: 'h1', html: title });
	mDom(d, {}, { tag: 'img', src: valf(o.photo, o.img) });
	showDetailsPresentation(o, d);
}
function showDetailsPresentation(o, dParent) {
	let onew = {};
	let nogo = ['longSpecies', 'ooffsprings', 'name', 'cats', 'colls', 'friendly', 'ga', 'fa', 'fa6', 'text', 'key', 'nsize', 'nweight', 'img', 'photo']
	for (const k in o) {
		if (nogo.includes(k)) continue;
		let val = o[k];
		let knew = k == 'ofoodtype' ? 'foodtype' : k;
		if (isString(val)) {
			val = replaceAll(val, '>-', '');
			val = val.trim();
			if (val.startsWith("'")) val = val.substring(1);
			if (val.endsWith("'")) val = val.substring(0, val.length - 1);
			if (val.includes(':')) val = stringAfter(val, ':')
			onew[knew] = capitalize(val.trim());
		}
		if (k == 'food') console.log(onew[knew])
	}
	onew = sortDictionary(onew);
	return showObjectInTable(onew, dParent, { w: window.innerWidth * .8 });
}
async function showDirPics(dir, dParent) {
	let imgs = await mGetFiles(dir);
	for (const fname of imgs) {
		let src = `${dir}/${fname}`;
		let sz = 200;
		let styles = { 'object-position': 'center top', 'object-fit': 'cover', h: sz, w: sz, round: true, border: `${rColor()} 2px solid` }
		let img = mDom(dParent, styles, { tag: 'img', src });
	}
}
function showDiv(d) { mStyle(d, { bg: rColor() }); console.log(d, mGetStyle(d, 'w')); }

function showEventOpen(id) {
	let e = Items[id];
	if (!e) return;
	let date = new Date(Number(e.day));
	let [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];
	let time = e.time;
	let popup = openPopup();
	let d = mBy(id);
	let [x, y, w, h, wp, hp] = [d.offsetLeft, d.offsetTop, d.offsetWidth, d.offsetHeight, 300, 180];
	let [left, top] = [Math.max(10, x + w / 2 - wp / 2), Math.min(window.innerHeight - hp - 60, y + h / 2 - hp / 2)]
	mStyle(popup, { left: left, top: top, w: wp, h: hp });
	let dd = mDom(popup, { display: 'inline-block', fz: '80%', maleft: 3, pabottom: 4 }, { html: `date: ${day}.${month + 1}.${year}` });
	let dt = mDom(popup, { display: 'inline-block', fz: '80%', maleft: 20, pabottom: 4 }, { html: `time:` });
	let inpt = mDom(popup, { fz: '80%', maleft: 3, mabottom: 4, w: 60 }, { tag: 'input', value: e.time });
	mOnEnter(inpt);
	let ta = mDom(popup, { rounding: 4, matop: 7, box: true, w: '100%', vpadding: 4, hpadding: 10, }, { tag: 'textarea', rows: 7, value: e.text });
	let line = mDom(popup, { matop: 6, w: '100%' }); //,'align-items':'space-between'});
	let buttons = mDom(line, { display: 'inline-block' });
	let bsend = mButton('Save', () => onEventEdited(id, ta.value, inpt.value), buttons);
	mButton('Cancel', () => closePopup(), buttons, { hmargin: 10 })
	mButton('Delete', () => { deleteEvent(id); closePopup(); }, buttons, { fg: 'red' })
	mDom(line, { fz: '90%', maright: 5, float: 'right', }, { html: `by ${e.user}` });
}
function showFleetingMessage(msg, dParent, styles = {}, ms = 3000, msDelay = 0, fade = true) {
	clearFleetingMessage();
	dFleetingMessage = mDiv(dParent);
	if (msDelay) {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), msDelay);
	} else {
		TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), 10);
	}
}
async function showGameMenu(gamename) {
	let users = Serverdata.users = await mGetRoute('users');//console.log('users',users);
	mRemoveIfExists('dGameMenu');
	let dMenu = mDom('dMain', {}, { className: 'section', id: 'dGameMenu' });
	mDom(dMenu, { maleft: 12 }, { html: `<h2>game options</h2>` });
	let style = { display: 'flex', justify: 'center', w: '100%', gap: 10, matop: 6 };
	let dPlayers = mDiv(dMenu, style, 'dMenuPlayers'); //mCenterFlex(dPlayers);
	let dOptions = mDiv(dMenu, style, 'dMenuOptions'); //mCenterFlex(dOptions);
	let dButtons = mDiv(dMenu, style, 'dMenuButtons');
	DA.gamename = gamename;
	DA.gameOptions = {};
	DA.playerList = [];
	DA.allPlayers = {};
	DA.lastName = null;
	await showGamePlayers(dPlayers, users);
	await showGameOptions(dOptions, gamename);
	let astart = mButton('Start', onclickStartGame, dButtons, {}, ['button', 'input']);
	let ajoin = mButton('Open to Join', onclickOpenToJoinGame, dButtons, {}, ['button', 'input']);
	let acancel = mButton('Cancel', () => mClear(dMenu), dButtons, {}, ['button', 'input']);
	let bclear = mButton('Clear Players', onclickClearPlayers, dButtons, {}, ['button', 'input']);
}
async function showGameMenuPlayerDialog(name, shift = false) {
	let allPlItem = DA.allPlayers[name];
	let gamename = DA.gamename;
	let da = iDiv(allPlItem);
	if (!DA.playerList.includes(name)) await setPlayerPlaying(allPlItem, gamename);
	else await setPlayerNotPlaying(allPlItem, gamename);
}
async function showGameOptions(dParent, gamename) {
	let poss = getGameOptions(gamename);
	if (nundef(poss)) return;
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(',');
			let legend = formatLegend(key);
			let fs = mRadioGroup(dParent, {}, `d_${key}`, legend);
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measureFieldset(fs);
		}
	}
	let inpsolo = mBy(`i_gamemode_solo`);//console.log('HALLO',inpsolo)
	let inpmulti = mBy(`i_gamemode_multi`);
	if (isdef(inpsolo)) inpsolo.onclick = setPlayersToSolo;
	if (isdef(inpmulti)) inpmulti.onclick = setPlayersToMulti;
}
async function showGamePlayers(dParent, users) {
	let me = getUname();
	mStyle(dParent, { wrap: true });
	let userlist = ['amanda', 'felix', 'mimi'];
	for (const name in users) addIf(userlist, name);
	for (const name of userlist) {
		let d = mDom(dParent, { align: 'center', padding: 2, cursor: 'pointer', border: `transparent` });
		let img = showUserImage(name, d, 40);
		let label = mDom(d, { matop: -4, fz: 12, hline: 12 }, { html: name });
		d.setAttribute('username', name)
		d.onclick = onclickGameMenuPlayer;
		let item = userToPlayer(name, DA.gamename); item.div = d; item.isSelected = false;
		DA.allPlayers[name] = item;
	}
	await clickOnPlayer(me);
}
function showGameover(table, dParent) {
	let winners = table.winners;
	let msg = winners.length > 1 ? `GAME OVER - The winners are ${winners.join(', ')}!!!` : `GAME OVER - The winner is ${winners[0]}!!!`;
	let d = showRibbon(dParent, msg);
	updateTestButtonsLogin(table.playerNames);
	mDom(d, { h: 12 }, { html: '<br>' })
	mButton('PLAY AGAIN', () => onclickStartTable(table.id), d, { className: 'button', fz: 24 });
}
function showGames(ms = 500) {
	let dParent = mBy('dGameList'); if (isdef(dParent)) { mClear(dParent); } else dParent = mDom('dMain', {}, { className: 'section', id: 'dGameList' });
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });
	let d = mDiv(dParent, { fg: 'white' }, 'game_menu'); mFlexWrap(d);
	let gamelist = 'accuse aristo bluff ferro nations spotit wise'; if (DA.TEST0) gamelist += ' a_game'; gamelist = toWords(gamelist);
	gamelist = ['setgame', 'fishgame'];//, 'button96'];
	for (const gname of gamelist) {
		let g = getGameConfig(gname);
		let [sym, bg, color, id] = [M.superdi[g.logo], g.color, null, getUID()];
		let d1 = mDiv(d, { cursor: 'pointer', rounding: 10, margin: 10, padding: 0, patop: 10, w: 140, height: 100, bg: bg, position: 'relative' }, g.id);
		d1.setAttribute('gamename', gname);
		d1.onclick = onclickGameMenuItem;
		mCenterFlex(d1);
		let o = M.superdi[g.logo];
		let el = mDom(d1, { matop: 0, mabottom: 6, fz: 65, hline: 65, family: 'emoNoto', fg: 'white', display: 'inline-block' }, { html: o.text });
		mLinebreak(d1);
		mDiv(d1, { fz: 18, align: 'center' }, null, g.friendly);
	}
}
function showImage(key, dParent, styles = {}, useSymbol = false) {
	let o = M.superdi[key];
	if (nundef(o)) { console.log('showImage:key not found', key); return; }
	let [w, h] = [valf(styles.w, styles.sz), valf(styles.h, styles.sz)];
	if (nundef(w)) {
		mClear(dParent);
		[w, h] = [dParent.offsetWidth, dParent.offsetHeight];
	} else {
		addKeys({ w: w, h: h }, styles)
		dParent = mDom(dParent, styles);
	}
	let [sz, fz, fg] = [.9 * w, .8 * h, valf(styles.fg, rColor())];
	let hline = valf(styles.hline * fz, fz);
	let d1 = mDiv(dParent, { position: 'relative', h: fz, overflow: 'hidden' });
	mCenterCenterFlex(d1)
	let el = null;
	if (!useSymbol && isdef(o.img)) el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` });
	else if (isdef(o.text)) el = mDom(d1, { fz: fz, hline: hline, family: 'emoNoto', fg: fg, display: 'inline' }, { html: o.text });
	else if (isdef(o.fa6)) el = mDom(d1, { fz: fz - 2, hline: hline, family: 'fa6', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
	else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: hline, family: 'pictoFa', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
	else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: hline, family: 'pictoGame', bg: valf(styles.bg, 'beige'), fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
	else if (isdef(o.img)) el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'contain', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` });
	assertion(el, 'PROBLEM mit' + key);
	mStyle(el, { cursor: 'pointer' })
	return d1;
}
function showImagePartial(dParent, image, x, y, w, h, left, top, wShow, hShow, wCanvas, hCanvas) {
	mClear(dParent)
	let canvas = mDom(dParent, {}, { tag: 'canvas' }); //console.log('left', left, 'top', top)
	const ctx = canvas.getContext('2d');
	canvas.width = wCanvas;
	canvas.height = hCanvas;
	ctx.drawImage(image, x, y, w, h, left, top, wShow, hShow);
}
function showMessage(msg, ms = 3000) {
	let d = mBy('dMessage');
	mStyle(d, { h: 21, bg: 'red', fg: 'yellow' });
	d.innerHTML = msg;
	clearTimeout(TO.message);
	TO.message = setTimeout(clearMessage, ms)
}
function showObject(o, keys, dParent, styles = {}, opts = {}) {
	if (nundef(keys)) { keys = Object.keys(o); opts.showKeys = true; styles.align = 'left' }
	addKeys({ align: 'center', padding: 2, bg: 'dimgrey', fg: 'contrast' }, styles);
	let d = mDom(dParent, styles, opts);
	let onew = {};
	for (const k of keys) onew[k] = o[k];
	mNode(onew, d, opts.title);
	return d;
}
function showObjectInTable(onew, dParent, styles = {}, opts = {}) {
	let d = mDom(dParent, styles);
	let t = mTable(d);
	for (const k in onew) {
		let r = mCreate('tr');
		mAppend(t, r);
		let col = mCreate('td'); mAppend(r, col); col.innerHTML = `${k}: `;
		col = mCreate('td'); mAppend(r, col); mDom(col, {}, { html: `${onew[k]}` });
	}
	return t;
}
function showPalette(dParent, colors) {
	let d1 = mDom(dParent, { display: 'flex', dir: 'column', wrap: true, gap: 2, hmax: '100vh' });
	for (var c of colors) {
		if (isDict(c)) c = c.hex;
		let html = `${c}<br>hue:${w3color(c).hue}<br>sat:${Math.round(w3color(c).sat * 100)}<br>lum:${Math.round(w3color(c).lightness * 100)}`
		let dmini = mDom(d1, { wmin: 40, hmin: 40, padding: 2, bg: c, fg: colorIdealText(c) }, { html });
	}
}
async function showPaletteFor(dParent, src, color, blendMode) {
	let fill = color;
	let bgBlend = getBlendCanvas(blendMode);
	let d = mDom(dParent, { w100: true, gap: 4 }); mCenterFlex(d);
	let palette = [color];
	if (isdef(src)) {
		let ca = await getCanvasCtx(d, { w: 500, h: 300, fill, bgBlend }, { src });
		palette = await getPaletteFromCanvas(ca.cv);
		palette.unshift(fill);
	} else {
		let ca = mDom(d, { w: 500, h: 300 });
		palette = arrCycle(paletteShades(color), 4);
	}
	let dominant = palette[0];
	let palContrast = paletteContrastVariety(palette, palette.length);
	mLinebreak(d);
	showPaletteMini(d, palette);
	mLinebreak(d);
	showPaletteMini(d, palContrast);
	mLinebreak(d);
	return [palette.map(x => colorO(x)), palContrast];
}
function showPaletteMini(dParent, colors, sz = 30) {
	let d1 = mDom(dParent, { display: 'flex', wrap: true, gap: 2 }); //, hmax: '100vh', dir: 'column' });
	let items = [];
	for (var c of colors) {
		if (isDict(c)) c = c.hex;
		let fg = 'dimgray'; //colorIdealText(c); if (fg == 'white') fg='silver';
		let dc = mDom(d1, { w: sz, h: sz, bg: c, fg, border: `${fg} solid 3px` });
		items.push({ div: dc, bg: c })
	}
	return items;
}
function showPaletteNames(dParent, colors) {
	let d1 = mDom(dParent, { gap: 12 }); mFlexWrap(d1);
	let items = [];
	for (var c of colors) {
		let bg = c.hex;
		let d2 = mDom(d1, { wmin: 250, bg, fg: colorIdealText(bg), padding: 20 }, { class: 'colorbox', dataColor: bg });
		mDom(d2, { weight: 'bold', align: 'center' }, { html: c.name });
		let html = `<br>${bg}<br>hue:${c.hue}<br>sat:${Math.round(c.sat * 100)}<br>lum:${Math.round(c.lightness * 100)}`
		let dmini = mDom(d2, { align: 'center', wmin: 120, padding: 2, bg, fg: colorIdealText(bg) }, { html });
		let item = jsCopy(c);
		item.div = dmini;
		item.dOuter = d2;
		items.push(item)
	}
	return items;
}
function showPaletteText(dParent, list) {
	let d1 = mDom(dParent, { display: 'flex', wrap: true, gap: 2 }); //, hmax: '100vh', dir: 'column' });
	let items = [];
	for (var c of list) {
		let dc = mDom(d1, { bg: 'black', fg: 'white' }, { html: c });
		items.push({ div: dc, text: c })
	}
	return items;
}
function showPlaetze(dCard, item, gap, color = 'silver') {
	let n = item.ooffsprings.num;
	let sym = item.class == 'mammal' ? 'paw' : 'big_egg';
	let html = wsGetChildInline(item, color);
	let plaetze = nundef(n) ? 2 : n == 0 ? 0 : n == 1 ? 1 : n < 8 ? 2 : n < 25 ? 3 : n < 100 ? 4 : n < 1000 ? 5 : 6;
	let [rows, cols, w] = [3, plaetze <= 3 ? 1 : 2, plaetze <= 3 ? gap : 3 * gap]
	let dgrid = mGrid(3, cols, dCard, { gap: gap * .8 });//{w,h:5*gap,gap:gap/2});
	for (const i of range(plaetze)) { mDom(dgrid, { w: gap, h: gap, fg: color }, { html }); }
	return dgrid;
}
function showRibbon(dParent, msg) {
	let d = mBy('ribbon'); if (isdef(d)) d.remove();
	let bg = `linear-gradient(270deg, #fffffd, #00000080)`
	d = mDom(dParent, { bg, mabottom: 10, align: 'center', vpadding: 10, fz: 30, w100: true }, { html: msg, id: 'ribbon' });
	return d;
}
async function showTable(id) {
	let me = getUname();
	let table = await mGetRoute('table', { id });  //console.log('table',table)
	if (!table) { showMessage('table deleted!'); return await showTables('showTable'); }
	let func = DA.funcs[table.game];
	T = table;
	clearMain();
	let d = mBy('dExtraLeft');
	d.innerHTML = `<h2>${getGameProp('friendly').toUpperCase()}: ${table.friendly} (${table.step})</h2>`; // title
	let items = func.present(table);
	func.stats(table);
	if (table.status == 'over') { showGameover(table, 'dTitle'); return; }
	assertion(table.status == 'started', `showTable status ERROR ${table.status}`);
	await updateTestButtonsPlayers(table);
	func.activate(table, items);
}
async function showTables(from) {
	await updateTestButtonsLogin();
	let me = getUname();
	let tables = Serverdata.tables = await mGetRoute('tables');
	tables.map(x => x.prior = x.status == 'open' ? 0 : x.turn.includes(me) ? 1 : x.playerNames.includes(me) ? 2 : 3);
	sortBy(tables, 'prior');
	let dParent = mBy('dTableList');
	if (isdef(dParent)) { mClear(dParent); }
	else dParent = mDom('dMain', {}, { className: 'section', id: 'dTableList' });
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }
	tables.map(x => x.game_friendly = capitalize(getGameFriendly(x.game)));
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = UI.tables = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'playerNames'], 'tables', false);
	mTableCommandify(t.rowitems.filter(ri => ri.o.status != 'open'), {
		0: (item, val) => hFunc(val, 'onclickTable', item.o.id, item.id),
	});
	mTableStylify(t.rowitems.filter(ri => ri.o.status == 'open'), { 0: { fg: 'blue' }, });
	let d = iDiv(t);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let id = ri.o.id;
		if (ri.o.prior == 1) mDom(r, {}, { tag: 'td', html: getWaitingHtml(24) });
		if (ri.o.status == 'open') {
			let playerNames = ri.o.playerNames;
			if (playerNames.includes(me)) {
				if (ri.o.owner != me) {
					let h1 = hFunc('leave', 'onclickLeaveTable', ri.o.id); let c = mAppend(r, mCreate('td')); c.innerHTML = h1;
				}
			} else {
				let h1 = hFunc('join', 'onclickJoinTable', ri.o.id); let c = mAppend(r, mCreate('td')); c.innerHTML = h1;
			}
		}
		if (ri.o.owner != me) continue;
		let h = hFunc('delete', 'onclickDeleteTable', id); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
		if (ri.o.status == 'open') { let h1 = hFunc('start', 'onclickStartTable', id); let c1 = mAppend(r, mCreate('td')); c1.innerHTML = h1; }
	}
}
function showText(dParent, text, bg = 'black') {
	return mDom(dParent, { align: 'center', wmin: 120, padding: 2, bg, fg: colorIdealText(bg) }, { html: text });
}
async function showTextColors() {
	let d = mBy('dSettingsMenu'); mClear(d);
	let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
	let colors = ['white', 'silver', 'dimgray', 'black'].map(x => w3color(x)); //, getCSSVariable('--fgButton'), getCSSVariable('--fgButtonHover')].map(x => w3color(x));
	for (var c of colors) {
		let bg = 'transparent';
		let fg = c.hex = c.toHexString();
		let d2 = mDom(d1, { border: fg, wmin: 250, bg, fg, padding: 20 }, { class: 'colorbox', dataColor: fg });
		mDom(d2, { weight: 'bold', align: 'center' }, { html: 'Text Sample' });
		let html = `<br>${fg}<br>hue:${c.hue}<br>sat:${Math.round(c.sat * 100)}<br>lum:${Math.round(c.lightness * 100)}`
		let dmini = mDom(d2, { align: 'center', wmin: 120, padding: 2, bg, fg }, { html });
	}
	let divs = document.getElementsByClassName('colorbox');
	for (const div of divs) {
		div.onclick = async () => onclickTextColor(div.getAttribute('dataColor'));
	}
}
async function showTextures() {
	let d = mBy('dSettingsMenu'); mClear(d);
	let dTheme = mDom(d, { padding: 12, gap: 10 }); mFlexWrap(dTheme);
	let list = M.textures;
	if (colorGetLum(U.color) > 75) list = list.filter(x => !x.includes('ttrans'));
	let itemsTexture = [];
	for (const t of list) {
		let bgRepeat = t.includes('marble_') || t.includes('wall') ? 'no-repeat' : 'repeat';
		let bgSize = t.includes('marble_') || t.includes('wall') ? `cover` : t.includes('ttrans') ? '' : 'auto';
		let bgImage = `url('${t}')`;
		let recommendedMode = t.includes('ttrans') ? 'normal' : (t.includes('marble_') || t.includes('wall')) ? 'luminosity' : 'multiply';
		let dc = mDom(dTheme, { bg: U.color, bgImage, bgSize, bgRepeat, bgBlend: 'normal', cursor: 'pointer', border: 'white', w: '30%', wmax: 300, h: 170 });
		let item = { div: dc, path: t, bgImage, bgRepeat, bgSize, bgBlend: recommendedMode, isSelected: false };
		itemsTexture.push(item);
		dc.onclick = async () => onclickTexture(item, itemsTexture);
	}
	return itemsTexture;
}
async function showThemes() {
	let d = mBy('dSettingsMenu'); mClear(d);
	let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
	let themes = lookup(Serverdata.config, ['themes']);
	let bgImage, bgSize, bgRepeat, bgBlend, name, color, fg;
	for (const key in themes) {
		let th = themes[key];
		if (isdef(th.texture)) {
			bgImage = bgImageFromPath(th.texture);
			bgRepeat = (bgImage.includes('marble') || bgImage.includes('wall')) ? 'no-repeat' : 'repeat';
			bgSize = (bgImage.includes('marble') || bgImage.includes('wall')) ? 'cover' : '';
			bgBlend = isdef(th.blendMode) ? th.blendMode : (bgImage.includes('ttrans') ? 'normal' : bgImage.includes('marble_') ? 'luminosity' : 'multiply');
		}
		color = th.color;
		if (isdef(th.fg)) fg = th.fg;
		name = th.name;
		let [realBg, bgContrast, bgNav, fgNew, fgContrast] = calculateGoodColors(color, fg)
		let styles = { w: 300, h: 200, bg: realBg, fg: fgNew, border: `solid 1px ${getCSSVariable('--fgButton')}` };
		if (isdef(bgImage)) addKeys({ bgImage, bgSize, bgRepeat }, styles);
		if (isdef(bgBlend)) addKeys({ bgBlend }, styles);
		let dsample = mDom(d1, styles, { theme: key });
		let dnav = mDom(dsample, { bg: bgNav, padding: 10 }, { html: name.toUpperCase() });
		let dmain = mDom(dsample, { padding: 10, fg: 'black', className: 'section' }, { html: getMotto() });
		dsample.onclick = onclickThemeSample;
	}
}
function showTitle(title, dParent = 'dTitle') {
	mClear(dParent);
	return mDom(dParent, { maleft: 20 }, { tag: 'h1', html: title, classes: 'title' });
}
function showTrick() {
	let dZone = Zones.table.dData;
	let d = mDiv(dZone);
	mStyle(d, { display: 'flex', position: 'relative' });
	let zIndex = 1;
	for (let i = 0; i < T.trick.length; i++) {
		let c = T.trick[i];
		let direction = i == 0 ? { x: 0, y: -1 } : { x: 0, y: 1 };
		let displ = 10;
		let offset = { x: -35 + direction.x * displ, y: direction.y * displ };
		let d1 = c.div;
		mAppend(d, d1);
		mStyle(d1, { position: 'absolute', left: offset.x, top: offset.y, z: zIndex });
		zIndex += 1;
	}
}
function showUserImage(uname, d, sz = 40) {
	let u = Serverdata.users[uname];
	let key = u.imgKey;
	let m = M.superdi[key];
	if (nundef(m)) {
		key = 'unknown_user';
	}
	return showim1(key, d, { 'object-position': 'center top', 'object-fit': 'cover', h: sz, w: sz, round: true, border: `${u.color} 3px solid` });
}
function showValidMoves(table) {
	if (nundef(table.moves)) { console.log('no moves yet!'); return; }
	console.log('________', table.step)
	for (const m of table.moves) {
		console.log(`${m.step} ${m.name}: ${m.move.map(x => x.substring(0, 5)).join(',')} (${m.change})=>${m.score}`);
	}
}
function showim1(imgKey, d, styles = {}, opts = {}) {
	let o = lookup(M.superdi, [imgKey]);
	let src;
	if (nundef(o) && imgKey.includes('.')) src = imgKey;
	else if (isdef(o) && isdef(opts.prefer)) src = valf(o[opts.prefer], o.img);
	else if (isdef(o)) src = valf(o.img, o.photo)
	if (nundef(src)) src = rChoose(M.allImages).path;
	let [w, h] = mSizeSuccession(styles, 40);
	addKeys({ w, h }, styles)
	let img = mDom(d, styles, { tag: 'img', src });
	return img;
}
function showim2(imgKey, d, styles = {}, opts = {}) {
	let o = lookup(M.superdi, [imgKey]);
	let src;
	if (isFilename(imgKey)) src = imgKey;
	else if (isdef(o) && isdef(opts.prefer)) src = valf(o[opts.prefer], o.img);
	else if (isdef(o)) src = valf(o.img, o.photo)
	let [w, h] = mSizeSuccession(styles, 40);
	addKeys({ w, h }, styles);
	if (nundef(o) && nundef(src)) src = rChoose(M.allImages).path;
	if (isdef(src)) return mDom(d, styles, { tag: 'img', src });
	fz = .8 * h;
	let [family, html] = isdef(o.text) ? ['emoNoto', o.text] : isdef(o.fa) ? ['pictoFa', String.fromCharCode('0x' + o.fa)] : isdef(o.ga) ? ['pictoGame', String.fromCharCode('0x' + o.ga)] : isdef(o.fa6) ? ['fa6', String.fromCharCode('0x' + o.fa6)] : ['algerian', o.friendly];
	addKeys({ family, fz, hline: fz, display: 'inline' }, styles);
	let el = mDom(d, styles, { html }); mCenterCenterFlex(el);
	return el;
	if (isdef(o.text)) el = mDom(d, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.text });
	else if (isdef(o.fa)) el = mDom(d, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
	else if (isdef(o.ga)) el = mDom(d, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
	else if (isdef(o.fa6)) el = mDom(d, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
	return el;
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }

function simpleCheckCommands() {
	if (nundef(UI.selectedImages)) UI.selectedImages = [];
	let n = UI.selectedImages.length;
	for (const k in UI.commands) {
		let cmd = UI.commands[k];
		if (nundef(cmd) || nundef(iDiv(cmd)) || nundef(mBy(k))) continue;
		if (nundef(cmd.fSel) || cmd.fSel(n)) cmdEnable(k); else cmdDisable(k);
	}
}
function simpleClearSelections() {
	mClearAllSelections();
	simpleCheckCommands();
}
async function simpleFinishEditing(canvas, dPopup, inpFriendly, inpCats, sisi) {
	const dataUrl = canvas.toDataURL('image/png'); //davon jetzt die dataUrl!
	if (isEmpty(inpFriendly.value)) inpFriendly.value = 'pic'
	let friendly = inpFriendly.value;
	let [name, imgname] = findUniqueSuperdiKey(friendly);
	console.log('key name will be', name, imgname);
	let key = name, filename = name + '.png';
	let o = { image: dataUrl, coll: sisi.name, filename };
	let resp = await mPostRoute('postImage', o); //console.log('resp', resp); //sollte path enthalten!
	filename = resp.filename;
	let imgPath = `../assets/img/${sisi.name}/${filename}`;
	let cats = extractWords(valf(inpCats.value, ''));
	let item = isdef(M.superdi[key]) ? jsCopy(M.superdi[key]) : { key, friendly, cats, colls: [] };
	item[valf(imgname, 'img')] = imgPath;
	dPopup.remove();
	await simpleOnDroppedItem(item, key, sisi);
}
function simpleInit(name, sisi) {
	if (nundef(name) && isdef(UI.simple)) { sisi = UI.simple; name = sisi.name; }
	let isReload = isdef(sisi.index) && sisi.name == name;
	if (!isReload) { sisi.index = 0; sisi.pageIndex = 1; sisi.name = name; sisi.filter = null; }
	let list = [];
	if (name == 'all' || isEmpty(name)) { list = Object.keys(M.superdi); }
	else if (isdef(M.byCollection[name])) { list = M.byCollection[name]; }
	else list = [];
	localStorage.setItem('sisi', name)
	let dMenu = sisi.dMenu;
	mClear(dMenu);
	let d = mDom(dMenu); mFlexV(d);
	mDom(d, { fz: 24, weight: 'bold' }, { html: 'Collection:' });
	let collNames = M.collections;
	let dlColl = mDatalist(d, collNames, { placeholder: "<select from list>" });
	dlColl.inpElem.oninput = ev => { console.log(sisi.name, ev.target.value); simpleInit(ev.target.value, sisi); }
	dlColl.inpElem.value = name;
	list = sortByFunc(list, x => M.superdi[x].friendly);
	sisi.masterKeys = list;
	sisi.keys = sisi.filter ? collFilterImages(sisi, sisi.filter) : list;
	let cats = collectCats(sisi.keys);
	cats.sort();
	d = mDom(dMenu); mFlexV(d);
	let wLabel = sisi.cols < 6 ? 117 : 'auto';
	mDom(d, { fz: 24, weight: 'bold', w: wLabel, align: 'right' }, { edit: true, html: 'Filter:' });
	let dlCat = mDatalist(d, cats, { edit: false, placeholder: "<enter value>", value: sisi.filter });
	dlCat.inpElem.oninput = ev => {
		let coll = UI.simple;
		let s = ev.target.value.toLowerCase().trim();
		let list = collFilterImages(coll, s);
		coll.keys = list;
		coll.filter = s;
		coll.index = 0; coll.pageIndex = 1; simpleClearSelections();
		simpleShowImageBatch(coll, 0, false);
	};
	d = mDom(dMenu, { gap: 10, align: 'right' });
	mButton('prev', () => simpleShowImageBatch(sisi, -1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bPrev');
	mButton('next', () => simpleShowImageBatch(sisi, 1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bNext');
	simpleClearSelections();
	simpleShowImageBatch(sisi);
}
function simpleLocked(collname) {
	if (nundef(collname)) collname = lookup(UI, ['simple', 'name']);
	if (!collname) return true;
	return getUname() != '_unsafe' && ['all', 'emo', 'fa6', 'icon', 'nations', 'users'].includes(collname);
}
async function simpleOnDropImage(ev, elem) {
	let dt = ev.dataTransfer;
	if (dt.types.includes('itemkey')) {
		let data = ev.dataTransfer.getData('itemkey');
		await simpleOnDroppedItem(data);
	} else {
		const files = ev.dataTransfer.files;
		if (files.length > 0) {
			const reader = new FileReader();
			reader.onload = async (evReader) => {
				let data = evReader.target.result;
				await simpleOnDroppedUrl(data, UI.simple);
			};
			reader.readAsDataURL(files[0]);
		}
	}
}
async function simpleOnDroppedItem(itemOrKey, key, sisi) {
	if (nundef(sisi)) sisi = UI.simple;
	let item;
	if (isString(itemOrKey)) { key = itemOrKey; item = M.superdi[key]; } else { item = itemOrKey; }
	assertion(isdef(key), 'NO KEY!!!!!');
	lookupAddIfToList(item, ['colls'], sisi.name);
	let o = M.superdi[key];
	if (isdef(o)) {
		console.log(`HA! ${key} already there`);
		let changed = false;
		for (const k in item) {
			let val = item[k];
			if (isLiteral(val) && o[k] != item[k]) { changed = true; break; }
			else if (isList(val) && !sameList(val, o[k])) { changed = true; break; }
		}
		if (!changed) return;
	}
	console.log(`........But changed!!!`);
	let di = {}; di[key] = item;
	await updateSuperdi(di);
	simpleInit(sisi.name, sisi)
}
async function simpleOnDroppedUrl(src, sisi) {
	let sz = 400;
	let dPopup = mDom(document.body, { position: 'fixed', top: 40, left: 0, wmin: sz, hmin: sz, bg: 'pink' });
	let dParent = mDom(dPopup);
	let d = mDom(dParent, { w: sz, h: sz, border: 'dimgray', margin: 10 });
	let canvas = createPanZoomCanvas(d, src, sz, sz);
	let instr = mDom(dPopup, { align: 'center', mabot: 10 }, { html: `- panzoom image to your liking -` })
	let dinp = mDom(dPopup, { padding: 10, align: 'right', display: 'inline-block' })
	mDom(dinp, { display: 'inline-block' }, { html: 'Name: ' });
	let inpFriendly = mDom(dinp, { outline: 'none', w: 200 }, { className: 'input', name: 'friendly', tag: 'input', type: 'text', placeholder: `<enter name>` });
	let defaultName = '';
	let iDefault = 1;
	let k = sisi.masterKeys.find(x => x == `${sisi.name}${iDefault}`);
	while (isdef(k)) { iDefault++; k = sisi.masterKeys.find(x => x == `${sisi.name}${iDefault}`); }
	defaultName = `${sisi.name}${iDefault}`;
	inpFriendly.value = defaultName;
	mDom(dinp, { h: 1 });
	mDom(dinp, { display: 'inline-block' }, { html: 'Categories: ' })
	let inpCats = mDom(dinp, { outline: 'none', w: 200 }, { className: 'input', name: 'cats', tag: 'input', type: 'text', placeholder: `<enter categories>` });
	let db2 = mDom(dPopup, { padding: 10, display: 'flex', gap: 10, 'justify-content': 'end' });
	mButton('Cancel', () => dPopup.remove(), db2, { w: 70 }, 'input');
	mButton('Save', () => simpleFinishEditing(canvas, dPopup, inpFriendly, inpCats, sisi), db2, { w: 70 }, 'input');
}
async function simpleOnclickItem(ev) {
	let id = evToId(ev);
	let item = UI.simple.items[id]; if (nundef(item)) return;
	let selkey = item.key;
	toggleSelectionOfPicture(iDiv(item), selkey, UI.selectedImages);
	simpleCheckCommands();
}
async function simpleOnclickLabel(ev) {
	evNoBubble(ev);
	let id = evToId(ev); console.log('id', id)
	let o = lookup(UI.simple, ['items', id]);
	if (!o) return;
	console.log('clicked label of', o);
	let [key, elem, collname] = [o.key, o.name, iDiv(o)];
	let newfriendly = await mGather(ev.target);
	if (!newfriendly) return;
	if (isEmpty(newfriendly)) {
		showMessage(`ERROR: name invalid: ${newfriendly}`);
		return;
	}
	console.log('rename friendly to', newfriendly)
	let item = M.superdi[key];
	item.friendly = newfriendly;
	let di = {};
	di[key] = item;
	let res = await mPostRoute('postUpdateSuperdi', { di });
	console.log('postUpdateSuperdi', res)
	await loadAssets();
	ev.target.innerHTML = newfriendly;
}
async function simpleSetAvatar(key) {
	U.imgKey = key;
	let res = await postUserChange(U);
}
function simpleShowImageBatch(sisi, inc = 0, alertEmpty = false) {
	let [keys, index, numCells] = [sisi.keys, sisi.index, sisi.rows * sisi.cols];
	if (isEmpty(keys) && alertEmpty) showMessage('nothing has been added to this collection yet!');
	if (keys.length <= numCells) inc = 0;
	let newPageIndex = sisi.pageIndex + inc;
	let numItems = keys.length;
	let maxPage = Math.max(1, Math.ceil(numItems / numCells));
	if (newPageIndex > maxPage) newPageIndex = 1;
	if (newPageIndex < 1) newPageIndex = maxPage;
	index = numCells * (newPageIndex - 1);
	let list = arrTakeFromTo(keys, index, index + numCells);
	sisi.index = index; sisi.pageIndex = newPageIndex;
	sisi.items = {};
	let name = sisi.name;
	for (let i = 0; i < list.length; i++) {
		let key = list[i];
		let d = sisi.cells[i];
		mStyle(d, { opacity: 1 });
		mClass(d, 'magnifiable')
		let id = getUID();
		let d1 = simpleShowImageInBatch(key, d, {}, { prefer: sisi.name == 'emo' ? 'img' : 'photo' });
		d1.id = id;
		let item = { div: d1, key, name, id, index: i, page: newPageIndex };
		sisi.items[id] = item;
		if (isList(UI.selectedImages) && UI.selectedImages.includes(key)) mSelect(d1);
	}
	for (let i = list.length; i < numCells; i++) {
		mStyle(sisi.cells[i], { opacity: 0 })
	}
	sisi.dPageIndex.innerHTML = `page ${sisi.pageIndex}/${maxPage}`;
	let [dNext, dPrev] = [mBy('bNext'), mBy('bPrev')];
	if (maxPage == 1) { mClass(dPrev, 'disabled'); mClass(dNext, 'disabled'); }
	else { mClassRemove(dPrev, 'disabled'); mClassRemove(dNext, 'disabled'); }
}
function simpleShowImageInBatch(key, dParent, styles = {}, opts = {}) {
	let o = M.superdi[key]; o.key = key;
	addKeys({ bg: rColor() }, styles);
	mClear(dParent);
	[w, h] = [dParent.offsetWidth, dParent.offsetHeight];
	let [sz, fz] = [.9 * w, .8 * h];
	let d1 = mDiv(dParent, { position: 'relative', w: '100%', h: '100%', padding: 11, box: true });//overflow: 'hidden', 
	mCenterCenterFlex(d1)
	let el = null;
	let src = (opts.prefer == 'photo' && isdef(o.photo)) ? o.photo : valf(o.img, null);
	if (isdef(src)) {
		if (o.cats.includes('card')) {
			el = mDom(d1, { h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src });
			mDom(d1, { h: 1, w: '100%' })
		} else {
			el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src });
		}
	}
	else if (isdef(o.text)) el = mDom(d1, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.text });
	else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
	else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
	else if (isdef(o.fa6)) el = mDom(d1, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
	assertion(el, 'PROBLEM mit' + key);
	let label = mDom(d1, { fz: 11, cursor: 'pointer' }, { html: o.friendly, className: 'ellipsis hoverHue' });
	label.onclick = simpleOnclickLabel;
	mStyle(d1, { cursor: 'pointer' });
	d1.onclick = simpleOnclickItem;
	d1.setAttribute('key', key);
	d1.setAttribute('draggable', true)
	d1.ondragstart = ev => { ev.dataTransfer.setData('itemkey', key); }
	return d1;
}
function simpleSidebar(wmin) {
	mStyle('dLeft', { wmin });
	let d = mDom('dLeft', { wmin: wmin - 10, matop: 20, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
	let gap = 5;
	let stylesTitles = { matop: 10, bg: '#ffffff80', fg: 'black' };
	let cmds = {};
	cmds.simpleNew = mCommand(d, 'simpleNew', 'New'); mNewline(d, gap);
	mDom(d, stylesTitles, { html: 'Selection:' })
	cmds.simpleSelectAll = mCommand(d, 'simpleSelectAll', 'Select All'); mNewline(d, gap);
	cmds.simpleSelectPage = mCommand(d, 'simpleSelectPage', 'Select Page'); mNewline(d, gap);
	cmds.simpleClearSelections = mCommand(d, 'simpleClearSelections', 'Clear Selection', { fSel: x => x >= 1 }); mNewline(d, gap);
	mDom(d, stylesTitles, { html: 'Item:' })
	cmds.setAvatar = mCommand(d, 'setAvatar', 'Set Avatar', { fSel: x => x == 1 }); mNewline(d, gap);
	cmds.editDetails = mCommand(d, 'editDetails', 'Edit Details', { fSel: x => x == 1 }); mNewline(d, gap);
	mDom(d, stylesTitles, { html: 'Items:' })
	cmds.addSelected = mCommand(d, 'addSelected', 'Add To', { fSel: x => (x >= 1) }); mNewline(d, gap);
	cmds.simpleRemove = mCommand(d, 'simpleRemove', 'Remove', { fSel: x => (!simpleLocked() && x >= 1) }); mNewline(d, gap);
	UI.commands = cmds;
	simpleCheckCommands();
}
async function simpleUpload(route, o) {
	let server = getServerurl();
	server += `/${route}`;
	const response = await fetch(server, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		mode: 'cors',
		body: JSON.stringify(o)
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	} else {
		return 'ERROR 1';
	}
}
function simulateClick(elem) {
	var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
	var canceled = !elem.dispatchEvent(evt);
}
function size2hex(w = 100, h = 0, x = 0, y = 0) {
	let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];
	if (h == 0) {
		h = (2 * w) / 1.73;
	}
	return polyPointsFrom(w, h, x, y, hexPoints);
}
function sleep() { return new Promise(r => setTimeout(r, m)) }

function sockInit() {
	let server = getServerurl();
	Socket = io(server);
	Socket.on('config', onsockConfig);
	Socket.on('disconnect', x => console.log('::SOCK disconnect:', x));
	Socket.on('event', onsockEvent);
	Socket.on('message', showChatMessage);
	Socket.on('merged', onsockMerged);
	Socket.on('pending', onsockPending);
	Socket.on('table', onsockTable);
	Socket.on('tables', onsockTables);
	Socket.on('superdi', onsockSuperdi);
}
function sockPostUserChange(oldname, newname) {
	Socket.emit('userChange', { oldname, newname });
}
function someOtherPlayerName(table) {
	return rChoose(arrWithout(table.playerNames, getUname()));
}
function sortBy(arr, key) { arr.sort((a, b) => (a[key] < b[key] ? -1 : 1)); return arr; }

function sortByDescending(arr, key) { arr.sort((a, b) => (a[key] > b[key] ? -1 : 1)); return arr; }

function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }

function sortByHues(list) {
	let buckets = { red: [], orange: [], yellow: [], green: [], cyan: [], blue: [], purple: [], magenta: [], pink: [], grey: [] };
	for (const c of list) {
		let hue = c.hue;
		if (hue >= 355 || hue <= 10) buckets.red.push(c);
		if (hue >= 11 && hue <= 45) buckets.orange.push(c);
		if (hue >= 46 && hue <= 62 && c.lightness * 100 >= 45) buckets.yellow.push(c);
		if (hue >= 63 && hue <= 164) buckets.green.push(c);
		if (hue >= 165 && hue <= 199) buckets.cyan.push(c);
		if (hue >= 200 && hue <= 245) buckets.blue.push(c);
		if (hue >= 246 && hue <= 277) buckets.purple.push(c);
		if (hue >= 278 && hue <= 305) buckets.magenta.push(c);
		if (hue >= 306 && hue <= 355) buckets.pink.push(c);
	}
	for (const b in buckets) {
		sortByMultipleProperties(buckets[b], 'lightness', 'hue');
	}
	return buckets;
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
function sortCaseInsensitive(list) {
	list.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
	return list;
}
function sortCheckboxes(grid) {
	let divs = arrChildren(grid);
	divs.map(x => x.remove());
	let chyes = divs.filter(x => x.firstChild.checked == true);
	let chno = divs.filter(x => !chyes.includes(x));
	chyes = sortByFunc(chyes, x => x.firstChild.name);
	chno = sortByFunc(chno, x => x.firstChild.name);
	for (const d of chyes) { mAppend(grid, d) }
	for (const d of chno) { mAppend(grid, d) }
}
function sortDicolor(di) {
	if (nundef(di)) di = jsCopy(M.dicolor);
	let dinew = {};
	let kbucket = Object.keys(di);
	kbucket.sort();
	for (const k of kbucket) {
		let o = di[k];
		let di_bucket_new = {};
		let kc = Object.keys(o);
		kc.sort(); console.log(kc);
		for (const k1 of kc) {
			di_bucket_new[k1] = o[k1];
		}
		dinew[k] = di_bucket_new;
	}
	downloadAsYaml(dinew, 'dicolor')
}
function sortDictionary(di) {
	let keys = Object.keys(di);
	keys.sort();
	let newdi = {};
	for (const k of keys) {
		newdi[k] = di[k];
	}
	return newdi;
}
function splitAtAnyOf(s, sep) {
	let arr = [], w = '';
	for (let i = 0; i < s.length; i++) {
		let ch = s[i];
		if (sep.includes(ch)) {
			if (!isEmpty(w)) arr.push(w);
			w = '';
		} else {
			w += ch;
		}
	}
	if (!isEmpty(w)) arr.push(w);
	return arr;
}
function splitAtWhiteSpace(s) {
	return s.split(/\s+/).filter(x => x.trim() !== "");
}
function squareTo(tool, sznew = 128) {
	let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
	let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
	if (sznew == 0) sznew = h;
	let sz = Math.max(w, h)
	let [x1, y1] = [x - (sz - w) / 2, y - (sz - h) / 2];
	redrawImage(img, dParent, x1, y1, sz, sz, sznew, sznew, () => tool.setRect(0, 0, sznew, sznew))
}
async function startGame(gamename, players, options) {
	let table = createOpenTable(gamename, players, options);
	table = setTableToStarted(table);
	let res = await mPostRoute('postTable', table);
}
function startLevel() {
	Speech.setLanguage(Settings.language);
	getGameValues(Username, G.id, G.level);
	G.instance.startLevel();
	if (G.keys.length < G.numPics) { updateKeySettings(G.numPics + 5); }
	startRound();
}
function startPanning(ev) {
	console.log('_________startPanning!')
	const panData = {};
	function panStart(ev) {
		evNoBubble(ev);
		assertion(nundef(panData.panning), panData)
		let dc = panData.dCrop = ev.target;
		panData.cropStartSize = { w: mGetStyle(dc, 'w'), h: mGetStyle(dc, 'h') }
		panData.cropStartPos = { l: mGetStyle(dc, 'left'), t: mGetStyle(dc, 'top') }
		panData.elParent = panData.dCrop.parentNode;
		panData.img = panData.elParent.querySelector('img, canvas');//console.log('img',panData.img);
		panData.panning = true;
		panData.counter = -1;
		panData.mouseStart = getMouseCoordinatesRelativeToElement(ev, panData.elParent);
		panData.posStart = { x: mGetStyle(dc, 'left'), y: mGetStyle(dc, 'top') };
		addEventListener('mouseup', panEnd);
		panData.elParent.addEventListener('mousemove', panMove);
		console.log('panStart!', panData.mouseStart);
	}
	function panMove(ev) {
		evNoBubble(ev);
		if (!panData.panning || ++panData.counter % 3) return;
		panData.mouse = getMouseCoordinatesRelativeToElement(ev, panData.elParent);
		let [x, y] = [panData.posStart.x, panData.posStart.y];
		let [dx, dy] = [panData.mouse.x - panData.mouseStart.x, panData.mouse.y - panData.mouseStart.y];
		[dx, dy] = [Math.round(dx / 10) * 10, Math.round(dy / 10) * 10];
		adjustComplex(panData)
	}
	function panEnd(ev) {
		assertion(panData.panning == true);
		let d = evToClass(ev, 'imgWrapper');
		if (d == panData.elParent) {
			evNoBubble(ev);
			panData.mouse = getMouseCoordinatesRelativeToElement(ev, panData.elParent);
			console.log('SUCCESS!', panData.mouse)
		}
		removeEventListener('mouseup', panEnd);
		panData.elParent.removeEventListener('mousemove', panMove);
		panData.panning = false;
		console.log('* THE END *', panData)
	}
	panStart(ev);
}
function startRound() {
	if (G.addonActive != true && isTimeForAddon()) {
		G.addonActive = true;
		exitToAddon(startRound); return;
	} else G.addonActive = false;
	resetRound();
	uiActivated = false;
	G.instance.startRound();
	TOMain = setTimeout(() => prompt(), 300);
}
function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}
function staticArea(areaName, oSpec) {
	func = correctFuncName(oSpec.type);
	oSpec.ui = window[func](areaName, oSpec);
}
function staticTitle(table) {
	clearInterval(TO.titleInterval);
	let url = window.location.href;
	let loc = url.includes('vidulus') ? '' : '(local)';
	let game = isdef(table) ? lastWord(table.friendly) : '♠ Moxito ♠';
	document.title = `${loc} ${game}`;
}
function stdRowsColsContainer(dParent, cols, styles = {}) {
	addKeys({
		margin: 'auto',
		padding: 10,
		gap: 10,
		display: 'grid',
		bg: 'green',
		'grid-template-columns': `repeat(${cols}, 1fr)`
	}, styles);
	return mDiv(dParent, styles);
}
function stopAutobot() {
	if (isdef(TO.SLEEPTIMEOUT)) clearTimeout(TO.SLEEPTIMEOUT);
	DA.stopAutobot = true;
}
function strRemoveTrailing(s, sub) {
	return s.endsWith(sub) ? stringBeforeLast(s, sub) : s;
}
function strSameCaseInsensitive(s1, s2) { return s1.toLowerCase() == s2.toLowerCase(); }

function stringAfter(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return arrLast(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - sSub.length);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function stringCSSToCamelCase(s) {
	let parts = s.split('-');
	let res = parts[0];
	for (let i = 1; i < parts.length; i++) { res += capitalize(parts[i]) }
	return res;
}
function stringCount(s, sSub, caseInsensitive = true) {
	let n = 0;
	for (let i = 0; i < s.length; i++) {
		if (s.slice(i).startsWith(sSub)) n++;
	}
	return n;
	let m = new RegExp(sSub, 'g' + (caseInsensitive ? 'i' : ''));
	let s1 = s.match(m);
	return s1 ? s1.length : 0;
}
function stringSplit(input) {
	return input.split(/[\s,]+/);
}
async function switchToMainMenu(name) { return await switchToMenu(UI.nav, name); }

async function switchToMenu(menu, key) {
	menuCloseCurrent(menu);
	Menu = { key }; localStorage.setItem('menu', key);
	await menuOpen(menu, key);
}
async function switchToOtherUser() {
	let uname = await mGetRoute('otherUser', arguments);
	await switchToUser(uname);
}
async function switchToTables() { return await switchToMainMenu('play'); }

async function switchToUser(uname, menu) {
	if (!isEmpty(uname)) uname = normalizeString(uname);
	if (isEmpty(uname)) uname = 'guest';
	sockPostUserChange(U ? getUname() : '', uname); //das ist nur fuer die client id!
	U = await getUser(uname);
	localStorage.setItem('username', uname);
	iDiv(UI.nav.commands.user).innerHTML = uname;
	setUserTheme();
	menu = valf(menu, getMenu(), localStorage.getItem('menu'), 'home');
	await switchToMainMenu(menu);
}
function tableLayoutMR(dParent, m = 7, r = 1) {
	let ui = UI; ui.players = {};
	clearElement(dParent);
	let bg = 'transparent';
	let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
	mCenterFlex(dMiddle, false);
	let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
	let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
	for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
	let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
	ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
	let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
	let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);
	return [dOben, dOpenTable, dMiddle, dRechts];
}
function tabtitleUpdate() {
}
function takeFromTo(ad, from, to) {
	if (isDict(ad)) {
		let keys = Object.keys(ad);
		return keys.slice(from, to).map(x => (ad[x]));
	} else return ad.slice(from, to);
}
function test1(map) {
	var baseballIcon = L.icon({
		iconUrl: '../leaf94/baseball-marker.png',
		iconSize: [32, 37],
		iconAnchor: [16, 37],
		popupAnchor: [0, -28]
	});
	function onEachFeature(feature, layer) {
		var popupContent = '<p>I started out as a GeoJSON ' +
			feature.geometry.type + ", but now I'm a Leaflet vector!</p>";
		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}
		layer.bindPopup(popupContent);
	}
	var bicycleRentalLayer = L.geoJSON([bicycleRental, campus], {
		style: function (feature) {
			return feature.properties && feature.properties.style;
		},
		onEachFeature: onEachFeature,
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, {
				radius: 8,
				fillColor: '#ff7800',
				color: '#000',
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			});
		}
	}).addTo(map);
	var freeBusLayer = L.geoJSON(freeBus, {
		filter: function (feature, layer) {
			if (feature.properties) {
				return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
			}
			return false;
		},
		onEachFeature: onEachFeature
	}).addTo(map);
	var coorsLayer = L.geoJSON(coorsField, {
		pointToLayer: function (feature, latlng) {
			return L.marker(latlng, { icon: baseballIcon });
		},
		onEachFeature: onEachFeature
	}).addTo(map);
}
function testHelpers() {
	if (activatedTests.includes('helpers')) {
		console.log(...arguments);
	}
}
async function testOnclickBot(ev) {
	for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
		if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
	}
	mStyle(UI.bTestBot, { bg: 'red', fg: 'white' });
	await onclickBot();
}
async function testOnclickHuman(ev) {
	for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
		if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
	}
	mStyle(UI.bTestHuman, { bg: 'red', fg: 'white' });
	await onclickHuman();
}
async function testOnclickHybrid(ev) {
	for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
		if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
	}
	mStyle(UI.bTestHybrid, { bg: 'red', fg: 'white' });
	await onclickHybrid();
}
async function testOnclickPlaymode(ev) {
	let b = UI.bPlaymode;
	let caption = b.innerHTML;
	if (caption.includes('human')) await onclickHuman();
	else await onclickBot();
}
function toElem(d) { return isString(d) ? mBy(d) : d; }

function toLetters(s) { return [...s]; }

function toNameValueList(any) {
	if (isEmpty(any)) return [];
	let list = [];
	if (isString(any)) {
		let words = toWords(any);
		for (const w of words) { list.push({ name: w, value: w }) };
	} else if (isDict(any)) {
		for (const k in any) { list.push({ name: k, value: any[k] }) };
	} else if (isList(any) && !isDict(any[0])) {
		for (const el of any) list.push({ name: el, value: el });
	} else if (isList(any) && isdef(any[0].name) && isdef(any[0].value)) {
		list = any;
	} else {
		let el = any[0];
		let keys = Object.keys(el);
		let nameKey = keys[0];
		let valueKey = keys[1];
		for (const x of any) {
			list.push({ name: x[nameKey], value: x[valueKey] });
		}
	}
	return list;
}
function toPercent(n, total) { return Math.round(n * 100 / total); }

function toWords(s, allow_ = false) {
	let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
	return arr.filter(x => !isEmpty(x));
}
function toggleItemSelection(item, classSelected = 'framedPicture', selectedItems = null) {
	if (nundef(item)) return;
	let ui = iDiv(item);
	item.isSelected = nundef(item.isSelected) ? true : !item.isSelected;
	if (item.isSelected) mClass(ui, classSelected); else mRemoveClass(ui, classSelected);
	if (isdef(selectedItems)) {
		if (item.isSelected) {
			console.assert(!selectedItems.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
			selectedItems.push(item);
		} else {
			console.assert(selectedItems.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
			removeInPlace(selectedItems, item);
		}
	}
}
function toggleItemSelectionUnique(item, items) {
	let selitems = items.filter(x => x.isSelected == true); selitems.map(x => toggleItemSelection(x))
	toggleItemSelection(item);
}
function toggleSelectionOfPicture(elem, selkey, selectedPics, className = 'framedPicture') {
	if (selectedPics.includes(selkey)) {
		removeInPlace(selectedPics, selkey); mUnselect(elem);
	} else {
		selectedPics.push(selkey); mSelect(elem);
	}
}
function transformColorName(s) {
	let res = replaceAll(s, ' ', '_');
	return res.toLowerCase();
}
function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}
function tryJSONParse(astext) {
	try {
		const data = JSON.parse(astext);
		return data;
	} catch {
		console.log('text', astext)
		return { message: 'ERROR', text: astext }
	}
}
function turtle() {
	background(51);
	stroke(255);
	translate(width / 2, height);
	for (let i = 0; i < sentence.length; i++) {
		let x = sentence.charAt(i);
		if ('ABF'.includes(x)) { line(0, 0, 0, -len); translate(0, -len); }
		else if (x == '+') rotate(angle);
		else if (x == '-') rotate(-angle);
		else if (x == '[') push();
		else if (x == ']') pop();
	}
}
function uiGadgetTypeCheckList(dParent, content, resolve, styles = {}, opts = {}) {
	addKeys({ hmax: 500, wmax: 200, bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let innerStyles = { hmax, wmax, box: true };
	let ui = uiTypeCheckList(content, dOuter, innerStyles, opts);
	let handler = () => resolve(getCheckedNames(ui));
	mButton('done', handler, dOuter, { classes: 'input', margin: 10 });
	return dOuter;
}
function uiGadgetTypeCheckListInput(form, content, resolve, styles, opts) {
	addKeys({ wmax: '100vw', hmax: valf(styles.hmax,500), bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
	let dOuter = mDom(form, styles);
	opts.handler = resolve;
	let ui = uiTypeCheckListInput(content, dOuter, styles, opts);
	return dOuter;
}
function uiGadgetTypeMulti(dParent, dict, resolve, styles = {}, opts = {}) {
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
function uiGadgetTypeMultiText(dParent, dict, resolve, styles = {}, opts = {}) {
	let inputs = [];
	let wIdeal = 500;
	let formStyles = { maleft: 10, wmin: wIdeal, padding: 10, bg: 'white', fg: 'black' };
	let form = mDom(dParent, formStyles, {})
	addKeys({ className: 'input', tag: 'textarea', }, opts);
	addKeys({ fz: 14, family: 'tahoma', w: wIdeal, resize: 'none' }, styles);
	let df = mDom(form);
	let db = mDom(form, { vmargin: 10, align: 'right' });
	mButton('Cancel', ev => resolve(null), db, { classes: 'button', maright: 10 });
	mButton('Save', ev => {
		let di = {};
		inputs.map(x => di[x.name] = x.inp.value);
		resolve(di);
	}, db, { classes: 'button', maright: 10 });
	if (isEmpty(dict)) {
		fillFormFromObject(inputs, wIdeal, df, db, styles, opts);
	} else {
		fillMultiForm(dict, inputs, wIdeal, df, styles, opts);
	}
	return form;
}
function uiGadgetTypeSelect(dParent, content, resolve, styles = {}, opts = {}) {
	let dSelect = uiTypeSelect(content, dParent, styles, opts);
	dSelect.onchange = ev => resolve(ev.target.value);
	return dSelect;
}
function uiGadgetTypeText(dParent, content, resolve, styles = {}, opts = {}) {
	let inp = mDom(dParent, styles, { autocomplete: 'off', className: 'input', name: content, tag: 'input', type: 'text', placeholder: valf(opts.placeholder, `<enter ${content}>`) });
	mOnEnterInput(inp, resolve);
	return inp;
}
function uiGadgetTypeYesNo(dParent, content, resolve, styles = {}, opts = {}) {
	addKeys({ bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles)
	let dq = mDom(dOuter, { mabottom: 7 }, { html: capitalize(content) });
	let db = mDom(dOuter, { w100: true, box: true, display: 'flex', 'justify-content': 'space-between', gap: 10 })
	let bYes = mDom(db, { w: 70, classes: 'input' }, { html: 'Yes', tag: 'button', onclick: () => resolve('yes') })
	let bNo = mDom(db, { w: 70, classes: 'input' }, { html: 'No', tag: 'button', onclick: () => resolve('no') })
	return dOuter;
}
async function uiTypeCalendar(dParent) {
	const [wcell, hcell, gap] = [120, 100, 10];
	let outerStyles = {
		rounding: 4, patop: 4, pabottom: 4, weight: 'bold', box: true,
		paleft: gap / 2, w: wcell, hmin: hcell,
		bg: 'black', fg: 'white', cursor: 'pointer'
	}
	let innerStyles = { box: true, padding: 0, align: 'center', bg: 'beige', rounding: 4 };//, w: '95%', hmin: `calc( 100% - 24px )` }; //cellWidth - 28 };
	innerStyles.w = wcell - 11.75;
	innerStyles.hmin = `calc( 100% - 23px )`;//hcell-32
	let fz = 12;
	let h = measureHeightOfTextStyle(dParent, { fz: fz }); //console.log('h', h)
	let eventStyles = { fz: fz, hmin: h, w: '100%' };
	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var dParent = toElem(dParent);
	var container = mDiv(dParent, {}, 'dCalendar');
	var currentDate = new Date();
	var today = new Date();
	let dTitle = mDiv(container, { w: 890, vpadding: gap, fz: 26, family: 'sans-serif', display: 'flex', justify: 'space-between' }, { className: 'title' });
	var dWeekdays = mGrid(1, 7, container, { gap: gap });
	var dDays = [];
	var info = {};
	for (const w of weekdays) { mDiv(dWeekdays, { w: wcell }, null, w, 'subtitle') };
	var dGrid = mGrid(6, 7, container, { gap: gap });
	var dDate = mDiv(dTitle, { display: 'flex', gap: gap }, 'dDate', '', 'title');
	var dButtons = mDiv(dTitle, { display: 'flex', gap: gap });
	mButton('Prev',
		async () => {
			let m = currentDate.getMonth();
			let y = currentDate.getFullYear();
			if (m == 0) setDate(12, y - 1); else await setDate(m, y);
		},
		dButtons, { w: 70, margin: 0 }, 'input');
	mButton('Next',
		async () => {
			let m = currentDate.getMonth();
			let y = currentDate.getFullYear();
			if (m == 11) setDate(1, y + 1); else await setDate(m + 2, y);
		}, dButtons, { w: 70, margin: 0 }, 'input');
	var dMonth, dYear;
	function getDayDiv(dt) {
		if (dt.getMonth() != currentDate.getMonth() || dt.getFullYear() != currentDate.getFullYear()) return null;
		let i = dt.getDate() + info.dayOffset;
		if (i < 1 || i > info.numDays) return null;
		let ui = dDays[i];
		if (ui.style.opacity === 0) return null;
		return ui.children[0];
	}
	async function setDate(m, y) {
		currentDate.setMonth(m - 1);
		currentDate.setFullYear(y);
		mClear(dDate);
		dMonth = mDiv(dDate, {}, 'dMonth', `${currentDate.toLocaleDateString('en-us', { month: 'long' })}`);
		dYear = mDiv(dDate, {}, 'dYear', `${currentDate.getFullYear()}`);
		mClear(dGrid);
		dDays.length = 0;
		let c = getNavBg();
		let dayColors = mimali(c, m).map(x => colorFrom(x))
		for (const i of range(42)) {
			let cell = mDiv(dGrid, outerStyles);
			mStyle(cell, { bg: dayColors[i], fg: 'contrast' })
			dDays[i] = cell;
		}
		populate(currentDate);
		await refreshEvents();
		return { container, date: currentDate, dDate, dGrid, dMonth, dYear, setDate, populate };
	}
	function populate() {
		let dt = currentDate;
		const day = info.day = dt.getDate();
		const month = info.month = dt.getMonth();
		const year = info.year = dt.getFullYear();
		const firstDayOfMonth = info.firstDay = new Date(year, month, 1);
		const daysInMonth = info.numDays = new Date(year, month + 1, 0).getDate();
		const dateString = info.dayString = firstDayOfMonth.toLocaleDateString('en-us', {
			weekday: 'long',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});
		const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);
		info.dayOffset = paddingDays - 1;
		for (const i of range(42)) {
			if (i < paddingDays || i >= paddingDays + daysInMonth) { mStyle(dDays[i], { opacity: 0 }); }
		}
		for (let i = paddingDays + 1; i <= paddingDays + daysInMonth; i++) {
			const daySquare = dDays[i - 1];
			let date = new Date(year, month, i - paddingDays);
			daySquare.innerText = i - paddingDays + (isSameDate(date, today) ? ' TODAY' : '');
			let d = mDom(daySquare, innerStyles, { id: date.getTime() });
			daySquare.onclick = ev => { evNoBubble(ev); onclickDay(d, eventStyles); }
		}
	}
	async function refreshEvents() {
		let events = await getEvents();
		for (const k in events) {
			let o = events[k];
			let dt = new Date(Number(o.day));
			let dDay = getDayDiv(dt);
			if (!dDay) continue;
			uiTypeEvent(dDay, o, eventStyles);
		}
		mDummyFocus();
	}
	await setDate(currentDate.getMonth() + 1, currentDate.getFullYear());
	return { container, date: currentDate, dDate, dGrid, dMonth, dYear, info, getDayDiv, refreshEvents, setDate, populate }
}
function uiTypeCheckList(any, dParent, styles = {}, opts = {}) {
	let lst = toNameValueList(any); lst.map(x => { if (x.value !== true) x.value = false; });
	addKeys({ overy: 'auto' }, styles)
	let d = mDom(dParent, styles, opts);
	lst.forEach((o, index) => {
		let [text, value] = [o.name, o.value];
		let dcheck = mDom(d, {}, { tag: 'input', type: 'checkbox', name: text, value: text, id: `ch_${index}`, checked: value });
		let dlabel = mDom(d, {}, { tag: 'label', for: dcheck.id, html: text });
		mNewline(d, 0);
	});
	return d;
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
	console.log('...hmax',styles.hmax)
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
function uiTypeEvent(dParent, o, styles = {}) {
	Items[o.id] = o;
	let id = o.id;
	let ui = mDom(dParent, styles, { id: id }); //, className:'no_events'}); //onclick:ev=>evNoBubble(ev) }); 
	mStyle(ui, { overflow: 'hidden', display: 'flex', gap: 2, padding: 2, 'align-items': 'center' }); //,'justify-items':'center'})
	let [wtotal, wbutton, h] = [mGetStyle(dParent, 'w'), 17, styles.hmin];
	let fz = 15;
	let stInput = { overflow: 'hidden', hline: fz * 4 / 5, fz: fz, h: h, border: 'solid 1px silver', box: true, margin: 0, padding: 0 };
	let inp = mDom(ui, stInput, { html: o.text, tag: 'input', className: 'no_outline', onclick: ev => { evNoBubble(ev) } }); //;selectText(ev.target);}});
	inp.value = getEventValue(o);
	inp.addEventListener('keyup', ev => { if (ev.key == 'Enter') { mDummyFocus(); onEventEdited(id, inp.value); } });
	fz = 14;
	let stButton = { overflow: 'hidden', hline: fz * 4 / 5, fz: fz, box: true, fg: 'silver', bg: 'white', family: 'pictoFa', display: 'flex' };
	let b = mDom(ui, stButton, { html: String.fromCharCode('0x' + M.superdi.pen_square.fa) });
	ui.onclick = ev => { evNoBubble(ev); onclickExistingEvent(ev); }
	mStyle(inp, { w: wtotal - wbutton });
	return { ui: ui, inp: inp, id: id };
}
function uiTypeExtraWorker(w) {
	let [res, n] = [stringBefore(w, ':'), Number(stringAfter(w, ':'))];
	let s = `worker (cost:${res} ${n})`
	let present = presentExtraWorker;
	let select = selectExtraWorker;
	return { itemtype: 'worker', a: s, key: `worker_${res}`, o: { res: res, n: n }, friendly: s, present, select }
}
async function uiTypePalette(dParent, color, fg, src, blendMode) {
	let fill = color;
	let bgBlend = getBlendCanvas(blendMode);
	let d = mDom(dParent, { w100: true, gap: 4 }); mCenterFlex(d);
	let NewValues = { fg, bg: color };
	let palette = [color];
	let dContainer = mDom(d, { w: 500, h: 300 });
	if (isdef(src)) {
		let ca = await getCanvasCtx(dContainer, { w: 500, h: 300, fill, bgBlend }, { src });
		palette = await getPaletteFromCanvas(ca.cv);
		palette.unshift(fill);
	} else {
		palette = arrCycle(paletteShades(color), 4);
	}
	let dominant = palette[0];
	let palContrast = paletteContrastVariety(palette, palette.length);
	mLinebreak(d);
	let bgItems = showPaletteMini(d, palette);
	mLinebreak(d);
	let fgItems = showPaletteMini(d, palContrast);
	mLinebreak(d);
	mIfNotRelative(dParent);
	let dText = mDom(dParent, { 'pointer-events': 'none', align: 'center', fg: 'white', fz: 30, position: 'absolute', top: 0, left: 0, w100: true, h100: true });
	mCenterFlex(dText);
	dText.innerHTML = `<br>HALLO<br>das<br>ist ein Text`
	for (const item of fgItems) {
		let div = iDiv(item);
		mStyle(div, { cursor: 'pointer' });
		div.onclick = () => {
			mStyle(dText, { fg: item.bg });
			NewValues.fg = item.bg;
			console.log('NewValues', NewValues);
		}
	}
	for (const item of bgItems) {
		let div = iDiv(item);
		mStyle(div, { cursor: 'pointer' });
		div.onclick = async () => {
			if (isdef(src)) {
				mClear(dContainer);
				let fill = item.bg;
				await getCanvasCtx(dContainer, { w: 500, h: 300, fill, bgBlend }, { src });
			}
			mStyle(dParent, { bg: item.bg });
			NewValues.bg = item.bg;
		}
	}
	async function onclickSaveMyTheme() {
		if (U.fg == NewValues.fg && U.color == NewValues.bg) return;
		U.fg = NewValues.fg;
		U.color = NewValues.bg;
		await updateUserTheme();
		await onclickSettMyTheme();
	}
	mButton('Save', onclickSaveMyTheme, dParent, { matop: 10, className: 'button' })
	return { pal: palette.map(x => colorO(x)), palContrast };
}
function uiTypePlayerStats(table, me, dParent, layout, styles = {}) {
	let dOuter = mDom(dParent); dOuter.setAttribute('inert', true); //console.log(dOuter)
	if (layout == 'rowflex') mStyle(dOuter, { display: 'flex', justify: 'center' });
	else if (layout == 'col') mStyle(dOuter, { display: 'flex', dir: 'column' });
	addKeys({ rounding: 10, bg: '#00000050', margin: 4, box: true, 'border-style': 'solid', 'border-width': 2 }, styles);
	let show_first = me;
	let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
	let items = {};
	for (const name of order) {
		let pl = table.players[name];
		styles['border-color'] = pl.color;
		let d = mDom(dOuter, styles, { id: name2id(name) })
		let img = showUserImage(name, d, 40); mStyle(img, { box: true })
		items[name] = { div: d, img, name };
	}
	return items;
}
function uiTypeRadios(lst, d, styles = {}, opts = {}) {
	let rg = mRadioGroup(d, {}, 'rSquare', 'Resize (cropped area) to height: '); mClass(rg, 'input');
	let handler = x => squareTo(cropper, x);
	mRadio(`${'just crop'}`, 0, 'rSquare', rg, {}, cropper.crop, 'rSquare', false)
	for (const h of [128, 200, 300, 400, 500, 600, 700, 800]) {
		mRadio(`${h}`, h, 'rSquare', rg, {}, handler, 'rSquare', false)
	}
	return rg;
}
function uiTypeSelect(any, dParent, styles = {}, opts = {}) {
	let list = toNameValueList(any);
	addKeys({ className: 'input', tag: 'select' }, opts);
	let dselect = mDom(dParent, styles, opts);
	for (const el of list) { mDom(dselect, {}, { tag: 'option', html: el.name, value: el.value }); }
	dselect.value = '';
	return dselect;
}
function uid() {
	UID += 1;
	return 'a' + UID;
}
function unionOfArrays() {
	let arrs = arguments[0];
	if (!arrs.every(Array.isArray)) arrs = Array.from(arguments);
	const flattenedArray = arrs.flat();
	return [...new Set(flattenedArray)];
}
function unselectPlayerItem(item) { mStyle(iDiv(item), { bg: 'transparent', fg: 'black', border: `transparent` }); }

async function updateClientData() {
}
async function updateDetails(di, key) {
	let res = await mPostRoute('postUpdateDetails', { key, di });
	await loadAssets();
}
function updateKeySettings(nMin) {
	if (nundef(G)) return;
	G.keys = setKeys({ nMin, lang: Settings.language, keysets: KeySets, key: Settings.vocab });
}
async function updateSuperdi(di, key) {
	let res = await mPostRoute('postUpdateSuperdi', { di });
	await loadAssets();
}
function updateUserImageToBotHuman(playername, value) {
	function doit(checked, name, val) {
		let du = mByAttr('username', playername);
		let img = du.getElementsByTagName('img')[0]; //du.firstChild;
		if (checked == true) if (val == 'human') mStyle(img, { round: true }); else mStyle(img, { rounding: 2 });
	}
	if (isdef(value)) doit(true, 0, value); else return doit;
}
async function updateUserTheme() {
	await postUserChange();
	setUserTheme(U);
	settingsCheck();
}
function uploadImg(img, unique, coll, name) {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		canvas.toBlob(async (blob) => {
			const formData = new FormData();
			formData.append('image', blob, unique + '.png');
			formData.append('collection', coll);
			formData.append('name', name);
			let server = getServerurl();
			server += '/upload';
			try {
				const response = await fetch(server, {
					method: 'POST',
					mode: 'cors',
					body: formData
				});
				if (response.ok) {
					const data = await response.json();
					resolve(data);
				} else {
					reject(response.statusText);
				}
			} catch (error) {
				console.error('Error uploading image:', error);
				reject(error);
			}
		});
	});
}
function userToPlayer(name, gamename, playmode = 'human') {
	let user = Serverdata.users[name];
	let pl = jsCopyExceptKeys(user, ['games']);
	let options = valf(getUserOptionsForGame(name, gamename), {});
	addKeys(options, pl);
	pl.playmode = playmode;
	let poss = getGamePlayerOptions(gamename);
	for (const p in poss) {
		if (isdef(pl[p])) continue;
		let val = poss[p];
		let defval = arrLast(val.split(','));
		if (isNumber(defval)) defval = Number(defval);
		pl[p] = defval;
	}
	return pl;
}
function valf() {
	for (const arg of arguments) if (isdef(arg)) return arg;
	return null;
}
function valnwhite() {
	for (const arg of arguments) {
		if (nundef(arg) || isEmpty(arg) || isWhiteSpace(arg)) {
			continue;
		}
		return arg;
	}
	return null;
}
function where(o) {
	let fname = getFunctionsNameThatCalledThisFunction();
}
function without(arr, elementToRemove) {
	return arr.filter(function (el) {
		return el !== elementToRemove;
	});
}
function wordAfter(arr, w) {
	if (isString(arr)) arr = toWords(arr);
	let i = arr.indexOf(w);
	return i >= 0 && arr.length > i ? arr[i + 1] : null;
}
function wsCard(d, w, h) {
	let card = cBlank(d, { h, w, border: 'silver' }); //return;
	let dCard = iDiv(card);
	return [card, dCard];
}
function wsFenFromItem(item) {
	return `${item.key}@${item.valueFactor}@${normalizeString(item.power, '_', [':', '.'])}@${item.colorPower}@${item.abstract}@${item.colorSym}@${item.op}`;
}
function wsFood(tokens, op, dtop, sz) {
	let d = mDom(dtop); mCenterCenterFlex(d);
	let ch = op;
	for (let i = 0; i < tokens.length; i++) {
		let t = tokens[i];
		let d1 = wsPrintSymbol(d, sz, t);
		if (i < tokens.length - 1) mDom(d, { fz: sz * .7, weight: 'bold' }, { html: ch });
	}
}
function wsFromNormalized(s, sep = '_') {
	let x = replaceAll(s, sep, ' '); return x;
}
function wsGenerateCardInfo(key) {
	let bg = rChoose(['white', 'sienna', 'pink', 'lightblue']);
	let palette = wsGetColorRainbow();
	let fg = rChoose(palette);
	sym = getAbstractSymbol([2, 8, 10, 23, 26]);
	power = wsGetPower(bg);
	valueFactor = rChoose(range(1, 3));
	op = rChoose(['+', '/']); //console.log('op',op)
	return wsFenFromItem({ key, valueFactor, power, colorPower: bg, abstract: sym, colorSym: fg, op });
}
function wsGetChildInline(item, color) {
	let type = item.class;
	let key = type == 'mammal' ? 'paw' : 'big_egg';
	let o = M.superdi[key];
	let [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
	let fg = valf(color, colorIdealText(item.colorPower, true));
	return `<span style="color:${fg};vertical-align:middle;line-height:80%;font-size:${item.fz * 1.5}px;font-family:${fam}">${String.fromCharCode('0x' + M.superdi[key][sym])}</span>`;
}
function wsGetColorRainbow() { return ['gold', 'limegreen', 'orangered', 'dodgerblue', 'indigo', 'hotpink']; }

function wsGetColorRainbowText(color) { return { gold: 'gold', limegreen: 'green', orangered: 'red', hotpink: 'pink', indigo: 'violet', dodgerblue: 'blue' }[color]; }

function wsGetFoodlist() { return ['cherries', 'fish', 'grain', 'mouse', 'seedling', 'worm'] }

function wsGetIcon(sym, sz = 30) {
	let html;
	if (nundef(sym)) sym = 'leaf';//rChoose(['omni', 'fish', 'mouse', 'wheat', 'worm', 'cherry']);
	if (sym == 'omni') {
		let colors = toWords('british_racing_green yellow sangria azure gray', true).map(x => colorFrom(x));
		html = generatePizzaSvg(sz, ...colors);
	} else if (sym == 'fish') {
		html = `
      <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
          <g transform="matrix(1,0,0,1,-700,-300)">
              <g transform="matrix(-10.1636,-1.24469e-15,1.24469e-15,-10.1636,756.948,402.109)">
                  <g id="ws-4">
                      <path id="fish" d="M0,0.092C0,-0.238 0.267,-0.506 0.598,-0.506C0.927,-0.506 1.195,-0.238 1.195,0.092C1.195,0.422 0.927,0.69 0.598,0.69C0.267,0.69 0,0.422 0,0.092M-11.442,-1.15L-11.442,-1.088C-11.442,-1.037 -11.42,-0.992 -11.408,-0.945C-11.275,-0.465 -10.779,-0.016 -10.771,0.305C-10.756,0.912 -11.504,1.256 -11.586,1.625C-11.586,1.625 -11.667,1.904 -11.559,2.025C-11.499,2.092 -11.42,2.102 -11.337,2.094C-9.921,1.954 -8.259,1.047 -7.839,1.24C-7.419,1.433 -5.796,3.438 -2.936,3.63C-1.327,3.738 1.139,3.412 2.135,2.096C2.368,1.819 2.579,1.517 2.783,1.224C2.876,1.09 2.97,0.957 3.065,0.825C3.225,0.596 3.097,0.387 3.056,0.337C2.902,0.146 2.75,-0.056 2.602,-0.253C2.27,-0.693 1.927,-1.148 1.529,-1.524C-0.167,-3.129 -2.469,-3.646 -4.806,-2.897C-5.842,-2.565 -7.774,-0.907 -7.775,-0.907C-8.289,-0.579 -10.235,-1.284 -11.139,-1.405C-11.214,-1.415 -11.286,-1.421 -11.346,-1.37C-11.406,-1.32 -11.442,-1.237 -11.442,-1.15" style="fill:rgb(0,121,159);fill-rule:nonzero;"/>
                  </g>
              </g>
          </g>
      </svg>
    `;
	} else if (sym == 'mouse') {
		html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-500,-300)">
                <g transform="matrix(9.09451,0,0,9.09451,670.98,392.954)">
                    <g id="ws-5">
                        <path id="mouse" d="M0,0.136C-0.705,-0.412 -2.127,-0.236 -2.867,-0.095C-2.803,-2.905 -7.442,-5.024 -10.299,-2.45L-11.797,-2.233C-11.131,-3.613 -12.9,-3.994 -13.312,-2.346L-15.426,-0.406C-16.451,0.4 -16.105,1.031 -15.189,1.031C-14.876,1.031 -11.897,1.617 -11.472,2.094C-11.535,2.206 -11.852,2.384 -11.773,2.995L-5.978,3.179C-4.286,2.679 -3.368,1.772 -3.023,0.768C-2.195,0.57 -0.921,0.449 -0.497,0.777C-0.434,0.826 -0.369,0.899 -0.369,1.063C-0.369,1.549 -0.767,1.699 -1.744,1.949C-2.445,2.129 -3.24,2.332 -3.749,2.912C-4.156,3.376 -4.309,3.827 -4.202,4.25C-4.05,4.859 -3.429,5.107 -3.359,5.134C-3.312,5.152 -3.264,5.16 -3.216,5.16C-3.052,5.16 -2.897,5.059 -2.837,4.896C-2.758,4.687 -2.864,4.452 -3.074,4.374C-3.131,4.352 -3.371,4.228 -3.415,4.053C-3.452,3.907 -3.354,3.692 -3.139,3.447C-2.796,3.057 -2.159,2.893 -1.542,2.735C-0.658,2.509 0.442,2.227 0.442,1.063C0.442,0.681 0.289,0.36 0,0.136" style="fill:rgb(116,100,91);fill-rule:nonzero;"/>
                    </g>
                </g>
            </g>
        </svg>
      `;
	} else if (sym == 'worm') {
		html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-300,-100)">
                <g transform="matrix(7.14802,0,0,7.14802,-2977.16,-1174.38)">
                    <g id="ws-1">
                        <g id="worm">
                            <g transform="matrix(1,0,0,1,467.653,195.772)">
                                <path d="M0,-8.535C-0.018,-8.351 -0.038,-8.047 -0.036,-7.798C-0.033,-7.536 -0.021,-7.275 0.007,-7.021C0.06,-6.511 0.179,-6.031 0.35,-5.619C0.432,-5.41 0.538,-5.226 0.648,-5.059C0.75,-4.905 0.789,-4.895 0.869,-4.838C1.013,-4.757 1.318,-4.665 1.782,-4.653C2.239,-4.635 2.789,-4.679 3.406,-4.729C3.718,-4.754 4.049,-4.779 4.42,-4.788C4.792,-4.794 5.204,-4.792 5.732,-4.686C6.694,-4.473 7.445,-4.057 8.093,-3.608C8.416,-3.38 8.716,-3.139 8.999,-2.886C9.14,-2.758 9.278,-2.629 9.413,-2.493C9.556,-2.348 9.664,-2.238 9.84,-2.031L9.993,-1.85C10.704,-1.01 10.599,0.248 9.758,0.959C8.918,1.67 7.66,1.564 6.95,0.724C6.866,0.626 6.79,0.513 6.729,0.404C6.711,0.373 6.616,0.251 6.548,0.17C6.473,0.08 6.394,-0.009 6.313,-0.096C6.152,-0.269 5.983,-0.43 5.815,-0.575C5.479,-0.863 5.134,-1.063 4.895,-1.148C4.821,-1.18 4.615,-1.217 4.37,-1.231C4.125,-1.248 3.839,-1.252 3.535,-1.254C2.922,-1.259 2.237,-1.25 1.464,-1.348C0.709,-1.447 -0.233,-1.666 -1.075,-2.345C-1.479,-2.669 -1.84,-3.145 -2.029,-3.534C-2.22,-3.903 -2.374,-4.283 -2.48,-4.66C-2.701,-5.417 -2.79,-6.164 -2.792,-6.886C-2.795,-7.247 -2.774,-7.603 -2.74,-7.957C-2.701,-8.323 -2.657,-8.633 -2.563,-9.056C-2.408,-9.76 -1.711,-10.205 -1.007,-10.049C-0.355,-9.906 0.075,-9.297 0.011,-8.649L0,-8.535Z" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(-0.516885,-0.856055,-0.856055,0.516885,474.654,198.339)">
                                <path d="M-0.369,-0.653C-0.561,-0.652 -0.716,-0.461 -0.716,-0.223C-0.716,0.015 -0.561,0.208 -0.369,0.208C-0.177,0.208 -0.021,0.016 -0.021,-0.223C-0.021,-0.46 -0.177,-0.653 -0.369,-0.653" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,474.892,196.692)">
                                <path d="M0,1.752C0.014,1.561 0.041,1.419 0.072,1.26C0.114,1.108 0.14,0.954 0.209,0.811C0.272,0.66 0.356,0.52 0.439,0.401C0.515,0.27 0.593,0.149 0.661,0L1.046,0.377C0.917,0.433 0.806,0.524 0.705,0.613C0.614,0.715 0.525,0.806 0.489,0.922C0.451,1.042 0.417,1.168 0.427,1.297C0.431,1.42 0.458,1.564 0.518,1.653L0,1.752Z" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(0.516885,0.856055,0.856055,-0.516885,479.321,195.111)">
                                <path d="M0.369,-0.208C0.561,-0.208 0.716,-0.015 0.716,0.222C0.716,0.461 0.56,0.653 0.369,0.653C0.176,0.653 0.021,0.46 0.021,0.222C0.021,-0.016 0.177,-0.208 0.369,-0.208" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,479.355,194.874)">
                                <path d="M0,0.679C-0.051,0.585 -0.166,0.495 -0.273,0.434C-0.382,0.364 -0.51,0.336 -0.633,0.314C-0.753,0.293 -0.874,0.329 -1.008,0.362C-1.134,0.41 -1.266,0.465 -1.375,0.554L-1.53,0.038C-1.367,0.047 -1.223,0.034 -1.072,0.028C-0.927,0.01 -0.764,0 -0.602,0.015C-0.443,0.02 -0.295,0.069 -0.14,0.102C0.015,0.148 0.152,0.191 0.329,0.267L0,0.679Z" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
        `;
	} else if (sym == 'wheat') {
		html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-300,-500)">
                <g transform="matrix(7.70232,0,0,7.70232,-3403,-873.691)">
                    <g id="ws-6">
                        <g id="wheat">
                            <g transform="matrix(1,0,0,1,487.796,189.11)">
                                <path d="M0,-2.293C0.445,-1.498 1.102,-0.729 1.282,-0.522C1.462,-0.316 3.41,-0.035 4.113,0.01C3.948,-0.403 3.671,-0.749 3.079,-1.281C2.586,-1.724 2.109,-1.963 1.47,-2.084C1.11,-2.152 0.279,-2.303 0,-2.293" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(0.807192,0.590289,0.590289,-0.807192,489.51,186.325)">
                                <path d="M0.599,0.015C0.869,0.113 1.467,0.126 1.68,0.173C1.017,0.749 0.85,1.614 0.599,1.67C0.348,1.727 -0.747,1.767 -1.127,1.674C-1.066,1.536 -0.423,0.405 0.599,0.015" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,493.462,188.018)">
                                <path d="M0,-0.85C-0.107,-1.338 -1.235,-2.168 -1.841,-2.459C-1.935,-2.155 -2.079,-1.594 -2.053,-1.056C-2.024,-0.467 -1.76,0.211 -1.407,0.615C-1.055,1.019 -0.183,1.515 0.13,1.609C0.128,1.597 0.126,1.586 0.124,1.574C-0.042,0.499 0.107,-0.361 0,-0.85" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,493.524,194.883)">
                                <path d="M0,-2.513C-1.031,-2.522 -1.653,-2.448 -2.565,-2.524C-2.161,-1.814 -1.315,-0.599 -0.557,-0.253C0.201,0.094 1.4,-0.3 2.482,-0.291C2.697,-0.289 3.439,-0.2 3.657,-0.152C3.551,-0.509 3.087,-1.833 2.6,-2.147C1.889,-2.607 1.577,-2.5 0,-2.513" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,496.22,189.606)">
                                <path d="M0,-0.012C-0.375,-1.259 -1.609,-2.115 -2.317,-2.551C-2.342,-1.879 -2.343,-1.374 -2.21,-0.514C-2.049,0.535 -1.946,0.574 -1.451,1.053C-1.175,1.319 -0.283,2.43 0.145,2.539C0.145,2.539 0.144,0.467 0,-0.012" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(-0.506442,0.862274,0.862274,0.506442,497.305,197.132)">
                                <path d="M-1.454,-1.812C-0.793,-3.066 -0.232,-3.44 0.202,-4.508C0.816,-2.36 0.396,0.388 -1.454,1.136C-1.693,1.232 -0.925,0.982 -1.454,1.136C-1.409,0.584 -2.027,-0.726 -1.454,-1.812" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,496.942,193.86)">
                                <path d="M0,-2.164C-0.197,-0.955 0.514,0.481 0.88,0.901C1.246,1.32 1.926,2.192 2.218,2.336C3.808,0.963 1.265,-2.639 0.213,-3.845C0.017,-4.069 -0.193,-4.287 -0.415,-4.5C-0.415,-4.5 -0.002,-3.337 0,-2.164" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(0.658061,-0.752964,-0.752964,-0.658061,489.682,185.285)">
                                <path d="M-1.083,-0.492C-0.929,-0.19 -0.7,0.149 -0.362,0.372C-0.023,0.597 -1.083,2.385 -1.083,2.385C-1.083,2.385 -1.281,0.976 -1.678,0.238C-1.494,0.048 -1.282,-0.197 -1.083,-0.492" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,493.645,189.424)">
                                <path d="M0,2.503C0.135,2.509 1.42,2.539 1.55,2.55C1.235,2.005 0.612,1.245 0.031,0.771C-0.532,0.313 -1.45,0.27 -2.369,0.204C-2.97,0.161 -3.964,-0.039 -4.563,-0.047C-4.309,0.6 -3.575,1.878 -3.04,2.181C-2.504,2.485 -1.165,2.457 0,2.503" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,498.162,197.672)">
                                <path d="M0,-0.974C0.138,-0.91 0.295,-0.809 0.427,-0.701C0.564,-0.594 0.684,-0.467 0.803,-0.344C0.906,-0.218 0.995,-0.088 1.06,0.052C1.119,0.181 1.236,0.44 1.251,0.547L2.018,-0.089C1.867,-0.346 1.481,-0.74 1.316,-0.866C0.983,-1.134 0.56,-1.408 0.317,-1.521L0,-0.974Z" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
      `;
	} else if (sym == 'mouse') {
		html = `
              <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                  <g transform="matrix(1,0,0,1,-500,-300)">
                      <g transform="matrix(9.09451,0,0,9.09451,670.98,392.954)">
                          <g id="ws-5">
                              <path id="mouse" d="M0,0.136C-0.705,-0.412 -2.127,-0.236 -2.867,-0.095C-2.803,-2.905 -7.442,-5.024 -10.299,-2.45L-11.797,-2.233C-11.131,-3.613 -12.9,-3.994 -13.312,-2.346L-15.426,-0.406C-16.451,0.4 -16.105,1.031 -15.189,1.031C-14.876,1.031 -11.897,1.617 -11.472,2.094C-11.535,2.206 -11.852,2.384 -11.773,2.995L-5.978,3.179C-4.286,2.679 -3.368,1.772 -3.023,0.768C-2.195,0.57 -0.921,0.449 -0.497,0.777C-0.434,0.826 -0.369,0.899 -0.369,1.063C-0.369,1.549 -0.767,1.699 -1.744,1.949C-2.445,2.129 -3.24,2.332 -3.749,2.912C-4.156,3.376 -4.309,3.827 -4.202,4.25C-4.05,4.859 -3.429,5.107 -3.359,5.134C-3.312,5.152 -3.264,5.16 -3.216,5.16C-3.052,5.16 -2.897,5.059 -2.837,4.896C-2.758,4.687 -2.864,4.452 -3.074,4.374C-3.131,4.352 -3.371,4.228 -3.415,4.053C-3.452,3.907 -3.354,3.692 -3.139,3.447C-2.796,3.057 -2.159,2.893 -1.542,2.735C-0.658,2.509 0.442,2.227 0.442,1.063C0.442,0.681 0.289,0.36 0,0.136" style="fill:rgb(116,100,91);fill-rule:nonzero;"/>
                          </g>
                      </g>
                  </g>
              </svg>
            `;
	} else if (sym == 'leaf') {
		html = `<img width="${sz}" height="${sz}" src='../assets/img/emo/seedling.png' />`;
	} else {
		html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-300,-300)">
                <g transform="matrix(8.59167,0,0,8.59167,432.85,422.626)">
                    <g id="ws-3">
                        <path id="berries" d="M0,-5.356C-0.427,-5.356 -0.825,-5.247 -1.184,-5.07L-1.487,-6.86C-1.18,-7.11 -0.839,-7.331 -0.47,-7.508C0.341,-7.901 1.273,-8.154 2.148,-8.241L2.17,-8.243C2.227,-8.249 2.283,-8.262 2.338,-8.282C2.695,-8.415 2.877,-8.811 2.745,-9.168C2.612,-9.524 2.216,-9.706 1.859,-9.574C0.872,-9.208 -0.018,-8.809 -0.897,-8.288C-1.327,-8.022 -1.751,-7.73 -2.127,-7.365C-2.478,-7.028 -2.813,-6.676 -3.154,-6.309C-3.37,-6.078 -3.566,-5.826 -3.752,-5.566C-3.756,-5.566 -3.759,-5.568 -3.763,-5.568L-5.106,-5.582C-5.308,-6.864 -6.41,-7.847 -7.749,-7.847C-9.233,-7.847 -10.435,-6.645 -10.435,-5.162C-10.435,-3.679 -9.233,-2.476 -7.749,-2.476C-6.304,-2.476 -5.134,-3.62 -5.074,-5.051L-4.184,-4.886C-4.394,-4.515 -4.579,-4.131 -4.719,-3.739C-4.942,-3.129 -5.117,-2.511 -5.27,-1.883C-6.879,-1.753 -8.148,-0.421 -8.148,1.221C-8.148,2.949 -6.748,4.35 -5.019,4.35C-3.291,4.35 -1.89,2.949 -1.89,1.221C-1.89,-0.297 -2.973,-1.562 -4.408,-1.846C-4.278,-2.39 -4.122,-2.933 -3.938,-3.457C-3.647,-4.336 -3.233,-5.136 -2.609,-5.816C-2.452,-5.994 -2.279,-6.162 -2.1,-6.327L-1.724,-4.714C-2.307,-4.221 -2.686,-3.493 -2.686,-2.67C-2.686,-1.187 -1.483,0.016 0,0.016C1.484,0.016 2.686,-1.187 2.686,-2.67C2.686,-4.153 1.484,-5.356 0,-5.356" style="fill:rgb(152,21,49);fill-rule:nonzero;"/>
                    </g>
                </g>
            </g>
        </svg>
      `;
	}
	return mCreateFrom(html);
}
function wsGetMission() {
	let missions = {
		class: [],
		food_only: [],
		food_specific: [],
		size_atMost: [],
		size_arLeast: [],
		weight_AtMost: [],
		weight_AtLeast: [],
		cards_hand: [],
		cards_board: [],
		cards_habitat: [],
		habitat_only: [],
		tuck: [],
		powerColor: [],
	}
	return rChoose(Object.keys(missions));
}
function wsGetPower(colorOrKey, prop) {
	let powers = {
		_child_1_sym: [],
		_child_2_sym: [],
		_child_1_class: [],
		_child_2_class: [],
		_child_1_color: [],
		_child_2_color: [],
		_draw_1_card_deck: [],
		_draw_2_card_return_1: [],
		_draw_2_card_1: [],
		_tuck_1_pick_feeder: [],
		_tuck_1_pick_supply: [],
		_tuck_1_draw_tray: [],
		_tuck_1_draw_deck: [],
		_tuck_1_place: [],
		_food_1_supply: [],
		_food_1_feeder: [],
		_food_2_supply: [],
		_food_2_tray: [],
		_discard_1_child_pick_2_food_feeder: [],
		_discard_1_child_pick_1_food_supply: [],
		_discard_1_child_draw_2_card: [],
		_discard_1_food_draw_1_card: [],
		_discard_1_card_pick_1_food_supply: [],
		_repeat: [],
		_hunt_food_mouse: [],
		_hunt_food_fish: [],
		_hunt_card_sym: [],
		pink_draw_mission_pick_1_food_feeder: [],
		pink_place_child_pick_1_food_feeder: [],
		pink_hunt_successfully_pick_1_food_feeder: [],
		pink_draw_mission_draw_1_card_deck: [],
		pink_place_child_draw_1_card_deck: [],
		pink_hunt_successfully_draw_1_card_deck: [],
		white_draw_2_mission_return_1: [],
		white_collect_fish: [],
		white_collect_mouse: [],
		white_collect_worm: [],
		white_collect_cherries: [],
		white_child_sym: [],
		white_child_color: [],
		white_child_class: [],
		lightblue_feeder: [],
		lightblue_tray: [],
	};
	let list = Object.keys(powers);
	if (isColor(colorOrKey)) return rChoose(list.filter(x => colorOrKey == 'sienna' ? x.startsWith('_') : x.startsWith(colorOrKey)));
	else if (nundef(colorOrKey)) return rChoose(list);
	else if (nundef(prop)) return powers[colorOrKey];
	else return lookup(powers, [colorOrKey, prop]);
}
function wsGetRandomCards(n = 1, deck = null) {
	if (!deck) deck = jsCopy(M.byCollection.tierspiel).map(x => wsGenerateCardInfo(x)); console.log(deck.length);
	let list = rChoose(deck, n);
	return list.length == 1 ? wsItemFromFen(list[0]) : list.map(x => wsItemFromFen(x));
}
function wsGetSymbolFilename(key) {
	let files = {
		cherries: '../assets/games/wingspan/fruit.svg',
		fish: '../assets/games/wingspan/fish.svg',
		forest: '../assets/games/wingspan/forest1.png',
		grain: '../assets/games/wingspan/wheat.svg',
		grassland: '../assets/games/wingspan/grassland2.png',
		mouse: '../assets/games/wingspan/mouse.svg',
		omni: '../assets/games/wingspan/pie3.svg',
		seedling: '../assets/img/emo/seedling.png',
		wetland: '../assets/games/wingspan/wetland.png',
		worm: '../assets/games/wingspan/worm.svg',
	};
	return files[key];
}
function wsGetSymbolInline(key, fz) { return `&nbsp;<span style="vertical-align:middle;line-height:80%;font-size:${fz * 1.5}px;font-family:pictoGame">${String.fromCharCode('0x' + M.superdi[key].ga)}</span>`; }

function wsHabitat(tokens, dtop, sz) {
	for (let i = 0; i < tokens.length; i++) {
		let t = tokens[i];
		if (i == 2) mLinebreak(dtop);
		let d = wsPrintSymbol(dtop, sz, t);
		if (i == 2) mStyle(d, { matop: -sz * 3 / 2 });
	}
}
function wsHowMany(deck, prop, val, op) {
}
function wsItemFromFen(fen) {
	let [key, valueFactor, power, colorPower, sym, colorSym, op] = fen.split('@');
	let o = getDetailedSuperdi(key);
	let item = jsCopy(o);
	let bg = item.colorPower = colorPower;
	let palette = wsGetColorRainbow();
	let fg = item.colorSym = colorSym;
	sym = item.abstract = sym;
	item.power = power;
	valueFactor = item.valueFactor = valueFactor;
	item.op = op;
	item.value = valueFactor * (item.op == '+' ? 1 : item.foodTokens.length);
	return item;
}
function wsOffspringSymbol(dParent, styles = {}) {
	console.log(styles)
	let [w, h] = [styles.h, styles.h];
	console.log(w, h)
	let d = mDom(dParent, { w, h, box: true });//,bg:'orange'}); //w100:true,h100:true,bg:'lime'});
	let fz = styles.h; let hline = fz;
	mIfNotRelative(d);
	let o = M.superdi.big_egg;
	let [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
	let dEgg = mDom(d, { fg: 'grey', family: fam, fz, padding: 0, hline }, { html: String.fromCharCode('0x' + o[sym]) });
	o = M.superdi.paw;
	[fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
	let dPaw = mDom(d, { w100: true, fg: 'black', family: fam, fz: 8, hline }, { html: String.fromCharCode('0x' + o[sym]) });
	mCenterFlex(dPaw)
	mPlace(dPaw, 'tc')
}
async function wsOnclickCard(table, item, items) { }

function wsPowerText(item, d, styles = {}) {
	mClear(d)
	let key = item.power; if (key.startsWith('_')) key = 'sienna' + key;
	let parts = key.split('_'); //console.log(parts)
	let s = '';
	let color = parts[0];
	if (color == 'sienna') s += 'WHEN ACTIVATED: ';
	else if (color == 'pink') s += 'ONCE BETWEEN TURNS: ';
	else if (color == 'white') s += 'WHEN PLAYED: ';
	else if (color == 'lightblue') s += 'ROUND END: ';
	copyKeys({ bg: color }, styles); mStyle(d, { bg: color, fg: 'contrast' });
	let what = parts[1];
	let verb = '';
	let n = Number(parts[2]);
	if (color == 'sienna') {
		if (what == 'child') {
			verb = 'place';
			s += `${capitalize(verb)} ${n} ${pluralOf('child', n)} on any`;
			let prop = parts[3];
			switch (prop) {
				case 'color':
					s += ` ${n == 1 ? 'card' : '2 cards'} with color <span style="border-radius:${item.fz}px;padding-left:${item.fz / 2}px;padding-right:${item.fz / 2}px;background-color:white;color:${colorFrom(item.colorSym)}">${wsGetColorRainbowText(item.colorSym)}</span>.`; break;
				case 'class':
					s += ` ${item.class}.`; break;
				case 'sym':
				default:
					s += ` ${n == 1 ? 'card' : '2 cards'} with symbol ${wsGetSymbolInline(item.abstract, item.fz)}.`;
			}
			if (n == 2) s += ` Other players may place 1 ${what}.`
		} else if (what == 'draw') {
			verb = 'draw';
			what = parts[3];
			s += `${capitalize(verb)} ${n} ${pluralOf(what, n)}`;
			let prop = parts[4];
			switch (prop) {
				case 'tray':
				case 'deck': s += ` from ${prop}.`; break;
				case 'return': s += `, return 1 at the end of action.`; break;
				case '1': s += ` Other players may draw 1.`; break;
				default: s += '.'; break;
			}
		} else if (what == 'tuck') {
			verb = what;
			what = parts[3];
			s += `${capitalize(verb)} ${n} ${pluralOf('card', n)}`;
			let prop = parts[3];
			switch (prop) {
				case 'pick': s += ` to ${prop} 1 food from ${parts[4]}.`; break;
				case 'draw': s += ` to ${prop} 1 card from ${parts[4]}.`; break;
				case 'place': s += ` to ${prop} 1 child on any card.`; break;
				default:
			}
		} else if (what == 'food') {
			verb = 'pick';
			s += `${capitalize(verb)} ${n} ${what} from ${parts[3]}.`;
			if (n == 2) s += ` Other players ${verb} 1 ${what}.`
		} else if (what == 'all') {
			s += `All players ${parts[2]} ${parts[3]} ${what}.`;
		} else if (what == 'discard') {
			let n1 = Number(parts[5])
			s += `You may ${what} ${n} ${parts[3]} to ${parts[4]}`;
			if (parts.length > 5) {
				let n1 = Number(parts[5]);
				s += ` ${n1} ${pluralOf(parts[6], n1)}`;
				s += parts.length > 7 ? ` from ${parts[7]}.` : '.';
			} else s += '.';
		} else if (what == 'repeat') {
			s += `Repeat another brown power on this habitat.`;
		} else if (what == 'hunt') {
			let verb = what; what = parts[2];
			if (what == 'food') {
				s += `Roll dice in feeder. If there is a ${parts[3]}, keep it.`;
			} else if (what == 'card') {
				s += `Draw a card. `;
				switch (parts[3]) {
					case 'sym':
					default: s += `If it has symbol ${wsGetSymbolInline(item.abstract, item.fz)}, tuck it.`; break;
				}
			}
		}
	}
	if (color == 'pink') {
		let [verb1, what1, verb2, n, what2, from] = parts.slice(1);
		s += `When another player ${verb1}s ${what1}, ${verb2} ${n} ${what2}`;
		s += isdef(from) ? ` from ${from}.` : '.';
	}
	if (color == 'white') {
		if (what == 'draw') {
			verb = 'draw';
			what = parts[3];
			s += `${capitalize(verb)} ${n} ${pluralOf(what, n)}`;
			let prop = parts[4];
			switch (prop) {
				case 'tray':
				case 'deck': s += ` from ${prop}.`; break;
				case 'return': s += `, return 1`; s += what == 'card' ? ` at the end of action.` : '.'; break;
				case '1': s += ` Other players may draw 1.`; break;
				default: s += '.'; break;
			}
		} else if (what == 'collect') {
			s += `Collect all ${parts[2]} from feeder.`
		} else if (what == 'child') {
			s += `Place 1 child on each of your cards with `;
			what = parts[2];
			switch (what) {
				case 'sym': s += `symbol ${wsGetSymbolInline(item.abstract, item.fz)}.`; break;
				case 'class': s += `class ${item.class}.`; break;
				case 'color': s += `color <span style="color:${colorFrom(item.colorSym)}">${wsGetColorRainbowText(item.colorSym)}</span>.`; break;
			}
		}
	}
	if (color == 'lightblue') {
		if (what == 'feeder') s += `Collect all food in feeder.`
		else if (what == 'tray') s += `Collect a card from tray.`
	}
	s = replaceAll(s, 'child', wsGetChildInline(item));
	d.innerHTML = s;
	return d;
}
async function wsPreAction(table, items) {
	let [fen, me] = [table.fen, getUname()]
	let [phase, stage, round, pl, plorder, turn] = [fen.phase, fen.stage, fen.round, table.players[me], table.plorder, table.turn];
	console.log()
}
function wsPresent(table) {
	presentStandardBGA();
	return;
	let fen = table.fen;
	let me = getUname();
	let pl = table.players[me];
	let d = mBy('dTable');
	d.style = '';
	d.className = '';
	mStyle(d, { hmin: 500, w: '90%', margin: 20 });
	d.innerHTML = ' '; mCenterFlex(d)
	let dCards = mDom(d, { gap: 8 }); mCenterFlex(dCards);
	let items = [];
	for (const fencard of pl.cards) {
		let ocard = wsItemFromFen(fencard);
		wsShowCardItem(ocard, dCards, .5);
		items.push(ocard);
	}
	mLinebreak(d, 25)
	let [w, h] = [1467, 1235].map(x => x * .67);
	let bg = U.color;
	let db = mDom(d, { w, h, bg, padding: 10, position: 'relative' });
	let da = mDom(db, { 'transform-origin': 'center', transform: 'rotate( -.3deg )', position: 'relative', w, h });
	let ibg = mDom(da, { position: 'absolute', left: 0, top: 0, w, h }, { tag: 'img', src: '../ode/wsboard1.jpg' });
	let dBoard = mDom(db, { position: 'absolute', left: -2, top: 0, w: w - 18, h: h - 12, wbox: true, border: `20px ${bg} solid` });
	let gap = 12;
	let grid = mGrid(3, 5, dBoard, { paleft: gap / 2, patop: gap, w: w - 52 }); //,position:'absolute'});
	let sym = ['food', 'child', 'card'];
	let n = [1, 1, 2, 2, 3];
	let cost = [0, 1, 1, 2, 2];
	let addon = [0, 1, 0, 1, 0];
	let list = wsGetRandomCards(15, fen.deck);
	for (const i of range(3)) {
		for (const j of range(5)) {
			let d = mDom(grid, { w: 172, h: 250, bg: rColor(), mabottom: 20 }); //,{html:'card'});
			let item = wsShowCardItem(list[i + 3 * j], d, .5)
		}
	}
	return items;
}
function wsPrintSymbol(dParent, sz, key) {
	let files = {
		cherries: '../assets/games/wingspan/fruit.svg',
		fish: '../assets/games/wingspan/fish.svg',
		forest: '../assets/games/wingspan/forest1.png',
		grain: '../assets/games/wingspan/wheat.svg',
		grassland: '../assets/games/wingspan/grassland2.png',
		mouse: '../assets/games/wingspan/mouse.svg',
		omni: '../assets/games/wingspan/pie3.svg',
		seedling: '../assets/img/emo/seedling.png',
		wetland: '../assets/games/wingspan/wetland.png',
		worm: '../assets/games/wingspan/worm.svg',
	};
	let keys = Object.keys(files);
	let styles = { w: sz, h: sz, };
	if (['wetland', 'grassland', 'forest'].includes(key)) styles['clip-path'] = PolyClips.diamond;
	if (key == 'wetland') styles.bg = 'lightblue';
	else if (key == 'grassland') styles.bg = 'goldenrod';
	else if (key == 'forest') styles.bg = 'emerald';
	let src = valf(files[key], key == 'food' ? files[rChoose(keys)] : null);
	if (src) return mDom(dParent, styles, { tag: 'img', width: sz, height: sz, src: files[valf(key, rChoose(keys))] });
	let o = M.superdi[key];
	return showim2(key, dParent, styles);
}
function wsSetup(table) {
	let fen = {};
	fen.deck = jsCopy(M.byCollection.tierspiel).map(x => wsGenerateCardInfo(x));
	arrShuffle(fen.deck);
	for (const name in table.players) {
		let pl = table.players[name];
		pl.score = 0;
		pl.cards = deckDeal(fen.deck, 5);
		pl.missions = [];
		pl.offsprings = 0;
		wsGetFoodlist().map(x => pl[x] = 0);
		pl.forest = [];
		pl.grassland = [];
		pl.wetland = [];
	}
	fen.round = 0;
	fen.phase = 'init';
	fen.stage = 'pick_cards';
	table.plorder = jsCopy(table.playerNames);
	table.turn = jsCopy(table.playerNames);
	return fen;
}
function wsShowCardItem(item, d, fa) {
	let [w, h, sztop, sz, gap, fz] = [340, 500, 100, 30, 8, 16].map(x => x * fa);
	item.fz = fz;
	let [card, dCard] = wsCard(d, w, h);
	let dtop = wsTopLeft(dCard, sztop, card.rounding);
	addKeys(card, item);
	let [bg, fg] = [item.colorPower, item.colorSym];
	wsHabitat(item.habTokens, dtop, sz * 1.1); mLinebreak(dtop, sz / 5);
	wsFood(item.foodTokens, item.op, dtop, sz * .8);
	wsTitle(item, dCard, sztop, fz, gap);
	let [szPic, yPic] = [h / 2, sztop + gap]
	let d1 = showim2(item.key, dCard, { rounding: 12, w: szPic, h: szPic }, { prefer: 'photo' });
	mPlace(d1, 'tr', gap, yPic);
	let leftBorderOfPic = w - (szPic + gap);
	let dleft = mDom(dCard, { w: leftBorderOfPic, h: szPic }); mPlace(dleft, 'tl', gap / 2, sztop + gap);
	mCenterCenterFlex(dleft);
	let dval = mDom(dleft, { fg, w: sz * 1.2, align: 'center', fz: fz * 1.8, weight: 'bold' }, { html: item.value });
	mLinebreak(dleft, 2 * gap)
	let szSym = sz * 1.5;
	let a = showim2(item.abstract, dleft, { w: szSym, h: szSym, fg });
	mLinebreak(dleft, 3 * gap)
	let dPlaetze = item.live.dPlaetze = showPlaetze(dleft, item, gap * 2);
	item.dpower = mDom(dCard, { fz: fz * 1.2, padding: gap, matop: sztop + szPic + gap * 3, w100: true, bg, fg: 'contrast', box: true });
	wsPowerText(item, item.dpower, { fz: item.fz })
	let dinfo = mDom(dCard, { fz, hpadding: gap, box: true, w100: true });
	mPlace(dinfo, 'bl'); mFlexLine(dinfo, 'space-between');
	mDom(dinfo, {}, { html: item.class });
	mDom(dinfo, {}, { html: item.olifespan.text });
	mDom(dinfo, {}, { html: item.osize.text });
	return item;
}
function wsShowTitle(dCard, title, fz, szlt) {
	let margin = szlt / 12;
	let dtitle = mDom(dCard, { fz, margin, display: 'inline', weight: 'bold' }, { html: title });
	mPlace(dtitle, 'tl', szlt + margin / 2, 0); //, 0, yTitle);
}
function wsStats(table) {
	let [me, players] = [getUname(), table.players];
	let style = { patop: 8, mabottom: 20, bg: 'beige', fg: 'contrast' };
	let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'colflex', style)
	for (const plname in players) {
		let pl = players[plname];
		let item = player_stat_items[plname];
		if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
		let d = iDiv(item);
		mStyle(d, { wmin: 200, padding: 12 })
		mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);
		let d1 = mDom(d); mCenterFlex(d1);
		wsGetFoodlist().map(x => playerStatCount(wsGetSymbolFilename(x), pl[x], d1));
		mLinebreak(d, 10);
		let d2 = mDom(d); mCenterFlex(d2);
		playerStatCount('star', pl.score, d2, null, { useSymbol: true }); //, {}, {id:`stat_${plname}_score`});
		playerStatCount('hand_with_fingers_splayed', pl.cards.length, d2, null, { useSymbol: true });
		playerStatCount(wsOffspringSymbol, pl.offsprings, d2);
		if (table.turn.includes(plname)) { mDom(d, { position: 'absolute', left: -3, top: 0 }, { html: getWaitingHtml() }); }
	}
}
function wsTitle(o, dCard, sztop, fz, gap) {
	let dtitle = mDom(dCard, { paleft: gap, wmax: sztop * 1.5 }); mPlace(dtitle, 'tl', sztop, gap)
	mDom(dtitle, { fz: fz * 1.1, weight: 'bold' }, { html: fromNormalized(o.friendly) });
	mDom(dtitle, { fz, 'font-style': 'italic' }, { html: o.species });
}
function wsTopLeft(dCard, sztop, rounding) {
	let dtop = mDom(dCard, { w: sztop, h: sztop, bg: '#ccc' });
	mPlace(dtop, 'tl');
	dtop.style.borderTopLeftRadius = dtop.style.borderBottomRightRadius = `${rounding}px`;
	mCenterCenterFlex(dtop);
	return dtop;
}
function yearsToReadable(n) {
	let di = { y: 1, m: 12, w: 52, d: 365, h: 365 * 24 };
	if (n > 1) return n.toFixed(1) + ' years';
	if (n * 12 > 1) return (n * 12).toFixed(1) + ' months';
	if (n * 52 > 1) return (n * 52).toFixed(1) + ' weeks';
	if (n * 365 > 1) return (n * 365).toFixed(1) + ' days';
	return (n * 365 * 24).toFixed(1) + ' hours';
}
