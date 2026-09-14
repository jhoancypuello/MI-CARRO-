const $=id=>document.getElementById(id);
const screens=[...document.querySelectorAll(".screen")];
const nav=[...document.querySelectorAll("nav button[data-screen]")];

function show(name){
  screens.forEach(s=>s.classList.toggle("active",s.id===name));
  nav.forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
  window.scrollTo(0,0);
}
document.querySelectorAll("[data-screen]").forEach(b=>b.addEventListener("click",()=>show(b.dataset.screen)));

function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function fmtDate(d){if(!d)return"Sin fecha";const [y,m,day]=d.split("-");return `${m}/${day}/${y}`;}

let maintenance=JSON.parse(localStorage.getItem("accord_maintenance_v3")||"[]");
function saveMaintenance(){localStorage.setItem("accord_maintenance_v3",JSON.stringify(maintenance));}
function renderMaintenance(){
  const box=$("maintenanceList");
  if(!maintenance.length){box.innerHTML='<div class="result-card"><p>No hay servicios registrados todavía.</p></div>';return;}
  box.innerHTML=maintenance.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(m=>`
    <div class="maintenance-card">
      <h3>🔧 ${esc(m.type)} <span class="badge">${fmtDate(m.date)}</span></h3>
      <p><b>Millaje:</b> ${Number(m.mileage).toLocaleString()} mi</p>
      ${m.notes?`<p><b>Notas:</b> ${esc(m.notes)}</p>`:""}
      <div class="row"><button class="editBtn" data-edit="${m.id}">Editar</button><button class="deleteBtn" data-delete="${m.id}">Eliminar</button></div>
    </div>`).join("");
  box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editMaintenance(b.dataset.edit));
  box.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{maintenance=maintenance.filter(x=>String(x.id)!==String(b.dataset.delete));saveMaintenance();renderMaintenance();renderHistory();});
}
function renderHistory(){
  const box=$("historyList");
  if(!maintenance.length){box.innerHTML='<div class="result-card"><p>Aquí aparecerán los servicios registrados y, después, los eventos OBD.</p></div>';return;}
  box.innerHTML=maintenance.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(m=>`
    <div class="maintenance-card"><h3>🔧 ${esc(m.type)}</h3><p>${fmtDate(m.date)} · ${Number(m.mileage).toLocaleString()} mi</p></div>`).join("");
}
function openMaintenance(m=null){
  $("maintenanceTitle").textContent=m?"Editar mantenimiento":"Agregar mantenimiento";
  $("maintenanceId").value=m?.id||"";
  $("maintenanceType").value=m?.type||"Aceite y filtro";
  $("maintenanceDate").value=m?.date||new Date().toISOString().slice(0,10);
  $("maintenanceMileage").value=m?.mileage??"";
  $("maintenanceNotes").value=m?.notes||"";
  $("maintenanceDialog").showModal();
}
function editMaintenance(id){const m=maintenance.find(x=>String(x.id)===String(id));if(m)openMaintenance(m);}
$("addMaintenance").onclick=()=>openMaintenance();
$("cancelMaintenance").onclick=()=>$("maintenanceDialog").close();
$("maintenanceForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("maintenanceId").value||String(Date.now());
  const item={id,type:$("maintenanceType").value,date:$("maintenanceDate").value,mileage:Number($("maintenanceMileage").value),notes:$("maintenanceNotes").value.trim()};
  const idx=maintenance.findIndex(x=>String(x.id)===String(id));
  if(idx>=0)maintenance[idx]=item;else maintenance.push(item);
  saveMaintenance();renderMaintenance();renderHistory();$("maintenanceDialog").close();
});
renderMaintenance();renderHistory();

const LOCAL_CODES={
"P0001":["Circuito de control de volumen de combustible — rango/rendimiento","Revisar cableado, conectores y control del sistema de combustible.","Media"],
"P0010":["Circuito del actuador de posición del árbol de levas, banco 1","Inspeccionar solenoide VVT, conector, cableado y aceite.","Media"],
"P0011":["Posición del árbol de levas demasiado avanzada — banco 1","Comprobar aceite, solenoide VVT y sincronización.","Media"],
"P0030":["Circuito del calentador del sensor O2 — banco 1 sensor 1","Revisar fusible, cableado, conector y calentador.","Media"],
"P0101":["Rango/rendimiento del circuito MAF","Revisar MAF, admisión, filtro y fugas.","Media"],
"P0113":["Entrada alta del sensor de temperatura de aire","Revisar sensor IAT, conector y cableado.","Media"],
"P0128":["Temperatura del refrigerante por debajo del nivel esperado","Comprobar refrigerante, termostato y sensor ECT.","Media"],
"P0171":["Sistema demasiado pobre — banco 1","Buscar fugas de admisión, revisar MAF, combustible y correcciones.","Media"],
"P0172":["Sistema demasiado rico — banco 1","Revisar MAF, presión de combustible, inyectores y O2.","Media"],
"P0300":["Fallos de encendido aleatorios/múltiples","Revisar bujías, bobinas, combustible, admisión y misfire.","Alta"],
"P0301":["Fallo de encendido — cilindro 1","Revisar bujía, bobina, inyector y compresión.","Alta"],
"P0302":["Fallo de encendido — cilindro 2","Revisar bujía, bobina, inyector y compresión.","Alta"],
"P0303":["Fallo de encendido — cilindro 3","Revisar bujía, bobina, inyector y compresión.","Alta"],
"P0304":["Fallo de encendido — cilindro 4","Revisar bujía, bobina, inyector y compresión.","Alta"],
"P0420":["Eficiencia del catalizador por debajo del umbral — banco 1","Revisar fugas, sensores O2 y rendimiento del catalizador.","Media"],
"P0440":["Falla general del sistema EVAP","Revisar tapa, mangueras, válvulas y fugas EVAP.","Media"],
"P0442":["Fuga pequeña detectada en EVAP","Comprobar tapa y conexiones; prueba de humo si persiste.","Media"],
"P0455":["Fuga grande detectada en EVAP","Revisar tapa, mangueras, válvulas y conexiones EVAP.","Media"],
"P0456":["Fuga muy pequeña detectada en EVAP","Revisar tapa, conexiones y líneas EVAP.","Media"],
"P0500":["Mal funcionamiento del sensor de velocidad","Revisar sensor, cableado, conectores y datos.","Media"],
"P0562":["Voltaje del sistema demasiado bajo","Comprobar batería, alternador, terminales y conexiones.","Alta"],
"P0606":["Falla del procesador/módulo de control del motor","Comprobar alimentación y masa antes de condenar el módulo.","Alta"],
"P0700":["Solicitud de MIL por sistema de transmisión","Leer códigos específicos del módulo de transmisión.","Alta"],
"U0100":["Pérdida de comunicación con módulo de control del motor/transmisión","Revisar alimentación, masas, red CAN y conectores.","Alta"],
"U0121":["Pérdida de comunicación con módulo de control de frenos","Revisar red CAN, alimentación, masas y conectores.","Alta"]
};

let dtcDB=null;
const DB_URL="https://foerbsnavi.github.io/obdex/generic.min.json";

async function loadDTCDB(){
  try{
    const r=await fetch(DB_URL,{cache:"force-cache"});
    if(!r.ok) throw new Error("HTTP "+r.status);
    dtcDB=await r.json();
    $("codeCount").textContent=dtcDB.length.toLocaleString()+" códigos";
    $("dbStatus").textContent=dtcDB.length.toLocaleString()+" códigos genéricos OBD-II cargados.";
  }catch(e){
    dtcDB=null;
    $("codeCount").textContent="Base local";
    $("dbStatus").textContent="Sin conexión a la base online; siguen disponibles los códigos locales.";
  }
}
loadDTCDB();

function normalizeCode(s){
  return String(s||"").toUpperCase().replace(/[^PBCU0-9]/g,"").slice(0,5);
}
function findDTC(code){
  code=normalizeCode(code);
  if(LOCAL_CODES[code]) return {code,title:LOCAL_CODES[code][0],desc:LOCAL_CODES[code][1],severity:LOCAL_CODES[code][2],source:"Base local"};
  if(dtcDB){
    const x=dtcDB.find(v=>String(v.code).toUpperCase()===code);
    if(x) return {code,title:x.title?.en||x.description?.en||"Código OBD-II",desc:x.description?.en||"",severity:(x.flags?.limp_mode||x.repair?.difficulty==="hard")?"Alta":"Media",source:"OBDex / base genérica"};
  }
  return null;
}
function showCode(code){
  const c=normalizeCode(code);
  if(!c){$("codeResult").innerHTML="<p>Escribe un código como P0300, P0455 o U0100.</p>";return;}
  const d=findDTC(c);
  if(!d){
    $("codeResult").innerHTML=`<h3>${esc(c)}</h3><p>No tengo todavía una descripción local para este código.</p><p>El código real seguirá mostrándose exactamente como lo reporte el vehículo.</p>`;
    return;
  }
  $("codeResult").innerHTML=`<h3>${esc(d.code)} — ${esc(d.title)}</h3><span class="severity">${esc(d.severity)}</span><p>${esc(d.desc)}</p><p><b>Fuente:</b> ${esc(d.source)}</p><p><small>El código orienta el diagnóstico; no demuestra por sí solo qué pieza está dañada.</small></p>`;
}
$("searchCode").onclick=()=>showCode($("codeInput").value);
$("codeInput").addEventListener("keydown",e=>{if(e.key==="Enter")showCode(e.target.value);});
$("allCodesBtn").onclick=()=>{$("codeInput").value="P0300";showCode("P0300");};

function setMetrics(rpm,speed,temp,voltage,maf="—",throttle="—",raw="Demo — sin respuesta OBD real"){
  $("homeDot").classList.add("green");$("homeStatus").textContent="Datos de demostración";$("obdStatus").textContent="● OBD-II: Demo";$("obdStatus").classList.remove("offline");$("obdStatus").classList.add("online");
  [["rpm",rpm],["speed",speed],["temp",temp],["voltage",voltage],["rpm2",rpm],["speed2",speed],["temp2",temp],["voltage2",voltage],["maf",maf],["throttle",throttle]].forEach(([id,v])=>$(id).textContent=v);
  $("liveSource").textContent="Modo demostración";$("liveTime").textContent=new Date().toLocaleTimeString();$("rawLive").textContent=raw;
  $("obdDetail").textContent="Modo demostración. Una conexión real mostrará adaptador, hora y respuesta.";
  $("rawObd").textContent=raw;
}
let demoMode=false;
function clearDemo(){
  demoMode=false;
  $("demoBtn").textContent="Demo";
  $("homeDot").classList.remove("green");
  $("homeStatus").textContent="Esperando OBD-II";
  $("obdStatus").textContent="● OBD-II desconectado";
  $("obdStatus").classList.remove("online");
  $("obdStatus").classList.add("offline");
  ["rpm","speed","temp","voltage","rpm2","speed2","temp2","voltage2","maf","throttle"].forEach(id=>$(id).textContent="—");
  $("liveSource").textContent="—";
  $("liveTime").textContent="—";
  $("rawLive").textContent="—";
  $("obdDetail").textContent="Esperando un método compatible con iPhone.";
  $("rawObd").textContent="—";
}
$("demoBtn").onclick=()=>{
  if(demoMode){ clearDemo(); return; }
  demoMode=true;
  $("demoBtn").textContent="Quitar demo";
  setMetrics(760,"0 mph","195 °F","14.2 V","3.1 g/s","11 %","41 0C 00 00 00 00 00");
};

function parseDTCResponse(raw){
  const bytes=raw.toUpperCase().replace(/[^0-9A-F]/g," ").trim().split(/\s+/).filter(Boolean);
  const out=[];
  let start=bytes.findIndex(x=>x==="43"||x==="47"||x==="48");
  if(start<0) return out;
  for(let i=start+1;i+1<bytes.length;i+=2){
    const a=parseInt(bytes[i],16),b=parseInt(bytes[i+1],16);
    if((a|b)===0) continue;
    const type=["P","C","B","U"][(a>>6)&3];
    const code=type+(((a>>4)&3).toString(16).toUpperCase())+((a&15).toString(16).toUpperCase())+((b>>4)&15).toString(16).toUpperCase()+(b&15).toString(16).toUpperCase();
    out.push(code);
  }
  return out;
}
function renderDetected(codes){
  if(!codes.length){$("detectedCodes").innerHTML='<div class="code-item"><small>No hay códigos detectados en esta lectura.</small></div>';return;}
  $("scanTitle").textContent=codes.length+" código(s) recibido(s)";
  $("scanSubtitle").textContent="Respuesta proveniente del vehículo";
  $("detectedCodes").innerHTML=codes.map(c=>{const d=findDTC(c);return `<div class="code-item"><b>${esc(c)}</b><div>${esc(d?.title||"Código recibido; descripción específica no disponible")}</div></div>`}).join("");
}
$("readCodes").onclick=()=>{
  $("scanTitle").textContent="Esperando conexión OBD";
  $("scanSubtitle").textContent="Todavía no hay un adaptador conectado a esta PWA.";
  $("detectedCodes").innerHTML='<div class="code-item"><small>La función de lectura real está preparada para procesar la respuesta OBD (por ejemplo, modo 03), pero Safari/iPhone no permite que una PWA normal abra directamente un adaptador Bluetooth.</small></div>';
};
$("clearCodes").onclick=()=>{
  $("detectedCodes").innerHTML='<div class="code-item"><small>El borrado real se hará únicamente cuando exista una conexión OBD válida y confirmada. No se enviará ningún comando ficticio.</small></div>';
};

if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js?v=5");
