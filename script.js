function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
 document.getElementById(id).classList.add("active");
}

/* GROUP DATA */
const groupTeams={
 A:["A1","A2","A3","A4"],
 B:["B1","B2","B3","B4"]
};

/* MATCH STATE */
let score=0, balls=0, wickets=0;
let ticker=[], history=[];
let overData=[];
let battingTeam="", bowlingTeam="";

/* POINTS */
let teams=[
 {name:"A1",matches:0,runs:0},
 {name:"A2",matches:0,runs:0},
 {name:"A3",matches:0,runs:0},
 {name:"A4",matches:0,runs:0},
 {name:"B1",matches:0,runs:0},
 {name:"B2",matches:0,runs:0},
 {name:"B3",matches:0,runs:0},
 {name:"B4",matches:0,runs:0}
];

/* POPULATE TEAMS */
document.getElementById("groupSelect").addEventListener("change",function(){
 const g=this.value;
 const t1=document.getElementById("team1");
 const t2=document.getElementById("team2");

 t1.innerHTML=`<option value="">-- Select Team 1 --</option>`;
 t2.innerHTML=`<option value="">-- Select Team 2 --</option>`;

 if(!g) return;
 groupTeams[g].forEach(t=>{
  t1.innerHTML+=`<option value="${t}">${t}</option>`;
  t2.innerHTML+=`<option value="${t}">${t}</option>`;
 });
});

/* ADMIN */
function adminLogin(){
 const pwd=prompt("Enter Admin Password");
 if(pwd==="kapl"){
  document.getElementById("adminPanel").classList.remove("hidden");
 }else alert("Wrong password");
}

/* START MATCH */
function startMatch(){
 const g=document.getElementById("groupSelect").value;
 const t1=document.getElementById("team1").value;
 const t2=document.getElementById("team2").value;

 if(!g) return alert("Select group first");
 if(!t1 || !t2) return alert("Select both teams");
 if(t1===t2) return alert("Teams must be different");

 battingTeam=t1;
 bowlingTeam=t2;

 resetMatch();
 document.getElementById("matchTitle").innerText=
  `${t1} vs ${t2} (Group ${g})`;
}

/* RESET MATCH */
function resetMatch(){
 score=0; balls=0; wickets=0;
 ticker=[]; history=[]; overData=[];
 updateUI();
}

/* SAVE STATE (LAST BALL ONLY) */
function saveState(){
 history.push({
  score,balls,wickets,
  ticker:[...ticker],
  overData:JSON.stringify(overData)
 });
}

/* EVENTS */
function ball(r){
 saveState();
 score+=r; balls++;
 updateOver(r);
 addTicker(r);
 updateUI();
}

function wide(){
 saveState();
 score++; updateOver("Wd"); addTicker("Wd"); updateUI();
}

function noBall(){
 saveState();
 score++; updateOver("Nb"); addTicker("Nb"); updateUI();
}

function wicket(){
 saveState();
 wickets++; balls++;
 updateOver("W"); addTicker("W"); updateUI();
}

/* UNDO */
function undoLastBall(){
 if(!history.length) return;
 let p=history.pop();
 score=p.score; balls=p.balls; wickets=p.wickets;
 ticker=p.ticker; overData=JSON.parse(p.overData);
 updateUI();
}

/* CHANGE TEAM */
function changeTeam(){
 [battingTeam,bowlingTeam]=[bowlingTeam,battingTeam];
 document.getElementById("matchTitle").innerText=
  `${battingTeam} batting`;
}

/* OVER LOGIC */
function updateOver(val){
 let o=Math.floor((val==="Wd"||val==="Nb"?balls:balls-1)/6);
 if(!overData[o]) overData[o]={balls:[],runs:0};
 overData[o].balls.push(val);
 if(typeof val==="number") overData[o].runs+=val;
 else overData[o].runs+=1;
}

/* TICKER */
function addTicker(e){
 ticker.unshift(e);
 if(ticker.length>6) ticker.pop();
}

/* UI */
function updateUI(){
 document.getElementById("score").innerText=`${score} / ${wickets}`;
 document.getElementById("overs").innerText=
  `Overs: ${Math.floor(balls/6)}.${balls%6}`;
 document.getElementById("ticker").innerText=
  ticker.length?ticker.join(" "):"–";
 renderOvers();
}

/* RENDER OVERS */
function renderOvers(){
 let tb=document.getElementById("overTable");
 tb.innerHTML="";
 overData.forEach((o,i)=>{
  tb.innerHTML+=`
   <tr>
    <td>${i+1}</td>
    <td>${o.balls.join(" ")}</td>
    <td>${o.runs}</td>
   </tr>`;
 });
}

/* POINTS */
function renderPoints(){
 let tb=document.getElementById("pointsTable");
 tb.innerHTML="";
 teams.forEach(t=>{
  let c=t.runs<0?"negative":"";
  tb.innerHTML+=`
   <tr>
    <td>${t.name}</td>
    <td>${t.matches}</td>
    <td class="${c}">${t.runs}</td>
   </tr>`;
 });
}

renderPoints();
updateUI();
