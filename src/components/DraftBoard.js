import React, { useState } from "react";
import Label from "./TeamLabel";
import Chip from "./Chip";
import PickModal from "./PickModal";
import { generateNumArray, computePickValues } from "../Functions";

const DraftBoard = ({ numRounds, timePerPick, teams }) => {
  const [boardInitialized, setBoardInitialized] = useState(false);
  const [draftStatus, setDraftStatus] = useState("active");

  const numTeams = teams.length;
  const totalPicks = numRounds * numTeams;

  const [currentPick, setCurrentPick] = useState(1);
  const [picks, setPicks] = useState([]);

  const [modalActive, setModalActive] = useState(false);
  const [modalStatus, setModalStatus] = useState();
  const [modalPickData, setModalPickData] = useState();

  const [timerActive, setTimerActive] = useState(true);

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
        <Label team_name={teams[t_index]} team_number={t_index + 1} />
        {team.map((round, r_index) => (
          <Chip
            pickData={round}
            onClick={handleChipClick}
            timerActive={timerActive}
            timePerPick={timePerPick}
            onMissedPick={handleMissedPick}
            draftStatus={draftStatus}
            key={"chip" + (r_index + 1) + "." + (t_index + 1)}
          />
        ))}
      </div>
    ));
  };

  const handleChipClick = (team, round) => {
    const chipData = picks[team - 1][round - 1];
    setModalStatus(chipData.status);
    setModalActive(true);
    setModalPickData(chipData);
    setTimerActive(false);
  };

  const handleCloseModal = () => {
    setModalActive(false);
    setModalStatus();
    setModalPickData();
    setTimerActive(true);
  };

  const advanceCurrentPick = () => {
    if (currentPick < totalPicks) {
      setCurrentPick((current) => current + 1);
    } else {
      setTimerActive(false);
      setDraftStatus("incomplete");
    }
  };

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
    handleCloseModal();

    if (pickNumber === currentPick || draftStatus === "incomplete") {
      advanceCurrentPick();
    }
  };

  const handleMissedPick = () => {
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
    handleCloseModal();
    advanceCurrentPick();
  };

  const handleRequestPickUpdate = () => {
    setModalStatus("update");
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

  const draftButton = () => {
    switch (draftStatus) {
      case "active":
        return (
          <input
            type="button"
            value="Toggle Draft"
            onClick={() => setTimerActive((current) => !current)}
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
      default:
    }
  };

  return (
    <div className="Board">
      {draftButton()}
      {draftStatus === "confirmed" && <div>Draft finished</div>}
      <PickModal
        isOpen={modalActive}
        onClose={handleCloseModal}
        onConfirm={handleConfirmedPick}
        modalStatus={modalStatus}
        modalPickData={modalPickData}
        onRequestPickUpdate={handleRequestPickUpdate}
      />
      {/* {draftStatus === "active" && <div>{buildChips()}</div>} */}
      <div>{buildChips()}</div>
    </div>
  );
};

export default DraftBoard;
