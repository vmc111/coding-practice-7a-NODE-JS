const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
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

module.exports = app;
