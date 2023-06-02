// import "./App.css";
import "./App.scss";
import DraftBoard from "./components/DraftBoard";

function App() {
  const numRounds = 3;
  // const numTeams = 12;

  // const teams = [
  //   "Team 1",
  //   "Team 2",
  //   "Team 3",
  //   "Team 4",
  //   "Team 5",
  //   "Team 6",
  //   "Team 7",
  //   "Team 8",
  //   "Team 9",
  //   "Team 10",
  //   "Team 11",
  //   "Team 12",
  // ];

  const teamsSmall = ["Team 1", "Team 2"];

  const timePerPick = 10; // seconds

  return (
    <div className="App-container">
      <DraftBoard
        numRounds={numRounds}
        teams={teamsSmall}
        timePerPick={timePerPick}
      />
    </div>
  );
}

export default App;
