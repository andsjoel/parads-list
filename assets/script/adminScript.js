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

let teams = []; // Armazena os times criados
let selectedPlayer = null; // Jogador ou espaço vazio selecionado
let selectedEmptySpace = null; // Referência para o espaço vazio selecionado
let countWin = 0;
let teamOnHold = null;

// Referência ao formulário de adicionar jogador
const playerForm = document.getElementById('playerForm');
const teamsContainer = document.getElementById('teams');
const returningTeamContainer = document.getElementById('returningTeam') //Div para exibir o time que volta
const removePlayerBtn = document.getElementById('removePlayerBtn');
const admBtn = document.getElementById('admBtn');

document.getElementById('onHold').addEventListener('change', saveTeamsToFirestore);

db.collection('teams').doc('currentTeams').onSnapshot((doc) => {
    if (doc.exists) {
        const data = doc.data();
        teams = data.teams;
        teamOnHold = data.teamOnHold;

        // Atualiza o estado do checkbox "onHold" com o valor salvo
        const isRuleActive = data.isRuleActive || false; // Define como false se não houver valor salvo
        document.getElementById('onHold').checked = isRuleActive;
        
        // Renderizar a lista de times na página
        renderTeams();
        // saveTeamsToFirestore();
    } else {
        console.log("No teams data found!");
    }
});

// Função para salvar os times no Firestore
function saveTeamsToFirestore() {
    const teamsData = teams.map(team => ({
        players: team.players.map(player => player ? {
            name: player.name,
            isSetter: player.isSetter,
            isFemale: player.isFemale,
            wins: player.wins || 0 // Inclui as vitórias individuais de cada jogador
        } : null),
        wins: team.wins || 0
    }));

    const isRuleActive = document.getElementById('onHold').checked;

    db.collection('teams').doc('currentTeams').set({
        teams: teamsData,
        teamOnHold: teamOnHold ? {
            players: teamOnHold.players.map(player => player ? {
                name: player.name,
                isSetter: player.isSetter,
                isFemale: player.isFemale,
                wins: player.wins || 0
            } : null),
            wins: teamOnHold.wins || 0
        } : null,
        isRuleActive: isRuleActive
    })
    .then(() => {
        console.log("Teams saved successfully!");
    })
    .catch(error => {
        console.error("Error saving teams: ", error);
    });
}



function handleWin(winningTeamIndex) {
    const winningTeam = teams[winningTeamIndex];

    // Incrementa o contador de vitórias do time e de cada jogador individualmente
    winningTeam.wins = (winningTeam.wins || 0) + 1;

    winningTeam.players.forEach(player => {
        if (player) {
            player.wins = (player.wins || 0) + 1; // Incrementa vitórias do jogador
        }
    });

    const losingTeamIndex = winningTeamIndex === 0 ? 1 : 0;
    const losingTeam = teams[losingTeamIndex];
    redistributeLosingTeam(losingTeam);

    const isRuleActive = document.getElementById('onHold').checked;
    if (isRuleActive) {
        if (teamOnHold) {
            const teamReturning = teamOnHold;
            teamOnHold = null;
            teamReturning.wins = 0;
            teams.splice(losingTeamIndex, 1);
            teams.unshift(teamReturning);
        } else {
            teams.splice(losingTeamIndex, 1);
            if (winningTeam.wins >= 2) {
                teamOnHold = winningTeam;
                teams.splice(teams.indexOf(winningTeam), 1);
                winningTeam.wins = 0;
            }
        }
    } else {
        teams.splice(losingTeamIndex, 1);
    }

    renderTeams();
    saveTeamsToFirestore();
}


// Função para selecionar um jogador
function selectPlayer(player, playerElement) {
    // Se já houver um jogador selecionado
    if (selectedPlayer) {
        // Se o jogador selecionado é o mesmo que o já selecionado, não faz nada
        if (selectedPlayer.player === player) {
            return;
        }

        // Pergunta de confirmação para trocar os jogadores
        const confirmSwap = confirm(`Deseja trocar ${selectedPlayer.player.name} por ${player.name}?`);
        if (confirmSwap) {
            swapPlayers(selectedPlayer.player, player);
        }

        // Desmarcar jogador selecionado após a confirmação
        selectedPlayer.element.classList.remove('player-selected');
        selectedPlayer = null;

        // Atualiza a interface
        renderTeams();
        return;
    }

    // Desmarcar espaço vazio, se houver
    if (selectedEmptySpace) {
        selectedEmptySpace.element.classList.remove('player-empty-selected');
        selectedEmptySpace = null;
    }

    // Marcar o novo jogador como selecionado
    selectedPlayer = { player: player, element: playerElement };
    playerElement.classList.add('player-selected');

    // Exibir o botão de remover
    document.getElementById('removePlayerBtn').style.display = 'block';
}

// Função para trocar jogadores
function swapPlayers(playerA, playerB) {
    // Encontrar os times e índices dos jogadores
    const teamAIndex = teams.findIndex(team => team.players.includes(playerA));
    const teamBIndex = teams.findIndex(team => team.players.includes(playerB));

    const playerAIndex = teams[teamAIndex].players.indexOf(playerA);
    const playerBIndex = teams[teamBIndex].players.indexOf(playerB);

    // Trocar os jogadores
    teams[teamAIndex].players[playerAIndex] = playerB;
    teams[teamBIndex].players[playerBIndex] = playerA;
    saveTeamsToFirestore();
}

// Função para selecionar um espaço vazio
function selectEmptySpace(playerElement, teamIndex, playerIndex) {
    // Se já houver um espaço vazio selecionado, desmarcar
    if (selectedEmptySpace) {
        selectedEmptySpace.element.classList.remove('player-empty-selected');
    }

    // Desmarcar jogador, se houver
    if (selectedPlayer) {
        selectedPlayer.element.classList.remove('player-selected');
        selectedPlayer = null;
    }

    // Marcar o espaço vazio como selecionado
    selectedEmptySpace = { element: playerElement, teamIndex: teamIndex, playerIndex: playerIndex };
    playerElement.classList.add('player-empty-selected');
}

// Função para adicionar jogador ao time
function addPlayerToTeam(player) {
    player.wins = player.wins || 0;

    if (selectedEmptySpace) {
        // Adicionar o jogador ao espaço vazio selecionado
        const team = teams[selectedEmptySpace.teamIndex];
        team.players[selectedEmptySpace.playerIndex] = player;

        // Limpar a seleção de espaço vazio
        selectedEmptySpace.element.classList.remove('player-empty-selected');
        selectedEmptySpace = null;
    } else {
        // Adiciona o jogador a um time da forma normal (primeiro time com vaga)
        for (let team of teams) {
            if (canAddPlayerToTeam(team, player)) {
                team.players.push(player);
                return;
            }
        }

        // Se não encontrar time, cria um novo
        const newTeam = { players: [] };
        newTeam.players.push(player);
        teams.push(newTeam);
    }
    saveTeamsToFirestore();
}

// Função para verificar se o jogador pode ser adicionado a um time
function canAddPlayerToTeam(team, player) {
    const isSetterInTeam = team.players.some(p => p && p.isSetter);
    const isFemaleInTeam = team.players.some(p => p && p.isFemale);

    const teamNotFull = team.players.length < 6;

    // Regras para adicionar um jogador:
    // - O time deve ter menos de 6 jogadores
    // - Só pode ter um levantador e uma mulher no time
    if (!teamNotFull) return false;
    if (player.isSetter && isSetterInTeam) return false;
    if (player.isFemale && isFemaleInTeam) return false;

    return true;
}

// Função para remover o jogador selecionado
document.getElementById('removePlayerBtn').addEventListener('click', function () {
    if (selectedPlayer) {
        // Encontrar o time e remover o jogador
        for (let team of teams) {
            const playerIndex = team.players.indexOf(selectedPlayer.player);
            if (playerIndex !== -1) {
                team.players.splice(playerIndex, 1);
                break;
            }
        }

        // Limpar seleção e esconder botão de remover
        selectedPlayer = null;
        this.style.display = 'none';

        // Re-renderizar os times
        renderTeams();
        saveTeamsToFirestore();
    }
});

// Função para adicionar jogador ao formulário
playerForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const playerName = document.getElementById('playerName').value;
    const isSetter = document.getElementById('isSetter').checked;
    const isFemale = document.getElementById('isFemale').checked;

    const newPlayer = {
        name: playerName,
        isSetter: isSetter,
        isFemale: isFemale
    };

    addPlayerToTeam(newPlayer);
    renderTeams();

    // Limpar formulário
    playerForm.reset();
    saveTeamsToFirestore();
});

// Detecta cliques fora dos jogadores e espaços vazios para desmarcar seleção
document.addEventListener('click', function () {
    // Desmarcar jogador selecionado
    if (selectedPlayer) {
        selectedPlayer.element.classList.remove('player-selected');
        selectedPlayer = null;
    }

    // Desmarcar espaço vazio selecionado
    if (selectedEmptySpace) {
        selectedEmptySpace.element.classList.remove('player-empty-selected');
        selectedEmptySpace = null;
    }

    // Esconder o botão de remover se nenhum jogador estiver selecionado
    document.getElementById('removePlayerBtn').style.display = 'none';
});

// Função para redistribuir o time perdedor
function redistributeLosingTeam(losingTeam) {
    let remainingPlayers = []; // Armazena os 4 jogadores não levantadores nem mulheres
    let setter = null; // Levantador do time
    let femalePlayer = null; // Mulher do time

    // Classificar os jogadores do time
    losingTeam.players.forEach(player => {
        if (player) {
            if (player.isSetter) {
                setter = player;
            } else if (player.isFemale) {
                femalePlayer = player;
            } else {
                remainingPlayers.push(player);
            }
        }
    });

    // Realocar o levantador
    if (setter) {
        realocatePlayer(setter);
    }

    // Realocar a mulher
    if (femalePlayer) {
        realocatePlayer(femalePlayer);
    }

    // Embaralhar os 4 jogadores restantes
    remainingPlayers = shuffleArray(remainingPlayers);

    // Realocar os jogadores restantes aleatoriamente
    remainingPlayers.forEach(player => {
        realocatePlayer(player);
    });
    saveTeamsToFirestore();
}

// Função para realocar um jogador em um time disponível
function realocatePlayer(player) {
    for (let team of teams) {
        if (canAddPlayerToTeam(team, player)) {
            for (let i = 0; i < 6; i++) {
                if (!team.players[i]) {
                    team.players[i] = player;
                    return;
                }
            }
        }
    }

    // Se não encontrar time, cria um novo time
    const newTeam = { players: [] };
    newTeam.players.push(player);
    teams.push(newTeam);
    saveTeamsToFirestore();
}

// Função auxiliar para embaralhar array (usado para os 4 jogadores restantes)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função auxiliar para criar botão de vitória
function createWinButton(teamIndex) {
    const winButton = document.createElement('button');
    winButton.textContent = 'Venceu';
    winButton.classList.add('win-button');
    winButton.addEventListener('click', function () {
        handleWin(teamIndex);
    });
    return winButton;
}

// Atualização da função que cria a interface dos times
function createTeamElement(team, title, teamIndex = null) {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team');

    const teamTitle = document.createElement('h3');
    teamTitle.textContent = title;
    teamDiv.appendChild(teamTitle);

    const playerList = document.createElement('div');
    playerList.style.display = 'flex';
    playerList.style.flexDirection = 'column';

    for (let i = 0; i < 6; i++) {
        const playerItem = document.createElement('div');
        playerItem.classList.add('player-space');

        if (team.players[i]) {
            const player = team.players[i];
            playerItem.textContent = `${player.name} ${player.wins || 0}`; // Exibe o número de vitórias
            if (player.isSetter) playerItem.classList.add('player-setter');
            if (player.isFemale) playerItem.classList.add('player-female');
            playerItem.addEventListener('click', function (event) {
                event.stopPropagation();
                selectPlayer(player, playerItem);
            });
        } else {
            playerItem.textContent = '?';
            playerItem.classList.add('player-empty');
            playerItem.addEventListener('click', function (event) {
                event.stopPropagation();
                selectEmptySpace(playerItem, teams.indexOf(team), i);
            });
            if (selectedEmptySpace && selectedEmptySpace.teamIndex === teams.indexOf(team) && selectedEmptySpace.playerIndex === i) {
                playerItem.classList.add('player-empty-selected');
            }
        }
        playerList.appendChild(playerItem);
    }

    teamDiv.appendChild(playerList);
    if (teamIndex === 0 || teamIndex === 1) {
        const winButton = createWinButton(teamIndex);
        teamDiv.appendChild(winButton);
    }

    return teamDiv;
}


// Função para renderizar os times atualizada com os botões "Venceu"
function renderTeams() {
    // console.log('Render Teams:', teams);
    teamsContainer.innerHTML = ''; // Limpa o container de times

    // Remover times vazios (com 0 jogadores)
    teams = teams.filter(team => team.players.some(player => player));

    if (teamOnHold) {
        const returningTeamDiv = createTeamElement(teamOnHold, 'Volta');
        returningTeamContainer.innerHTML = ''; // Limpa o container do time "Volta"
        returningTeamContainer.appendChild(returningTeamDiv);
    } else {
        returningTeamContainer.innerHTML = ''; // Limpa se não houver time em espera
    }

    // Verificar se há pelo menos dois times
    if (teams.length > 0) {
        // Cria uma seção especial para os dois primeiros times (Time 1 e Time 2)
        const playingTeamsContainer = document.createElement('div');
        playingTeamsContainer.classList.add('playing-teams');

        const team1Div = createTeamElement(teams[0], 'Time 1', 0);
        const team2Div = teams.length > 1 ? createTeamElement(teams[1], 'Time 2', 1) : null;

        playingTeamsContainer.appendChild(team1Div);

        // Adicionar o "X" entre os dois times
        const vsDiv = document.createElement('div');
        vsDiv.classList.add('versus');
        vsDiv.textContent = 'X';
        playingTeamsContainer.appendChild(vsDiv);

        if (team2Div) {
            playingTeamsContainer.appendChild(team2Div);
        }

        teamsContainer.appendChild(playingTeamsContainer);
    }

    // Renderiza os outros times, se existirem
    for (let i = 2; i < teams.length; i++) {
        const teamTitle = `${i - 1}º Próxima`;
        const teamDiv = createTeamElement(teams[i], teamTitle);
        teamsContainer.appendChild(teamDiv);
    }
}

// Adicionando o evento para o botão de popular times
document.getElementById('clearTeams').addEventListener('click', clearTeams)

function populateTeams() {
    mockPlayers.forEach(player => {
        addPlayerToTeam(player);
    });
    renderTeams();
    saveTeamsToFirestore();
}

function clearTeams() {
    const confirmClear = confirm('Deseja limpar os times?');
    if (confirmClear) {
        teams = []
        renderTeams();
        teamOnHold = null;
        saveTeamsToFirestore();
    }
}

// ##########################

        // Verifica se o usuário está autenticado
        if (localStorage.getItem("isAdmin") !== "true") {
            // Se não estiver autenticado, redireciona para a página inicial
            window.location.href = "index.html";
        }
