'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const util = require ('util');
const mongoose = require('mongoose');




const db = mongoose.connect('mongodb://localhost/nfl_teams');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const teamSchema = new Schema({
     name: String,
     teamId: String,
     seasons: Array
})

const Team = mongoose.model('Team', teamSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  Team.findOne({name: 'Broncos'},(err, team) => {
    res.json(team)
  })
});

app.get('/schedule', async(req, res) => {
  let data = {};
  try {
    const message = validateInputs(req.query)
    if (message) throw message;
    if(req.query.team) {
      const team = await Team.findOne({name: req.query.team})  
      data = formatTeamSchedule(team, req.query.year)
      
    }
    else {
      const teams = await Team.find();
      data = teams.map(team => formatTeamSchedule(team, req.query.year))
    }
    res.json(data)
  }
  catch(e) {
    res.json(e)
  }
});

app.get('/scores', async(req, res) => {
  const period = getPeriod(req.query.period)

  try {
    const message = validateInputs(req.query)
    if (message) throw message;
    if(!req.query.team) throw {message: 'you forgot to specify a team'};
    const team = await Team.findOne({name: req.query.team})
    const byeWeekIndex = team.seasons[0]['2018'].sort((a, b) => a.week - b.week).findIndex(game => game.byeWeek);
    const totalPointsAfterByeWeek = team.seasons[0]['2018'].slice(byeWeekIndex+1)
      .reduce((acc, game) => acc + game[period], 0);

    const averageScoreAfterByeWeek = totalPointsAfterByeWeek/(17-byeWeekIndex+1)

    res.json(averageScoreAfterByeWeek)
  }
  catch(e) {
    res.json(e)
  }
});

function getPeriod(period) {
  if (period == 1) return 'pointQ1'
  if (period == 2) return 'pointQ2'
  if (period == 3) return 'pointQ3'
  if (period == 4) return 'pointQ4'
  if (period == 'OT') return 'pointOT'
  return 'pointTotal'
}

function validateInputs(req) {
  // validate inputs and send helpful message to client
  return false
}

app.set('port', process.env.PORT || 4000);

app.listen(app.get('port'), () => {
  util.log('listening on port ', app.get('port'))
})

function formatTeamSchedule(team, year) {
  if(year) {
    const schedule = team.seasons[0][year]
    return {
      [team.name]: schedule.map(formatGame).sort((a, b) => a.week - b.week)
    }
  }
  else {
    return {
      [team.name]: Object.keys(team.seasons[0]).reduce((total, year) => {
        return {
          ...total,
          [year]: team.seasons[0][year].map(formatGame).sort((a, b) => a.week - b.week)
        }
      }, {})
    }
  }
  
}

const formatGame = game => ({
  week: game.week, 
  opponent: game.opponent, 
  byeWeek: game.byeWeek
})