# Simple Fantasy Football Draft Board
Self-contained fantasy football league draft board, customizable by number of teams, team names, number of rounds, and time per pick. The intent for this draft board program is that it would be used in an in-person setting in place of a traditional paper board or white board.

## Initialization
For starters, boot up the draft program using `npm start` from within the src/ folder. Once the program is running, you will be prompted to either enter how many teams will be in the draft or import from your last save (see Flask Server section). Once your number of teams is confirmed, you will then be prompted to edit the teams' names, set the number of rounds for your draft, and set the time (in seconds) per pick. Once each of these fields is confirmed, you will then be able to click the "Start Draft!" button, which will take you to the draft board.

## Drafting
The draft clock will be started immediately upon starting the draft. At any point, you may pause the draft clock by clicking the "Pause draft" button at the top of the screen. Once you are ready to resume drafting, simply click the same button (it will now say "Resume draft").

### Making Picks
The current pick is indicated in gold. In order to make a selection, click on the active pick and fill out the required fields. The pick selection process provides a small degree of validation to make sure that all fields are filled out and that this is not a duplicate selection. Beyond that, it is up to you, for the time being, to ensure that your player information is correct. The draft clock pauses whenever you are actively entering pick information. However, if you are looking at the draft board and the clock expires, the active pick will be marked red for "missing", and the next pick will be put on the clock. 

### Updating Picks
In the event of missing picks or slight mistakes throughout the draft, there is also the option to update previous picks. If it is a missing pick, clicking on it will bring up the same modal as a regular pick, and you may fill out the fields accordingly. If it is a completed pick that needs updating, clicking on it will bring up a modal containing the pick's current information. 

### Finishing the draft
Once the clock runs out on or the pick is made for the last pick in the draft, the draft clock will disappear. At this point, you have the ability to validate the draft. The validation at this stage ensures that there is a selection for every pick slot on the board. If there are any missing picks, there will be corresponding error messages at the top of the screen. Once you are able to validate the draft successfully, you will be given the opportunity to make any last changes to the draft, if you so desire. Once you are done, click the confirm button. On this last screen, you can scroll through the full confirmed draft board as you please, or you may click the "View results" button to see a compacted view of all the teams. From here, you may also export the results of the draft as a CSV if you so wish (see Flask Server section for more details).

## Flask Server
This ReactJS project can also link to a Flask Server (located in server/server.py) to provide automatic saving. Just start the Python program, and the work will be done behind the scenes. In the event of an accidental refresh where you are taking back to the initialization screen, you may import your previous settings immediately by clicking the "Import from last save" button. This will take you to the draft board right away, set up as it was before. However, the draft board will start out blank. If you would like to re-populate the draft board with what you had before, just click the "Import from last save" button at the top of the screen. From there, it is back to normal functionality. At the end of the draft, as mentioned above, you have option to export the draft as a CSV. Just click the "Export" button, and a CSV containing all of this draft's pick data will be generated in your directory (draft_board/results.csv).
