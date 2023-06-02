import React, { useState, useEffect, useCallback } from "react";
import Chip from "./Chip";
import PickModal from "./PickModal";
import ResultsModal from "./ResultsModal";
import {
  generateNumArray,
  computePickValues,
  formatTime,
} from "../StaticFunctions";

const DraftBoard = ({ numRounds, timePerPick, teams }) => {
  const numTeams = teams.length;
  const totalPicks = numRounds * numTeams;

  const [boardInitialized, setBoardInitialized] = useState(false);
  const [draftStatus, setDraftStatus] = useState("active");

  const [currentPick, setCurrentPick] = useState(1);
  const [picks, setPicks] = useState([]);

  const [pickModalActive, setPickModalActive] = useState(false);
  const [pickModalStatus, setPickModalStatus] = useState();
  const [pickModalData, setPickModalData] = useState();

  const [resultsModalActive, setResultsModalActive] = useState(false);

  const [pickTimerActive, setPickTimerActive] = useState(true);
  const [timeOnClock, setTimeOnClock] = useState(timePerPick);

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
        {/* <Label team_name={teams[t_index]} team_number={t_index + 1} /> */}
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
    for (let i = 0; i < picks.length; i++) {
      for (let j = 0; j < picks[i].length; j++) {
        if (picks[i][j].status !== "complete") {
          console.log(picks[i][j].overall + " " + picks[i][j].status);
          setDraftStatus("incomplete");
          return;
        }
      }
    }
    setDraftStatus("finished");
  };

  const handleCloseResultsModal = () => setResultsModalActive(false);

  const draftButton = () => {
    switch (draftStatus) {
      case "active":
        return (
          <input
            type="button"
            value="Toggle Draft"
            onClick={() => setPickTimerActive((current) => !current)}
          />
        );
      case "incomplete":
        return (
          <input type="button" value="Validate Draft" onClick={validateDraft} />
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (pickTimerActive && timeOnClock > 0) {
        setTimeOnClock((prevTime) => prevTime - 1);
      }
      if (timeOnClock <= 0) {
        handleMissedPick();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [pickTimerActive, timeOnClock, handleMissedPick]);

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
          onRequestPickUpdate={handleRequestPickUpdate}
        />
        <ResultsModal
          isOpen={resultsModalActive}
          onClose={handleCloseResultsModal}
          data={picks}
        />
        <div>{buildChips()}</div>
      </div>
    </div>
  );
};

export default DraftBoard;
