import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1O3YGQV1Up0n-wYXn34NyzMx0RT7NOL0",
  authDomain: "parads-list.firebaseapp.com",
  projectId: "parads-list",
  storageBucket: "parads-list.appspot.com",
  messagingSenderId: "502581426851",
  appId: "1:502581426851:web:9374424441ce1bddc71d16"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const teamsContainer = document.getElementById('teams');
const onHoldContainer = document.getElementById('onHoldTeam');

function renderTeamsFromFirestore(teamsData, teamOnHold) {
    teamsContainer.innerHTML = '';
    currentMatch.innerHTML = ''; // nova div
    onHoldContainer.innerHTML = '';

    if (!teamsData || teamsData.length === 0) {
        const divInicio = document.createElement('div');
        divInicio.classList.add('div-inicio');

        const waitingMessage = document.createElement('h2');
        waitingMessage.textContent = "Waiting for Player One...";
        waitingMessage.classList.add('blink');
        divInicio.appendChild(waitingMessage);
        teamsContainer.appendChild(divInicio);

        return;
    }

    const matchContainer = document.createElement('div');
    matchContainer.classList.add('match-container');

    [0, 1].forEach((index) => {
        const team = teamsData[index];
        if (!team) return;

        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team');

        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Time ${index + 1}`;
        teamDiv.appendChild(teamTitle);

        const playerList = document.createElement('ul');

        for (let i = 0; i < 6; i++) {
            const playerItem = document.createElement('div');
            playerItem.classList.add('player-space');

            if (team.players[i]) {
                const player = team.players[i];
                const tagP = document.createElement('p');
                tagP.textContent = player.name;
                const playerWins = document.createElement('span');
                playerWins.textContent = `${player.wins}`;

                playerItem.appendChild(tagP);
                playerItem.appendChild(playerWins);

                if (player.isSetter) playerItem.classList.add('player-setter');
                if (player.isFemale) playerItem.classList.add('player-female');
            } else {
                playerItem.textContent = 'ʕ•́ᴥ•̀ʔっ';
                playerItem.classList.add('player-empty');
                playerItem.addEventListener('click', function (event) {
                    event.stopPropagation();
                    selectEmptySpace(playerItem, index, i);
                });
            }
            playerList.appendChild(playerItem);
        }

        teamDiv.appendChild(playerList);
        matchContainer.appendChild(teamDiv);
    });

    currentMatch.appendChild(matchContainer);

    teamsData.slice(2).forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team');

        const teamTitle = document.createElement('h3');
        const labelIndex = index + 1;
        teamTitle.textContent = `${labelIndex}º Próxima`;
        teamDiv.appendChild(teamTitle);

        const playerList = document.createElement('ul');

        for (let i = 0; i < 6; i++) {
            const playerItem = document.createElement('div');
            playerItem.classList.add('player-space');

            if (team.players[i]) {
                const player = team.players[i];
                const tagP = document.createElement('p');
                tagP.textContent = player.name;
                const playerWins = document.createElement('span');
                playerWins.textContent = `${player.wins}`;

                playerItem.appendChild(tagP);
                playerItem.appendChild(playerWins);

                if (player.isSetter) playerItem.classList.add('player-setter');
                if (player.isFemale) playerItem.classList.add('player-female');
            } else {
                playerItem.textContent = 'ʕ•́ᴥ•̀ʔっ';
                playerItem.classList.add('player-empty');
                playerItem.addEventListener('click', function (event) {
                    event.stopPropagation();
                    selectEmptySpace(playerItem, index + 2, i);
                });
            }
            playerList.appendChild(playerItem);
        }

        teamDiv.appendChild(playerList);
        teamsContainer.appendChild(teamDiv);
    });

    // ⏸️ Time de Volta
    if (teamOnHold) {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team', 'team-onHold');

        const teamTitle = document.createElement('h3');
        teamTitle.textContent = 'Volta';
        teamDiv.appendChild(teamTitle);

        const playerList = document.createElement('ul');

        for (let i = 0; i < 6; i++) {
            const playerItem = document.createElement('div');
            playerItem.classList.add('player-space');

            const player = teamOnHold.players[i];
            const tagP = document.createElement('p');
            tagP.textContent = player.name;
            const playerWins = document.createElement('span');
            playerWins.textContent = `${player.wins}`;

            playerItem.appendChild(tagP);
            playerItem.appendChild(playerWins);

            if (player.isSetter) playerItem.classList.add('player-setter');
            if (player.isFemale) playerItem.classList.add('player-female');

            playerList.appendChild(playerItem);
        }

        teamDiv.appendChild(playerList);
        onHoldContainer.appendChild(teamDiv);
    }
}


db.collection('teams').doc('currentTeams').onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        const teamsData = data.teams;
        const teamOnHold = data.teamOnHold;
        
        // Renderizar a lista de times na página
        renderTeamsFromFirestore(teamsData, teamOnHold);
    } else {
        console.log("No teams data found!");
    }
});

const correctPassword = "Laudado"; // Altere para a senha que você deseja

// Adicionando evento de clique ao botão
document.getElementById("admBtn").addEventListener("click", function() {
    const inputPass = document.getElementById("admPass").value;
    
    if (inputPass === correctPassword) {
        localStorage.setItem("isAdmin", "true");
        window.location.href = "adm.html";
    } else {
        alert("Senha incorreta!");
    }
});