import React, { Component } from 'react';
import worldmap from './map.js';

class World extends Component {
  constructor (props) {
    super(props);
    this.world = worldmap;
    this.state = { enemies: {}, items: [], boss: { name: "Evil Eyes", level: 50, healthCurrent: 500, healthMax: 500, attack: 70 }, targetedEnemy: {}, messages: ["Welcome to Dungeon Crawler!", "Use W A S D to move your character.", "To win, defeat the dungeon boss!", "Good luck!"] };
  }
  componentWillMount = () => {
    this.gameInit();
  }
  gameInit = () => {
    let //Pushes Player onto the array (position is random between one of two locations)
        playerStarti = /*67,*/Math.floor(Math.random()) === 1 ? 189 : 190,
        playerStartj = /*181*/playerStarti === 189 ? 3 : 31,
        enemies = {};
        this.world[playerStarti][playerStartj] = 2;

    //Pushes Boss onto the array.
    for ( var r = 11; r < 15; ++r ) {
      for ( var s = 180; s < 184; ++s ) {
        this.world[r][s] = 6;
      }
    }

    //Gives each open tile a chance to become an enemy, item, or health pack.
    for ( var i = 0, len = this.world.length; i < len; ++i ) {
      for ( var j = 0; j < len; ++j ) {
        var lotto = (Math.random() * 100), occupier,
            lvl = 1;
        if ( i > 170 && j < 30 ) {
          lvl = 1;
        } else if ( i > 100 && j < 100 ) {
          lvl = 2;
        } else if ( i > 50 && j < 150 ) {
          lvl = 3;
        } else { lvl = Math.floor(Math.random() * 10) + 4 };

        switch (true) {
          case lotto > 99.9:
            occupier = 5;
            break;
          case lotto > 99.4:
            occupier = 4;
            break;
          case lotto >= 97.8:
            occupier = 3;
            var level = Math.floor((Math.random() * lvl) + lvl),
                health = Math.floor((Math.random() * 40) + 40 * lvl),
                attack = Math.floor((Math.random() * lvl) + 2) + level * 2,
                id = "i" + i + "j" + j;
            if ( this.world[i][j] === 0 ){
              enemies[id] = { position: {i: i, j: j}, level: level, healthCurrent: health, healthMax: health, attack: attack };
            }
            break;
          default:
            occupier = 0;
            break;
        }
        if ( occupier !== 0 && this.world[i][j] === 0) { //Only sets those spaces which wouldn't become 0, and checks space for emptiness.
          this.world[i][j] = occupier;
        }
      }
    }
    this.setState({ player: { position: {i: playerStarti, j: playerStartj}, experienceCurrent: 0, experienceMax: 50, healthCurrent: 100, healthMax: 100, attack: 5, level: 1 }, enemies: enemies, gameInPlay: true });
  }
  legalCheck = (i, j) => {
    if (this.world[i][j] === 0) {
      this.setState({ targetedEnemy: {} });
      return true;
    } else if (this.world[i][j] === 3) {
      this.enemyFight(i, j);
    } else if (this.world[i][j] === 4) {
      this.healthPickup(i, j);
    } else if (this.world[i][j] === 5) {
      this.weaponPickup(i, j);
    } else if (this.world[i][j] === 6) {
      this.bossFight();
    } else if (this.world[i][j] === 7) {
      this.bossTalk();
    } else if (this.world[i][j] === 8) {
      this.soldierTalk();
    } else return false;
  }
  enemyFight = (i, j) => {
    let enemyid = "i" + i + "j" + j,
        enemies= this.state.enemies,
        targetedEnemy = enemies[enemyid],
        playerCurrent = this.state.player,
        phealth = playerCurrent.healthCurrent,
        pattack = playerCurrent.attack,
        ehealth = targetedEnemy.healthCurrent,
        eattack = targetedEnemy.attack,
        messages = this.state.messages,
        playerDamage = pattack + Math.floor(Math.random() * 2),
        enemyDamage = eattack + Math.floor(Math.random() * 2);
    
    targetedEnemy.healthCurrent = ehealth - playerDamage;
    playerCurrent.healthCurrent = phealth - enemyDamage;
    messages.push("You hit the skeleton for " + playerDamage + " damage.");
    messages.push("Skeleton attacked player for " + enemyDamage + " damage.");
    
    if (playerCurrent.healthCurrent <= 0) {
      this.world[this.state.player.position.i][this.state.player.position.j] = 3;
      playerCurrent.healthCurrent = 0;
      messages.push("You have been defeated. Better luck next time!");
      this.loss();
      this.setState({ enemies: enemies, targetedEnemy: {}, messages: messages });
    } else {
      this.setState({ enemies: enemies, targetedEnemy: targetedEnemy, messages: messages });
    }
    
    if (targetedEnemy.healthCurrent <= 0) {
      this.experienceGain(targetedEnemy.level);
      delete enemies.targetedEnemy;
      this.world[i][j] = 0;
      messages.push("Skeleton defeated!")
      this.setState({ enemies: enemies, targetedEnemy: {}, messages: messages });
    } else {
      this.setState({ enemies: enemies, targetedEnemy: targetedEnemy, messages: messages });
    }


  }
  healthPickup = (i, j) => {
    let playerCurrent = this.state.player,
        phealthcurrent = playerCurrent.healthCurrent,
        phealthmax = playerCurrent.healthMax,
        messages = this.state.messages;
    
    playerCurrent.healthCurrent = phealthcurrent + 25 > phealthmax ? phealthmax : phealthcurrent + 25;
    this.world[i][j] = 0;
    messages.push("Gained 25hp.");
    this.setState({ player: playerCurrent, messsages: messages });

  }
  weaponPickup = (i, j) => {
    let playerCurrent = this.state.player,
        pattack = playerCurrent.attack,
        messages = this.state.messages;
    
    playerCurrent.attack = pattack + 3;
    this.world[i][j] = 0;
    messages.push("New weapon, attack increased by 3.");
    this.setState({ player: playerCurrent });
  }
  soldierTalk = () => {
    let messages = this.state.messages;
    messages.push("Thank you for saving me!")
    this.setState({ messsages: messages });
  }
  bossTalk = () => {
    let messages = this.state.messages;
    messages.push("The evil eyes have been defeated and the dungeon's curse has been lifted.")
    this.setState({ messsages: messages });
  }
  experienceGain = (level) => {
    var player = this.state.player,
        expCurrent = this.state.player.experienceCurrent,
        expMax = this.state.player.experienceMax,
        expGained = 10 * level,
        messages = this.state.messages;

    if ( expCurrent + expGained >= expMax) {
      player.level += 1;
      player.experienceCurrent = 0;
      player.experienceMax += 20;
      player.healthMax += 10;
      player.healthCurrent = player.healthMax;
      player.attack += 2;
      messages.push("Gained " + expGained + "xp.");
      messages.push("You reached level " + player.level + "!");
    } else {
      player.experienceCurrent = expCurrent + expGained;
      messages.push("Gained " + expGained + "xp.");
    }
    this.setState({ player: player, messages: messages });

  }
  bossFight = () => {
    let boss = this.state.boss,
        playerCurrent = this.state.player,
        phealth = playerCurrent.healthCurrent,
        pattack = playerCurrent.attack,
        bhealth = boss.healthCurrent,
        battack = boss.attack,
        messages = this.state.messages,
        playerDamage = pattack + Math.floor(Math.random() * 2),
        bossDamage = battack + Math.floor(Math.random() * 2);
    
    boss.healthCurrent = bhealth - playerDamage;
    playerCurrent.healthCurrent = phealth - bossDamage;
    messages.push("You hit the boss for " + playerDamage + " damage.");
    messages.push("Skeleton attacked player for " + bossDamage + " damage.");
    
    if (playerCurrent.healthCurrent <= 0) {
      this.world[this.state.player.position.i][this.state.player.position.j] = 3;
      playerCurrent.healthCurrent = 0;
      messages.push("You were so close! Better luck next time.");
      this.loss();
      this.world = this.world;
      this.setState({ boss: boss, targetedEnemy: {}, messages: messages });
    }
    
    if (boss.healthCurrent <= 0) {
      
      messages.push("Boss defeated!");
      messages.push("Congratulations, you've won!");
      this.win();
      this.setState({ boss: {}, targetedEnemy: {}, messages: messages });
    } else {
      this.setState({ boss: boss, targetedEnemy: boss, messages: messages });
    }
  }
  loss = () => {
    this.setState({ gameInPlay: false });
  }
  win = () => {
    let enemies = this.state.enemies;
    for ( var r = 11; r < 15; ++r ) {
        for ( var s = 180; s < 184; ++s ) {
          this.world[r][s] = 7;
        }
      }
    
    for ( var enemy in enemies ) {
      this.world[enemy.position.i][enemy.position.j] = 8;
    }
  }
  playerInput = (e) => {
    let currentPlayer = this.state.player,      
        i = currentPlayer.position.i,
        j = currentPlayer.position.j;
    if ( this.state.gameInPlay === true ) {
      switch (e.charCode) {
      case 119: //w
        if (this.legalCheck(i - 1, j) === true) {
          currentPlayer.position.i = i - 1;
          currentPlayer.position.j = j;
          this.world[i][j] = 0;
          this.world[currentPlayer.position.i][currentPlayer.position.j] = 2;
          break;
        } else break;
      case 100: //d
        if (this.legalCheck(i, j + 1) === true) {
          currentPlayer.position.i = i;
          currentPlayer.position.j = j + 1;
          this.world[i][j] = 0;
          this.world[currentPlayer.position.i][currentPlayer.position.j] = 2;
          break;
        } else break;
      case 115: //s
        if (this.legalCheck(i + 1, j) === true) {
          currentPlayer.position.i = i + 1;
          currentPlayer.position.j = j;
          this.world[i][j] = 0;
          this.world[currentPlayer.position.i][currentPlayer.position.j] = 2;
          break;
        } else break;
      case 97:  //a
        if (this.legalCheck(i, j - 1) === true) {
          currentPlayer.position.i = i;
          currentPlayer.position.j = j - 1;
          this.world[i][j] = 0;
          this.world[currentPlayer.position.i][currentPlayer.position.j] = 2;
          break;
        } else break;
      default:
        break;
    }
    this.setState({ player: currentPlayer });
    }
    
  }
  render () {
    return (
      <div className="world" tabIndex="0" onKeyPress={ this.playerInput }>
        <PlayerStats { ...this.state.player }/>
        <EnemyStats enemy={ this.state.targetedEnemy }/>
        <div className="fog"></div>
        <View player={ this.state.player } world={ this.world } />
        <Messages { ...this.state }/>
      </div>
    )
  }
}
class View extends Component {
  getTiles = () => {
    let ppi = this.props.player.position.i - 10,
        ppj = this.props.player.position.j - 10,
        viewarr = [];

    for ( var l = ppi; l < ppi + 20; ++l ) {
      for ( var m = ppj; m < ppj + 20; ++m ) {
        if ( l > 199 || l < 0 || m > 199 || m < 0 ) {
          viewarr.push("wall");
        } else {
          switch ( this.props.world[l][m] ) {
            case 0:
              viewarr.push("floor");
              break;
            case 1:
              viewarr.push("wall");
              break;
            case 2:
              viewarr.push("player");
              break;
            case 3:
              viewarr.push("enemy");
              break;
            case 4:
              viewarr.push("health");
              break;
            case 5:
              viewarr.push("weapon");
              break;
            case 6:
              viewarr.push("boss");
              break;
            case 7:
              viewarr.push("boss-dead");
              break;
            case 8:
              viewarr.push("soldier");
              break;
            case undefined:
            default:
              viewarr.push("wall");
              break;
          }
        }

      }
    }
    const currentView = viewarr.map((tile, k) => {
      return (
        <div key={ k } className={tile + " tile"}></div>
      )
    });
    return currentView;
  }
  render () {
    return (
      <div className="view">
      { this.getTiles() }
      </div>
    )
  }
}

class Messages extends Component {
  render () {
    const messagesArr = [];
    for ( var i = this.props.messages.length - 5, len = this.props.messages.length; i < len; ++i ) {
      messagesArr.push( this.props.messages[i] );
    }
    const currentMessages = messagesArr.map((item, j) => {
      return (
        <div key={ j }>{ item }</div>
      )
    })
    return (
      <div className="messages-box">{ currentMessages }</div>
    )
  }
}
class PlayerStats extends Component {
  render () {
    return (
      <div className="player-stats-box">
        <div>Player</div>
        <div>Level: {this.props.level} Experience: {this.props.experienceCurrent}/{this.props.experienceMax}</div>
        <div>Health:{this.props.healthCurrent}/{this.props.healthMax}</div>
        Attack:{this.props.attack}-{this.props.attack+2}
        
      </div>
    )
  }
}

class EnemyStats extends Component {
  render () {
    const stats = this.props.enemy.level ? (<div><div>{ this.props.enemy.name ? "Evil Eyes" : "Skeleton"}</div><div>Level: {this.props.enemy.level}</div>Health:  {this.props.enemy.healthCurrent}/{this.props.enemy.healthMax}<div>Attack: {this.props.enemy.attack}-{this.props.enemy.attack+2}</div></div>): undefined;
    return (
      <div className="enemy-stats-box">{stats}</div>
    )
  }
}
export default World;