"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Container, Row, Col, Card, Form } from "react-bootstrap"
import { motion, AnimatePresence } from "framer-motion"
import styles from "./RankingDashboard.module.css"

const API_BASE_URL = "https://hk-pass-2.onrender.com/api"

const gradients = {
  teamScore: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
  teamAttacked: "linear-gradient(135deg, #6B5B95, #FF6B6B)",
  playerScore: "linear-gradient(135deg, #45B649, #DCE35B)",
  playerMiniGame: "linear-gradient(135deg, #614385, #516395)",
}

const calcProgressWidth = (value, maxValue) => {
  const percentage = Math.round((value / maxValue) * 100)
  return `${percentage}%`
}

const displayValueByField = (value, item, field) => {
  if (field === "score" || field === "attacked_count") {
    return item.hide_ranking ? "---" : value
  } else if (field === "personal_score") {
    return item.hide_personal_score ? "---" : value
  } else if (field === "completed_minigame_count") {
    return item.hide_completed_minigame_count ? "---" : value
  }
  return value
}

function RankingDashboard() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [topCounts, setTopCounts] = useState({
    teamsScore: 6,
    teamsAttacked: 6,
    playersScore: 6,
    playersMiniGame: 6,
  })
  const [hideRankings, setHideRankings] = useState({
    teamsScore: false,
    teamsAttacked: false,
    playersScore: false,
    playersMiniGame: false,
  })

  const prevDataRef = useRef({ teams: [], players: [] })

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, playersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/teams/`),
        fetch(`${API_BASE_URL}/players/`),
      ])
      const [teamsData, playersData] = await Promise.all([teamsRes.json(), playersRes.json()])

      setTeams((prevTeams) => {
        const newTeams = teamsData.sort((a, b) => b.score - a.score)
        prevDataRef.current.teams = prevTeams
        return JSON.stringify(newTeams) !== JSON.stringify(prevTeams) ? newTeams : prevTeams
      })

      setPlayers((prevPlayers) => {
        const newPlayers = playersData.sort((a, b) => b.personal_score - a.personal_score)
        prevDataRef.current.players = prevPlayers
        return JSON.stringify(newPlayers) !== JSON.stringify(prevPlayers) ? newPlayers : prevPlayers
      })
    } catch (error) {
      console.error("Error fetching ranking data:", error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  const maxValues = useMemo(
    () => ({
      teamScore: Math.max(...teams.map((team) => team.score), 1),
      teamAttacked: Math.max(...teams.map((team) => team.attacked_count), 1),
      playerScore: Math.max(...players.map((player) => player.personal_score), 1),
      playerMiniGame: Math.max(...players.map((player) => player.completed_minigame_count), 1),
    }),
    [teams, players],
  )

  const sortedData = useMemo(
    () => ({
      teamsByScore: teams.slice(0, topCounts.teamsScore),
      teamsByAttacked: [...teams].sort((a, b) => b.attacked_count - a.attacked_count).slice(0, topCounts.teamsAttacked),
      playersByScore: players.slice(0, topCounts.playersScore),
      playersByMiniGame: [...players]
        .sort((a, b) => b.completed_minigame_count - a.completed_minigame_count)
        .slice(0, topCounts.playersMiniGame),
    }),
    [teams, players, topCounts],
  )

  const formatLabel = useCallback(
    (item, type) => {
      if (type === "team") {
        return item.hide_team_name ? "---" : item.name
      } else if (type === "player") {
        const teamObj = teams.find((t) => t.id === item.team)
        const teamPart = teamObj && !item.hide_team ? teamObj.name : ""
        const namePart = !item.hide_name ? item.name : ""
        return teamPart && namePart ? `${teamPart}-${namePart}` : teamPart || namePart || "---"
      }
    },
    [teams],
  )

  const RankingRow = React.memo(({ item, index, valueKey, labelType, maxValue, prevData }) => {
    const value = item[valueKey]
    const progressWidth = calcProgressWidth(value, maxValue)
    const prevIndex = prevData.findIndex((prevItem) => prevItem.id === item.id)
    const yOffset = (prevIndex - index) * 100

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: yOffset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -yOffset }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={styles.rankingRow}
      >
        <div className={styles.rankNumber}>{index === 0 ? "👑" : index + 1}</div>
        <div className={styles.rankLabel}>{formatLabel(item, labelType)}</div>
        <div className={styles.rankValue}>{displayValueByField(value, item, valueKey)}</div>
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressBarFill}
            style={{
              background: gradients[labelType === "team" ? "teamScore" : "playerScore"],
            }}
            initial={{ width: 0 }}
            animate={{ width: progressWidth }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    )
  })

  const RankingCard = React.memo(({ title, items, maxValue, valueKey, labelType, cardGradient, isHidden }) => {
    const prevItems = labelType === "team" ? prevDataRef.current.teams : prevDataRef.current.players

    return (
      <div className={styles.card}>
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
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <RankingRow
                  key={item.id}
                  item={item}
                  index={index}
                  valueKey={valueKey}
                  labelType={labelType}
                  maxValue={maxValue}
                  prevData={prevItems}
                />
              ))}
            </AnimatePresence>
          )}
        </Card.Body>
      </div>
    )
  })

  return (
    <Container fluid className={styles.container}>
      <h1 className={styles.title}>排行榜</h1>
      <Row>
        <Col lg={6}>
          <RankingCard
            title="隊伍總分排名"
            items={sortedData.teamsByScore}
            maxValue={maxValues.teamScore}
            valueKey="score"
            labelType="team"
            cardGradient={gradients.teamScore}
            isHidden={hideRankings.teamsScore}
          />
        </Col>
        <Col lg={6}>
          <RankingCard
            title="隊伍被攻擊次數排名"
            items={sortedData.teamsByAttacked}
            maxValue={maxValues.teamAttacked}
            valueKey="attacked_count"
            labelType="team"
            cardGradient={gradients.teamAttacked}
            isHidden={hideRankings.teamsAttacked}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <RankingCard
            title="玩家得分排名"
            items={sortedData.playersByScore}
            maxValue={maxValues.playerScore}
            valueKey="personal_score"
            labelType="player"
            cardGradient={gradients.playerScore}
            isHidden={hideRankings.playersScore}
          />
        </Col>
        <Col lg={6}>
          <RankingCard
            title="玩家小遊戲完成數排名"
            items={sortedData.playersByMiniGame}
            maxValue={maxValues.playerMiniGame}
            valueKey="completed_minigame_count"
            labelType="player"
            cardGradient={gradients.playerMiniGame}
            isHidden={hideRankings.playersMiniGame}
          />
        </Col>
      </Row>

      <Card className={styles.settingsCard}>
        <Card.Header as="h5" className={styles.settingsHeader}>
          排行榜設定
        </Card.Header>
        <Card.Body className={styles.settingsBody}>
          <Row>
            {Object.entries(topCounts).map(([key, value]) => (
              <Col md={6} lg={3} key={key}>
                <Form.Group controlId={`${key}Count`} className="mb-3">
                  <Form.Label className={styles.formLabel}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} 顯示前幾名
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={value}
                    onChange={(e) => setTopCounts((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    min={1}
                    className={styles.formControl}
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
                    className={styles.formCheck}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default RankingDashboard

