// (function () {

const DEFAULT_K = 20;

class Elo {
  eloLookup = {};
  matchRecord = {};

  getWinProbabilty(ratingA, ratingB){
    let qA = exp10(ratingA/400);
    let qB = exp10(ratingB/400);
    let expectedA = qA/(qA + qB);
    let expectedB = 1 - expectedA;
    return ([expectedA, expectedB]);
  }

  get_elo(player, elo_lookup){
    if(elo_lookup[player] == null ){ // may be null, undefined
        elo_lookup[player] = 1500; // create the new player
    }
    return elo_lookup[player];
  }

  getExpectedScoreList_(playerCount, 
    positionSortedPlayerEloList, 
    positionSortedExpectedScoreList, 
    k=DEFAULT_K){
    let playerEloList = positionSortedPlayerEloList;
    let expectedScoreList = positionSortedExpectedScoreList;
    for (let ii = 0; ii < playerCount; ii++){
      for (let jj = ii+1; jj < playerCount; jj++){
        let winProbPair = this.getWinProbabilty(playerEloList[ii], playerEloList[jj]);
        expectedScoreList[ii] += Math.round(winProbPair[0]*k)/k;
        expectedScoreList[jj] += Math.round(winProbPair[1]*k)/k;
      }
    }
  }

  getScoreChange_(playerCount, expectedScoreList, chageList, k=DEFAULT_K){
    for (let ii = 0; ii < playerCount; ii++){
      let actualScore = playerCount - ii - 1;
      let expectedScore = expectedScoreList[ii];
      chageList[ii] += Math.round((actualScore - expectedScore)*k);
    }
  }

  createEloRecord_(playerNameList, eloLookup, changeList){
    let newElo = structuredClone(eloLookup);
    playerNameList.forEach(
      (name, ii)=>{
        newElo[name] += changeList[ii];
      }
    )
    return newElo;
  }

  processMatch(matchResult, eloLookup, k=DEFAULT_K){
    const positions=["p1", "p2", "p3", "p4"];

    let playerNameList = [];
    let playerEloList = [];
    let expectedScoreList = [];
    let changeList = [];

    let ii = 0;
    while (ii < 4 && matchResult[positions[ii]] !== ""){
      playerNameList[ii] = matchResult[positions[ii]];
      playerEloList[ii] = this.get_elo(playerNameList[ii], eloLookup);
      expectedScoreList[ii] = 0;
      changeList[ii] = 0;
      ii++;
    }
    const playerCount = ii;

    this.getExpectedScoreList_(playerCount, playerEloList, expectedScoreList, k);

    this.getScoreChange_(playerCount, expectedScoreList, changeList, k);

    let newEloRecord = this.createEloRecord_(playerNameList, eloLookup, changeList);

    console.log(playerNameList);
    console.log(playerEloList);
    console.log(expectedScoreList);
    console.log(changeList);
    console.log(newEloRecord);
    console.log("original elo record", eloLookup);
  }
}

class ServerComm{
  matchData = [];
  matchSuggestions = [];
  eloData = [];

  async getDataFromServer() {
    await fetch('data')
    .then(response => response.json())
    .then(receivedData => {
      this.matchData = receivedData["match_data"];
      this.matchSuggestions = receivedData["mach_suggestion"];
    })
    .catch(error => {
      console.error(error);
    });
  }

  async sendSuggestion(date, p1, p2, p3, p4){
    let dataToSend = {
      "date":date,
      "p1":p1,
      "p2":p2,
      "p3":p3,
      "p4":p4
    }
    //console.log(JSON.stringify(dataToSend));
    await fetch('sendSuggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.text())
    .then(receivedData => {
      // console.log(receivedData);
      // // Clear the input value
      // input.value = '';
      // // Reload the page to fetch the updated data
      // window.location.reload();
    })
    .catch(error => {
      console.error(error);
    });
  }
}

class ElementsController{
  matchRecordTable = document.getElementsByClassName("match-record-table")[0];
  suggestionForm = document.getElementsByClassName("suggestion-form")[0];
  #previousCallBack = (a,b,c,d)=>{};
  #basicSubmitAction = (callback) => (event) => {
    // Prevent the default behavior of the form submission
    event.preventDefault();

    // Get the input element
    let date = document.getElementsByClassName('date-input')[0];
    let p1 = document.getElementsByClassName('p1-input')[0];
    let p2 = document.getElementsByClassName('p2-input')[0];
    let p3 = document.getElementsByClassName('p3-input')[0];
    let p4 = document.getElementsByClassName('p4-input')[0];

    // Check if the input value is not empty
    if (date.value && p1.value && p2.value) {
      callback(date.value, p1.value, p2.value, p3.value, p4.value);
      date.value = "";
      p1.value = "";
      p2.value = "";
      p3.value = "";
      p4.value = "";
    }
    else{
      console.log('check input values: "'+
                date.value+'" "'+
                p1.value+'" "'+
                p2.value+'"');
    }
  }

  setSubmitAction(submitCallback){
    // Add an event listener for the form submission
    this.suggestionForm.removeEventListener('submit', this.#basicSubmitAction(this.#previousCallBack));
    this.suggestionForm.addEventListener('submit', this.#basicSubmitAction(submitCallback));
    this.#previousCallBack = submitCallback;
  }

  populateTable(matchData){
    matchData.forEach(row => {
      let newRow = this.matchRecordTable.insertRow(-1);
      let dateCell = newRow.insertCell(0);
      let p1Cell = newRow.insertCell(1);
      let p2Cell = newRow.insertCell(2);
      let p3Cell = newRow.insertCell(3);
      let p4Cell = newRow.insertCell(4);
      dateCell.textContent = row["date"];
      p1Cell.textContent = row["p1"];
      p2Cell.textContent = row["p2"];
      p3Cell.textContent = row["p3"];
      p4Cell.textContent = row["p4"];
    });
  }
}

function exp10(x){
  return Math.exp(Math.log(10) * x);
}

function testRun(){
  let tempEloLookup = {"강유정":1500,"한결":1600,"김기범":1400, "김수연":1400};    
  let testing = serverComm.matchData[0];
  elo.processMatch(testing, tempEloLookup);  
}

let elo = new Elo();
let serverComm = new ServerComm();
let controller = new ElementsController();

serverComm.getDataFromServer().then(response => {
  controller.populateTable(serverComm.matchData);
  testRun()
});
controller.setSubmitAction(serverComm.sendSuggestion);



// })();