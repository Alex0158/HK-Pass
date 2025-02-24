// src/components/BatchCreate.js
import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Form, Button } from 'react-bootstrap';

function BatchCreate() {
  const [activeKey, setActiveKey] = useState("teams");

  // Teams 表單狀態
  const [teamName, setTeamName] = useState("");
  const [teamHideRanking, setTeamHideRanking] = useState(false);
  const [teamHideTeamName, setTeamHideTeamName] = useState(false);

  // Players 表單狀態
  const [playerName, setPlayerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState(""); // 自動填入
  const [playerTeam, setPlayerTeam] = useState(""); // 將變成下拉選單
  const [playerHideName, setPlayerHideName] = useState(false);
  const [playerHideTeam, setPlayerHideTeam] = useState(false);
  const [playerHidePersonalScore, setPlayerHidePersonalScore] = useState(false);
  const [playerHideCompletedMinigameCount, setPlayerHideCompletedMinigameCount] = useState(false);

  // MiniGames 表單狀態
  const [gameCategory, setGameCategory] = useState("");
  const [gameRoom, setGameRoom] = useState("");
  const [gameName, setGameName] = useState("");
  const [gameAvailableChips, setGameAvailableChips] = useState(0);
  const [gameIsDisplayed, setGameIsDisplayed] = useState(true);
  const [gameIsLimited, setGameIsLimited] = useState(false);
  const [gameLimitedTime, setGameLimitedTime] = useState(0);

  // 額外狀態：抓取所有隊伍與玩家資料，用於玩家分頁的下拉選單及自動生成玩家號碼
  const [teamsList, setTeamsList] = useState([]);
  const [existingPlayers, setExistingPlayers] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams/');
        const data = await res.json();
        setTeamsList(data);
      } catch (error) {
        console.error("Error fetching teams for players tab:", error);
      }
    };
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/players/');
        const data = await res.json();
        setExistingPlayers(data);
        // 計算目前最大玩家號碼（假設號碼皆為數字型態的字串）
        let maxNumber = 0;
        data.forEach(player => {
          const num = parseInt(player.number);
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num;
          }
        });
        setPlayerNumber((maxNumber + 1).toString());
      } catch (error) {
        console.error("Error fetching players for auto increment:", error);
      }
    };
    fetchTeams();
    fetchPlayers();
  }, []);

  // 提交隊伍創建
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: teamName,
      score: 0,
      attacked_count: 0,
      hide_ranking: teamHideRanking,
      hide_team_name: teamHideTeamName,
    };
    try {
      const res = await fetch('/api/teams/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("隊伍建立成功！");
        setTeamName("");
        setTeamHideRanking(false);
        setTeamHideTeamName(false);
      } else {
        alert("建立隊伍失敗！");
      }
    } catch (error) {
      console.error(error);
      alert("建立隊伍時發生錯誤！");
    }
  };

  // 提交玩家創建
  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: playerName,
      number: playerNumber,
      personal_score: 0,
      chips: 0,
      completed_minigame_count: 0,
      team: playerTeam, // 傳入選擇的隊伍ID
      hide_name: playerHideName,
      hide_team: playerHideTeam,
      hide_personal_score: playerHidePersonalScore,
      hide_completed_minigame_count: playerHideCompletedMinigameCount,
    };
    try {
      const res = await fetch('/api/players/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("玩家建立成功！");
        setPlayerName("");
        // 重新計算玩家號碼：自動加 1
        let current = parseInt(playerNumber);
        setPlayerNumber((current + 1).toString());
        setPlayerTeam("");
        setPlayerHideName(false);
        setPlayerHideTeam(false);
        setPlayerHidePersonalScore(false);
        setPlayerHideCompletedMinigameCount(false);
      } else {
        alert("建立玩家失敗！");
      }
    } catch (error) {
      console.error(error);
      alert("建立玩家時發生錯誤！");
    }
  };

  // 提交小遊戲創建
  const handleGameSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category: gameCategory,
      room: gameRoom,
      name: gameName,
      available_chips: Number(gameAvailableChips),
      is_displayed: gameIsDisplayed,
      is_limited: gameIsLimited,
      limited_time: Number(gameLimitedTime),
      play_count: 0,
    };
    try {
      const res = await fetch('/api/minigames/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("小遊戲建立成功！");
        setGameCategory("");
        setGameRoom("");
        setGameName("");
        setGameAvailableChips(0);
        setGameIsDisplayed(true);
        setGameIsLimited(false);
        setGameLimitedTime(0);
      } else {
        alert("建立小遊戲失敗！");
      }
    } catch (error) {
      console.error(error);
      alert("建立小遊戲時發生錯誤！");
    }
  };

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4">批量創建介面</h1>
      <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>
        <Tab eventKey="teams" title="隊伍">
          <Form onSubmit={handleTeamSubmit} className="mt-3">
            <Form.Group controlId="teamName">
              <Form.Label>隊伍名稱</Form.Label>
              <Form.Control
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="teamHideRanking">
              <Form.Check
                type="checkbox"
                label="隱藏排行榜數值"
                checked={teamHideRanking}
                onChange={(e) => setTeamHideRanking(e.target.checked)}
              />
            </Form.Group>
            <Form.Group controlId="teamHideTeamName">
              <Form.Check
                type="checkbox"
                label="隱藏隊伍名稱"
                checked={teamHideTeamName}
                onChange={(e) => setTeamHideTeamName(e.target.checked)}
              />
            </Form.Group>
            <Button type="submit" className="mt-2">創建隊伍</Button>
          </Form>
        </Tab>
        <Tab eventKey="players" title="玩家">
          <Form onSubmit={handlePlayerSubmit} className="mt-3">
            <Form.Group controlId="playerName">
              <Form.Label>玩家名稱</Form.Label>
              <Form.Control
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="playerNumber">
              <Form.Label>玩家號碼 (自動填入)</Form.Label>
              <Form.Control
                type="text"
                value={playerNumber}
                readOnly
              />
            </Form.Group>
            <Form.Group controlId="playerTeam">
              <Form.Label>所屬隊伍</Form.Label>
              <Form.Control
                as="select"
                value={playerTeam}
                onChange={(e) => setPlayerTeam(e.target.value)}
              >
                <option value="">請選擇隊伍</option>
                {teamsList.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="playerHideName">
              <Form.Check
                type="checkbox"
                label="隱藏名稱"
                checked={playerHideName}
                onChange={(e) => setPlayerHideName(e.target.checked)}
              />
            </Form.Group>
            <Form.Group controlId="playerHideTeam">
              <Form.Check
                type="checkbox"
                label="隱藏所屬隊伍"
                checked={playerHideTeam}
                onChange={(e) => setPlayerHideTeam(e.target.checked)}
              />
            </Form.Group>
            <Form.Group controlId="playerHidePersonalScore">
              <Form.Check
                type="checkbox"
                label="隱藏個人得分"
                checked={playerHidePersonalScore}
                onChange={(e) => setPlayerHidePersonalScore(e.target.checked)}
              />
            </Form.Group>
            <Form.Group controlId="playerHideCompletedMinigameCount">
              <Form.Check
                type="checkbox"
                label="隱藏完成小遊戲數量"
                checked={playerHideCompletedMinigameCount}
                onChange={(e) => setPlayerHideCompletedMinigameCount(e.target.checked)}
              />
            </Form.Group>
            <Button type="submit" className="mt-2">創建玩家</Button>
          </Form>
        </Tab>
        <Tab eventKey="minigames" title="小遊戲">
          <Form onSubmit={handleGameSubmit} className="mt-3">
            <Form.Group controlId="gameCategory">
              <Form.Label>遊戲類別</Form.Label>
              <Form.Control
                type="text"
                value={gameCategory}
                onChange={(e) => setGameCategory(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="gameRoom">
              <Form.Label>房間</Form.Label>
              <Form.Control
                type="text"
                value={gameRoom}
                onChange={(e) => setGameRoom(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="gameName">
              <Form.Label>遊戲名稱</Form.Label>
              <Form.Control
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="gameAvailableChips">
              <Form.Label>可得籌碼</Form.Label>
              <Form.Control
                type="number"
                value={gameAvailableChips}
                onChange={(e) => setGameAvailableChips(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="gameIsDisplayed">
              <Form.Check
                type="checkbox"
                label="顯示於遊戲大全"
                checked={gameIsDisplayed}
                onChange={(e) => setGameIsDisplayed(e.target.checked)}
              />
            </Form.Group>
            <Form.Group controlId="gameIsLimited">
              <Form.Check
                type="checkbox"
                label="限時"
                checked={gameIsLimited}
                onChange={(e) => setGameIsLimited(e.target.checked)}
              />
            </Form.Group>
            <Form.Group controlId="gameLimitedTime">
              <Form.Label>限時秒數</Form.Label>
              <Form.Control
                type="number"
                value={gameLimitedTime}
                onChange={(e) => setGameLimitedTime(e.target.value)}
              />
            </Form.Group>
            <Button type="submit" className="mt-2">創建小遊戲</Button>
          </Form>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default BatchCreate;