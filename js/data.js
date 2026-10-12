'use strict';
/* ========= levels, bands, game types ========= */
const BANDS=[
 {id:0,start:1,end:1000,icon:'🍼',n:B('1-2 ขวบ','Age 1-2'),auto:true,easy:true},
 {id:1,start:1001,end:3000,icon:'🧸',n:B('อนุบาล (3-5 ขวบ)','Kindergarten (3-5)'),auto:true},
 {id:2,start:3001,end:4800,icon:'🎒',n:B('ป.1','Grade 1')},
 {id:3,start:4801,end:6600,icon:'✏️',n:B('ป.2','Grade 2')},
 {id:4,start:6601,end:8300,icon:'📚',n:B('ป.3','Grade 3')},
 {id:5,start:8301,end:10000,icon:'🎓',n:B('ป.4','Grade 4')}
];
const bandOf=N=>BANDS.find(b=>N<=b.end)||BANDS[5];
const ctxOf=N=>{const b=bandOf(N);return{N,b:b.id,p:Math.min(.999,(N-b.start)/(b.end-b.start+1))}};

const TYPES={
 tapNum:{icon:'🔢',n:B('ฟังเสียงตัวเลข','Hear the numbers')},
 tapPic:{icon:'👆',n:B('แตะแล้วฟังเสียง','Tap and listen')},
 findPic:{icon:'🔍',n:B('หาของ','Find it')},
 countTap:{icon:'🍎',n:B('นับด้วยกัน','Count together')},
 soundQ:{icon:'🐮',n:B('เสียงสัตว์','Animal sounds')},
 memory:{icon:'🃏',n:B('จับคู่ความจำ','Memory')},
 count:{icon:'🔢',n:B('นับเลข','Counting')},
 numRec:{icon:'🔟',n:B('รู้จักตัวเลข','Numbers')},
 vocab:{icon:'🖼️',n:B('คำศัพท์ไทย-อังกฤษ','Thai-English words')},
 letters:{icon:'🔤',n:B('ตัวอักษร ก-ฮ / A-Z','Letters')},
 add:{icon:'➕',n:B('การบวก','Addition')},
 sub:{icon:'➖',n:B('การลบ','Subtraction')},
 mul:{icon:'✖️',n:B('การคูณ','Multiplication')},
 div:{icon:'➗',n:B('การหาร','Division')},
 compare:{icon:'⚖️',n:B('เปรียบเทียบ','Compare')},
 place:{icon:'🏛️',n:B('หลักและค่าประจำหลัก','Place value')},
 pattern:{icon:'🧩',n:B('หาแบบรูป','Patterns')},
 clock:{icon:'🕒',n:B('อ่านนาฬิกา','Clock')},
 money:{icon:'💰',n:B('เงินบาท','Money')},
 fraction:{icon:'🍕',n:B('เศษส่วน','Fractions')},
 geometry:{icon:'📐',n:B('รูปเรขาคณิต','Geometry')},
 round:{icon:'🎯',n:B('ปัดเศษ','Rounding')},
 ops:{icon:'🧮',n:B('ลำดับการคำนวณ','Order of operations')},
 decimal:{icon:'🔹',n:B('ทศนิยม','Decimals')},
 factor:{icon:'🔗',n:B('ตัวประกอบ ตัวคูณ','Factors & multiples')},
 spell:{icon:'✏️',n:B('สะกดคำอังกฤษ','English spelling')},
 grammar:{icon:'Abc',n:B('ไวยากรณ์อังกฤษ','English grammar')},
 calendar:{icon:'📅',n:B('วัน เดือน ปี','Days & months')},
 thRead:{icon:'อ่าน',n:B('อ่านคำไทย','Thai reading')},
 thVowel:{icon:'สระ',n:B('สระไทย','Thai vowels')},
 thTone:{icon:'ไม้',n:B('วรรณยุกต์','Thai tone marks')},
 thAnti:{icon:'↔️',n:B('คำตรงข้าม','Opposites')},
 thClass:{icon:'หมู่',n:B('อักษรสามหมู่','Consonant classes')},
 thWordType:{icon:'ชนิด',n:B('ชนิดของคำ','Word types')}
};
const POOLS=[
 ['tapNum','tapPic','findPic','countTap','tapPic','soundQ','findPic','memory','tapPic','findPic'],
 ['count','vocab','numRec','letters','add','vocab','compare','pattern','sub','letters','memory','spell','clock','numRec','vocab','count'],
 ['add','thVowel','vocab','sub','letters','thRead','compare','spell','place','thTone','pattern','grammar','clock','money','calendar','memory','numRec','thRead','add','sub'],
 ['add','sub','mul','thRead','grammar','place','money','thAnti','clock','vocab','fraction','spell','compare','calendar','thTone','div','pattern','geometry','memory','mul'],
 ['mul','div','add','sub','fraction','thClass','grammar','thAnti','money','clock','geometry','round','spell','pattern','calendar','thRead','factor','memory','mul','div'],
 ['mul','div','fraction','decimal','geometry','ops','factor','thClass','thWordType','grammar','spell','thAnti','round','clock','money','pattern','add','sub','calendar','thRead']
];
const poolOf=N=>POOLS[bandOf(N).id];
function levelType(N){
  if(N%10===0)return 'boss';
  const b=bandOf(N),pl=POOLS[b.id];
  return pl[(N-b.start)%pl.length];
}
const bossTotal=N=>N%100===0?12:8;

/* ========= vocabulary: [emoji, english, thai, soundEn, soundTh] ========= */
const CAT={
animal:[['🐶','dog','หมา','woof woof','โฮ่ง โฮ่ง'],['🐱','cat','แมว','meow','เหมียว'],['🐮','cow','วัว','moo','มอ'],['🐷','pig','หมู','oink','อู๊ด อู๊ด'],
 ['🐔','chicken','ไก่','cluck cluck','เอ้ก เอ้ก เอ้ก'],['🐸','frog','กบ','ribbit','อ็อบ อ็อบ'],['🦆','duck','เป็ด','quack quack','ก๊าบ ก๊าบ'],['🐑','sheep','แกะ','baa','แบะ'],
 ['🐴','horse','ม้า','neigh','ฮี้ ฮี้'],['🦁','lion','สิงโต','roar','โฮก'],['🐘','elephant','ช้าง','toot','แปร๋น'],['🐭','mouse','หนู','squeak','จี๊ด จี๊ด'],
 ['🐝','bee','ผึ้ง','buzz','หึ่ง หึ่ง'],['🐍','snake','งู','hiss','ฟ่อ'],['🐵','monkey','ลิง','ooh ooh','อู๊ก อู๊ก'],['🐯','tiger','เสือ','roar','โฮก'],
 ['🐰','rabbit','กระต่าย'],['🐻','bear','หมี','growl','กร๊าว'],['🐼','panda','แพนด้า'],['🐧','penguin','เพนกวิน'],['🐢','turtle','เต่า'],['🐟','fish','ปลา'],
 ['🐙','octopus','ปลาหมึก'],['🦋','butterfly','ผีเสื้อ']],
food:[['🍎','apple','แอปเปิ้ล'],['🍌','banana','กล้วย'],['🍇','grape','องุ่น'],['🍉','watermelon','แตงโม'],['🍊','orange','ส้ม'],['🍓','strawberry','สตรอว์เบอร์รี'],
 ['🍍','pineapple','สับปะรด'],['🥭','mango','มะม่วง'],['🥕','carrot','แครอท'],['🌽','corn','ข้าวโพด'],['🍅','tomato','มะเขือเทศ'],['🥚','egg','ไข่'],
 ['🍚','rice','ข้าว'],['🥛','milk','นม'],['🍞','bread','ขนมปัง'],['🎂','cake','เค้ก'],['🍦','ice cream','ไอศกรีม'],['🍪','cookie','คุกกี้'],['🍕','pizza','พิซซ่า']],
vehicle:[['🚗','car','รถ'],['🚌','bus','รถบัส'],['🚲','bike','จักรยาน'],['✈️','plane','เครื่องบิน'],['🚢','ship','เรือ'],['🚀','rocket','จรวด'],
 ['🚂','train','รถไฟ'],['🚁','helicopter','เฮลิคอปเตอร์'],['🏍️','motorbike','มอเตอร์ไซค์'],['🚒','fire truck','รถดับเพลิง'],['🚑','ambulance','รถพยาบาล']],
body:[['👁️','eye','ตา'],['👂','ear','หู'],['👃','nose','จมูก'],['👄','mouth','ปาก'],['🖐️','hand','มือ'],['🦶','foot','เท้า'],['🦷','tooth','ฟัน'],['👅','tongue','ลิ้น'],['🦵','leg','ขา'],['💪','arm','แขน']],
color:[['🔴','red','สีแดง'],['🔵','blue','สีน้ำเงิน'],['🟢','green','สีเขียว'],['🟡','yellow','สีเหลือง'],['🟣','purple','สีม่วง'],['⚫','black','สีดำ'],['⚪','white','สีขาว'],['🟤','brown','สีน้ำตาล']],
shape:[['⭕','circle','วงกลม'],['🟦','square','สี่เหลี่ยม'],['🔺','triangle','สามเหลี่ยม'],['❤️','heart','หัวใจ'],['⭐','star','ดาว']],
thing:[['🏠','house','บ้าน'],['🌳','tree','ต้นไม้'],['🌸','flower','ดอกไม้'],['☀️','sun','ดวงอาทิตย์'],['🌙','moon','ดวงจันทร์'],['☁️','cloud','เมฆ'],['🌧️','rain','ฝน'],
 ['📖','book','หนังสือ'],['✏️','pencil','ดินสอ'],['⚽','ball','ลูกบอล'],['👟','shoe','รองเท้า'],['👕','shirt','เสื้อ'],['🎩','hat','หมวก'],['⏰','clock','นาฬิกา'],
 ['🔑','key','กุญแจ'],['🎈','balloon','ลูกโป่ง'],['🪑','chair','เก้าอี้'],['🛏️','bed','เตียง'],['🚪','door','ประตู'],['🥄','spoon','ช้อน'],['🎒','bag','กระเป๋า'],
 ['☂️','umbrella','ร่ม'],['🎁','gift','ของขวัญ'],['📱','phone','โทรศัพท์'],['💡','light','หลอดไฟ']],
job:[['👩‍🏫','teacher','ครู'],['👨‍⚕️','doctor','หมอ'],['👮','police','ตำรวจ'],['👨‍🚒','firefighter','นักดับเพลิง'],['👨‍🍳','chef','พ่อครัว'],['👩‍🚀','astronaut','นักบินอวกาศ']]
};
const mkV=cats=>cats.flatMap(c=>CAT[c].map(x=>({e:x[0],en:x[1],th:x[2],sEn:x[3],sTh:x[4],c})));
const V_ALL=mkV(Object.keys(CAT));
const V_TOD=mkV(['animal','food','vehicle','body','color','shape','thing']);
const EM=['🍎','⭐','🐟','🎈','🍓','🐥','🌸','🚗','🍪','🦋','🐶','🍌'];

/* ========= Thai ========= */
const TL=[['ก','🐔','ไก่'],['ข','🥚','ไข่'],['ค','🐃','ควาย'],['ง','🐍','งู'],['จ','🍽️','จาน'],['ช','🐘','ช้าง'],['ด','👦','เด็ก'],['ต','🐢','เต่า'],
['น','🐭','หนู'],['ป','🐟','ปลา'],['ผ','🐝','ผึ้ง'],['ฟ','🦷','ฟัน'],['ม','🐴','ม้า'],['ร','⛵','เรือ'],['ล','🐵','ลิง'],['ว','💍','แหวน'],
['ส','🐯','เสือ'],['ถ','👜','ถุง'],['บ','🍃','ใบไม้'],['ย','👹','ยักษ์'],['ท','💂','ทหาร'],['อ','🛁','อ่าง'],['ฮ','🦉','นกฮูก']];
const THC='กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'.split('');
const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ABCW={A:'apple',B:'ball',C:'cat',D:'dog',E:'egg',F:'fish',G:'goat',H:'hat',I:'ice cream',J:'juice',K:'kite',L:'lion',M:'moon',N:'nose',O:'orange',P:'pig',Q:'queen',R:'rabbit',S:'sun',T:'tiger',U:'umbrella',V:'van',W:'water',X:'box',Y:'yo-yo',Z:'zebra'};
const TD='๐๑๒๓๔๕๖๗๘๙';
const tdig=n=>String(n).replace(/\d/g,d=>TD[d]);
const CLS_MID='กจฎฏดตบปอ'.split(''),CLS_HIGH='ขฃฉฐถผฝศษสห'.split('');
const CLS_LOW=THC.filter(x=>!CLS_MID.includes(x)&&!CLS_HIGH.includes(x));
const VOWELS=[['◌ะ','สระอะ'],['◌า','สระอา'],['◌ิ','สระอิ'],['◌ี','สระอี'],['◌ึ','สระอึ'],['◌ื','สระอือ'],['◌ุ','สระอุ'],['◌ู','สระอู'],['เ◌','สระเอ'],['แ◌','สระแอ'],['โ◌','สระโอ'],['ไ◌','สระไอ'],['ใ◌','สระใอ']];
const VWORDS=[['ปลา','🐟','สระอา'],['ม้า','🐴','สระอา'],['ไก่','🐔','สระไอ'],['งู','🐍','สระอู'],['ลิง','🐵','สระอิ'],['แมว','🐱','สระแอ'],['เสือ','🐯','สระเอือ'],
 ['ปู','🦀','สระอู'],['หมี','🐻','สระอี'],['เต่า','🐢','สระเอา'],['บ้าน','🏠','สระอา'],['มือ','🖐️','สระอือ'],['เรือ','🚢','สระเอือ'],['ไข่','🥚','สระไอ'],['ขา','🦵','สระอา']];
const VNAMES=[...VOWELS.map(v=>v[1]),'สระเอือ','สระเอา'];
const TONES=[['◌่','ไม้เอก'],['◌้','ไม้โท'],['◌๊','ไม้ตรี'],['◌๋','ไม้จัตวา']];
const TWORDS=[['ไก่','ไม้เอก'],['ม้า','ไม้โท'],['น้ำ','ไม้โท'],['ปู่','ไม้เอก'],['ข้าว','ไม้โท'],['เสื้อ','ไม้โท'],['ป้า','ไม้โท'],['ว่าว','ไม้เอก'],['โต๊ะ','ไม้ตรี'],['ก๋วยเตี๋ยว','ไม้จัตวา'],['น้อง','ไม้โท'],['เก้า','ไม้โท']];
// [thai1, thai2, en1, en2]
const ANTI=[['ใหญ่','เล็ก','big','small'],['ร้อน','เย็น','hot','cold'],['ยาว','สั้น','long','short'],['หนัก','เบา','heavy','light'],['เร็ว','ช้า','fast','slow'],
 ['ขึ้น','ลง','up','down'],['เปิด','ปิด','open','close'],['ใกล้','ไกล','near','far'],['อ้วน','ผอม','fat','thin'],['สว่าง','มืด','bright','dark'],['แข็ง','อ่อน','hard','soft'],
 ['เก่า','ใหม่','old','new'],['มาก','น้อย','many','few'],['หวาน','ขม','sweet','bitter'],['สะอาด','สกปรก','clean','dirty'],['แพง','ถูก','expensive','cheap'],
 ['ซ้าย','ขวา','left','right'],['เต็ม','ว่าง','full','empty'],['ดี','ร้าย','good','bad'],['ดีใจ','เสียใจ','happy','sad'],['กลางวัน','กลางคืน','day','night'],
 ['ตื่น','หลับ','awake','asleep'],['เปียก','แห้ง','wet','dry'],['ลึก','ตื้น','deep','shallow'],['กว้าง','แคบ','wide','narrow'],['ง่าย','ยาก','easy','difficult']];
// [thai, english, type]  n=noun v=verb a=adjective
const WT=[['ครู','teacher','n'],['โรงเรียน','school','n'],['หนังสือ','book','n'],['ช้าง','elephant','n'],['บ้าน','house','n'],['ดอกไม้','flower','n'],['โต๊ะ','table','n'],['แมว','cat','n'],
 ['วิ่ง','run','v'],['กิน','eat','v'],['นอน','sleep','v'],['เดิน','walk','v'],['อ่าน','read','v'],['เขียน','write','v'],['ว่ายน้ำ','swim','v'],['กระโดด','jump','v'],['ร้องเพลง','sing','v'],
 ['สวย','beautiful','a'],['ใหญ่','big','a'],['เล็ก','small','a'],['ดี','good','a'],['เร็ว','fast','a'],['ช้า','slow','a'],['สูง','tall','a'],['เตี้ย','short','a']];
const WT_NAME={n:B('คำนาม (ชื่อคน สัตว์ สิ่งของ)','a noun (a thing, animal or person)'),v:B('คำกริยา (บอกการกระทำ)','a verb (an action)'),a:B('คำคุณศัพท์ (บอกลักษณะ)','an adjective (describes)')};

/* ========= English ========= */
const RHYME=[['cat','hat','bat','mat'],['dog','log','frog','fog'],['sun','run','fun','bun'],['bee','tree','three','knee'],['star','car','jar','far'],['pen','ten','hen','men'],
 ['book','look','cook','hook'],['cake','lake','snake','make'],['ball','tall','wall','call'],['bed','red','head','bread']];
// [minBand, sentence, answer, distractors]
const GRAM=[
[2,'This is ___ apple.','an',['a','the']],[2,'This is ___ dog.','a',['an','the']],[2,'I ___ a boy.','am',['is','are']],[2,'She ___ a girl.','is',['am','are']],
[2,'You ___ my friend.','are',['am','is']],[2,'We ___ happy.','are',['am','is']],[2,'He ___ a teacher.','is',['am','are']],[2,'It ___ a cat.','is',['am','are']],
[2,'One cat, two ___.','cats',['cat','cates']],[2,'One dog, two ___.','dogs',['dog','doges']],[2,'___ is my mother.','She',['He','They']],[2,'___ is my father.','He',['She','We']],
[2,'Ice is ___.','cold',['hot','sweet']],[2,'Fish can ___.','swim',['fly','walk']],[2,'We eat with a ___.','spoon',['shoe','hat']],[2,'We read a ___.','book',['chair','cloud']],
[3,'One box, two ___.','boxes',['boxs','box']],[3,'One child, two ___.','children',['childs','childes']],[3,'One man, two ___.','men',['mans','manes']],[3,'One foot, two ___.','feet',['foots','feets']],
[3,'They ___ playing.','are',['is','am']],[3,'He ___ a book.','has',['have','haves']],[3,'I ___ two pens.','have',['has','haves']],[3,'She ___ milk every day.','drinks',['drink','drinking']],
[3,'The cat ___ on the sofa.','sleeps',['sleep','sleeping']],[3,'___ is your name?','What',['Where','Who']],[3,'___ do you live?','Where',['What','Who']],[3,'___ is that boy?','Who',['Where','What']],
[3,'There ___ three books.','are',['is','am']],[3,'There ___ a pen.','is',['are','am']],[3,'Today is Monday. Tomorrow is ___.','Tuesday',['Sunday','Friday']],[3,'My brother ___ football.','plays',['play','playing']],
[4,'Yesterday I ___ to school.','went',['go','goes']],[4,'She ___ an apple yesterday.','ate',['eat','eats']],[4,'He ___ football yesterday.','played',['play','plays']],[4,'We ___ a movie last night.','saw',['see','sees']],
[4,'I ___ my homework yesterday.','did',['do','does']],[4,'They ___ happy yesterday.','were',['was','are']],[4,'I ___ at home yesterday.','was',['were','am']],
[4,'The elephant is ___ than the dog.','bigger',['big','biggest']],[4,'A giraffe is ___ than a cat.','taller',['tall','tallest']],[4,'This bag is ___ than that bag.','heavier',['heavy','heaviest']],
[4,'She is the ___ girl in class.','tallest',['taller','tall']],[4,'He ___ running now.','is',['are','am']],[4,'I will ___ tomorrow.','go',['went','goes']],
[4,'___ you like pizza?','Do',['Does','Is']],[4,'___ she like pizza?','Does',['Do','Is']],[4,'The book is ___ the table.','on',['in','under']],[4,'The ball is ___ the box. (inside)','in',['on','under']],
[4,'The cat is ___ the bed. (below)','under',['on','in']],[4,'My birthday is ___ May.','in',['on','at']],[4,'We have class ___ Monday.','on',['in','at']],[4,'The movie starts ___ 7 o\'clock.','at',['in','on']],
[5,'Last week, we ___ to the zoo.','went',['go','going']],[5,'She is ___ than her sister.','older',['old','oldest']],[5,'This is the ___ cake in the shop.','best',['good','better']],
[5,'He ___ his teeth every morning.','brushes',['brush','brushed']],[5,'I ___ a letter yesterday.','wrote',['write','writes']],[5,'They ___ buy a toy tomorrow.','will',['did','was']],
[5,'She is ___ a song now.','singing',['sing','sang']],[5,'My mother ___ rice yesterday.','cooked',['cook','cooks']],[5,'There ___ some milk in the glass.','is',['are','were']],
[5,'He can ___ very fast.','run',['runs','ran']],[5,'I have ___ apple and two bananas.','an',['a','the']],[5,'___ is your birthday? It is in June.','When',['Who','What']]
];
const DAYS={th:['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'].map(d=>'วัน'+d),en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']};
const MONTHS={th:['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],en:['January','February','March','April','May','June','July','August','September','October','November','December']};
const MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];
