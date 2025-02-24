"use client"

import { useState, useEffect } from "react"
import { Form, Row, Col, Button } from "react-bootstrap"
import { updateTeam, updatePlayer } from "../api/apiService"

export default function AttackForm({ team, allTeams, allPlayers, commonSettings, refreshData }) {
  const [attackerTeam, setAttackerTeam] = useState("")
  const [attackerNumber, setAttackerNumber] = useState("")
  const [attackCount, setAttackCount] = useState(1)
  const [attackerPlayers, setAttackerPlayers] = useState([])

  useEffect(() => {
    if (attackerTeam) {
      const filtered = allPlayers.filter((player) => {
        const playerTeam = allTeams.find((t) => t.id === player.team)
        return playerTeam && playerTeam.name.trim().toLowerCase() === attackerTeam.trim().toLowerCase()
      })
      setAttackerPlayers(filtered)
    } else {
      setAttackerPlayers([])
    }
    setAttackerNumber("")
  }, [attackerTeam, allPlayers, allTeams])

  const handleAttack = async () => {
    if (!attackerTeam || !attackerNumber || !attackCount || !commonSettings) {
      alert("請填寫所有欄位並確保通用設定已載入")
      return
    }
    if (attackerTeam === team.name) {
      alert("攻擊者隊伍不能與目標隊伍相同")
      return
    }
    const count = Number(attackCount)
    if (isNaN(count) || count <= 0) {
      alert("請輸入有效的攻擊次數")
      return
    }

    try {
      const newAttackedCount = team.attacked_count + count * commonSettings.attacked_increment
      await updateTeam(team.id, { attacked_count: newAttackedCount })

      const attackerPlayer = attackerPlayers.find((p) => p.number.trim() === attackerNumber.trim())
      if (attackerPlayer) {
        const newPlayerScore = attackerPlayer.personal_score + count * commonSettings.attacker_player_bonus
        await updatePlayer(attackerPlayer.id, { personal_score: newPlayerScore })

        const attackerTeamObj = allTeams.find((t) => t.name === attackerTeam)
        if (attackerTeamObj) {
          const newTeamScore = attackerTeamObj.score + count * commonSettings.attacker_team_bonus
          await updateTeam(attackerTeamObj.id, { score: newTeamScore })
        }
      } else {
        throw new Error("找不到攻擊者玩家")
      }

      alert(`攻擊記錄已提交：
攻擊者隊伍: ${attackerTeam}，
攻擊者號碼: ${attackerNumber}，
攻擊次數: ${count}，
被攻擊次數增加: ${count * commonSettings.attacked_increment}，
攻擊者玩家加分: ${count * commonSettings.attacker_player_bonus}，
攻擊者隊伍加分: ${count * commonSettings.attacker_team_bonus}`)

      await refreshData()
      setAttackerTeam("")
      setAttackerNumber("")
      setAttackCount(1)
    } catch (error) {
      console.error("Error updating data:", error)
      alert("更新失敗，請檢查後端 API")
    }
  }

  return (
    <Form>
      <Row className="align-items-end">
        <Col md={3}>
          <Form.Group controlId="formAttackerTeam">
            <Form.Label style={{ fontSize: "0.7rem" }}>攻擊者隊伍</Form.Label>
            <Form.Control
              as="select"
              value={attackerTeam}
              onChange={(e) => setAttackerTeam(e.target.value)}
              size="sm"
              style={{ fontSize: "0.7rem" }}
            >
              <option value="">請選擇攻擊者隊伍</option>
              {allTeams
                .filter((t) => t.name !== team.name)
                .map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="formAttackerNumber">
            <Form.Label style={{ fontSize: "0.7rem" }}>攻擊者號碼</Form.Label>
            <Form.Control
              as="select"
              value={attackerNumber}
              onChange={(e) => setAttackerNumber(e.target.value)}
              size="sm"
              style={{ fontSize: "0.7rem" }}
              disabled={!attackerTeam || attackerPlayers.length === 0}
            >
              <option value="">請選擇攻擊者號碼</option>
              {attackerPlayers.map((player) => (
                <option key={player.id} value={player.number}>
                  {player.number}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="formAttackCount">
            <Form.Label style={{ fontSize: "0.7rem" }}>攻擊次數</Form.Label>
            <Form.Control
              type="number"
              value={attackCount}
              onChange={(e) => setAttackCount(Number(e.target.value))}
              min={1}
              size="sm"
              style={{ fontSize: "0.7rem", padding: "2px" }}
            />
          </Form.Group>
        </Col>
        <Col md={3} className="text-center">
          <Button
            variant="danger"
            onClick={handleAttack}
            size="sm"
            style={{
              borderRadius: "50%",
              width: "100px",
              height: "100px",
              fontSize: "1.2rem",
            }}
          >
            攻擊
          </Button>
        </Col>
      </Row>
      <p className="mt-2" style={{ fontSize: "0.7rem", color: "#555" }}>
        (通用設定：隊伍加分 {commonSettings ? commonSettings.attacker_team_bonus : "讀取中"}、 玩家加分{" "}
        {commonSettings ? commonSettings.attacker_player_bonus : "讀取中"}、 被攻擊增加{" "}
        {commonSettings ? commonSettings.attacked_increment : "讀取中"})
      </p>
    </Form>
  )
}

