import React, { useState } from "react";
import ReactModal from "react-modal";

const PickModal = ({
  isOpen,
  modalStatus,
  onConfirm,
  onClose,
  modalPickData,
  onRequestPickUpdate,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [team, setTeam] = useState("");
  const [position, setPosition] = useState("");

  const handleInput = (input, newValue) => {
    switch (input) {
      case "fname":
        setFirstName(newValue);
        break;
      case "lname":
        setLastName(newValue);
        break;
      case "team":
        setTeam(newValue);
        break;
      case "position":
        setPosition(newValue);
        break;
      default:
    }
  };

  const clearInputs = () => {
    setFirstName("");
    setLastName("");
    setTeam("");
    setPosition("");
  };

  const requestPickUpdate = () => {
    onRequestPickUpdate();
    setFirstName(modalPickData.data.firstName);
    setLastName(modalPickData.data.lastName);
    setTeam(modalPickData.data.playerTeam);
    setPosition(modalPickData.data.position);
  };

  const modalContent = () => {
    if (
      modalStatus === "onClock" ||
      modalStatus === "update" ||
      modalStatus === "missed"
    ) {
      return (
        <div>
          {position !== "DST" && (
            <div>
              <label htmlFor="fname">First Name </label>
              <input
                id="fname"
                name="fname"
                size={12}
                value={firstName}
                onChange={(e) => handleInput("fname", e.target.value)}
              />
            </div>
          )}
          {position !== "DST" && (
            <div>
              <label htmlFor="lname"> Last Name </label>
              <input
                id="lname"
                name="lname"
                size={12}
                value={lastName}
                onChange={(e) => handleInput("lname", e.target.value)}
              />
            </div>
          )}

          <div>
            <label htmlFor="team">Team </label>
            <select
              id="team"
              name="team"
              value={team}
              onChange={(e) => handleInput("team", e.target.value)}
            >
              <option value=""></option>
              <option value="AZ">AZ</option>
              <option value="ATL">ATL</option>
              <option value="BAL">BAL</option>
              <option value="BUF">BUF</option>
              <option value="CAR">CAR</option>
              <option value="CHI">CHI</option>
              <option value="CIN">CIN</option>
              <option value="CLE">CLE</option>
              <option value="DAL">DAL</option>
              <option value="DEN">DEN</option>
              <option value="DET">DET</option>
              <option value="GB">GB</option>
              <option value="HOU">HOU</option>
              <option value="IND">IND</option>
              <option value="JAX">JAX</option>
              <option value="KC">KC</option>
              <option value="LV">LV</option>
              <option value="LAC">LAC</option>
              <option value="LAR">LAR</option>
              <option value="MIA">MIA</option>
              <option value="MIN">MIN</option>
              <option value="NE">NE</option>
              <option value="NO">NO</option>
              <option value="NYG">NYG</option>
              <option value="NYJ">NYJ</option>
              <option value="PHI">PHI</option>
              <option value="PIT">PIT</option>
              <option value="SF">SF</option>
              <option value="SEA">SEA</option>
              <option value="TB">TB</option>
              <option value="TEN">TEN</option>
              <option value="WAS">WAS</option>
            </select>
          </div>
          <div>
            <label htmlFor="position">Position </label>
            <select
              id="position"
              name="position"
              value={position}
              onChange={(e) => handleInput("position", e.target.value)}
            >
              <option value=""></option>
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
              <option value="K">K</option>
              <option value="DST">D/ST</option>
            </select>
          </div>
          <div>
            <input
              type="button"
              value="Submit"
              onClick={() => {
                const data = {
                  firstName: firstName,
                  lastName: lastName,
                  playerTeam: team,
                  position: position,
                };
                if (modalStatus === "onClock") {
                  onConfirm(data);
                } else {
                  onConfirm(data, modalPickData.overall);
                  //   onUpdatePick(modalPickData.overall, data);
                }
                clearInputs();
              }}
            />
          </div>
        </div>
      );
    } else if (modalStatus === "complete") {
      return (
        <div>
          <p>{JSON.stringify(modalPickData)}</p>
          <input
            type="button"
            value="Update Pick"
            onClick={requestPickUpdate}
          />
        </div>
      );
    }
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => {
        onClose();
        clearInputs();
      }}
      style={{
        content: {
          background: "#fff",
          top: "20vh",
          bottom: "20vh",
          left: "35vw",
          right: "35vw",
          border: "1.5px solid black",
          borderRadius: "15px",
        },
      }}
    >
      {modalContent()}
    </ReactModal>
  );
};

export default PickModal;
