// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1O3YGQV1Up0n-wYXn34NyzMx0RT7NOL0",
  authDomain: "parads-list.firebaseapp.com",
  projectId: "parads-list",
  storageBucket: "parads-list.appspot.com",
  messagingSenderId: "502581426851",
  appId: "1:502581426851:web:9374424441ce1bddc71d16"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function renderTeamsFromFirestore(teamsData, teamOnHold) {
    const teamsContainer = document.getElementById('teamsContainer');
    teamsContainer.innerHTML = ''; // Limpa o container

    teamsData.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team');

        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Time ${index + 1}`;
        teamDiv.appendChild(teamTitle);

        const playerList = document.createElement('ul');

        // Exibir jogadores
        team.players.forEach((player, playerIndex) => {
            const playerItem = document.createElement('li');
            if (player) {
                playerItem.textContent = `${player.name} ${player.isSetter ? '(Levantador)' : ''} ${player.isFemale ? '(Mulher)' : ''}`;
            } else {
                playerItem.textContent = 'Vazio';
            }
            playerList.appendChild(playerItem);
        });

        teamDiv.appendChild(playerList);
        teamsContainer.appendChild(teamDiv);
    });

    if (teamOnHold) {
        const onHoldContainer = document.getElementById('onHoldTeam');
        onHoldContainer.innerHTML = `<h3>Time de Volta</h3>`;
        teamOnHold.players.forEach((player, index) => {
            const playerItem = document.createElement('div');
            playerItem.textContent = player.name;
            onHoldContainer.appendChild(playerItem);
        });
    }
}

// Escutar mudanças no Firestore
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

const correctPassword = "12345"; // Altere para a senha que você deseja

// Adicionando evento de clique ao botão
document.getElementById("admBtn").addEventListener("click", function() {
    const inputPass = document.getElementById("admPass").value;

    // Verifica se a senha inserida está correta
    if (inputPass === correctPassword) {
        localStorage.setItem("isAdmin", "true");
        // Se correta, redireciona para a página de administrador
        window.location.href = "adm.html";
    } else {
        // Senha incorreta, exibe uma mensagem de erro
        alert("Senha incorreta!");
    }
});