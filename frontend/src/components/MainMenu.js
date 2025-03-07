"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Button, Form, Spinner } from "react-bootstrap"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  hover: { scale: 1.05, boxShadow: "0px 0px 12px rgba(255,255,255,0.8)" },
}

const API_BASE_URL = "https://hk-pass-2.onrender.com/api"

const staticCards = [
  { title: "實時數據", route: "/dashboard" },
  { title: "排行榜", route: "/ranking" },
  
  { title: "遊戲大全設定", route: "/game-settings" },
  { title: "遊戲大全", route: "/game-all" },
]

const MainMenu = () => {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem("loggedIn") === "true")
  const [password, setPassword] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [fetchingPassword, setFetchingPassword] = useState(true)
  const [loginError, setLoginError] = useState("")

  // 從 API 取得 CommonSetting 中的 login_password
  useEffect(() => {
    const fetchLoginPassword = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings/`)
        if (!response.ok) {
          console.error(`API error: ${response.status} ${response.statusText}`)
          setFetchingPassword(false)
          return
        }
        const data = await response.json()
        console.log("Fetched settings data:", data)
        if (data && data.length > 0) {
          const fetchedPassword = data[0].login_password || ""
          console.log("Fetched login password:", fetchedPassword)
          setLoginPassword(fetchedPassword)
        } else {
          console.error("No settings data returned from API")
        }
      } catch (error) {
        console.error("Error fetching login password:", error)
      }
      setFetchingPassword(false)
    }
    fetchLoginPassword()
  }, [])

  // 當 loggedIn 狀態變更時，若已登入則抓取隊伍資料
  useEffect(() => {
    if (loggedIn) {
      fetchTeams()
    }
    setLoading(false)
  }, [loggedIn])

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/`)
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Error fetching teams:", error)
    }
  }

  // 登入處理：比對使用者輸入的密碼與從資料庫取得的密碼（均進行 trim() 處理）
  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError("")
    console.log("User entered password (trimmed):", password.trim())
    console.log("Stored login password (trimmed):", loginPassword.trim())
    if (password.trim() === loginPassword.trim()) {
      console.log("Login successful!")
      localStorage.setItem("loggedIn", "true")
      setLoggedIn(true)
    } else {
      console.log("Login failed: 密碼不匹配")
      setLoginError("密碼錯誤，請重試")
    }
  }

  // 登出處理：清除 localStorage 與狀態
  const handleLogout = () => {
    localStorage.removeItem("loggedIn")
    setLoggedIn(false)
  }

  if (loading || fetchingPassword) {
    return (
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #141E30, #243B55)",
        }}
      >
        <Spinner animation="border" variant="light" />
        <h2 style={{ color: "#fff", marginTop: "20px" }}>載入中...</h2>
      </Container>
    )
  }

  // 若尚未登入，顯示登入表單
  if (!loggedIn) {
    return (
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #141E30, #243B55)",
          padding: "20px",
        }}
      >
        <Form
          onSubmit={handleLogin}
          style={{ width: "300px", background: "rgba(255,255,255,0.1)", padding: "20px", borderRadius: "10px" }}
        >
          <h2 className="text-center text-white mb-4">登入</h2>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">密碼</Form.Label>
            <Form.Control
              type="password"
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          {loginError && <p className="text-danger text-center">{loginError}</p>}
          <Button variant="primary" type="submit" className="w-100">
            登入
          </Button>
        </Form>
      </Container>
    )
  }

  // 登入後顯示主選單及隊伍操作頁面，並提供登出按鈕
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #141E30, #243B55)",
        padding: "20px",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      <div className="w-100 d-flex justify-content-end mb-3">
        <Button variant="danger" onClick={handleLogout}>
          登出
        </Button>
      </div>

      <motion.h1
        style={{ color: "#fff", marginBottom: "20px", fontSize: "2.5rem", textAlign: "center" }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        薩里條村
      </motion.h1>

      <Row className="w-100 justify-content-center">
        {staticCards.map((card, idx) => (
          <Col xs={12} sm={6} md={4} className="mb-4" key={idx}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
              <Card onClick={() => navigate(card.route)} style={{ cursor: "pointer", borderRadius: "12px" }}>
                <Card.Body
                  className="text-center"
                  style={{ background: "rgba(0, 0, 0, 0.5)", color: "#fff", padding: "20px" }}
                >
                  <Card.Title style={{ fontSize: "1.5rem" }}>{card.title}</Card.Title>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}

        {teams.length > 0 && (
          <>
            <Col xs={12}>
              <h2
                style={{
                  color: "#fff",
                  textAlign: "center",
                  margin: "20px 0",
                  fontSize: "1.8rem",
                }}
              >
                隊伍操作
              </h2>
            </Col>
            {teams.map((team) => (
              <Col xs={12} sm={6} md={4} className="mb-4" key={team.id}>
                <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
                  <Card
                    onClick={() => navigate(`/team-panel/${team.name}`)}
                    style={{ cursor: "pointer", borderRadius: "12px" }}
                  >
                    <Card.Body
                      className="text-center"
                      style={{
                        background: "rgba(0, 0, 0, 0.5)",
                        color: "#fff",
                        padding: "20px",
                      }}
                    >
                      <Card.Title style={{ fontSize: "1.5rem" }}>{team.name}</Card.Title>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </>
        )}
      </Row>

      <h3
        style={{
          color: "#fff",
          textAlign: "center",
          marginTop: "20px",
          fontSize: "1.8rem",
        }}
      >
        薩里條村-傳說故事
      </h3>
    </Container>
  )
}

export default MainMenu
