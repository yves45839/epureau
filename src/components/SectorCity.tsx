import styles from "./SectorCity.module.css";
// Original vector illustration: a schematic city, not a geographic map.
// All coordinates share the same 1200 × 700 space as the interactive markers.
type Point=[number,number];
const project=(x:number,y:number,z=0):Point=>[600+(x-y)*.9,55+(x+y)*.43-z];
const points=(values:Point[])=>values.map(p=>p.join(",")).join(" ");
function Ground({x,y,w,d,color}:{x:number;y:number;w:number;d:number;color:string}){
  return <polygon points={points([project(x,y),project(x+w,y),project(x+w,y+d),project(x,y+d)])} fill={color}/>;
}
function Building({x,y,w,d,h,accent="#d9e5e9",windows=true}:{x:number;y:number;w:number;d:number;h:number;accent?:string;windows?:boolean}){
  const a=project(x,y,h),b=project(x+w,y,h),c=project(x+w,y+d,h),e=project(x,y+d,h);
  return <g>
    <polygon points={points([e,c,project(x+w,y+d),project(x,y+d)])} fill="#becbd1"/>
    <polygon points={points([b,c,project(x+w,y+d),project(x+w,y)])} fill="#92a7b5"/>
    <polygon points={points([a,b,c,e])} fill={accent}/>
    {windows&&Array.from({length:Math.max(1,Math.floor(h/20))},(_,floor)=>Array.from({length:Math.max(1,Math.floor(w/23))},(_,col)=>{
      const p=project(x+9+col*23,y+d+.2,12+floor*19);
      return <path key={`${floor}-${col}`} d={`M${p[0]},${p[1]}l11,5v-8l-11,-5Z`} fill="#3b6479" opacity=".8"/>;
    }))}
    {windows&&Array.from({length:Math.max(1,Math.floor(h/20))},(_,floor)=>{
      const p=project(x+w+.2,y+10,12+floor*19);
      return <path key={floor} d={`M${p[0]},${p[1]}l-16,8v-8l16,-8Z`} fill="#d8eced"/>;
    })}
  </g>;
}
function Tree({x,y}:{x:number;y:number}){const [px,py]=project(x,y);return <g><ellipse cx={px+5} cy={py+3} rx="14" ry="6" fill="#759785" opacity=".25"/><path d={`M${px},${py}v-18`} stroke="#788b69" strokeWidth="4"/><circle cx={px} cy={py-22} r="13" fill="#5b8d71"/><circle cx={px-5} cy={py-27} r="9" fill="#79a082"/></g>;}
function Tank({x,y}:{x:number;y:number}){const [px,py]=project(x,y);return <g><path d={`M${px-42},${py-15}v18a42 20 0 0 0 84 0v-18`} fill="#91acb6"/><ellipse cx={px} cy={py-15} rx="42" ry="20" fill="#d8e9e9"/><ellipse cx={px} cy={py-15} rx="34" ry="15" fill="#66bdcc"/><g transform={`translate(${px} ${py-15})`}><ellipse className={styles.ripple} rx="23" ry="9" fill="none" stroke="#e5fcfa" strokeWidth="1.5"/></g><path d={`M${px-35},${py-15}h70`} stroke="#ecf5f5" strokeWidth="4"/></g>;}
function Crane({x,y,height=140}:{x:number;y:number;height?:number}){
  const [px,py]=project(x,y);
  return <g transform={`translate(${px} ${py})`}>
    <path d={`M-5,0V-${height}H5V0M-5,-20L5,-40L-5,-60L5,-80L-5,-100L5,-120`} fill="none" stroke="#c79745" strokeWidth="3"/>
    <g transform={`translate(0 ${-height})`}><g className={styles.craneArm}>
      <path d="M-92,0H42M-92,0L0,-24L42,0M0,-24V0" fill="none" stroke="#dfa94c" strokeWidth="4"/>
      <rect x="21" y="-5" width="22" height="12" rx="2" fill="#8c9eaa"/>
      <rect x="-13" y="-4" width="17" height="14" rx="2" fill="#f5c76d"/>
      <g className={styles.trolley}><rect x="-75" y="0" width="12" height="6" rx="2" fill="#536879"/>
        <path className={styles.cable} d="M-69,5v54" stroke="#657987" strokeWidth="2"/>
        <g className={styles.load}><path d="M-69,56v7q0 8 6 3" fill="none" stroke="#536879" strokeWidth="3"/><path d="M-84,82L-68,69L-50,82" fill="none" stroke="#9c885f" strokeWidth="2"/><rect x="-88" y="80" width="42" height="10" rx="2" fill="#c5ad83"/></g>
      </g>
    </g></g>
  </g>;
}
function Smoke({x,y,z,delay=0}:{x:number;y:number;z:number;delay?:number}){
  const [px,py]=project(x,y,z);
  return <g transform={`translate(${px} ${py})`}>{[0,1,2,3].map(i=><g key={i} className={styles.smoke} style={{animationDelay:`${delay-i*1.5}s`}}><ellipse cy="-5" rx="11" ry="8" fill="#a3bac3"/><circle cx="-7" cy="-10" r="7" fill="#b5c8ce"/></g>)}</g>;
}
export default function SectorCity(){return <svg className={`sector-city ${styles.city}`} viewBox="0 0 1200 700" aria-hidden="true" focusable="false">
  <defs><linearGradient id="city-base" x2="0" y2="1"><stop stopColor="#e6eeeb"/><stop offset="1" stopColor="#d2e2df"/></linearGradient></defs>
  <ellipse cx="600" cy="565" rx="470" ry="90" fill="#15374b" opacity=".07"/>
  <polygon points={points([project(0,640),project(640,640),project(640,0),project(640,0,-18),project(640,640,-18),project(0,640,-18)])} fill="#bccfd1"/>
  <Ground x={0} y={0} w={640} d={640} color="url(#city-base)"/>
  <Ground x={0} y={215} w={640} d={38} color="#688090"/><Ground x={305} y={0} w={38} d={640} color="#688090"/>
  <Ground x={0} y={438} w={640} d={32} color="#688090"/>
  {[234,454].map(y=><path key={y} d={`M${project(0,y).join(',')}L${project(640,y).join(',')}`} stroke="#e9eeee" strokeWidth="2" strokeDasharray="12 13"/>)}
  <path d={`M${project(324,0).join(',')}L${project(324,640).join(',')}`} stroke="#e9eeee" strokeWidth="2" strokeDasharray="12 13"/>
  <Ground x={20} y={20} w={265} d={175} color="#c3d8c8"/>
  <Ground x={365} y={20} w={250} d={175} color="#d4e2df"/>
  <Ground x={20} y={278} w={265} d={135} color="#e2e9e5"/>
  <Ground x={370} y={277} w={240} d={135} color="#c9ddcd"/>
  <Ground x={20} y={490} w={265} d={125} color="#c4dbd7"/>
  <Ground x={369} y={490} w={250} d={125} color="#dde5df"/>
  {/* Back left: construction. */}
  <Building x={45} y={75} w={70} d={60} h={100}/><Building x={155} y={60} w={85} d={85} h={65} accent="#f0f3ee"/>
  <Crane x={180} y={150}/><Crane x={52} y={60} height={112}/>
  {/* Back right: industrial production. */}
  <Building x={385} y={70} w={135} d={85} h={48} accent="#e0eaec"/><Building x={532} y={70} w={32} d={32} h={112} accent="#edf2ee" windows={false}/>
  <Building x={577} y={75} w={24} d={24} h={87} accent="#edf2ee" windows={false}/>
  <Ground x={400} y={82} w={100} d={50} color="#527d9e"/>
  <Smoke x={548} y={86} z={114}/><Smoke x={589} y={87} z={89} delay={-.8}/>
  {/* Centre left: hospital. */}
  <Building x={43} y={300} w={135} d={68} h={55} accent="#f3f6f2"/><Building x={91} y={275} w={53} d={113} h={70} accent="#f3f6f2"/>
  <path d={`M${project(118,330,71).join(',')}l18,8m-9,-16l-18,9`} stroke="#2c9f94" strokeWidth="9"/>
  {/* Centre right: hotel, garden and pool. */}
  <Building x={390} y={275} w={105} d={60} h={106} accent="#eaf0eb"/><Building x={500} y={280} w={70} d={54} h={56}/>
  <Ground x={430} y={365} w={115} d={30} color="#6dc3d0"/>
  {/* Foreground left: municipal water treatment. */}
  <Building x={40} y={502} w={58} d={48} h={30} accent="#f1f5ef"/><Tank x={145} y={535}/><Tank x={237} y={545}/>
  {/* Foreground right: laundry and service building. */}
  <Building x={380} y={500} w={165} d={80} h={50} accent="#e7efee"/>
  {[414,462,510].map(x=>{const [px,py]=project(x,581,27);return <g key={x}><ellipse cx={px} cy={py} rx="10" ry="14" fill="#eaf3f2"/><ellipse cx={px} cy={py} rx="6" ry="9" fill="#4b7b96"/><g transform={`translate(${px} ${py}) scale(.65 1)`}><g className={styles.drum} style={{animationDelay:`${-x/100}s`}}><path d="M0,-6L3,0L-3,4" fill="none" stroke="#b8edf0" strokeWidth="2"/></g></g></g>;})}
  {[[20,30],[280,45],[280,165],[350,35],[615,185],[28,265],[262,290],[260,390],[365,398],[595,370],[15,500],[290,592],[358,595],[600,610],[605,500]].map(([x,y])=><Tree key={`${x}-${y}`} x={x} y={y}/>)}
  {[80,260,480].map(x=><Building key={x} x={x} y={224} w={22} d={10} h={9} accent="#faf6e9" windows={false}/>)}
  <path d="M80 648h1040" stroke="#d1dfdf" strokeWidth="1"/>
</svg>;}
