import React, { useState } from "react";
import ReactModal from "react-modal";

const ResultsModal = ({ isOpen, onClose, data, teams }) => {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [attemptExport, setAttemptExport] = useState(false);

  const getOptions = () => {
    const params = {
      data: data,
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    };

    return options;
  };

  const dataViz = () => {
    const mappings = data.map((team, t_idx) => (
      <div key={"rt_" + t_idx} className="Results-team-container">
        <div className="Results-team-name">
          <b>{teams[t_idx]}</b>
        </div>
        <div className="Results-team-picks">
          {team.map((round, r_idx) => (
            <div key={"rr_" + r_idx}>
              {r_idx +
                1 +
                ": " +
                round.data.firstName +
                " " +
                round.data.lastName +
                " - " +
                round.data.position}
            </div>
          ))}
        </div>
      </div>
    ));

    return (
      <div style={{ flexDirection: "row", display: "flex" }}>{mappings}</div>
    );
  };

  const modalContent = () => {
    return (
      <div>
        <div>{dataViz()}</div>
        <div>
          <input type="button" value="Close" onClick={onClose} />
          <input type="button" value="Export" onClick={exportData} />
        </div>
        <div>
          {attemptExport &&
            (exportSuccess ? "Exported Successfully" : "Export Unsucessful")}
        </div>
      </div>
    );
  };

  const exportData = () => {
    fetch("http://localhost:5000/export", getOptions())
      .then((r) => r.json())
      .then((r) => {
        setAttemptExport(true);
        setExportSuccess(r["status"]);
      })
      .catch(() => {
        setAttemptExport(true);
        setExportSuccess(false);
      });
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={() => {
        onClose();
        setAttemptExport(false);
        setExportSuccess(false);
      }}
      ariaHideApp={false}
      style={{
        content: {
          background: "#fff",
          top: "12.5vh",
          bottom: "7.5vh",
          left: "5vw",
          right: "5vw",
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
