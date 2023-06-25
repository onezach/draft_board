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
  const [nextPositionNumbers, setNextPositionNumbers] = useState({
    QB: 1,
    RB: 1,
    WR: 1,
    TE: 1,
    K: 1,
    DST: 1,
  });

  const [pickModalActive, setPickModalActive] = useState(false);
  const [pickModalStatus, setPickModalStatus] = useState();
  const [pickModalData, setPickModalData] = useState();

  const [resultsModalActive, setResultsModalActive] = useState(false);

  const [pickTimerActive, setPickTimerActive] = useState(true);
  const [timeOnClock, setTimeOnClock] = useState(timePerPick);

  const [validationErrors, setValidationErrors] = useState([]);

  const getOptions = (mode, picks, currentPick, draftStatus, posNums) => {
    if (mode === "save") {
      const params = {
        picks: picks,
        currentPick: currentPick,
        numTeams: numTeams,
        teams: teams,
        numRounds: numRounds,
        timePerPick: timePerPick,
        draftStatus: draftStatus,
        nextPositionNumbers: posNums,
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
        <div id={"t" + t_index + 1} className={"Label"}>
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
    let tempPosNums = nextPositionNumbers;

    const confirmNewPick = picks.map((team) =>
      team.map((round) => {
        if (round.overall === pickNumber) {
          if (round.overall === currentPick) {
            setNextPositionNumbers((prev) => ({
              ...prev,
              [pickedPlayerData.position]: prev[pickedPlayerData.position] + 1,
            }));
            tempPosNums[pickedPlayerData.position] =
              tempPosNums[pickedPlayerData.position] + 1;
          }
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
        pickNumber === totalPicks ? "incomplete" : "active",
        tempPosNums
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

  const evaluatePositionNumbers = () => {
    let qb = 1;
    let rb = 1;
    let wr = 1;
    let te = 1;
    let k = 1;
    let dst = 1;

    let temp = picks.map((team) => team.map((round) => round));

    for (let i = 0; i < numRounds; i++) {
      let done = false;
      for (let j = 0; j < numTeams; j++) {
        if (i % 2 === 0) {
          switch (temp[j][i].data.position) {
            case "QB":
              temp[j][i].data.positionNumber = qb;
              qb++;
              break;
            case "RB":
              temp[j][i].data.positionNumber = rb;
              rb++;
              break;
            case "WR":
              temp[j][i].data.positionNumber = wr;
              wr++;
              break;
            case "TE":
              temp[j][i].data.positionNumber = te;
              te++;
              break;
            case "K":
              temp[j][i].data.positionNumber = k;
              k++;
              break;
            case "DST":
              temp[j][i].data.positionNumber = dst;
              dst++;
              break;
            default:
              done = true;
              break;
          }
        } else {
          switch (temp[numTeams - j - 1][i].data.position) {
            case "QB":
              temp[numTeams - j - 1][i].data.positionNumber = qb;
              qb++;
              break;
            case "RB":
              temp[numTeams - j - 1][i].data.positionNumber = rb;
              rb++;
              break;
            case "WR":
              temp[numTeams - j - 1][i].data.positionNumber = wr;
              wr++;
              break;
            case "TE":
              temp[numTeams - j - 1][i].data.positionNumber = te;
              te++;
              break;
            case "K":
              temp[numTeams - j - 1][i].data.positionNumber = k;
              k++;
              break;
            case "DST":
              temp[numTeams - j - 1][i].data.positionNumber = dst;
              dst++;
              break;
            default:
              done = true;
              break;
          }
        }
      }
      if (done) {
        break;
      }
    }

    setPicks(temp);
    setNextPositionNumbers({
      QB: qb,
      RB: rb,
      WR: wr,
      TE: te,
      K: k,
      DST: dst,
    });
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
            <input
              type="button"
              value="Re-evaluate Position Numbers"
              onClick={evaluatePositionNumbers}
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
                      setNextPositionNumbers(r["nextPositionNumbers"]);
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
            onClick={() => {
              setDraftStatus("confirmed");
              fetch(
                "http://localhost:5000/save",
                getOptions(
                  "save",
                  picks,
                  totalPicks,
                  "confirmed",
                  nextPositionNumbers
                )
              )
                .then((r) => r.json())
                .then((r) => console.log(r))
                .catch(() => {});
            }}
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
          nextPositionNumbers={nextPositionNumbers}
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
