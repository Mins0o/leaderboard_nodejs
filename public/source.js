(function () {

const DEFAULT_K = 20;

class Elo {
  eloData = [];
  nameList = [];

  #getWinProbabilty_(ratingA, ratingB){
    let qA = exp10(ratingA/400);
    let qB = exp10(ratingB/400);
    let expectedA = qA/(qA + qB);
    let expectedB = 1 - expectedA;
    return ([expectedA, expectedB]);
  }

  #getElo_(player, eloLookup){
    if(eloLookup[player] == null ){ // may be null, undefined
        eloLookup[player] = 1500; // create the new player
    }
    return eloLookup[player];
  }

  #getExpectedScoreList_(playerCount, 
    positionSortedPlayerEloList, 
    positionSortedExpectedScoreList, 
    k=DEFAULT_K){
    let playerEloList = positionSortedPlayerEloList;
    let expectedScoreList = positionSortedExpectedScoreList;
    for (let ii = 0; ii < playerCount; ii++){
      for (let jj = ii+1; jj < playerCount; jj++){
        let winProbPair = this.#getWinProbabilty_(playerEloList[ii], playerEloList[jj]);
        expectedScoreList[ii] += Math.round(winProbPair[0]*k)/k;
        expectedScoreList[jj] += Math.round(winProbPair[1]*k)/k;
      }
    }
  }

  #getScoreChange_(playerCount, expectedScoreList, chageList, k=DEFAULT_K){
    for (let ii = 0; ii < playerCount; ii++){
      let actualScore = playerCount - ii - 1;
      let expectedScore = expectedScoreList[ii];
      chageList[ii] += Math.round((actualScore - expectedScore)*k);
    }
  }

  #createEloRecord_(playerNameList, eloLookup, changeList){
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
      playerEloList[ii] = this.#getElo_(playerNameList[ii], eloLookup);
      expectedScoreList[ii] = 0;
      changeList[ii] = 0;
      ii++;
    }
    const playerCount = ii;

    this.#getExpectedScoreList_(playerCount, playerEloList, expectedScoreList, k);

    this.#getScoreChange_(playerCount, expectedScoreList, changeList, k);

    let newEloRecord = this.#createEloRecord_(playerNameList, eloLookup, changeList);
    newEloRecord["date"] = matchResult["date"];
    
    return newEloRecord;
  }

  recompileElo(matchData){
    let  eloData = [];
    matchData.forEach((match, ii)=>{
      eloData[ii] = this.processMatch(match,(ii==0?{"date":""}:eloData[eloData.length-1]));
    })
    return eloData;
  }

  #getNameList_(eloData){
    let lastLineNames = Object.keys(eloData.at(-1));
    const indexToDelete = lastLineNames.indexOf("date");
    if (indexToDelete >-1){
      lastLineNames.splice(indexToDelete, 1);
    }
    return lastLineNames.sort();
  }

  setEloData(eloData){
    this.eloData = structuredClone(eloData);
    this.nameList = this.#getNameList_(eloData);
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
    await fetch('elo')
    .then(response => response.json())
    .then(receivedData => {
      this.eloData = receivedData;
    })
    .catch(error => {
      console.error(error);
    });
  }

  async sendEloData(eloData){
    await fetch('sendEloData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eloData)
    })
    .then(response => response.text())
    .then(receivedData => {
      ;
    })
    .catch(error => {
      console.error(error)
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
    await fetch('sendSuggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.text())
    .then(receivedData => {
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
  dateInput = document.getElementsByClassName("date-input")[0];

  constructor(){
    this.dateInput.value = (new Date()).toISOString().substr(0, 10);
    this.namesDataList = document.createElement("datalist");
    this.namesDataList.id = "names-data-list";
    this.suggestionForm.appendChild(this.namesDataList);
  }
  #previousSubmitCallBack_ = (a,b,c,d)=>{};
  // submit action is a function takes in an event,
  // createSubmitAction: is a function that creates an submit action from the input callback
  #createSubmitAction_ = (callback) => (event) => {
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
      // date.value = "";
      p1.value = "";
      p2.value = "";
      p3.value = "";
      p4.value = "";
      p1.focus();
    }
    else{
      console.error('Check input values: "'+
                date.value+'" "'+
                p1.value+'" "'+
                p2.value+'"');
    }
  }

  // submitCallback: is a function that takes in four input
  setSubmitAction(submitCallback){
    // Add an event listener for the form submission
    this.suggestionForm.removeEventListener('submit', this.#createSubmitAction_(this.#previousSubmitCallBack_));
    this.suggestionForm.addEventListener('submit', this.#createSubmitAction_(submitCallback));
    this.#previousSubmitCallBack_ = submitCallback;
  }

  populateTable(matchData){
    matchData.forEach(dataRow => {
      let newRow = this.matchRecordTable.insertRow(-1);
      let dateCell = newRow.insertCell(0);
      let p1Cell = newRow.insertCell(1);
      let p2Cell = newRow.insertCell(2);
      let p3Cell = newRow.insertCell(3);
      let p4Cell = newRow.insertCell(4);
      let cells = [p1Cell,  p2Cell, p3Cell, p4Cell];
      let data = [dataRow["p1"], dataRow["p2"], dataRow["p3"], dataRow["p4"]];
      dateCell.textContent = dataRow["date"];

      for (let ii = 0; ii<4; ii++){
        cells[ii].textContent = data[ii];
        cells[ii].classList.add("participant-name");
      }
    });
  }

  drawChart(eloData){
    ;
  }

  makeInputNameOptions(nameList){
    this.suggestionForm.removeChild(this.namesDataList);
    this.namesDataList = document.createElement("datalist");
    this.namesDataList.id = "names-data-list";
    nameList.forEach((name, ii) =>{
      let nameOption = document.createElement("option");
      nameOption.appendChild(document.createTextNode(name));
      nameOption.value = name;
      this.namesDataList.appendChild(nameOption);
      window.namesDataList = this.namesDataList;
    });
    this.suggestionForm.appendChild(this.namesDataList);
  }
}

function exp10(x){
  return Math.exp(Math.log(10) * x);
}

function elementLog(x){
  let writeHere = document.getElementsByClassName("log-alternative")[0];
  let paragraph = document.createElement("p");
  writeHere.appendChild(paragraph);
  paragraph.appendChild(document.createTextNode(x));
}

function testRun(){
  // elementLog("Elo");
  // elementLog(JSON.stringify(elo.eloData, null, 2));
}

var elo = new Elo();
var serverComm = new ServerComm();
var controller = new ElementsController();

serverComm.getDataFromServer().then(response => {
  controller.populateTable(serverComm.matchData);
  elo.setEloData(serverComm.eloData);
  controller.makeInputNameOptions(elo.nameList);
  testRun();
});

controller.setSubmitAction(serverComm.sendSuggestion);

const chartTesting = (()=>{
  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
})()



})();
