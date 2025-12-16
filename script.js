const MAX_OVERS=7, BALLS_PER_OVER=6, MAX_BALLS=42, PLAYERS=8;

function genPlayers(){
 let a=[];
 for(let i=1;i<=PLAYERS;i++)a.push({name:"Player "+i,runs:0,balls:0,out:false});
 return a;
}

function initStats(){
 return {m:0,w:0,l:0,pts:0,rf:0,bf:0,ra:0,ba:0};
}

const groups={
A:[
 {name:"A1",stats:initStats(),players:genPlayers()},
 {name:"A2",stats:initStats(),players:genPlayers()},
 {name:"A3",stats:initStats(),players:genPlayers()},
 {name:"A4",stats:initStats(),players:genPlayers()}
],
B:[
 {name:"B1",stats:initStats(),players:genPlayers()},
 {name:"B2",stats:initStats(),players:genPlayers()},
 {name:"B3",stats:initStats(),players:genPlayers()},
 {name:"B4",stats:initStats(),players:genPlayers()}
]
};

let battingTeam,bowlingTeam,group;
let innings={score:0,balls:0,wkts:0,overs:[],players:[],strike:0,nonStrike:1};
let allPlayers=[];

const groupSel=document.getElementById("groupSelect");
const t1=document.getElementById("team1");
const t2=document.getElementById("team2");

groupSel.onchange=populateTeams;
populateTeams();

function populateTeams(){
 t1.innerHTML=t2.innerHTML="";
 groups[groupSel.value].forEach((t,i)=>{
  t1.innerHTML+=`<option value="${i}">${t.name}</option>`;
  t2.innerHTML+=`<option value="${i}">${t.name}</option>`;
 });
}

function startMatch(){
 if(t1.value===t2.value)return alert("Select different teams");
 group=groupSel.value;
 battingTeam=groups[group][t1.value];
 bowlingTeam=groups[group][t2.value];
 startInnings();
}

function startInnings(){
 innings={score:0,balls:0,wkts:0,overs:[],players:JSON.parse(JSON.stringify(battingTeam.players)),strike:0,nonStrike:1};
 loadBatsmen();
 updateUI();
}

function addRuns(r){
 if(innings.balls>=MAX_BALLS)return;
 let p=innings.players[innings.strike];
 p.runs+=r;p.balls++;
 innings.score+=r;innings.balls++;

 let o=Math.floor((innings.balls-1)/6);
 if(!innings.overs[o])innings.overs[o]={balls:[],runs:0};
 innings.overs[o].balls.push(r);
 innings.overs[o].runs+=r;

 if(Math.abs(r)%2===1)[innings.strike,innings.nonStrike]=[innings.nonStrike,innings.strike];
 if(innings.balls%6===0)[innings.strike,innings.nonStrike]=[innings.nonStrike,innings.strike];

 updateUI();
}

function wicket(){
 if(innings.balls>=MAX_BALLS)return;
 innings.players[innings.strike].out=true;
 innings.players[innings.strike].balls++;
 allPlayers.push(innings.players[innings.strike]);
 innings.wkts++;innings.balls++;
 innings.strike=getNext();
 updateUI();
}

function getNext(){
 for(let i=0;i<innings.players.length;i++)
  if(!innings.players[i].out && innings.players[i].balls===0)return i;
 return innings.strike;
}

function switchInnings(){
 saveStats();
 [battingTeam,bowlingTeam]=[bowlingTeam,battingTeam];
 startInnings();
}

function saveStats(){
 battingTeam.stats.rf+=innings.score;
 battingTeam.stats.bf+=innings.balls;
 bowlingTeam.stats.ra+=innings.score;
 bowlingTeam.stats.ba+=innings.balls;
}

function loadBatsmen(){
 let s=document.getElementById("batsmanSelect");
 s.innerHTML="";
 innings.players.forEach((p,i)=>!p.out&&(s.innerHTML+=`<option value="${i}">${p.name}</option>`));
 s.onchange=()=>innings.strike=parseInt(s.value);
}

function updateUI(){
 document.getElementById("score").innerText=`${innings.score}/${innings.wkts}`;
 document.getElementById("balls").innerText=`Balls: ${innings.balls}/42`;
 renderOvers();renderPlayers();renderLive();
}

function renderOvers(){
 let tb=document.getElementById("overBallTable");tb.innerHTML="";
 innings.overs.forEach((o,i)=>tb.innerHTML+=`<tr><td>${i+1}</td><td>${o.balls.join(" ")}</td><td>${o.runs}</td></tr>`);
}

function renderPlayers(){
 let tb=document.getElementById("playerTable");tb.innerHTML="";
 innings.players.forEach(p=>tb.innerHTML+=`<tr><td>${p.name}</td><td>${p.runs}</td><td>${p.balls}</td><td>${p.out?"Yes":"No"}</td></tr>`);
}

function renderLive(){
 let o=Math.floor(innings.balls/6)+"."+innings.balls%6;
 let rr=innings.balls? (innings.score/(innings.balls/6)).toFixed(2):"0.00";
 document.getElementById("lbTeam").innerText=battingTeam.name;
 document.getElementById("lbScore").innerText=`${innings.score}/${innings.wkts}`;
 document.getElementById("lbOvers").innerText=`Overs: ${o}`;
 document.getElementById("lbRR").innerText=`CRR: ${rr}`;
 document.getElementById("lbLastOver").innerText=innings.overs.length?`Last Over: ${innings.overs[innings.overs.length-1].balls.join(" ")}`:"";
}

function exportPDF(){
 html2pdf().from(document.querySelector(".container")).save("KAPL_Scorecard.pdf");
}
