// Updated GameCard.js
"use client";
import { Col, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaCoins, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } },
};

const GameCard = ({ game }) => {
  const navigate = useNavigate();

  if (!game || !game.id) {
    console.error("Invalid game data:", game);
    return null; // 避免渲染無效的遊戲卡片
  }

  return (
    <Col xs={12} sm={6} md={4} lg={3} xl={2}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.2)" }}
        className="game-card"
        onClick={() => {
          console.log("Navigating to game-score page for game ID:", game.id);
          navigate(`/game-score/${game.id}`);
        }}
      >
        <div className="game-card-content">
          <h3 className="game-title">{game.name}</h3>
          <Badge bg="primary" className="mb-2">{game.category}</Badge>
          <p className="game-info">
            <FaMapMarkerAlt className="me-2" />
            {game.room}
          </p>
          <p className="game-info">
            <FaCoins className="me-2" />
            可得籌碼: {game.available_chips}
          </p>
          {game.is_limited && (
            <div className="limited-time">
              <FaClock className="me-2" />
              限時: {game.limited_time} 秒
            </div>
          )}
        </div>
      </motion.div>
    </Col>
  );
};

export default GameCard;