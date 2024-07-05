var A = null;
var Menu = null;
var T = null;
var Tid = null;
var U = {};
var SLEEP_WATCHER = null; //elim!
const deepRichColors = [
  "#2B2D42", // Charcoal Blue
  "#3F3351", // Deep Purple
  "#450920", // Burgundy Velvet
  "#423629", // Dark Walnut
  "#004346", // Teal Deep
  "#283618", // Hunter Green
  "#462255", // Royal Purple
  "#540B0E", // Dark Burgundy
  "#1B263B", // Midnight Blue
  "#0B132B", // Blue Black
  "#353535", // Onyx
  "#3C1874", // Persian Indigo
  "#08415C", // Deep Sea Blue
  "#650D1B", // Claret Red
  "#005F73", // Deep Cyan
  "#101820", // Rich Black
  "#1A1423", // Eclipse
  "#6622CC", // Deep Violet
  "#4A4E69", // Independence Blue
  "#6A040F", // Red Oxide
  "#264653", // Charleston Green
  "#230C33", // Blackcurrant
  "#3A0CA3", // Vivid Blue Violet
  "#240046", // Russian Violet
  "#10002B", // Deep Purple
];
const childrenRoomColors = [
  "#FF9AA2", // Soft Coral
  "#FFB7B2", // Light Salmon Pink
  "#FFDAC1", // Peach Crayola
  "#E2F0CB", // Tea Green
  "#B5EAD7", // Magic Mint
  "#C7CEEA", // Periwinkle Crayola
  "#FFD700", // Bright Gold
  "#FDDB3A", // Banana Mania
  "#87CEFA", // Light Sky Blue
  "#77DD77", // Pastel Green
  "#F49AC2", // Pastel Pink
  "#836FFF", // Light Slate Blue
  "#CB99C9", // Pastel Violet
  "#FF6961", // Pastel Red
  "#03C03C", // Dark Pastel Green
  "#FDFD96", // Pastel Yellow
  "#AEC6CF", // Pastel Blue
  "#DEA5A4", // Pastel Red
  "#FFB347", // Pastel Orange
  "#77B5FE", // French Sky Blue
  "#FDBCB4", // Melon
  "#779ECB", // Slate Blue
  "#966FD6", // Dark Pastel Purple
  "#FFD1DC", // Piggy Pink
  "#FFD700", // Golden Poppy
  "#B39EB5", // Lilac
  "#FF6961", // Salmon Pink
  "#C23B22", // Dark Pastel Red
  "#CFCFC4", // Pastel Gray
  "#A23BEC", // Bright Purple
];
const vibrantColors = [
  "#FF4057", // Bright Red
  "#00B8A9", // Vivid Teal
  "#F46036", // Vibrant Orange
  "#E71D36", // Strong Carmine
  "#2EC4B6", // Bright Turquoise
  "#FFD166", // Sunny Yellow
  "#06D6A0", // Neon Green
  "#EF476F", // Fuchsia Pink
  "#26547C", // Cobalt Blue
  "#FF9F1C", // Electric Orange
  "#00BBF9", // Bright Sky Blue
  "#118AB2", // Blue NCS
  "#073B4C", // Dark Cyan
  "#FFD32D", // Bright Yellow
  "#8338EC", // Electric Purple
  "#FB5607", // Tango Orange
  "#FF006E", // Neon Pink
  "#3A86FF", // Vivid Blue
  "#FFBE0B", // Bitter Lemon
  "#FF006E", // Magenta
  "#48BF84", // Mint Green
  "#F94144", // Vermilion Red
  "#F3722C", // Orange (Red C)
  "#90BE6D", // Pistachio Green
  "#577590", // Blue Yonder
  "#9B5DE5", // Lavender Purple
  "#F15BB5", // Light Magenta
  "#FEE440", // Electric Yellow
  "#00F5D4", // Bright Cyan
  "#7209B7", // Byzantine Purple
];
const modernColors = [
  "#FF6F61", // Vibrant Coral
  "#6B5B95", // Subdued Purple
  "#88B04B", // Leafy Green
  "#F7CAC9", // Pastel Pink
  "#92A8D1", // Soft Blue
  "#955251", // Warm Terra Cotta
  "#B565A7", // Muted Lilac
  "#009B77", // Deep Aqua
  "#DD4124", // Fiery Red
  "#D65076", // Bright Pink
  "#45B8AC", // Ocean Blue
  "#EFC050", // Sunny Yellow
  "#5B5EA6", // Majestic Purple
  "#9B2335", // Strong Red
  "#DFCFBE", // Neutral Beige
  "#55B4B0", // Soft Turquoise
  "#E15D44", // Burnt Orange
  "#7FCDCD", // Pale Cyan
  "#BC243C", // Powerful Red
  "#C3447A", // Deep Pink
  "#98B4D4", // Light Blue
  "#8D9440", // Olive Green
  "#FFD662", // Bright Yellow
  "#A4B086", // Sage Green
  "#774D8E", // Dark Purple
  "#F4B9B8", // Light Coral
  "#6E81A0", // Smoky Blue
  "#5A7247", // Hunter Green
  "#FF968A", // Soft Red
  "#D2C29D", // Earthy Gold
  "#F2E2E0", // Off White
  "#83781B", // Brass Yellow
  "#E1EDE9", // Pale Mint
  "#5E3D26", // Deep Brown
];
var ColorThiefObject;
var WhichCorner = 0;
const CORNERS0 = ['♠', '♡']; //, '♣', '♢'];
const CORNERS = ['◢', '◣', '◤', '◥'];
const CORNERS2 = ['⬔', '⬕'];
const CORNERS3 = ['⮜', '⮝', '⮞', '⮟'];
const CORNERS4 = ['⭐', '⭑']; //, '⭒', '⭓'];
const CORNERS5 = ['⬛', '⬜']; //, '⭒', '⭓'];
const ANIM = {};
var Session = {};
var Clientdata = {};
const allPeeps = []
const availablePeeps = []
const BLUE = '#4363d8';
const BROWN = '#96613d';
const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow', 'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const crowd = []
const DEF_ORIENTATION = 'v';
const DEF_SPLIT = 0.5;
const FIREBRICK = '#800000';
const GREEN = '#3cb44b';
const BLUEGREEN = '#004054';
const img = document.createElement('img')
const LIGHTBLUE = '#42d4f4';
const LIGHTGREEN = '#afff45';
const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
const OLIVE = '#808000';
const ORANGE = '#f58231';
const NEONORANGE = '#ff6700';
const playerColors = {
  red: '#D01013',
  blue: '#003399',
  green: '#58A813',
  orange: '#FF6600',
  yellow: '#FAD302',
  violet: '#55038C',
  pink: '#ED527A',
  beige: '#D99559',
  sky: '#049DD9',
  brown: '#A65F46',
  white: '#FFFFFF',
};
const PURPLE = '#911eb4';
const RED = '#e6194B';
const stage = {
  width: 0,
  height: 0,
}
const STYLE_PARAMS = {
  acontent: 'align-content',
  aitems: 'align-items',
  align: 'text-align',
  aspectRatio: 'aspect-ratio',
  bg: 'background-color',
  bgBlend: 'background-blend-mode', //'mix-blend-mode', //
  bgImage: 'background-image',
  bgRepeat: 'background-repeat',
  bgSize: 'background-size',
  deco: 'text-decoration',
  dir: 'flex-direction',
  family: 'font-family',
  fg: 'color',
  fontSize: 'font-size',
  fStyle: 'font-style',
  fz: 'font-size',
  gridCols: 'grid-template-columns',
  gridRows: 'grid-template-rows',
  h: 'height',
  hgap: 'column-gap',
  hmin: 'min-height',
  hmax: 'max-height',
  hline: 'line-height',
  jcontent: 'justify-content',
  jitems: 'justify-items',
  justify: 'justify-content',
  matop: 'margin-top',
  maleft: 'margin-left',
  mabottom: 'margin-bottom',
  maright: 'margin-right',
  origin: 'transform-origin',
  overx: 'overflow-x',
  overy: 'overflow-y',
  patop: 'padding-top',
  paleft: 'padding-left',
  pabottom: 'padding-bottom',
  paright: 'padding-right',
  place: 'place-items',
  rounding: 'border-radius',
  valign: 'align-items',
  vgap: 'row-gap',
  w: 'width',
  wmin: 'min-width',
  wmax: 'max-width',
  weight: 'font-weight',
  x: 'left',
  xover: 'overflow-x',
  y: 'top',
  yover: 'overflow-y',
  z: 'z-index'
};
const TEAL = '#469990';
const walks = ['normalWalk']
const YELLOW = '#ffe119';
const NEONYELLOW = '#efff04';
const YELLOW2 = '#fff620';
const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED, GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue',
  'deeppink', TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE,
  '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'deeppink',
  'palegreen', '#e6194B'];
var activatedTests = [];
var AD;
var ADS;
var aiActivated;
var Animation1;
var AREAS = {};
var AU = {};
var auxOpen;
var Categories;
var ColorDi;
var ColorNames;
var coorsField = {
  "type": "Feature",
  "properties": {
    "popupContent": "Coors Field"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-104.99404191970824, 39.756213909328125]
  }
};
var currentGame = IS_TESTING ? 'gTouchPic' : 'sequence';
var currentLanguage = 'E';
var currentLevel;
var DA = {};
var DB;
var draggedElement;
var dragStartOffset;
var dropPosition = 'none';
var dynSpec;
var freeBus = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-105.00341892242432, 39.75383843460583],
          [-105.0008225440979, 39.751891803969535]
        ]
      },
      "properties": {
        "popupContent": "This is a free bus line that will take you across downtown.",
        "underConstruction": false
      },
      "id": 1
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-105.0008225440979, 39.751891803969535],
          [-104.99820470809937, 39.74979664004068]
        ]
      },
      "properties": {
        "popupContent": "This is a free bus line that will take you across downtown.",
        "underConstruction": true
      },
      "id": 2
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-104.99820470809937, 39.74979664004068],
          [-104.98689651489258, 39.741052354709055]
        ]
      },
      "properties": {
        "popupContent": "This is a free bus line that will take you across downtown.",
        "underConstruction": false
      },
      "id": 3
    }
  ]
};
var FUNCTIONS = {
  instanceof: 'instanceOf',
  prop: (o, v) => isdef(o[v]),
  no_prop: (o, v) => nundef(o[v]),
  no_spec: (o, v) => false,
}
var G = null;
var gameSequence = IS_TESTING ? ['gSayPicAuto', 'gTouchPic', 'gTouchColors', 'gWritePic', 'gMissingLetter', 'gSayPic'] : ['gSayPic', 'gTouchColors', 'gWritePic'];
var Goal;
var I;
var INFO = {};
var IS_TESTING = true;
var IsAnswerCorrect;
var IsControlKeyDown = false;
var Items = {};
var KeySets;
var lastPosition = 0;
var LevelChange = true;
var M = {};
var MAGNIFIER_IMAGE;
var MAXLEVEL = 10;
var nMissing;
var P;
var Pictures = [];
var Players;
var PolyClips = {
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  hex: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  test1: 'inset(50% 0% 100% 25% 100% 75% 50% 100% 0% 75% 0% 25% round 10px)',
  test0: 'inset(45% 0% 33% 10% round 10px)',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  hexF: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  hexFlat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  hexflat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  rect: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  sq: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  square: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  tri: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triUp: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triup: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triDown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
  tridown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
  triright: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  triRight: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  trileft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  triLeft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  splayup: 'polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)',
}
var POOLS = {};
var PROTO;
var R;
var S = {};
var sData;
var Selected;
var Serverdata = {};
var Settings;
var SHAPEFUNCS = { 'circle': 'agCircle', 'hex': 'agHex', 'rect': 'agRect', };
var Socket = null;
var SPEC = null;
var Speech;
var symbolDict;
var Syms;
var TESTING = false;
var TO = {};
var TOFleetingMessage;
var TOList;
var TOMain;
var TOMan;
var TOTrial;
var UI = {};
var uiActivated = false;
var UID = 0;
var UIDCounter = 0;
var UIROOT;
var Username;
var Z;
var Zones = {};
