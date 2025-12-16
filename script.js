/**************** CONFIG ****************/
const MAX_OVERS = 7;
const BALLS_PER_OVER = 6;
const MAX_BALLS = MAX_OVERS * BALLS_PER_OVER;
const PLAYERS_PER_TEAM = 8;

/**************** DATA ****************/
function generatePlayers() {
    let arr = [];
    for (let i = 1; i <= PLAYERS_PER_TEAM; i++) {
        arr.push({ name: "Player " + i, runs: 0, balls: 0, out: false });
    }
    return arr;
}

const groups = {
    A: [
        { name: "A1", stats: initStats(), players: generatePlayers() },
        { name: "A2", stats: initStats(), players: generatePlayers() },
        { name: "A3", stats: initStats(), players: generatePlayers() },
        { name: "A4", stats: initStats(), players: generatePlayers() }
    ],
    B: [
        { name: "B1", stats: initStats(), players: generatePlayers() },
        { name: "B2", stats: initStats(), players: generatePlayers() },
        { name: "B3", stats: initStats(), players: generatePlayers() },
        { name: "B4", stats: initStats(), players: generatePlayers() }
    ]
};

function initStats() {
    return {
        matches: 0,
        wins: 0,
        losses: 0,
        points: 0,
        runsFor: 0,
        ballsFor: 0,
        runsAgainst: 0,
        ballsAgainst: 0
    };
}

let matchHistory = [];

/**************** MATCH STATE ****************/
let currentGroup = null;
let battingTeam = null;
let bowlingTeam = null;

let innings = {
    score: 0,
    balls: 0,
    wickets: 0,
    overs: [],
    players: [],
    striker: 0
};

/**************** DOM ****************/
const groupSelect = document.getElementById("groupSelect");
const team1Sel = document.getElementById("team1");
const team2Sel = document.getElementById("team2");
const batsmanSelect = document.getElementById("batsmanSelect");

/**************** INIT ****************/
groupSelect.onchange = populateTeams;
populateTeams();
renderPointsTable();

function populateTeams() {
    team1Sel.innerHTML = "";
    team2Sel.innerHTML = "";
    groups[groupSelect.value].forEach((t, i) => {
        team1Sel.innerHTML += `<option value="${i}">${t.name}</option>`;
        team2Sel.innerHTML += `<option value="${i}">${t.name}</option>`;
    });
}

/**************** MATCH CONTROL ****************/
function startMatch() {
    if (team1Sel.value === team2Sel.value) {
        alert("Select two different teams");
        return;
    }

    currentGroup = groupSelect.value;
    battingTeam = groups[currentGroup][team1Sel.value];
    bowlingTeam = groups[currentGroup][team2Sel.value];

    startInnings(battingTeam);
}

function startInnings(team) {
    innings.score = 0;
    innings.balls = 0;
    innings.wickets = 0;
    innings.overs = [];
    innings.players = JSON.parse(JSON.stringify(team.players));
    innings.striker = 0;

    loadBatsmen();
    updateUI();
}

function switchInnings() {
    saveInningsResult();

    let temp = battingTeam;
    battingTeam = bowlingTeam;
    bowlingTeam = temp;

    startInnings(battingTeam);
}

/**************** SCORING ****************/
function addRuns(runs) {
    if (innings.balls >= MAX_BALLS) return;

    let p = innings.players[innings.striker];
    p.runs += runs;
    p.balls++;

    innings.score += runs;
    innings.balls++;

    let overIndex = Math.floor((innings.balls - 1) / 6);
    if (!innings.overs[overIndex]) {
        innings.overs[overIndex] = { runs: 0, balls: 0 };
    }
    innings.overs[overIndex].runs += runs;
    innings.overs[overIndex].balls++;

    updateUI();
}

function wicket() {
    if (innings.balls >= MAX_BALLS) return;

    innings.players[innings.striker].out = true;
    innings.players[innings.striker].balls++;
    innings.wickets++;
    innings.balls++;

    innings.striker = getNextBatsman();
    loadBatsmen();
    updateUI();
}

function getNextBatsman() {
    for (let i = 0; i < innings.players.length; i++) {
        if (!innings.players[i].out && innings.players[i].balls === 0) return i;
    }
    return innings.striker;
}

/**************** UI ****************/
function loadBatsmen() {
    batsmanSelect.innerHTML = "";
    innings.players.forEach((p, i) => {
        if (!p.out) batsmanSelect.innerHTML += `<option value="${i}">${p.name}</option>`;
    });
    batsmanSelect.onchange = () => innings.striker = parseInt(batsmanSelect.value);
}

function updateUI() {
    document.getElementById("score").innerText = `${innings.score}/${innings.wickets}`;
    document.getElementById("balls").innerText = `Balls: ${innings.balls} / ${MAX_BALLS}`;
    renderPlayers();
}

function renderPlayers() {
    let tb = document.getElementById("playerTable");
    tb.innerHTML = "";
    innings.players.forEach(p => {
        tb.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.runs}</td>
            <td>${p.balls}</td>
            <td>${p.out ? "Yes" : "No"}</td>
        </tr>`;
    });
}

/**************** STATS & POINTS ****************/
function saveInningsResult() {
    battingTeam.stats.runsFor += innings.score;
    battingTeam.stats.ballsFor += innings.balls;

    bowlingTeam.stats.runsAgainst += innings.score;
    bowlingTeam.stats.ballsAgainst += innings.balls;
}

function endMatch() {
    saveInningsResult();

    battingTeam.stats.matches++;
    bowlingTeam.stats.matches++;

    if (battingTeam.stats.runsFor > bowlingTeam.stats.runsFor) {
        battingTeam.stats.wins++;
        battingTeam.stats.points += 2;
        bowlingTeam.stats.losses++;
    } else {
        bowlingTeam.stats.wins++;
        bowlingTeam.stats.points += 2;
        battingTeam.stats.losses++;
    }

    renderPointsTable();
}

function calcNRR(t) {
    if (t.stats.ballsFor === 0 || t.stats.ballsAgainst === 0) return "0.00";
    let forRate = t.stats.runsFor / (t.stats.ballsFor / 6);
    let againstRate = t.stats.runsAgainst / (t.stats.ballsAgainst / 6);
    return (forRate - againstRate).toFixed(2);
}

function renderPointsTable() {
    let body = document.getElementById("pointsTable");
    body.innerHTML = "";

    ["A", "B"].forEach(g => {
        groups[g].sort((a, b) => b.stats.points - a.stats.points || calcNRR(b) - calcNRR(a));
        groups[g].forEach(t => {
            body.innerHTML += `
            <tr>
                <td>${t.name}</td>
                <td>${t.stats.matches}</td>
                <td>${t.stats.wins}</td>
                <td>${t.stats.losses}</td>
                <td>${t.stats.points}</td>
                <td>${calcNRR(t)}</td>
            </tr>`;
        });
    });
}

/**************** PDF EXPORT ****************/
function exportPDF() {
    let element = document.querySelector(".container");
    html2pdf().from(element).save("Scorecard.pdf");
}
