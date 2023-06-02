import React from "react";
import ReactModal from "react-modal";

const ResultsModal = ({ isOpen, onClose, data }) => {
  const dataViz = () => {
    return (
      <div style={{ flexDirection: "row", display: "flex" }}>
        {data.map((team, t_idx) => (
          <div key={"rt_" + t_idx}>
            {t_idx + 1}
            {team.map((round, r_idx) => (
              <div key={"rr_" + r_idx}>{JSON.stringify(round.data)}</div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const modalContent = () => {
    return (
      <div>
        {dataViz()}
        <input type="button" value="Close" onClick={onClose} />
      </div>
    );
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          background: "#fff",
          top: "10vh",
          bottom: "10vh",
          left: "7.5vw",
          right: "7.5vw",
          border: "1.5px solid black",
          borderRadius: "12px",
        },
      }}
    >
      {modalContent()}
    </ReactModal>
  );
};

export default ResultsModal;
