Node version 8.11.3

to start the server, in the terminal from the project root type: node src  
the server will start on localhost:4000

DATABASE

create a mongo database and run the node project found at https://github.com/jasontenbrink/footBallDataDump to polulate the database
see https://github.com/jasontenbrink/footBallDataDump for further instructions on database creation

when entering query parameters use team nicknames ("Broncos", "Falcons" etc).  Unfortunately there is no validation
to make sure the team name was entered correctly :-(

example queries to the /scores api:
localhost:4000/scores?team=Falcons&period=1
  - a team is required, period is optional

localhost:4000/schedule?team=Broncos&year=2018
  - both team and year are optional
