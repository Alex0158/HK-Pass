"use client"

import { useState, useEffect, useRef } from "react"
import { Form, Row, Col, Button } from "react-bootstrap"
// 從 apiService 引入更新玩家與隊伍的方法
import { updateTeam, updatePlayer } from "../api/apiService"

export default function AttackForm({ team, allTeams, allPlayers, commonSettings, refreshData }) {
  const [attackerTeam, setAttackerTeam] = useState("")
  const [attackerName, setAttackerName] = useState("")
  const [attackCount, setAttackCount] = useState(1)
  const [attackerPlayers, setAttackerPlayers] = useState([])

  // 使用 useRef 保持 attackerName 值不被 useEffect 清空
  const attackerNameRef = useRef(attackerName)

  // 當攻擊者隊伍變動時，從 allPlayers 中過濾出該隊伍的玩家
  useEffect(() => {
    if (attackerTeam) {
      const filtered = allPlayers.filter((player) => {
        const playerTeam = allTeams.find((t) => t.id === player.team)
        return playerTeam && playerTeam.name.trim().toLowerCase() === attackerTeam.trim().toLowerCase()
      })
      setAttackerPlayers(filtered)
      // 當目前選定的攻擊者姓名不在新的列表中時，重置 attackerName
      if (!filtered.some(player => player.name === attackerNameRef.current)) {
        setAttackerName("")
      }
    } else {
      setAttackerPlayers([])
    }
  }, [attackerTeam, allPlayers, allTeams])

  // 讓 attackerNameRef 保持最新
  useEffect(() => {
    attackerNameRef.current = attackerName
  }, [attackerName])

  const handleAttack = async () => {
    if (!attackerTeam || !attackerName || !attackCount || !commonSettings) {
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
      // 更新被攻擊隊伍的被攻擊次數
      const newAttackedCount = team.attacked_count + count * commonSettings.attacked_increment
      await updateTeam(team.id, { attacked_count: newAttackedCount })

      // 從攻擊者隊伍中找出對應的玩家，根據姓名
      const attackerPlayer = attackerPlayers.find((p) => p.name.trim() === attackerName.trim())
      if (attackerPlayer) {
        // 更新攻擊者玩家的分數
        const newPlayerScore = attackerPlayer.personal_score + count * commonSettings.attacker_player_bonus
        await updatePlayer(attackerPlayer.id, { personal_score: newPlayerScore })

        // 找出攻擊者的隊伍，更新該隊伍的總分
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
攻擊者姓名: ${attackerName}，
攻擊次數: ${count}，
被攻擊次數增加: ${count * commonSettings.attacked_increment}，
攻擊者玩家加分: ${count * commonSettings.attacker_player_bonus}，
攻擊者隊伍加分: ${count * commonSettings.attacker_team_bonus}`)

      // 刷新最新資料
      await refreshData()
      // 清空輸入欄位
      setAttackerTeam("")
      setAttackerName("")
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
          <Form.Group controlId="formAttackerName">
            <Form.Label style={{ fontSize: "0.7rem" }}>攻擊者姓名</Form.Label>
            <Form.Control
              as="select"
              value={attackerName}
              onChange={(e) => setAttackerName(e.target.value)}
              size="sm"
              style={{ fontSize: "0.7rem" }}
              disabled={!attackerTeam || attackerPlayers.length === 0}
            >
              <option value="">請選擇攻擊者姓名</option>
              {attackerPlayers.map((player) => (
                <option key={player.id} value={player.name}>
                  {player.name}
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
        (通用設定：隊伍加分 {commonSettings ? commonSettings.attacker_team_bonus : "讀取中"}、 玩家加分 {commonSettings ? commonSettings.attacker_player_bonus : "讀取中"}、 被攻擊增加 {commonSettings ? commonSettings.attacked_increment : "讀取中"})
      </p>
    </Form>
  )
}
