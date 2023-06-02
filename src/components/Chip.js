import React from "react";
import Timer from "./Timer";

const Chip = ({
  pickData,
  onClick,
  timerActive,
  timePerPick,
  onMissedPick,
  draftStatus
}) => {
  const myTeamNumber = pickData.team;
  const myRoundNumber = pickData.round;

  const status = pickData.status;
  let chipClass = "Chip-";

  if (status === "complete") {
    chipClass += pickData.data.position;
  } else {
    chipClass += status;
  }


  return (
    <div
      id={"c" + pickData.string}
      className="Chip-container"
      onClick={() => onClick(myTeamNumber, myRoundNumber)}
    >
      <div className={chipClass}>
        <div className="Chip-pick">
          <div>{pickData.string}</div>
        </div>
        {chipClass === "Chip-onClock" && (
          <Timer
            initialTime={timePerPick}
            isRunning={timerActive}
            onTimesUp={() => onMissedPick()}
          />
        )}
        {status === "complete" && (
          <div className="Chip-name">
            <div>
              {pickData.data.position !== "DST" && pickData.data.firstName[0] + ". " + pickData.data.lastName}
            </div>
            <div>
              {pickData.data.position} - {pickData.data.playerTeam}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chip;
