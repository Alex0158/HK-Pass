import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import styles from './RankingDashboard.module.css';

const API_BASE_URL = "https://hk-pass-2.onrender.com/api";

const gradients = {
  teamScore: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
  teamAttacked: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
  playerScore: 'linear-gradient(135deg, #11998e, #38ef7d)',
  playerMiniGame: 'linear-gradient(135deg, #fc4a1a, #f7b733)',
};

const calcProgressWidth = (value, maxValue) => {
  const percentage = Math.round((value / maxValue) * 100);
  return `${percentage}%`;
};

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

  // 前端設定：各排行榜顯示前幾名
  const [topCounts, setTopCounts] = useState({
    teamsScore: 6,
    teamsAttacked: 6,
    playersScore: 6,
    playersMiniGame: 6,
  });
  const [hideRankings, setHideRankings] = useState({
    teamsScore: false,
    teamsAttacked: false,
    playersScore: false,
    playersMiniGame: false,
  });

  // 儲存上一輪數據（如果需要比對）
  const prevDataRef = useRef({ teams: [], players: [] });

  const fetchData = useCallback(async () => {
    try {
      const teamsRes = await fetch(`${API_BASE_URL}/teams/`);
      const teamsData = await teamsRes.json();
      const playersRes = await fetch(`${API_BASE_URL}/players/`);
      const playersData = await playersRes.json();
      // 對隊伍以總分排序（降序）
      teamsData.sort((a, b) => b.score - a.score);
      // 對玩家以個人得分排序（降序）
      playersData.sort((a, b) => b.personal_score - a.personal_score);
      setTeams(teamsData);
      setPlayers(playersData);
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 每 5 秒刷新一次
    return () => clearInterval(interval);
  }, [fetchData]);

  // 取得各排行榜的最大值，避免除以 0
  const maxValues = {
    teamScore: teams.reduce((max, team) => Math.max(max, team.score), 0) || 1,
    teamAttacked: teams.reduce((max, team) => Math.max(max, team.attacked_count), 0) || 1,
    playerScore: players.reduce((max, player) => Math.max(max, player.personal_score), 0) || 1,
    playerMiniGame: players.reduce((max, player) => Math.max(max, player.completed_minigame_count), 0) || 1,
  };

  // 根據設定重新排序並取前幾名
  const sortedTeamsByScore = [...teams].slice(0, topCounts.teamsScore);
  const sortedTeamsByAttacked = [...teams].sort((a, b) => b.attacked_count - a.attacked_count).slice(0, topCounts.teamsAttacked);
  const sortedPlayersByScore = [...players].slice(0, topCounts.playersScore);
  const sortedPlayersByMiniGame = [...players].sort((a, b) => b.completed_minigame_count - a.completed_minigame_count).slice(0, topCounts.playersMiniGame);

  // 隊伍名稱格式化：若隱藏則顯示 '---'
  const teamLabelFormatter = (team) => {
    return team.hide_team_name ? '---' : team.name;
  };

  // 玩家名稱格式化：根據隱藏設定
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

  // RankingRow：只使用 layout 與 animate 屬性
  const RankingRow = React.memo(({ item, index, valueKey, labelType, maxValue }) => {
    const value = item[valueKey];
    const progressWidth = calcProgressWidth(value, maxValue);
    return (
      <motion.div
        layout
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={styles.rankingRow}
      >
        <div className={styles.rankNumber}>{index === 0 ? '👑' : index + 1}</div>
        <div className={styles.rankLabel}>
          {labelType === "team" ? teamLabelFormatter(item) : formatPlayerLabel(item)}
        </div>
        <div className={styles.rankValue}>{displayValueByField(value, item, valueKey)}</div>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressBarFill}
            style={{
              background: labelType === "team" ? gradients.teamScore : gradients.playerScore,
              width: progressWidth
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    );
  });

  // RankingCard：直接渲染列表，不使用 AnimatePresence
  const RankingCard = ({ title, items, maxValue, valueKey, labelType, cardGradient, isHidden }) => {
    return (
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card.Header className={styles.cardHeader} style={{ background: cardGradient }}>
          {title}
        </Card.Header>
        <Card.Body className={styles.cardBody}>
          {isHidden ? (
            <div
              style={{
                textAlign: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.2rem",
                padding: "20px",
              }}
            >
              封印中，賄賂工作人員解鎖
            </div>
          ) : (
            items.map((item, index) => (
              <RankingRow
                key={item.id}
                item={item}
                index={index}
                valueKey={valueKey}
                labelType={labelType}
                maxValue={maxValue}
              />
            ))
          )}
        </Card.Body>
      </motion.div>
    );
  };

  const dividerStyle = { borderTop: '2px solid #fff', margin: '40px 0' };

  return (
    <Container className="my-5" style={{ background: 'linear-gradient(135deg, #141E30, #243B55)', padding: '30px', borderRadius: '12px' }}>
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        排行榜
      </motion.h1>
      <Row>
        {!hideRankings.teamsScore && (
          <Col lg={6}>
            <RankingCard
              title="隊伍總分排名"
              items={sortedTeamsByScore}
              maxValue={maxValues.teamScore}
              valueKey="score"
              labelType="team"
              cardGradient={gradients.teamScore}
              isHidden={hideRankings.teamsScore}
            />
          </Col>
        )}
        {!hideRankings.teamsAttacked && (
          <Col lg={6}>
            <RankingCard
              title="隊伍被攻擊次數排名"
              items={sortedTeamsByAttacked}
              maxValue={maxValues.teamAttacked}
              valueKey="attacked_count"
              labelType="team"
              cardGradient={gradients.teamAttacked}
              isHidden={hideRankings.teamsAttacked}
            />
          </Col>
        )}
      </Row>
      <Row>
        {!hideRankings.playersScore && (
          <Col lg={6}>
            <RankingCard
              title="玩家得分排名"
              items={sortedPlayersByScore}
              maxValue={maxValues.playerScore}
              valueKey="personal_score"
              labelType="player"
              cardGradient={gradients.playerScore}
              isHidden={hideRankings.playersScore}
            />
          </Col>
        )}
        {!hideRankings.playersMiniGame && (
          <Col lg={6}>
            <RankingCard
              title="玩家小遊戲完成數排名"
              items={sortedPlayersByMiniGame}
              maxValue={maxValues.playerMiniGame}
              valueKey="completed_minigame_count"
              labelType="player"
              cardGradient={gradients.playerMiniGame}
              isHidden={hideRankings.playersMiniGame}
            />
          </Col>
        )}
      </Row>

      <hr style={dividerStyle} />

      <Card className={styles.settingsCard}>
        <Card.Header as="h5" className={styles.settingsHeader}>
          排行榜設定
        </Card.Header>
        <Card.Body>
          <Row>
            {Object.entries(topCounts).map(([key, value]) => (
              <Col md={6} lg={3} key={key}>
                <Form.Group controlId={`${key}Count`} className="mb-3">
                  <Form.Label>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} 顯示前幾名
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={value}
                    onChange={(e) => setTopCounts((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    min={1}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
          <Row>
            {Object.entries(hideRankings).map(([key, value]) => (
              <Col md={6} lg={3} key={key}>
                <Form.Group controlId={`hide${key.charAt(0).toUpperCase() + key.slice(1)}`} className="mb-3">
                  <Form.Check
                    type="switch"
                    label={`隱藏${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}排行榜`}
                    checked={value}
                    onChange={(e) => setHideRankings((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RankingDashboard;