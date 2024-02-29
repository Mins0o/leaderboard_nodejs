(function () {

class Elo {
  eloLookup = {};
  matchRecord = {};
  winProbTemplate = [[1,1,1],
                    [0,1,1],
                    [0,0,1],
                    [0,0,0]];
}

class ServerComm{
  matchData = [];
  matchSuggestions = [];

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

  setSubmitAction(submitCallback){
    // Add an event listener for the form submission
    this.suggestionForm.addEventListener('submit', (event) => {
      // Prevent the default behavior of the form submission
      event.preventDefault();

      // Get the input element
      let date = document.getElementsByClassName('date-input')[0].value;
      let p1 = document.getElementsByClassName('p1-input')[0].value;
      let p2 = document.getElementsByClassName('p2-input')[0].value;
      let p3 = document.getElementsByClassName('p3-input')[0].value;
      let p4 = document.getElementsByClassName('p4-input')[0].value;

      // Check if the input value is not empty
      if (date && p1 && p2) {
        submitCallback(date, p1, p2, p3, p4);
      }
      else{
        console.log('check input values: "'+date+'" "'+p1+'" "'+p2+'"');
      }
    });
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

function get_win_probability(rating_a, rating_b){
    let q_a = exp10(rating_a/400);
    let q_b = exp10(rating_b/400);
    let expected_a = q_a/(q_a+ q_b);
    let expected_b = 1 - expected_a;
    return ([expected_a, expected_b]);
}

function get_win_probabilities(elo_array){
    let number_of_players = elo_array.length;
    let win_prob_array = manual_copy(g_win_prob_template);
    for(let ii=0; ii<number_of_players; ii++){
        for(let jj=ii-1; jj>=0; jj--){
            let win_prob = get_win_probability(elo_array[jj],elo_array[ii]);
            win_prob_array[jj][ii-1] = win_prob[0];
            win_prob_array[ii][jj] = win_prob[1];
        }
    }
    return win_prob_array;
}

function get_elo(player){
    if(g_elo_lookup[player] == null ){ // may be null, undefined
        g_elo_lookup[player] = 1500; // create the new player
    }
    return g_elo_lookup[player];
}

let elo = new Elo();
let serverComm = new ServerComm();
let controller = new ElementsController();

serverComm.getDataFromServer().then(response => {
  controller.populateTable(serverComm.matchData);
});
controller.setSubmitAction(serverComm.sendSuggestion);

})();