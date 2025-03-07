"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Container, Row, Col, Card, Spinner } from "react-bootstrap"
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
  // 排行榜資料
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])

  // 從後端抓取 CommonSetting 設定
  const [commonSetting, setCommonSetting] = useState(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // 抓取設定的函式，並定時更新（例如每10秒重新抓取一次）
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/`)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      if (data && data.length > 0) {
        setCommonSetting(data[0])
      }
    } catch (error) {
      console.error("Error fetching common settings:", error)
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    const settingsInterval = setInterval(fetchSettings, 10000)
    return () => clearInterval(settingsInterval)
  }, [fetchSettings])

  // 儲存上一次資料以供動畫比較
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
    const dataInterval = setInterval(fetchData, 1000)
    return () => clearInterval(dataInterval)
  }, [fetchData])

  // 依據 commonSetting 設定各排行榜的顯示名次與是否隱藏
  const topCounts = useMemo(() => {
    return {
      teamsScore: commonSetting ? commonSetting.team_ranking_top_n : 6,
      teamsAttacked: commonSetting ? commonSetting.attack_count_ranking_top_n : 6,
      playersScore: commonSetting ? commonSetting.player_ranking_top_n : 6,
      playersMiniGame: commonSetting ? commonSetting.minigame_ranking_top_n : 6,
    }
  }, [commonSetting])

  const hideRankings = useMemo(() => {
    return {
      teamsScore: commonSetting ? commonSetting.hide_team_ranking : false,
      teamsAttacked: commonSetting ? commonSetting.hide_attack_count_ranking : false,
      playersScore: commonSetting ? commonSetting.hide_player_ranking : false,
      playersMiniGame: commonSetting ? commonSetting.hide_minigame_ranking : false,
    }
  }, [commonSetting])

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
      {loadingSettings ? (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
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
        </>
      )}
    </Container>
  )
}

export default RankingDashboard
