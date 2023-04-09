const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

// INITIALIZE DATA BASE
let db = null;
const runDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("SERVER RUNNING AT http://localhost:3000");
    });
  } catch (e) {
    console.log(`DataBase Error: ${e.message}`);
  }
};

runDBServer();

// API 1
app.get("/players/", async (request, response) => {
  const playersQuery = `
        SELECT 
            player_id AS playerId, 
            player_name AS playerName 
        FROM player_details;`;

  let playerDetails = await db.all(playersQuery);
  response.send(playerDetails);
});

// API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
        player_id AS playerId, 
        player_name AS playerName 
    FROM player_details 
    WHERE player_id = ${playerId};`;
  let player = await db.get(getPlayerQuery);
  response.send(player);
});

// API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  console.log(request.body);

  const putQuery = `
      UPDATE
          player_details
      SET
          player_name = '${playerName}'
      WHERE
          player_id = ${playerId};`;

  await db.run(putQuery);
  response.send("Player Details Updated");
});

// API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchDetailsQuery = `
    SELECT 
        match_id AS matchId, 
        match, 
        year
    FROM match_details 
    WHERE match_id = ${matchId};`;

  let matchDetails = await db.get(getMatchDetailsQuery);
  response.send(matchDetails);
});

// API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const matchesByPlayerQuery = `
    SELECT 
        match_details.match_id AS matchId, 
        match, 
        year 
    FROM 
        match_details INNER JOIN player_match_score
        ON match_details.match_id = player_match_score.match_id
    WHERE 
        player_match_score.player_id = ${playerId};`;

  let matchesByPlayer = await db.all(matchesByPlayerQuery);
  response.send(matchesByPlayer);
});

// API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const getPlayersOfMatch = `
    SELECT 
        player_details.player_id AS playerId, 
        player_name AS playerName
    FROM player_details INNER JOIN player_match_score 
    ON player_details.player_id = player_match_score.player_id
    WHERE player_match_score.match_id = ${matchId};`;

  let playersList = await db.all(getPlayersOfMatch);
  response.send(playersList);
});

// API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const playerScoresQuery = `
    SELECT 
    player_details.player_id AS playerId, 
    player_details.player_name AS playerName, 
    SUM(player_match_score.score) AS totalScore, 
    SUM(player_match_score.fours) AS totalFours,
    SUM(player_match_score.sixes) AS totalSixes
    FROM 
        player_match_score INNER JOIN player_details 
        ON player_match_score.player_id = player_details.player_id
    WHERE 
        player_match_score.player_id = ${playerId}
    GROUP BY
        player_match_score.player_id;`;

  let playerStats = await db.get(playerScoresQuery);
  response.send(playerStats);
});

module.exports = app;
