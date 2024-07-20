
async function start() { test10(); }

async function test10(){
	//await _sortFunctionsOfAFile();
	await _integrate(`../omnifin/minilib.js`,'../omnifin/baulib.js');
	//await _closureFromProject('ode'); 
}



async function test9_combineFromProject(dir) {
	S.type = detectSessionType();
	initCodingUI();

	let text, css, project;
	let glitches = ['startsWith', 'endsWith'];
	text = '<please call closureFromProject>', css = '';
	
	text = await combineFromProject(`../${dir}`);

	let globlist = await codeParseFile('../basejs/allghuge.js');
	console.log('globlist', globlist); //return;
	let globsused = [];
	for (const o of globlist) {
		let k = o.key;
		if (text.includes(k)) globsused.push(o)
	}
	console.log('globsused', globsused);
	let globtext = globsused.map(x => x.code).join('\r\n');
	downloadAsText(globtext, 'globs', 'js');
	AU.ta.value = text;
	AU.css.value = css;
}
async function test7_integrate_bau4_ode(){	test3_integrate(`../ode/closure.js`,'../ode/bau4.js');}
async function test6_sortFunctionsOfAFile(){
	S.type = detectSessionType();	initCodingUI();

	let path = `../ode/newclosure.js`;

	let bykey = await getCodeDictByKey(path);
	let text = '';
	let keys = Object.keys(bykey);
	keys.sort();
	for (const k of keys) { 
		let s=bykey[k].code;

		if (!s.includes('\n')) {console.log('oneliner',s); s+='\n';}
		text += s + '\n'; 
	}
	AU.ta.value = text;

}
async function test5_lineEndings(){
	S.type = detectSessionType();
	initCodingUI();
	let bykey = await getCodeDictByKey(`../ode/closure.js`);
	let text = '';
	for (const k in bykey) { 
		text += bykey[k].code + '\n'; 
	}
	AU.ta.value = text;

}
async function test4_intode(){
	test3_integrate(`../ode/closure.js`,'../ode/baui.js');
}
async function test3_integrate(pathLarge,pathNew){
	S.type = detectSessionType();
	initCodingUI();
	let bykey = await getCodeDictByKey(pathLarge);
	copyKeys(await getCodeDictByKey(pathNew),bykey);

	let list = Object.keys(bykey);
	list = sortCaseInsensitive(list);
	
	let text = '';
	for (const k of list) { 
		text += bykey[k].code + '\r\n'; 
	}
	AU.ta.value = text;

}
async function test2_ode() {
	S.type = detectSessionType();
	initCodingUI();
	let bykey = await getCodeDictByKey('../basejs/allfhuge.js');
	addKeys(await getCodeDictByKey('../basejs/allghuge.js'),bykey);
	copyKeys(await getCodeDictByKey(`../ode/globals.js`),bykey);
	copyKeys(await getCodeDictByKey(`../ode/closure.js`),bykey);
	DA.diglobal = bykey;
	let list = DA.listglobal = dict2list(bykey); 

	let bytype = {};
	for (const k in bykey) { let o = bykey[k]; lookupAddIfToList(bytype, [o.type], o); }

	let seed = await getCodeKeys(`../ode/closure.js`); //console.log('seed', seed);

	let [globs, funcs, byKeyMinimized] = createListsFromSeed(bykey, list, seed);
	//let byKeyMinimized = _minimizeCode(bykey, seed, []);
	//console.log('res',byKeyMinimized); return;


	//console.log('funcs',funcs); return;

	let text = generateCodeText(globs, funcs, byKeyMinimized);


	AU.ta.value = text;

}
async function test1_ode() {
	S.type = detectSessionType();
	initCodingUI();
	let bykey = await getCodeDictByKey('../basejs/allfhuge.js');
	addKeys(await getCodeDictByKey('../basejs/allghuge.js'),bykey);
	copyKeys(await getCodeDictByKey(`../ode/code.js`),bykey);
	DA.diglobal = bykey;
	let list = DA.listglobal = dict2list(bykey); 

	let bytype = {};
	for (const k in bykey) { let o = bykey[k]; lookupAddIfToList(bytype, [o.type], o); }

	let seed = await getCodeKeys(`../ode/code.js`); //console.log('seed', seed);

	let [globs, funcs, byKeyMinimized] = createListsFromSeed(bykey, list, seed);
	//let byKeyMinimized = _minimizeCode(bykey, seed, []);
	//console.log('res',byKeyMinimized); return;


	//console.log('funcs',funcs); return;

	let text = generateCodeText(globs, funcs, byKeyMinimized);

	AU.ta.value = text;

}
async function test01_try() {
	let [bykey, bytype] = await getTheDicts();
	console.log('dicts', bykey, bytype);

	let codelist = await codeParseFile('../ode/code.js');
	console.log('codelist', codelist)
	let codebykey = list2dict(codelist, 'key');

	for (const k in codebykey) {
		bykey[k] = codebykey[k];
		bytype.function[k]
	}
}
async function test0(dir='odf') {
	S.type = detectSessionType();
	initCodingUI();

	//#region tests

	// let text=await intersectAnimeAndAllfuncs();
	// let [g, text, old] = await codebaseExtendFromProject('hltest');

	// let csstext = await cssbaseExtend('coding');
	// let csstext = await cssSelectFrom('../base/alibs/transition.css',['keyframes']);
	// let csstext = await cssSelectFrom('../base/alibs/bs4/bootstrap.css',['class']);
	// let csstext = await cssSelectFrom('../base/alibs/w3.css',['root','class','keyframes']);
	//downloadAsText(text, 'closure', 'js');
	//downloadAsText(css, 'final', 'css');
	//#endregion
	let text, css, project;
	let glitches = ['startsWith', 'endsWith'];
	text = '<please call closureFromProject>', css = '';
	
	text = await combineFromProject(`../${dir}`);

	let globlist = await codeParseFile('../basejs/allghuge.js');
	console.log('globlist', globlist); //return;
	let globsused = [];
	for (const o of globlist) {
		let k = o.key;
		if (text.includes(k)) globsused.push(o)
	}
	console.log('globsused', globsused);
	let globtext = globsused.map(x => x.code).join('\r\n');
	downloadAsText(globtext, 'globs', 'js');

	//[text, css, project] = await closureFromProject('combu', glitches, ['downloadAsText','onclickColors','onclickPlan','onclickCollection','onclickPlay','onclickNATIONS','onclickHome']); 
	// [text, css, project] = await closureFromProject('coding', glitches, ['downloadAsText']); 
	// [text, css, project] = await closureFromProject('spiel', glitches); 
	// [text, css, project] = await closureFromProject('testa', glitches); 
	// [text, css, project] = await closureFromProject('testphp', glitches); 
	// [text, css, project] = await closureFromProject('tiere', glitches.concat(['expand', 'drop']), ['allowDrop','dropImage']);

	//text = await combineClosures(['coding','spiel','testa','tiere']); 
	// cssFromFiles(files, dir = '', types = ['root', 'tag', 'class', 'id', 'keyframes'])
	//downloadAsText(css,'final','css');

	AU.ta.value = text;
	//AU.ta.value = project; //if want only functions not in allfhuge.js!
	AU.css.value = css;

}






