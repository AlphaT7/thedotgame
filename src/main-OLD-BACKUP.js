/* global $ io Image */

//window.onload = function() {

let socket = io(),
  a = (d) => {
    alert(d);
  },
  c = (d) => {
    console.log(d);
  },
  ct = (d) => {
    console.log(JSON.stringify(d));
  };

// declare all the main variables and functions

let main = {
  variables: {
    colors: {
      st_red: "rgba(255, 37, 0, 0.25)" /*semi-transparent red*/,
      clear: "rgba(255, 255, 255, 0)" /*transparent white*/,
      red: "red",
      blue: "#3498DB",
      orange: "#F39C12",
      green: "#27AE60",
      st_blue: "rgba(0, 120, 255, .25)",
      st_green: "rgba(17, 222, 27, .25)",
      shadow: "rgba(0,0,0,.75)",
      purple: "rgba(151, 17, 222, .25)",
    }, // end of main.variables.colors object
    canvas: document.getElementById("myCanvas"),
    ctx: document.getElementById("myCanvas").getContext("2d"),
    goals: [
      {
        x: 200,
        y: 10,
      },
      {
        x: 200,
        y: 370,
      },
    ],
    sprites: {},
    flags: [
      {
        src: "img/waving-flag-red.png",
        x: "",
        y: "",
      },
      {
        src: "img/waving-flag-blue.png",
        x: "",
        y: "",
      },
    ],
    goalboundries: [
      {
        x: "",
        y: "",
        w: "",
        h: "",
        c: "",
      },
      {
        x: "",
        y: "",
        w: "",
        h: "",
        c: "",
      },
    ],
    dropboundry: {
      x: "",
      y: "",
      w: "",
      h: "",
    },
    mouse: {
      x: "0",
      y: "201",
    },
    gamelive: false,
    latencycount: 0,
    latencyarray: [],
    dots: {
      d1: {
        x: "",
        y: "",
        r: "",
        n: 1,
        dottype: "",
        live: false,
      },
      d2: {
        x: "",
        y: "",
        r: "",
        n: 2,
        dottype: "",
        live: false,
      },
      d3: {
        x: "",
        y: "",
        r: "",
        n: 3,
        dottype: "",
        live: false,
      },
      d4: {
        x: "",
        y: "",
        r: "",
        n: 4,
        dottype: "",
        live: false,
      },
      d5: {
        x: "",
        y: "",
        r: "",
        n: 5,
        dottype: "",
        live: false,
      },
      d6: {
        x: "",
        y: "",
        r: "",
        n: 6,
        dottype: "",
        live: false,
      },
      d7: {
        x: "",
        y: "",
        r: "",
        n: 7,
        dottype: "",
        live: false,
      },
      d8: {
        x: "",
        y: "",
        r: "",
        n: 8,
        dottype: "",
        live: false,
      },
      d9: {
        x: "",
        y: "",
        r: "",
        n: 9,
        dottype: "",
        live: false,
      },
      d10: {
        x: "",
        y: "",
        r: "",
        n: 10,
        dottype: "",
        live: false,
      },
    },
    edots: {
      d1: {
        x: "",
        y: "",
        r: "",
        n: 1,
        dottype: "",
        live: false,
      },
      d2: {
        x: "",
        y: "",
        r: "",
        n: 2,
        dottype: "",
        live: false,
      },
      d3: {
        x: "",
        y: "",
        r: "",
        n: 3,
        dottype: "",
        live: false,
      },
      d4: {
        x: "",
        y: "",
        r: "",
        n: 4,
        dottype: "",
        live: false,
      },
      d5: {
        x: "",
        y: "",
        r: "",
        n: 5,
        dottype: "",
        live: false,
      },
      d6: {
        x: "",
        y: "",
        r: "",
        n: 6,
        dottype: "",
        live: false,
      },
      d7: {
        x: "",
        y: "",
        r: "",
        n: 7,
        dottype: "",
        live: false,
      },
      d8: {
        x: "",
        y: "",
        r: "",
        n: 8,
        dottype: "",
        live: false,
      },
      d9: {
        x: "",
        y: "",
        r: "",
        n: 9,
        dottype: "",
        live: false,
      },
      d10: {
        x: "",
        y: "",
        r: "",
        n: 10,
        dottype: "",
        live: false,
      },
    },
    setupflag: 0,
    username: "",
    gameroom: "",
    stepcounter: 0,
    host: false,
  },

  gamestate: [],

  methods: {
    isEven: function (n) {
      return n % 2 == 0;
    },

    latency: function () {
      let mv = main.variables;

      let latencytest = setInterval(function () {
        mv.latencyarray.push(new Date()); //Date.now();
        socket.emit("client2server");
      }, 1000);
    },

    message: function (text) {
      $("#message").html(text);
      setTimeout(function () {
        $("#message").html("");
      }, 3000);
    },

    drawFlags: function () {
      let mv = main.variables;

      mv.ctx.drawImage(mv.sprites.playerflag, mv.flags[1].x, mv.flags[1].y);
      mv.ctx.drawImage(mv.sprites.enemyflag, mv.flags[0].x, mv.flags[0].y);
    },

    drawPlayerBoundry: function () {
      let mv = main.variables;

      mv.ctx.save();
      mv.ctx.translate(0, 0);
      mv.ctx.beginPath();
      mv.ctx.rect(
        mv.dropboundry.x,
        mv.dropboundry.y,
        mv.dropboundry.w,
        mv.dropboundry.h
      );

      // check if we hover it, fill red, if not make it transparent
      mv.ctx.fillStyle = mv.ctx.isPointInPath(mv.mouse.x, mv.mouse.y)
        ? mv.colors.st_red
        : mv.colors.clear;
      mv.ctx.fill();
      mv.ctx.restore();
    },

    drawGoalBoundries: function () {
      let mv = main.variables;

      mv.goalboundries.forEach(function (element, index, array) {
        mv.ctx.shadowColor = mv.colors.shadow;
        mv.ctx.shadowBlur = 20;

        if (index == 0) {
          mv.ctx.shadowOffsetY = 2;
          mv.ctx.shadowOffsetX = 2;
        } else {
          mv.ctx.shadowOffsetY = -2;
          mv.ctx.shadowOffsetX = -2;
        }

        mv.ctx.fillStyle = element.c;
        mv.ctx.fillRect(element.x, element.y, element.w, element.h);
      });

      function RectCircleColliding(circle, rect) {
        // return true if the rectangle and circle are colliding
        let distX = Math.abs(circle.x - rect.x - rect.w / 2);
        let distY = Math.abs(circle.y - rect.y - rect.h / 2);

        if (distX > rect.w / 2 + circle.r) {
          return false;
        }
        if (distY > rect.h / 2 + circle.r) {
          return false;
        }
        /*               
                          if (distX <= (rect.w/2)) { return true; } 
                          if (distY <= (rect.h/2)) { return true; }
                */
        if (distX <= rect.w / 2 && distY <= rect.h / 2) {
          return true;
        }

        let dx = distX - rect.w / 2;
        let dy = distY - rect.h / 2;
        return dx * dx + dy * dy <= circle.r * circle.r;
      }
    },

    drawNewCircle: function (x, y, r, color, dottype) {
      let mvd = main.variables.dots;
      let mv = main.variables;

      for (let dot in mvd) {
        if (mvd[dot].live == false) {
          mv.ctx.fillStyle = color;
          mv.ctx.beginPath();
          mv.ctx.arc(x, y, r, 0, 2 * Math.PI);
          mv.ctx.stroke();
          mv.ctx.fill();

          mvd[dot].x = x;
          mvd[dot].y = y;
          mvd[dot].r = r;
          mvd[dot].dottype = dottype;
          mvd[dot].live = true;

          socket.emit("circle", mvd[dot], mv.gameroom, mv.host);

          break;
        }
      }
    },

    drawNewEnemyCircle: function (x, y, r, dottype) {
      let mved = main.variables.edots;
      let mv = main.variables;

      for (let dot in mved) {
        if (mved[dot].live == false) {
          mved[dot].x = 400 - x;
          mved[dot].y = 400 - y;
          mved[dot].r = r;
          mved[dot].dottype = dottype;
          mved[dot].live = true;

          break;
        }
      }

      if (dottype == "flagrunner") {
        mv.ctx.fillStyle = mv.colors.orange;
      } else {
        mv.ctx.fillStyle = mv.colors.red;
      }

      mv.ctx.beginPath();
      mv.ctx.arc(400 - x, 400 - y, r, 0, 2 * Math.PI);
      mv.ctx.stroke();
      mv.ctx.fill();
    },

    drawCircle: function (x, y, r, color) {
      let mv = main.variables;

      mv.ctx.fillStyle = color;
      mv.ctx.beginPath();
      mv.ctx.arc(x, y, r, 0, 2 * Math.PI);
      mv.ctx.fill();
    },

    drawLine: function (x1, y1, x2, y2) {
      let mv = main.variables;

      mv.ctx.beginPath();
      mv.ctx.moveTo(x1, y1);
      mv.ctx.lineTo(x2, y2);
      mv.ctx.stroke();
    },

    moveFlagRunners: function () {
      let mvd = main.variables.dots;
      let mv = main.variables;

      for (let dot in mvd) {
        if (mvd[dot].dottype == "flagrunner" && mvd[dot].live == true) {
          let x = mvd[dot].x,
            y = mvd[dot].y,
            moveFlag = false,
            velX = 0,
            velY = 0,
            thrust = 3;

          let targetaquired = x == mv.flags[0].x && y == mv.flags[0].y;
          let targetoffset = x - 7 == mv.flags[0].x && y - 7 == mv.flags[0].y;

          if (targetaquired || targetoffset) {
            let target = {
              x: mv.goals[1].x,
              y: mv.goals[1].y,
            };
            mvd[dot].r = 12;
            moveFlag = true;
          } else {
            let target = {
              x: mv.flags[0].x,
              y: mv.flags[0].y,
            };
          }

          let tx = target.x - x,
            ty = target.y - y,
            dist = Math.sqrt(tx * tx + ty * ty);
          //  rad = Math.atan2(ty,tx),
          //  angle = rad/Math.PI * 180;

          velX = (tx / dist) * thrust;
          velY = (ty / dist) * thrust;

          let testX = target.x - (mvd[dot].x + velX);
          let testY = target.y - (mvd[dot].y + velY);

          // some math to ensure no 'bouncing' once the circle reaches the target...
          if (testX / velX > 1) {
            mvd[dot].x += velX;
          } else if (testX / velX < 1) {
            mvd[dot].x = target.x;
          }

          // some math to ensure no 'bouncing' once the circle reaches the target...
          if (testY / velY > 1) {
            mvd[dot].y += velY;
          } else if (testY / velY < 1) {
            mvd[dot].y = target.y;
          }
          // if the 'moveFlag' variable has been set to 'true', then move the flag position equal to the circle position
          // this must be done ***after*** the circle position has been updated
          if (moveFlag) {
            mv.flags[0].x = mvd[dot].x - 7;
            mv.flags[0].y = mvd[dot].y - 7;
          }
        }
      }
    },

    moveEFlagRunners: function () {
      let mved = main.variables.edots;
      let mv = main.variables;

      for (let dot in mved) {
        if (mved[dot].dottype == "flagrunner" && mved[dot].live == true) {
          let x = mved[dot].x,
            y = mved[dot].y,
            moveFlag = false,
            velX = 0,
            velY = 0,
            thrust = 3;

          let targetaquired = x == mv.flags[1].x && y == mv.flags[1].y;
          let targetoffset = x - 7 == mv.flags[1].x && y - 7 == mv.flags[1].y;

          if (targetaquired || targetoffset) {
            let target = {
              x: mv.goals[0].x,
              y: mv.goals[0].y,
            };
            mved[dot].r = 12;
            moveFlag = true;
          } else {
            let target = {
              x: mv.flags[1].x,
              y: mv.flags[1].y,
            };
          }

          let tx = target.x - x,
            ty = target.y - y,
            dist = Math.sqrt(tx * tx + ty * ty);
          //  rad = Math.atan2(ty,tx),
          //  angle = rad/Math.PI * 180;

          velX = (tx / dist) * thrust;
          velY = (ty / dist) * thrust;

          let testX = target.x - (mved[dot].x + velX);
          let testY = target.y - (mved[dot].y + velY);

          // some math to ensure no 'bouncing' once the circle reaches the target...
          if (testX / velX > 1) {
            mved[dot].x += velX;
          } else if (testX / velX < 1) {
            mved[dot].x = target.x;
          }

          // some math to ensure no 'bouncing' once the circle reaches the target...
          if (testY / velY > 1) {
            mved[dot].y += velY;
          } else if (testY / velY < 1) {
            mved[dot].y = target.y;
          }
          // if the 'moveFlag' variable has been set to 'true', then move the flag position equal to the circle position
          // this must be done ***after*** the circle position has been updated
          if (moveFlag) {
            mv.flags[1].x = mved[dot].x - 7;
            mv.flags[1].y = mved[dot].y - 7;
          }
        }
      }
    },

    moveAttackers: function () {
      let mm = main.methods;
      let mvd = main.variables.dots;
      let mved = main.variables.edots;

      let targetarray = [];
      let attackers = [];

      for (let dot in mvd) {
        if (mvd[dot].dottype == "attacker" && mvd[dot].live == true) {
          attackers.push(mvd[dot]);
        }
      }

      for (let dot in mved) {
        if (mved[dot].live == true) {
          targetarray.push(mved[dot]);
        }
      }

      if (targetarray.length > 0) {
        for (let i = 0; i < attackers.length; i++) {
          let element = attackers[i];
          let t = mm.nearestTarget(element, targetarray);
          move(element, t.target);
        }
      }

      function move(element, t) {
        let x = element.x,
          y = element.y,
          velX = 0,
          velY = 0,
          thrust = 2;

        let tx = t.x - x,
          ty = t.y - y,
          dist = Math.sqrt(tx * tx + ty * ty);

        velX = (tx / dist) * thrust;
        velY = (ty / dist) * thrust;

        element.x += velX;
        element.y += velY;
      }
    },

    moveEAttackers: function () {
      let mm = main.methods;
      let mvd = main.variables.dots;
      let mved = main.variables.edots;

      let targetarray = [];
      let eattackers = [];

      for (let dot in mved) {
        if (mved[dot].dottype == "attacker" && mved[dot].live == true) {
          eattackers.push(mved[dot]);
        }
      }

      for (let dot in mvd) {
        if (mvd[dot].live == true) {
          targetarray.push(mvd[dot]);
        }
      }

      if (targetarray.length > 0) {
        for (let i = 0; i < eattackers.length; i++) {
          let element = eattackers[i];
          let t = mm.nearestTarget(element, targetarray);
          move(element, t.target);
        }
      }

      function move(element, t) {
        let x = element.x,
          y = element.y,
          velX = 0,
          velY = 0,
          thrust = 2;

        let tx = t.x - x,
          ty = t.y - y,
          dist = Math.sqrt(tx * tx + ty * ty);

        velX = (tx / dist) * thrust;
        velY = (ty / dist) * thrust;

        element.x += velX;
        element.y += velY;
      }
    },

    nearestTarget: function (element, arr) {
      let distance = [];
      for (let i = 0; i < arr.length; i++) {
        distance.push(
          Math.sqrt(
            Math.pow(element.x - arr[i].x, 2) +
              Math.pow(element.y - arr[i].y, 2)
          )
        );
      }

      let arraymin = Math.min.apply(Math, distance);
      let target = arr[distance.indexOf(arraymin)];
      let data = {
        target: target,
        index: distance.indexOf(arraymin),
      };
      return data;
    },
    /*
                    checkCollision: function(circ1, circ2) {

                        // Mathmatic Equation to Detect Colision between circles
                        // distance = sqrt( (y2 - y1)² + (x2 - x1)² ) 
                        // if distance < r1 + r2, then INTERSECTION HAS OCCURED

                        let distance = Math.sqrt(Math.pow(((circ2.x) - circ1.x), 2) + Math.pow(((circ2.y) - circ1.y), 2));
                        if (distance <= 50) {
                            main.methods.drawLine(circ1.x, circ1.y, circ2.x, circ2.y)
                        }
                        let test = distance < circ1.rad + circ2.rad;
                        return test;
                    },
        */
    init: function () {
      let mv = main.variables;
      let mm = main.methods;

      mv.sprites.playerflag = new Image();
      mv.sprites.playerflag.src = mv.flags[1].src;

      mv.sprites.enemyflag = new Image();
      mv.sprites.enemyflag.src = mv.flags[0].src;

      // set flag coordinates
      mv.flags[0].x = mv.goals[0].x;
      mv.flags[0].y = mv.goals[0].y;
      mv.flags[1].x = mv.goals[1].x;
      mv.flags[1].y = mv.goals[1].y;

      // set goal boundry coordinates and main.variables.colors
      mv.goalboundries[0].x = 120;
      mv.goalboundries[0].y = 0;
      mv.goalboundries[0].w = 160;
      mv.goalboundries[0].h = 80;
      mv.goalboundries[0].c = mv.colors.st_green;

      mv.goalboundries[1].x = 120;
      mv.goalboundries[1].y = 320;
      mv.goalboundries[1].w = 160;
      mv.goalboundries[1].h = 80;
      mv.goalboundries[1].c = mv.colors.st_blue;

      // set drop boundry coordinates and main.variables.colors

      mv.dropboundry.x = 0;
      mv.dropboundry.y = 0;
      mv.dropboundry.w = 400;
      mv.dropboundry.h = 200;

      // start latency check
      mm.latency();
    },

    step: function () {
      let mv = main.variables;
      let mg = main.gamestate;
      let mm = main.methods;
      let mvd = main.variables.dots;
      let mved = main.variables.edots;

      mm.moveAttackers();
      mm.moveFlagRunners();
      mm.moveEAttackers();
      mm.moveEFlagRunners();

      mg[mg.length] = {
        stepcounter: mv.stepcounter,
        timestamp: new Date(),
        dots: JSON.parse(JSON.stringify(mv.dots)),
        edots: JSON.parse(JSON.stringify(mv.edots)),
        flags: JSON.parse(JSON.stringify(mv.flags)),
      };

      // keep the main.gamestate array at a length of 200
      // this way the array doesn't expand into infinity
      if (mg.length > 200) {
        mg.splice(0, 1);
      }

      mv.ctx.clearRect(0, 0, 400, 400);
      mm.drawPlayerBoundry();

      mv.ctx.save();
      mv.ctx.translate(0, 0);
      mm.drawGoalBoundries();

      for (let dot in mvd) {
        if (mvd[dot].dottype == "attacker" && mvd[dot].live == true) {
          //c(mvd[dot].live + '-' + mvd[dot].dottype + ' -at-test')
          mm.drawCircle(mvd[dot].x, mvd[dot].y, mvd[dot].r, mv.colors.blue);
        } else if (mvd[dot].dottype == "flagrunner" && mvd[dot].live == true) {
          //c(mvd[dot].live + '-' + mvd[dot].dottype + ' -fr-test')
          mm.drawCircle(mvd[dot].x, mvd[dot].y, mvd[dot].r, mv.colors.green);
        }
      }

      for (let dot in mved) {
        if (mved[dot].dottype == "attacker" && mved[dot].live == true) {
          mm.drawCircle(
            mved[dot].x,
            mved[dot].y,
            mved[dot].r,
            mv.colors.orange
          );
        } else if (
          mved[dot].dottype == "flagrunner" &&
          mved[dot].live == true
        ) {
          mm.drawCircle(
            mved[dot].x,
            mved[dot].y,
            mved[dot].r,
            mv.colors.orange
          );
        }
      }

      mm.drawFlags();
      mv.ctx.restore();

      if (mv.gamelive == true) {
        mv.stepcounter++;
        window.requestAnimationFrame(mm.step);
      }
    },
  },
};

// socket event functions

socket.on("server2client", function () {
  // In order to create a real-time latency check, we have to first store date/time in an array.
  // This is done via function 'client2server' and stores the date in array main.variables.latencyarray.
  // The server receives the signal from the client, and responds with signal server2client.
  // This function subtracts the date in the latencystart array at the latencycount position and displays it on the screen.
  let mv = main.variables;
  $("#latency").html(
    "Latency: " +
      (Date.now() - main.variables.latencyarray[mv.latencycount]) +
      " ms"
  );
  mv.latencycount++;

  // Keep main.variables.latencyarray.length at about 300
  // The function main.methods.latency fires every 1 second
  // So this gives it about 5 minutes worth of latency data
  if (mv.latencyarray.length > 300) {
    mv.latencyarray.splice(0, 1);
    mv.latencycount--;
  }
});

socket.on("create_user", function (data) {
  main.variables.username = $("#username").val();
  $("#createuser_wrapper").css("display", "none");
  $("#uid_info").html("User Name: " + main.variables.username);
});

socket.on("addgame", function (data) {
  $("#gamelist").html(
    $("#gamelist").html() + '<option value="' + data + '">' + data + "</option>"
  );
});

socket.on("addgamefirstload", function (data) {
  for (let key in data) {
    $("#gamelist").html(
      $("#gamelist").html() + '<option value="' + key + '">' + key + "</option>"
    );
  }
});

socket.on("removegame", function (data) {
  $('#gamelist option[value="' + data + '"]').remove();
});

socket.on("joingame", function (data) {
  main.variables.gameroom = data;
  $("#gname_info").html("Game Name: " + main.variables.gameroom);
});

socket.on("message", function (data) {
  alert(data);
});

socket.on("opponentname", function (data) {
  $("#oname_info").html("Game Opponent: " + data);
  socket.emit("serveropponentname", {
    gamename: main.variables.gameroom,
    username: main.variables.username,
  });
  if (main.variables.setupflag == 1) {
    $("#handlebar").trigger("click");
  }
  $("#gamestatus").html('Game Status: <span class="neongreen_txt">Live</span>');
  main.variables.gamelive = true;
  main.methods.step();
});

socket.on("opponentname2", function (data) {
  $("#oname_info").html("Opponent Name: " + data);
  if (main.variables.setupflag == 1) {
    $("#handlebar").trigger("click");
  }
  $("#gamestatus").html('Game Status: <span class="neongreen_txt">Live</span>');
  main.methods.step();
});

socket.on("circle", function (data) {
  main.methods.drawNewEnemyCircle(data.x, data.y, data.r, data.dottype);
});

socket.on("gamestatus", function (data) {
  let mv = main.variables;
  let mvd = main.variables.dots;

  if (
    data.stepcounter >
    main.gamestate[main.gamestate.length - 1].stepcounter + 100
  ) {
    mv.stepcounter = data.stepcounter;

    if (mv.host == true) {
      // if it's the host client
      mv.dots = JSON.parse(JSON.stringify(data.dots1));
      //let edots = JSON.parse(JSON.stringify(data.dots2));
      mv.edots = JSON.parse(JSON.stringify(data.dots2));
      mv.flags = JSON.parse(JSON.stringify(data.flags1));

      // must inverse the edots to make them display correctly on opposite screens
      /*
            for (let dot in mv.edots) {
                //dot.x = (400 - edots.x);
                //dot.y = (400 - edots.y);
                dot.live = edots.live;
            }
            */
    } else {
      // if it's NOT the host client
      let dots = JSON.parse(JSON.stringify(data.dots2));
      let edots = JSON.parse(JSON.stringify(data.dots1));
      mv.flags = JSON.parse(JSON.stringify(data.flags2));

      // must inverse the dots/edots to make them display correctly on the non-host client

      for (let dot in mv.dots) {
        for (let ndot in dots) {
          if (mv.dots[dot].n == dots[ndot].n) {
            mv.dots[dot].x = 400 - dots.x;
            mv.dots[dot].y = 400 - dots.y;
            mv.dots[dot].live = dots.live;
          }
        }
      }

      for (let dot in mv.edots) {
        for (let ndot in edots) {
          if (mv.edots[dot].n == edots[ndot].n) {
            mv.edots[dot].x = 400 - edots.x;
            mv.edots[dot].y = 400 - edots.y;
            mv.edots[dot].live = edots.live;
          }
        }
      }

      // for the non-host client, must inverse flags to make the display correctly
      // as the server receives the flag array in the order used by the host machine
      /*
            mv.flags[0].x = (400 - data.flags[1].x);
            mv.flags[0].y = (400 - data.flags[1].y);
            mv.flags[1].x = (400 - data.flags[0].x);
            mv.flags[1].y = (400 - data.flags[0].y);
            */
    }
  }
});

socket.on("circlecollision", function (data) {
  console.log(JSON.stringify(data.c1) + " -c1");
  console.log(JSON.stringify(data.c2) + " -c2");
  let mv = main.variables;

  if (data.host == true) {
    // if the host client attacker initiated the collision
    if (mv.host == true) {
      // and if the receiving client is the host
      for (let dot in mv.dots) {
        // then turn c1 ( the attacker ) .live to false
        if (mv.dots[dot].n == data.c1.n) {
          mv.dots[dot].live = false;
        }
      }
      for (let dot in mv.edots) {
        // and c2 ( the target ) .live to false
        if (mv.edots[dot].n == data.c2.n) {
          mv.edots[dot].live = false;
        }
      }
    } else {
      // else if the receiving client is NOT the host, inversion is necessary
      for (let dot in mv.dots) {
        // then turn c2 ( the target ) .live to false
        if (mv.dots[dot].n == data.c2.n) {
          mv.dots[dot].live = false;
        }
      }
      for (let dot in mv.edots) {
        // and c2 ( the attacker ) .live to false
        if (mv.edots[dot].n == data.c1.n) {
          mv.edots[dot].live = false;
        }
      }
    }
  } else {
    // else if the non-host client attacker initiated the collision
    if (mv.host == true) {
      // and if the receiving client is the host, inversion is necessary
      for (let dot in mv.dots) {
        // then turn c1 ( the attacker ) .live to false
        if (mv.dots[dot].n == data.c2.n) {
          mv.dots[dot].live = false;
        }
      }
      for (let dot in mv.edots) {
        // and c2 ( the target ) .live to false
        if (mv.edots[dot].n == data.c1.n) {
          mv.edots[dot].live = false;
        }
      }
    } else {
      // else if the receiving client is NOT the host, inversion is necessary
      for (let dot in mv.dots) {
        // then turn c2 ( the target ) .live to false
        if (mv.dots[dot].n == data.c1.n) {
          mv.dots[dot].live = false;
        }
      }
      for (let dot in mv.edots) {
        // and c2 ( the attacker ) .live to false
        if (mv.edots[dot].n == data.c2.n) {
          mv.edots[dot].live = false;
        }
      }
    }
  }
});

// jquery event functions

$(main.variables.canvas).contextmenu(function (e) {
  e.preventDefault();

  let mv = main.variables;
  let mm = main.methods;
  let dots = 0;

  for (let dot in mv.dots) {
    if (mv.dots[dot].live == true) {
      dots++;
    }
  }

  if (mv.gamelive == true) {
    if (dots <= 10) {
      let x;
      let y;

      if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
      } else {
        x =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;
        y =
          e.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;
      }

      x -= mv.canvas.offsetLeft;
      y -= mv.canvas.offsetTop;

      // check and disallow circle creation if within drop boundry area...
      mv.ctx.rect(
        mv.dropboundry.x,
        mv.dropboundry.y,
        mv.dropboundry.w,
        mv.dropboundry.h
      );
      if (mv.ctx.isPointInPath(mv.mouse.x, mv.mouse.y) == false) {
        mm.drawNewCircle(x, y, 7, mv.colors.green, "flagrunner");
      }
    } else {
      mm.message("You have reached your dot limit of 10!");
    }
  } else {
    mm.message("You have not setup your game yet.");
  }
});

$(main.variables.canvas).click(function (e) {
  let mv = main.variables;
  let mm = main.methods;
  let dots = 0;

  for (let dot in mv.dots) {
    if (mv.dots[dot].live == true) {
      dots++;
    }
  }

  if (mv.gamelive == true) {
    if (dots < 10) {
      let x;
      let y;
      if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
      } else {
        x =
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;
        y =
          e.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;
      }
      x -= mv.canvas.offsetLeft;
      y -= mv.canvas.offsetTop;

      // check and disallow circle creation if within drop boundry area...
      mv.ctx.rect(
        mv.dropboundry.x,
        mv.dropboundry.y,
        mv.dropboundry.w,
        mv.dropboundry.h
      );
      if (mv.ctx.isPointInPath(mv.mouse.x, mv.mouse.y) == false) {
        mm.drawNewCircle(x, y, 7, mv.colors.blue, "attacker");
      }
    } else {
      mm.message("You have reached your dot limit of 10!");
    }
  } else {
    mm.message("You have not setup your game yet.");
  }
});

$(main.variables.canvas).mousemove(function (e) {
  //captures the mouse coordinates within the canvas...

  let mv = main.variables;

  let rect = this.getBoundingClientRect();
  mv.mouse.x = e.clientX - rect.left;
  mv.mouse.y = e.clientY - rect.top;

  $("#mousecoords").html(
    "Mouse Coordinates: " + mv.mouse.x + " - " + mv.mouse.y
  );
});

$(main.variables.canvas).mouseout(function (e) {
  //sets the y value outside of the border coordinates so it will not stay red...
  main.variables.mouse.y = 201;
});

$("#handlebar").click(function () {
  if (main.variables.setupflag == 0) {
    $("html, body").animate(
      {
        left: $("#setup_wrapper").width() * -1 + 80 + "px",
      },
      200
    );

    main.variables.setupflag = 1;
  } else {
    $("html, body").animate(
      {
        left: "0",
      },
      200
    );

    main.variables.setupflag = 0;
  }

  setTimeout(function () {
    $("#handlebar i").toggleClass("glyphicon-chevron-right"),
      $("#handlebar").toggleClass("addneonblue");
  }, 200);
});

$("#createuser_wrapper").submit(function (e) {
  e.preventDefault();
  if ($("#username").val() != "") {
    socket.emit("createuser", $("#username").val());
  }
});

$("#creategame_wrapper").submit(function (e) {
  e.preventDefault();
  if ($("#gamename").val() != "" && main.variables.username != "") {
    if ($("#gname_info").html() != "") {
      let r = confirm(
        "Are you sure you wish to leave your existing game: " +
          main.variables.gameroom
      );
      if (r) {
        socket.emit("creategame", {
          gamename: $("#gamename").val(),
          oldgamename: main.variables.gameroom,
          username: main.variables.username,
          goals: main.variables.goals,
          goalboundries: main.variables.goalboundries,
          flags: main.variables.flags,
          dropboundry: main.variables.dropboundry,
          stepcounter: main.variables.stepcounter,
          gamesize: $("#gamesize").val(),
        });
        $("#gname_info").html("Game Name: " + $("#gamename").val() + " ");
        main.variables.host = true;
      }
    } else {
      socket.emit("creategame", {
        gamename: $("#gamename").val(),
        //'oldgamename': main.variables.gameroom,
        username: main.variables.username,
        goals: main.variables.goals,
        goalboundries: main.variables.goalboundries,
        flags: main.variables.flags,
        dropboundry: main.variables.dropboundry,
        stepcounter: main.variables.stepcounter,
        gamesize: $("#gamesize").val(),
      });
      $("#gname_info").html("Game Name: " + $("#gamename").val() + " ");
      main.variables.host = true;
    }
  }
});

$("#joingame_wrapper").submit(function (e) {
  e.preventDefault();
  if ($("#gamelist").val() != "default" && main.variables.username != "") {
    if ($("#gname_info").html() != "") {
      let r = confirm(
        "Are you sure you wish to leave your existing game: " +
          main.variables.gameroom
      );
      if (r) {
        socket.emit("joingame", {
          gamename: $("#gamelist").val(),
          oldgamename: main.variables.gameroom,
          username: main.variables.username,
          flags: main.variables.flags,
        });
        $("#gamestatus").html(
          'Game Status: <span class="neongreen_txt">Live</span>'
        );
        //playerturn = 2;
        main.variables.gamelive = true;
      }
    } else {
      socket.emit("joingame", {
        gamename: $("#gamelist").val(),
        username: main.variables.username,
        flags: main.variables.flags,
      });
      $("#gamestatus").html(
        'Game Status: <span class="neongreen_txt">Live</span>'
      );
      //playerturn = 2;
      main.variables.gamelive = true;
    }
  }
});

// initialize the setup and start the step cycle

main.methods.init(); // pre-loads images, starts the latency check

//setInterval(() => main.methods.step(), 17);
//window.requestAnimationFrame(main.methods.step);
