import "./App.scss";
import DraftBoard from "./components/DraftBoard";
import React, { useState } from "react";

function App() {
  const [teams, setTeams] = useState([]);
  const [teamsConfirmed, setTeamsConfirmed] = useState(false);
  const [numTeams, setNumTeams] = useState(0);
  const [numTeamsConfirmed, setNumTeamsConfirmed] = useState(false);
  const [numRounds, setNumRounds] = useState(0);
  const [numRoundsConfirmed, setNumRoundsConfirmed] = useState(false);
  const [timePerPick, setTimePerPick] = useState(0);
  const [timeConfirmed, setTimeConfirmed] = useState(false);

  const [isImport, setIsImport] = useState(false);
  const [startDraft, setStartDraft] = useState(false);

  const getOptions = () => {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    return options;
  };

  const updateTeams = (newValue, idx) => {
    const updatedArray = teams.map((team, i) => {
      if (idx === i) {
        return newValue;
      } else {
        return team;
      }
    });
    setTeams(updatedArray);
  };

  const handleInput = (input, newValue, idx) => {
    switch (input) {
      case "num_teams":
        setNumTeams(newValue);
        break;
      case "teams":
        updateTeams(newValue, idx);
        break;
      case "rounds":
        setNumRounds(newValue);
        break;
      case "time":
        setTimePerPick(newValue);
        break;
      default:
    }
  };

  // get numTeams
  const getNumTeams = () => {
    return (
      <div className="Init-number-input-container">
        <div className="Init-container">
          <label htmlFor="numTeams">Number of teams: </label>
          <input
            id="numTeams"
            name="numTeams"
            className="Init-number-input"
            size={4}
            value={numTeams}
            disabled={numTeamsConfirmed}
            onChange={(e) => handleInput("num_teams", e.target.value)}
          />
        </div>
        {numTeams > 0 && !numTeamsConfirmed && (
          <input
            id="confirm_num_teams"
            name="comfirm_num_teams"
            type="button"
            value="Confirm"
            onClick={() => {
              setNumTeamsConfirmed(true);
              initializeTeams();
            }}
          />
        )}
      </div>
    );
  };

  const initializeTeams = () => {
    let initArray = [];
    for (let i = 0; i < numTeams; i++) {
      initArray.push("Team " + (i + 1));
    }
    setTeams(initArray);
  };

  const getTeams = () => {
    const inputMap = teams.map((team_val, idx) => {
      return (
        <div key={"ti_" + idx} className="Init-container">
          <label htmlFor={"ti_" + idx}>Team {idx + 1}: </label>
          <div>
            <input
              id={"ti_" + idx}
              name={"ti_" + idx}
              value={team_val}
              disabled={teamsConfirmed}
              onChange={(e) => handleInput("teams", e.target.value, idx)}
            />
          </div>
        </div>
      );
    });

    return (
      <div className="Init-teams-section">
        <div className="Init-teams-map">{inputMap}</div>
        <div>
          {checkAllTeamsFilled() && !teamsConfirmed && (
            <input
              id="confirm_teams"
              name="confirm_teams"
              type="button"
              value="Confirm"
              onClick={() => setTeamsConfirmed(true)}
            />
          )}
        </div>
      </div>
    );
  };

  // get rounds
  const getRounds = () => {
    return (
      <div className="Init-number-input-container">
        <div className="Init-container">
          <label htmlFor="num_rounds_i">Number of Rounds: </label>
          <input
            id="num_rounds_i"
            name="num_rounds_i"
            value={numRounds}
            size={4}
            className="Init-number-input"
            disabled={numRoundsConfirmed}
            onChange={(e) => handleInput("rounds", e.target.value)}
          />
        </div>
        <div>
          {numRounds > 0 && !numRoundsConfirmed && (
            <input
              id="confirm_num_rounds"
              name="confirm_num_rounds"
              type="button"
              value="Confirm"
              onClick={() => setNumRoundsConfirmed(true)}
            />
          )}
        </div>
      </div>
    );
  };

  // get time
  const getTime = () => {
    return (
      <div className="Init-number-input-container">
        <div className="Init-container">
          <label htmlFor="time_i">Time Per Pick: </label>
          <input
            id="time_i"
            name="time_i"
            value={timePerPick}
            size={4}
            disabled={timeConfirmed}
            className="Init-number-input"
            onChange={(e) => handleInput("time", e.target.value)}
          />
        </div>
        <div>
          {timePerPick > 0 && !timeConfirmed && (
            <input
              id="confirm_time"
              name="confirm_time"
              type="button"
              value="Confirm"
              onClick={() => setTimeConfirmed(true)}
            />
          )}
        </div>
      </div>
    );
  };

  const initializeDraft = () => {
    return (
      <div className="Init">
        {!numTeamsConfirmed && (
          <div>
            {getNumTeams()}
            <div className="Init-import">
              <input
                id="import"
                name="import"
                value="Import from Last Save"
                type="button"
                onClick={() => {
                  fetch("http://localhost:5000/import", getOptions())
                    .then((r) => r.json())
                    .then((r) => {
                      setNumTeams(r["numTeams"]);
                      setTeams(r["teams"]);
                      setNumRounds(r["numRounds"]);
                      setTimePerPick(r["timePerPick"]);
                      setNumTeamsConfirmed(true);
                      setTeamsConfirmed(true);
                      setNumRoundsConfirmed(true);
                      setTimeConfirmed(true);
                      setIsImport(true);
                      setStartDraft(true);
                    })
                    .catch(() => {});
                }}
              />
            </div>
          </div>
        )}
        <div className={numTeamsConfirmed ? "Init-section" : ""}>
          {numTeamsConfirmed && getTeams()}
        </div>
        <div className={teamsConfirmed ? "Init-section" : ""}>
          {teamsConfirmed && getRounds()}
        </div>
        <div className={numRoundsConfirmed ? "Init-section" : ""}>
          {numRoundsConfirmed && getTime()}
        </div>
      </div>
    );
  };

  const checkAllTeamsFilled = () => {
    for (let i = 0; i < teams.length; i++) {
      if (teams[i] === "") {
        return false;
      }
    }
    return true;
  };

  const startButton = () => (
    <div>
      <input
        id="startButton"
        name="startButton"
        value="Start Draft!"
        className="Start-button"
        type="button"
        onClick={() => setStartDraft(true)}
      />
    </div>
  );

  return (
    <div className="App-container">
      {!startDraft && initializeDraft()}
      {!startDraft &&
        numTeamsConfirmed &&
        teamsConfirmed &&
        numRoundsConfirmed &&
        timeConfirmed &&
        startButton()}
      {startDraft && (
        <DraftBoard
          numRounds={numRounds}
          teams={teams}
          timePerPick={timePerPick}
          isImport={isImport}
        />
      )}
    </div>
  );
}

export default App;
