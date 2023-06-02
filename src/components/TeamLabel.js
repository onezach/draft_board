import React from "react";

const TeamLabel = ({ team_name, team_number }) => (
  <div id={"t" + team_number} className={"Label-double"}>
    <p>{team_name}</p>
  </div>
);

export default TeamLabel;
