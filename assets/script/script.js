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

const teamsContainer = document.getElementById('teamsContainer');
const onHoldContainer = document.getElementById('onHoldTeam');
const waitingPlayer = document.getElementById('waitingPlayer');

let countBalloon = 0;
let balaoVisivel = false;

const falas = [
    "Achou que ia estourar meu balão? Sou apenas um Gif, trouxa.",
    "Sabe como um Gif funciona?",
    "Nem eu.",
    "Ainda nessa?",
    "Podemos ficar aqui o dia todo...",
    "Cadê os adm?",
    "...",
    "Meow Meow",
    "Não da pra estourar, você sabe né?",
    "Mesmo que desse...",
    "BUUM! Brincadeira.",
    "Eita, senti balançando.",
    "Ta, sério. Cadê os adm???",
    "Para aê ow, brother.",
    "Brincadeira. Parei.",
    "PARA!",
    "AAAAAAAA",
    "EU VOU MORRER!",
    "Meow?"
];

function renderTeamsFromFirestore(teamsData, teamOnHold) {

    teamsContainer.innerHTML = ''; // Limpa o container

    if (!teamsData || teamsData.length === 0) {
        const waitingMessage = document.createElement('h2');
        waitingMessage.textContent = "Waiting for Player One...";
        waitingMessage.classList.add('blink')
        teamsContainer.appendChild(waitingMessage);

        const balloon = document.createElement('div');
        balloon.classList.add('balloon');

        const waitingCat = document.createElement('img');
        waitingCat.src = './assets/img/balloon_cat.gif';
        waitingCat.classList.add('cat-wait')
        balloon.appendChild(waitingCat);

        const balao = document.createElement('p');

        balao.textContent = 'Achou que ia estourar meu balão? Sou só um Gif!'
        balao.style.display = 'none';

        balloon.appendChild(balao)

        balloon.addEventListener('click', () => {
            if (!balaoVisivel && countBalloon < falas.length) { // Verifica se o balão não está visível
                balaoVisivel = true; // Marca que o balão está visível
                balao.textContent = falas[countBalloon]; // Atualiza o texto do balão com a fala atual
                balao.style.display = 'block'; // Mostra o balão
                setTimeout(() => {
                    balao.style.display = 'none'; // Esconde o balão após 2.5 segundos
                    balaoVisivel = false; // Marca que o balão não está mais visível
                }, 2500); // O balão ficará visível por 2 segundos
                countBalloon++; // Incrementa o índice para a próxima fala
            } else if (countBalloon >= falas.length) {
                countBalloon = 0; // Reseta o índice se chegar ao final
            }
        });

        teamsContainer.appendChild(balloon);
        return;
    }

    teamsData.forEach((team, index) => {
        const teamDiv = document.createElement('div');
        teamDiv.classList.add('team');

        const teamTitle = document.createElement('h3');
        teamTitle.textContent = `Time ${index + 1}`;
        teamDiv.appendChild(teamTitle);

        if (index === 2) {
            teamTitle.textContent = `1º Próxima`;
        }
        if (index === 3) {
            teamTitle.textContent = `2º Próxima`;
        }
        if (index === 4) {
            teamTitle.textContent = `3º Próxima`;
        }
        if (index === 5) {
            teamTitle.textContent = `5º Próxima`;
        }

        const playerList = document.createElement('ul');

        // Exibir jogadores
        team.players.forEach((player, playerIndex) => {
            const playerItem = document.createElement('li');
            playerItem.classList.add('player-space');
            if (player) {
                playerItem.textContent = player.name;
                if (player.isSetter) {
                    playerItem.classList.add('player-setter');
                }
                if (player.isFemale) {
                    playerItem.classList.add('player-female');
                }
            } else {
                playerItem.textContent = 'Vazio';
            }
            playerList.appendChild(playerItem);
        });

        teamDiv.appendChild(playerList);
        teamsContainer.appendChild(teamDiv);
    });

    if (teamOnHold) {
        console.log('TIME',teamOnHold);

        onHoldContainer.innerHTML = '<h3>Time de Volta</h3>';
        teamOnHold.players.forEach((player, index) => {
            const playerItem = document.createElement('p');
            playerItem.textContent = player.name;
            onHoldContainer.appendChild(playerItem);
        });
        console.log(onHoldContainer);
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

const correctPassword = "$rt52wdf#?"; // Altere para a senha que você deseja

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