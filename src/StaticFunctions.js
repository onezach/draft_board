/**
 *
 * @param {Number} start
 * @param {Number} num
 * @returns {[Number]} Array of numbers starting from start and ending with num
 */
export const generateNumArray = (start, num) => {
  let arr = [];

  for (let i = start; i <= num; i++) {
    arr.push(i);
  }

  return arr;
};

/**
 *
 * @param {Number} round_number
 * @param {Number} team_number
 * @returns {{round: Number, pick: Number, overall: Number, team: String, string: String, status: String, data: {firstName: String, lastName: String, playerTeam: String, position: String, positionNumber: Number}}} Pick position data
 */
export const computePickValues = (round_number, team_number, numTeams) => {
  let string = round_number + ".";
  let pick = 0;
  let overallPick = 0;
  let status = "upcoming";
  let data = { firstName: "", lastName: "", playerTeam: "", position: "", positionNumber: 0 };

  if (round_number % 2 === 1) {
    pick = team_number;
    string += pick;
    overallPick = (round_number - 1) * numTeams + team_number;
    string += " (" + overallPick + ")";
  } else {
    pick = numTeams + 1 - team_number;
    string += pick;
    overallPick = round_number * numTeams - (team_number - 1);
    string += " (" + overallPick + ")";
  }
  return {
    round: round_number,
    pick: pick,
    overall: overallPick,
    team: team_number,
    string: string,
    status: status,
    data: data,
  };
};

export const formatTime = (time) => {
  const minutes = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};