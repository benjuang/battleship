var state = "setup",
    current_player = 1,
    last_player,
    gameboardActive = false,
    player_guesses = [,[],[]],
    player_ships = [,[],[]],
    player_placed = [,[],[]],
    turns = 0;
    

function initBoards(){
  var gameboard = $("#gameboard"),
      guesses = $("#guesses"),
      table = $("<table>");
  for (var i=0; i < 10; i++){
    var tr = $("<tr>");

    if (!player_ships[1][i]){
      player_ships[1][i] = [];
      player_ships[2][i] = [];
    }
    if (!player_guesses[1][i]){
      player_guesses[1][i] = [];
      player_guesses[2][i] = [];
    }
    for (var j=0; j < 10; j++){
      var td = $("<td x='"+i+"' y='"+j+"'>");
      tr.append(td);
      td.click(gameboardClick);
    }
    table.append(tr);
  }
  gameboard.append(table);

  var table = $("<table>");
  for (var i=0; i < 10; i++){
    var tr = $("<tr>");
    for (var j=0; j < 10; j++){
      var td = $("<td x='"+i+"' y='"+j+"'>");
      tr.append(td);
      td.click(guessesClick);
    }
    table.append(tr);
  }
  guesses.append(table);
}

function wipeBoard(boardId){
  $(boardId+" td").attr("class", "");
}

function gameboardClick(){
  var cell = $(this),
      x = parseInt(cell.attr("x"), 10),
      y = parseInt(cell.attr("y"), 10);

  if (!gameboardActive){
    // start ship
    gameboardActive = {'x':x, 'y':y};
    $("#gameboard [x="+x+"][y="+y+"]").addClass("start");
  } else {
    // end ship
    var length = 0;
    if (x == gameboardActive.x){
      length = Math.abs(gameboardActive.y - y)+1;
    } else if (y == gameboardActive.y){
      length = Math.abs(gameboardActive.x - x)+1;
    }
    if (length >= 2 && length <= 5){
      // found acceptable ship length
      var ship_type;
      if (length == 5 && !player_placed[current_player]['carrier']){
        ship_type = "carrier";
      }
      if (length == 4 && !player_placed[current_player]['battleship']){
        ship_type = "battleship";
      }
      if (length == 3){
        if (!player_placed[current_player]['sub']){
          ship_type = "sub";
        } else if (!player_placed[current_player]['destroyer']){
          ship_type = "destroyer";
        }
      }
      if (length == 2 && !player_placed[current_player]['patrol']){
        ship_type = "patrol";
      }

      if (ship_type){
        //valid ship placement
        console.log("placing ship "+ship_type);

        if (x == gameboardActive.x){
          direction = (y < gameboardActive.y ? 1 : -1);
          // Make sure all locations are free of ships first.
          for (var i=y; i != gameboardActive.y+direction; i += direction){
            if (player_ships[current_player][x][i]){
              console.log("Can't place ship here!");
              $(".start").removeClass("start");
              gameboardActive = false;
              return false;
            }
          }

          // Now actually place our ship.
          for (var i=y; i != gameboardActive.y+direction; i += direction){
            player_ships[current_player][x][i] = {'name': ship_type, 'hit': false};
            $("#gameboard [x="+x+"][y="+i+"]").addClass(ship_type);
            console.log("setting "+x+", "+i+" as "+ship_type);
          }
        } else {
          direction = (x < gameboardActive.x ? 1 : -1);

          // Make sure all locations are free of ships first.
          for (var i=y; i != gameboardActive.y+direction; i += direction){
            if (player_ships[current_player][x][i]){
              console.log("Can't place ship here!");
              $(".start").removeClass("start");
              gameboardActive = false;
              return false;
            }
          }

          // Now actually place our ship.
          for (var i=x; i != gameboardActive.x+direction; i += direction){
            player_ships[current_player][i][y] = {'name': ship_type, 'hit': false};
            $("#gameboard [x="+i+"][y="+y+"]").addClass(ship_type);
            console.log("setting "+i+", "+y+" as "+ship_type);
          }
        }

        player_placed[current_player][ship_type] = true;
        if (player_placed[current_player]['carrier'] ){
          // &&
          //   player_placed[current_player]['battleship'] &&
          //   player_placed[current_player]['sub'] &&
          //   player_placed[current_player]['destroyer'] &&
          //   player_placed[current_player]['patrol'] ){
          $(".placementButton").prop("disabled", false);
        }

        $(".start").removeClass("start");
        gameboardActive = false;
      }
    } else {
      $(".start").removeClass("start");
      gameboardActive = false;
    }
  }
}

function donePlacement(){
  if (current_player == 2){
    $(".active").removeClass("active");
    $("#guesses").addClass("active");
    $("#ships").hide();
    $(".placementButton").hide();
    state = "play";
    $(".blackoutCurtain").show();
    wipeBoard("#gameboard");
    setPlayer(1);
    return;
  }

  if (current_player == 1){
    setPlayer(2);
    $(".placementButton").prop("disabled", true);
  }

  // wipe board of evidence
  $(".blackoutCurtain").show();
  wipeBoard("#gameboard");
}

function loadPlayerBoard(){
  wipeBoard("#gameboard");
  wipeBoard("#guesses");

  for (var x=0; x < 10; x++){
    for (var y=0; y < 10; y++){
      if (player_ships[current_player][x][y]){
        var ship_info = player_ships[current_player][x][y],
            cell = $("#gameboard [x="+x+"][y="+y+"]");

        cell.addClass(ship_info.name);
        if (ship_info.hit){
          cell.addClass("damage");
        }
      }
    }
  }

  for (var x=0; x < 10; x++){
    for (var y=0; y < 10; y++){
      if (player_guesses[current_player][x][y]){
        var guess_info = player_guesses[current_player][x][y],
            cell = $("#guesses [x="+x+"][y="+y+"]");

        cell.addClass("guess");
        if (guess_info.hit){
          cell.addClass("damage");
        }
      }
    }
  }
}

function nextTurn(){
  var other_player = (current_player == 1 ? 2 : 1);
  $(".message").html("");
  $(".blackoutCurtain").show();
  setPlayer(other_player);
}

function setPlayer(player_id){
  current_player = player_id;
  $("#current_player").text(current_player);
  loadPlayerBoard();
}

function guessesClick(){
  var cell = $(this),
      x = parseInt(cell.attr("x"), 10),
      y = parseInt(cell.attr("y"), 10);
      other_player = (current_player == 1 ? 2 : 1);
  
  if (last_player == current_player){
    // already guessed
    return;
  }
  last_player = current_player;

  player_guesses[current_player][x][y] = {'turn': turns};
  $("#guesses [x="+x+"][y="+y+"]").addClass("guess");
  if (player_ships[other_player][x][y]){
    player_ships[other_player][x][y].hit = true;
    player_guesses[current_player][x][y].hit = true;
    $("#guesses [x="+x+"][y="+y+"]").addClass("damage");
    $(".message").html("You hit something!");
  } else {
    $(".message").html("Better luck next time?");
  }

  turns++;

  if (checkWin()){
    $(".win").html("Yay, Player "+current_player+" won!");
  }
}

function checkWin(){
  var other_player = (current_player == 1 ? 2 : 1);

  for (var x=0; x < 10; x++){
    for (var y=0; y < 10; y++){
      if (player_ships[other_player][x][y]){
        var ship_info = player_ships[other_player][x][y];
        if (!ship_info.hit){
          return false;
        }
      }
    }
  }

  return true;
}

$(document).ready(function(){
  initBoards();
  setPlayer(1);
  $(".blackoutCurtain").click(function(){
    $(this).hide();
  })
});
