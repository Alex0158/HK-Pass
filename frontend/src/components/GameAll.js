// src/components/GameAll.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 樣式常量
const CARD_HEIGHT = 150;
const FONT_SIZE_TITLE = '1rem';
const FONT_SIZE_TEXT = '0.9rem';
const CARD_PADDING = '20px';
const CARD_BORDER_RADIUS = '12px';
const CARD_BOX_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.15)';
const HOVER_SCALE = 1.03;

// 卡片動畫 variants
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } },
  exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.4, ease: 'easeIn' } },
};

// 單個遊戲卡片組件
const GameCard = ({ game, navigate }) => {
  return (
    <Col xs={12} sm={6} md={4} lg={2}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        whileHover={{ scale: HOVER_SCALE }}
        onClick={() => navigate(`/game-score/${game.id}`)}
        style={{
          background: 'linear-gradient(135deg, #ffffff, #f8f8f8)',
          borderRadius: CARD_BORDER_RADIUS,
          padding: CARD_PADDING,
          textAlign: 'center',
          boxShadow: CARD_BOX_SHADOW,
          height: CARD_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'background 0.3s ease',
        }}
      >
        <h5 style={{
          marginBottom: '10px',
          color: '#333',
          fontSize: FONT_SIZE_TITLE,
          fontWeight: 'bold',
          wordBreak: 'break-word'
        }}>
          {game.name}
        </h5>
        <p style={{
          margin: 0,
          color: '#555',
          fontSize: FONT_SIZE_TEXT,
          wordBreak: 'break-word'
        }}>
          類別: {game.category}
        </p>
        <p style={{
          margin: 0,
          color: '#555',
          fontSize: FONT_SIZE_TEXT,
          wordBreak: 'break-word'
        }}>
          房間: {game.room}
        </p>
        <p style={{
          margin: 0,
          color: '#555',
          fontSize: FONT_SIZE_TEXT
        }}>
          可得籌碼: {game.available_chips}
        </p>
        {game.is_limited && (
          <div style={{
            marginTop: '10px',
            background: '#ffc107',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: FONT_SIZE_TEXT,
            fontWeight: 'bold',
            wordBreak: 'break-word'
          }}>
            限時: {game.limited_time} 秒
          </div>
        )}
      </motion.div>
    </Col>
  );
};

function GameAll() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  // 從 API 獲取所有遊戲資料，僅保留 is_displayed 為 true 的遊戲
  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/minigames/');
      const data = await res.json();
      const availableGames = data.filter(game => {
        return game.is_displayed === true || game.is_displayed === 'true' || !!game.is_displayed;
      });
      setGames(availableGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, []);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, [fetchGames]);

  // 使用 useMemo 記憶化遊戲卡片列表
  const gameCards = useMemo(() => {
    return games.map(game => (
      <GameCard key={game.id} game={game} navigate={navigate} />
    ));
  }, [games, navigate]);

  return (
    <Container className="my-5">
      <h1 className="text-center mb-4" style={{ fontSize: '2rem', color: '#fff' }}>遊戲大全</h1>
      {games.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#ddd', fontSize: '1rem' }}>暫無可顯示的遊戲</div>
      ) : (
        <Row className="g-4">
          <AnimatePresence>
            {gameCards}
          </AnimatePresence>
        </Row>
      )}
    </Container>
  );
}

export default GameAll;