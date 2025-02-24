// src/components/RankingDashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';

const gradients = {
  teamScore: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
  teamAttacked: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
  playerScore: 'linear-gradient(135deg, #11998e, #38ef7d)',
  playerMiniGame: 'linear-gradient(135deg, #fc4a1a, #f7b733)',
};

// 進度條部分：直接以普通 div 呈現最終寬度
const calcProgressWidth = (value, maxValue) => {
  const percentage = Math.round((value / maxValue) * 100);
  return `${percentage}%`;
};

const ProgressBar = ({ progressWidth }) => (
  <div style={{ width: progressWidth, height: '100%', background: '#fff' }} />
);

// 根據欄位決定是否隱藏數值，若隱藏則回傳 '---'
const displayValueByField = (value, item, field) => {
  if (field === 'score' || field === 'attacked_count') {
    return item.hide_ranking ? '---' : value;
  } else if (field === 'personal_score') {
    return item.hide_personal_score ? '---' : value;
  } else if (field === 'completed_minigame_count') {
    return item.hide_completed_minigame_count ? '---' : value;
  }
  return value;
};

function RankingDashboard() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // 前端設定：各排行榜顯示前幾名（僅供控制顯示數量，實際隱藏依後端資料）
  const [topTeamsScoreCount, setTopTeamsScoreCount] = useState(6);
  const [hideTeamsScore, setHideTeamsScore] = useState(false);
  const [topTeamsAttackedCount, setTopTeamsAttackedCount] = useState(6);
  const [hideTeamsAttacked, setHideTeamsAttacked] = useState(false);
  const [topPlayersScoreCount, setTopPlayersScoreCount] = useState(6);
  const [hidePlayersScore, setHidePlayersScore] = useState(false);
  const [topPlayersMiniGameCount, setTopPlayersMiniGameCount] = useState(6);
  const [hidePlayersMiniGame, setHidePlayersMiniGame] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRes = await fetch('/api/teams/');
        const teamsData = await teamsRes.json();
        const playersRes = await fetch('/api/players/');
        const playersData = await playersRes.json();
        teamsData.sort((a, b) => b.score - a.score);
        playersData.sort((a, b) => b.personal_score - a.personal_score);
        setTeams(teamsData);
        setPlayers(playersData);
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const maxTeamScore = teams.reduce((max, team) => Math.max(max, team.score), 0) || 1;
  const maxAttacked = teams.reduce((max, team) => Math.max(max, team.attacked_count), 0) || 1;
  const maxPlayerScore = players.reduce((max, player) => Math.max(max, player.personal_score), 0) || 1;
  const maxMiniGame = players.reduce((max, player) => Math.max(max, player.completed_minigame_count), 0) || 1;

  const sortedTeamsByScore = [...teams].slice(0, topTeamsScoreCount);
  const sortedTeamsByAttacked = [...teams].slice(0, topTeamsAttackedCount);
  const sortedPlayersByScore = [...players].slice(0, topPlayersScoreCount);
  const sortedPlayersByMiniGame = [...players].slice(0, topPlayersMiniGameCount);

  // 隊伍名稱格式化：若 hide_team_name 為 true 則顯示 '---'
  const teamLabelFormatter = (team) => {
    return team.hide_team_name ? '---' : team.name;
  };

  // 玩家名稱格式化：若隱藏所屬隊伍或隱藏姓名，則分別處理
  const formatPlayerLabel = (player) => {
    let teamObj = null;
    if (player.team && typeof player.team === 'object') {
      teamObj = player.team;
    } else if (player.team) {
      teamObj = teams.find(t => t.id === player.team);
    }
    const teamPart = teamObj && !player.hide_team ? teamObj.name : '';
    const namePart = !player.hide_name ? player.name : '';
    if (teamPart && namePart) {
      return `${teamPart}-${namePart}`;
    }
    return teamPart || namePart || '---';
  };

  // RankingRow 只保留 layout 與 animate 過渡，不使用 initial/exit 以避免閃爍
  const RankingRow = ({ item, index, valueKey, labelFormatter, barGradient, maxValue }) => {
    const value = item[valueKey];
    const progressWidth = calcProgressWidth(value, maxValue);
    return (
      <motion.div
        layout
        transition={{ layout: { type: 'spring', stiffness: 80, damping: 70 } }}
        style={{ perspective: 800, marginBottom: '10px', padding: '5px 10px', borderBottom: '1px solid rgba(255,255,255,0.4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <div style={{ width: '40px', fontWeight: 'bold', color: '#fff' }}>
            {index === 0 ? '👑' : index + 1}
          </div>
          <div style={{ flexGrow: 1, fontSize: '1.1rem', color: '#fff' }}>
            {labelFormatter ? labelFormatter(item) : item.name}
          </div>
          <div style={{ width: '60px', textAlign: 'right', fontWeight: 'bold', color: '#fff' }}>
            {displayValueByField(value, item, valueKey)}
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '4px', overflow: 'hidden', height: '10px' }}>
          <div style={{ width: progressWidth, height: '100%', background: '#fff' }} />
        </div>
      </motion.div>
    );
  };

  // 移除 AnimatePresence，直接渲染 RankingRow 列表
  const RankingCard = ({ title, items, maxValue, valueKey, labelFormatter, cardGradient, barGradient }) => (
    <Card className="mb-4 shadow-lg" style={{ background: cardGradient, border: 'none' }}>
      <Card.Header style={{ background: 'transparent', border: 'none', fontWeight: 'bold', color: '#fff' }}>
        {title}
      </Card.Header>
      <Card.Body>
        {items.length > 0 ? items.map((item, index) => (
          <RankingRow
            key={item.id}
            item={item}
            index={index}
            valueKey={valueKey}
            labelFormatter={labelFormatter}
            barGradient={barGradient}
            maxValue={maxValue}
          />
        )) : (
          <div style={{ textAlign: 'center', color: '#ccc' }}>暫無資料</div>
        )}
      </Card.Body>
    </Card>
  );

  const dividerStyle = { borderTop: '2px solid #fff', margin: '40px 0' };

  return (
    <Container className="my-5" style={{ background: 'linear-gradient(135deg, #141E30, #243B55)', padding: '30px', borderRadius: '12px' }}>
      <h1 className="text-center mb-4" style={{ color: '#fff' }}>排行榜</h1>
      <Row>
        {!hideTeamsScore && (
          <Col md={6}>
            <RankingCard
              title="隊伍總分排名"
              items={sortedTeamsByScore}
              maxValue={maxTeamScore}
              valueKey="score"
              labelFormatter={(team) => teamLabelFormatter(team)}
              cardGradient={gradients.teamScore}
              barGradient="linear-gradient(90deg, #4e54c8, #8f94fb)"
            />
          </Col>
        )}
        {!hideTeamsAttacked && (
          <Col md={6}>
            <RankingCard
              title="隊伍被攻擊次數排名"
              items={sortedTeamsByAttacked}
              maxValue={maxAttacked}
              valueKey="attacked_count"
              labelFormatter={(team) => teamLabelFormatter(team)}
              cardGradient={gradients.teamAttacked}
              barGradient="linear-gradient(90deg, #ff416c, #ff4b2b)"
            />
          </Col>
        )}
      </Row>
      <Row>
        {!hidePlayersScore && (
          <Col md={6}>
            <RankingCard
              title="玩家得分排名"
              items={sortedPlayersByScore}
              maxValue={maxPlayerScore}
              valueKey="personal_score"
              labelFormatter={(player) => formatPlayerLabel(player)}
              cardGradient={gradients.playerScore}
              barGradient="linear-gradient(90deg, #11998e, #38ef7d)"
            />
          </Col>
        )}
        {!hidePlayersMiniGame && (
          <Col md={6}>
            <RankingCard
              title="玩家小遊戲完成數排名"
              items={sortedPlayersByMiniGame}
              maxValue={maxMiniGame}
              valueKey="completed_minigame_count"
              labelFormatter={(player) => formatPlayerLabel(player)}
              cardGradient={gradients.playerMiniGame}
              barGradient="linear-gradient(90deg, #fc4a1a, #f7b733)"
            />
          </Col>
        )}
      </Row>

      <hr style={dividerStyle} />

      <Card className="mb-4 shadow-lg" style={{ background: '#fff', color: '#333' }}>
        <Card.Header as="h5">排行榜設定</Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="teamsScoreCount">
                <Form.Label>隊伍總分顯示前幾名</Form.Label>
                <Form.Control
                  type="number"
                  value={topTeamsScoreCount}
                  onChange={e => setTopTeamsScoreCount(Number(e.target.value))}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="hideTeamsScore">
                <Form.Label>隱藏隊伍總分排行榜</Form.Label>
                <Form.Check
                  type="switch"
                  checked={hideTeamsScore}
                  onChange={e => setHideTeamsScore(e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="teamsAttackedCount">
                <Form.Label>隊伍被攻擊顯示前幾名</Form.Label>
                <Form.Control
                  type="number"
                  value={topTeamsAttackedCount}
                  onChange={e => setTopTeamsAttackedCount(Number(e.target.value))}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="hideTeamsAttacked">
                <Form.Label>隱藏隊伍被攻擊排行榜</Form.Label>
                <Form.Check
                  type="switch"
                  checked={hideTeamsAttacked}
                  onChange={e => setHideTeamsAttacked(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="playersScoreCount">
                <Form.Label>玩家得分顯示前幾名</Form.Label>
                <Form.Control
                  type="number"
                  value={topPlayersScoreCount}
                  onChange={e => setTopPlayersScoreCount(Number(e.target.value))}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="hidePlayersScore">
                <Form.Label>隱藏玩家得分排行榜</Form.Label>
                <Form.Check
                  type="switch"
                  checked={hidePlayersScore}
                  onChange={e => setHidePlayersScore(e.target.checked)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="playersMiniGameCount">
                <Form.Label>玩家小遊戲顯示前幾名</Form.Label>
                <Form.Control
                  type="number"
                  value={topPlayersMiniGameCount}
                  onChange={e => setTopPlayersMiniGameCount(Number(e.target.value))}
                  min={1}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="hidePlayersMiniGame">
                <Form.Label>隱藏玩家小遊戲排行榜</Form.Label>
                <Form.Check
                  type="switch"
                  checked={hidePlayersMiniGame}
                  onChange={e => setHidePlayersMiniGame(e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RankingDashboard;