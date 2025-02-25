// src/components/MainMenu.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const cardVariants = {
  hover: { scale: 1.05, boxShadow: '0px 0px 12px rgba(255,255,255,0.8)' },
};

const MainMenu = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);

  // 取得所有隊伍資料，用於動態生成隊伍操作卡片
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // 直接呼叫 Render 上的後端 API
        const res = await fetch('https://hk-pass-2.onrender.com/api/teams/');
        const data = await res.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // 靜態卡片項目，只顯示名稱，不包含解釋文字
  const staticCards = [
    {
      title: '實時數據',
      route: '/dashboard',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
    {
      title: '排行榜',
      route: '/ranking',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
    {
      title: '批量創建',
      route: '/batch-create',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
    {
      title: '遊戲大全設定',
      route: '/game-settings',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
    {
      title: '遊戲大全',
      route: '/game-all',
      bgColor: 'rgba(0, 0, 0, 0.5)',
    },
  ];

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #141E30, #243B55)',
        padding: '20px',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      <motion.h1
        style={{ color: '#fff', marginBottom: '20px', fontSize: '2.5rem', textAlign: 'center' }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        ENTP 統治世界
      </motion.h1>

      <Row className="w-100 justify-content-center">
        {staticCards.map((card, idx) => (
          <Col xs={12} sm={6} md={4} className="mb-4" key={`static-${idx}`}>
            <motion.div variants={cardVariants} whileHover="hover">
              <Card onClick={() => navigate(card.route)} style={{ cursor: 'pointer', borderRadius: '12px' }}>
                <Card.Body
                  className="text-center"
                  style={{ background: card.bgColor, color: '#fff', padding: '20px' }}
                >
                  <Card.Title style={{ fontSize: '1.5rem' }}>{card.title}</Card.Title>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}

        {/* 如果有抓到隊伍資料，就顯示「隊伍操作」區塊 */}
        {teams.length > 0 && (
          <>
            <Col xs={12}>
              <h2
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  margin: '20px 0',
                  fontSize: '1.8rem',
                }}
              >
                隊伍操作
              </h2>
            </Col>
            {teams.map((team) => (
              <Col xs={12} sm={6} md={4} className="mb-4" key={team.id}>
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card
                    onClick={() => navigate(`/team-panel/${team.name}`)}
                    style={{ cursor: 'pointer', borderRadius: '12px' }}
                  >
                    <Card.Body
                      className="text-center"
                      style={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: '#fff',
                        padding: '20px',
                      }}
                    >
                      <Card.Title style={{ fontSize: '1.5rem' }}>{team.name}</Card.Title>
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
          color: '#fff',
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '1.8rem',
        }}
      >
        薩里條村-傳說故事
      </h3>
    </Container>
  );
};

export default MainMenu;