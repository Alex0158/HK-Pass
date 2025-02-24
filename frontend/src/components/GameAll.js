"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Container, Row, Col } from "react-bootstrap"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import GameCard from "./GameCard"
import { fetchGames } from "../api/gameService"
import { FaGamepad } from "react-icons/fa"

function GameAll() {
  const [games, setGames] = useState([])
  const navigate = useNavigate()

  const fetchAndSetGames = useCallback(async () => {
    try {
      const availableGames = await fetchGames()
      setGames(availableGames)
    } catch (error) {
      console.error("Error fetching games:", error)
    }
  }, [])

  useEffect(() => {
    fetchAndSetGames()
    const interval = setInterval(fetchAndSetGames, 1000)
    return () => clearInterval(interval)
  }, [fetchAndSetGames])

  const gameCards = useMemo(() => {
    return games.map((game) => <GameCard key={game.id} game={game} navigate={navigate} />)
  }, [games, navigate])

  return (
    <Container fluid className="py-5 game-all-container">
      <Row className="justify-content-center mb-5">
        <Col xs={12} className="text-center">
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <h1 className="display-4 text-light mb-3">
              <FaGamepad className="me-3" />
              遊戲大全
            </h1>
            <p className="lead text-light">要注意遊戲地點哦</p>
          </motion.div>
        </Col>
      </Row>
      {games.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-light"
        >
          <h3>暫無可顯示的遊戲</h3>
          <p>請稍後再來查看，我們正在準備精彩的遊戲內容！</p>
        </motion.div>
      ) : (
        <Row className="g-4 justify-content-center">
          <AnimatePresence>{gameCards}</AnimatePresence>
        </Row>
      )}
    </Container>
  )
}

export default GameAll

