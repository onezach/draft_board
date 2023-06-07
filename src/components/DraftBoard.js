import React, { useState, useEffect, useCallback } from "react";
import Chip from "./Chip";
import PickModal from "./PickModal";
import ResultsModal from "./ResultsModal";
import {
  generateNumArray,
  computePickValues,
  formatTime,
} from "../StaticFunctions";

const DraftBoard = ({ numRounds, timePerPick, teams, isImport }) => {
  const numTeams = teams.length;
  const totalPicks = numRounds * numTeams;

  const [boardInitialized, setBoardInitialized] = useState(false);
  const [draftStatus, setDraftStatus] = useState("active");
  const [draftPaused, setDraftPaused] = useState(false);

  const [currentPick, setCurrentPick] = useState(1);
  const [picks, setPicks] = useState([]);

  const [pickModalActive, setPickModalActive] = useState(false);
  const [pickModalStatus, setPickModalStatus] = useState();
  const [pickModalData, setPickModalData] = useState();

  const [resultsModalActive, setResultsModalActive] = useState(false);

  const [pickTimerActive, setPickTimerActive] = useState(true);
  const [timeOnClock, setTimeOnClock] = useState(timePerPick);

  const [validationErrors, setValidationErrors] = useState([]);

  const getOptions = (mode, picks, currentPick, draftStatus) => {
    if (mode === "save") {
      const params = {
        picks: picks,
        currentPick: currentPick,
        numTeams: numTeams,
        teams: teams,
        numRounds: numRounds,
        timePerPick: timePerPick,
        draftStatus: draftStatus,
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      };

      return options;
    } else if (mode === "import") {
      const options = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };

      return options;
    }
  };

  const initializeBoard = () => {
    let teamsArr = generateNumArray(1, numTeams);
    let roundsArr = generateNumArray(1, numRounds);

    const data = teamsArr.map((team_number) => {
      return roundsArr.map((round_number) =>
        computePickValues(round_number, team_number, numTeams)
      );
    });

    // first pick on the clock
    data[0][0].status = "onClock";

    setBoardInitialized(true);
    setPicks(data);
  };

  const buildChips = () => {
    if (!boardInitialized) {
      initializeBoard();
    }

    return picks.map((team, t_index) => (
      <div key={"team" + (t_index + 1) + "_row"} className="Row-container">
        <div id={"t" + t_index + 1} className={"Label-double"}>
          <p>{teams[t_index]}</p>
        </div>
        {team.map((round, r_index) => (
          <Chip
            pickData={round}
            onClick={handleChipClick}
            draftStatus={draftStatus}
            key={"chip" + (r_index + 1) + "." + (t_index + 1)}
          />
        ))}
      </div>
    ));
  };

  const handleChipClick = (team, round) => {
    const chipData = picks[team - 1][round - 1];
    setPickModalStatus(chipData.status);
    setPickModalActive(true);
    setPickModalData(chipData);
    if (draftStatus === "active") {
      setPickTimerActive(false);
    }
  };

  const handleClosePickModal = () => {
    setPickModalActive(false);
    setPickModalStatus();
    setPickModalData();
    if (draftStatus === "active") {
      setPickTimerActive(true);
    }
  };

  const advanceCurrentPick = useCallback(() => {
    if (currentPick < totalPicks) {
      setCurrentPick((current) => current + 1);
      setTimeOnClock(timePerPick);
    } else {
      setPickTimerActive(false);
      setDraftStatus("incomplete");
    }
  }, [currentPick, timePerPick, totalPicks]);

  const handleConfirmedPick = (pickedPlayerData, pickNumber = currentPick) => {
    const confirmNewPick = picks.map((team) =>
      team.map((round) => {
        if (round.overall === pickNumber) {
          return { ...round, status: "complete", data: pickedPlayerData };
        } else if (
          pickNumber === currentPick &&
          round.overall === currentPick + 1
        ) {
          return { ...round, status: "onClock" };
        } else {
          return round;
        }
      })
    );

    fetch(
      "http://localhost:5000/save",
      getOptions(
        "save",
        confirmNewPick,
        pickNumber === currentPick
          ? Math.min(currentPick + 1, totalPicks)
          : currentPick,
        pickNumber === totalPicks ? "incomplete" : "active"
      )
    )
      .then((r) => r.json())
      .then((r) => console.log(r))
      .catch(() => {});

    setPicks(confirmNewPick);
    handleClosePickModal();

    if (pickNumber === currentPick || draftStatus === "incomplete") {
      advanceCurrentPick();
    }
  };

  const handleMissedPick = useCallback(() => {
    const missedPick = picks.map((team) =>
      team.map((round) => {
        if (round.overall === currentPick) {
          return { ...round, status: "missed" };
        } else if (round.overall === currentPick + 1) {
          return { ...round, status: "onClock" };
        } else {
          return round;
        }
      })
    );

    setPicks(missedPick);
    advanceCurrentPick();
  }, [advanceCurrentPick, currentPick, picks]);

  const handleRequestPickUpdate = () => {
    setPickModalStatus("update");
  };

  const validateDraft = () => {
    let errors = [];

    for (let i = 0; i < picks.length; i++) {
      for (let j = 0; j < picks[i].length; j++) {
        if (picks[i][j].status !== "complete") {
          // console.log("No pick selection at " + picks[i][j].string);
          errors.push("No pick selection at " + picks[i][j].string);
        }
      }
    }
    errors.length === 0
      ? setDraftStatus("finished")
      : setDraftStatus("incomplete");
    setValidationErrors(errors);
  };

  const handleCloseResultsModal = () => setResultsModalActive(false);

  const draftButton = () => {
    switch (draftStatus) {
      case "active":
        return (
          <div>
            <input
              type="button"
              value={draftPaused ? "Resume draft" : "Pause draft"}
              onClick={() => setDraftPaused((current) => !current)}
            />
            {isImport && (
              <input
                type="button"
                value={"Import from Last Save"}
                onClick={() =>
                  fetch("http://localhost:5000/import", getOptions("import"))
                    .then((r) => r.json())
                    .then((r) => {
                      setPicks(r["picks"]);
                      setCurrentPick(r["currentPick"]);
                      setDraftStatus(r["draftStatus"]);
                    })
                    .catch(() => {})
                }
              />
            )}
          </div>
        );
      case "incomplete":
        return (
          <div>
            <div>
              {validationErrors.map((error, e_idx) => (
                <div style={{ color: "red" }} key={e_idx}>
                  *{error}
                </div>
              ))}
            </div>
            <div>
              <input
                type="button"
                value="Validate Draft"
                onClick={validateDraft}
              />
            </div>
          </div>
        );
      case "finished":
        return (
          <input
            type="button"
            value="Confirm Draft"
            onClick={() => setDraftStatus("confirmed")}
          />
        );
      case "confirmed":
        return (
          <input
            type="button"
            value="View Results"
            onClick={() => setResultsModalActive(true)}
          />
        );
      default:
    }
  };

  // timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (pickTimerActive && !draftPaused && timeOnClock > 0) {
        setTimeOnClock((prevTime) => prevTime - 1);
      }
      if (timeOnClock <= 0 && draftStatus === "active") {
        handleMissedPick();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    pickTimerActive,
    timeOnClock,
    handleMissedPick,
    draftPaused,
    draftStatus,
  ]);

  return (
    <div>
      {draftButton()}
      {draftStatus === "confirmed" && <div>Draft finished</div>}
      {draftStatus === "active" && (
        <div className={timeOnClock > 10 ? "Timer" : "Timer-low"}>
          <div>{formatTime(timeOnClock)}</div>
        </div>
      )}
      <div className="Board">
        <PickModal
          isOpen={pickModalActive}
          onClose={handleClosePickModal}
          onConfirm={handleConfirmedPick}
          modalStatus={pickModalStatus}
          modalPickData={pickModalData}
          picksData={picks}
          onRequestPickUpdate={handleRequestPickUpdate}
          draftStatus={draftStatus}
        />
        <ResultsModal
          isOpen={resultsModalActive}
          onClose={handleCloseResultsModal}
          data={picks}
          teams={teams}
        />
        <div>{buildChips()}</div>
      </div>
    </div>
  );
};

export default DraftBoard;
