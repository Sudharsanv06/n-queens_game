import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';
import './Tutorial.css';

const Tutorial = () => {
  const videoSources = [
    {
      id: 'basic-rules',
      title: 'Basic Rules of N-Queens',
      description: 'Learn the fundamental rules of placing queens on the board without them attacking each other.',
      embedUrl: 'https://www.youtube.com/embed/example1'
    },
    {
      id: '4x4-solution',
      title: 'Solving 4×4 Board',
      description: 'Step-by-step guide to solving the smallest N-Queens puzzle.',
      embedUrl: 'https://www.youtube.com/embed/example2'
    },
    {
      id: '8x8-strategy',
      title: '8×8 Board Strategy',
      description: 'Advanced techniques for solving the classic chess board size.',
      embedUrl: 'https://www.youtube.com/embed/example3'
    },
    {
      id: 'time-trial-tips',
      title: 'Time Trial Tips',
      description: 'How to improve your speed in time trial mode.',
      embedUrl: 'https://www.youtube.com/embed/example4'
    }
  ];

  const steps = [
    {
      title: 'Understanding the Rules',
      content: 'Queens must be placed so that no two queens threaten each other. This means no two queens can share the same row, column, or diagonal.',
      visual: '♛ _ _ _\n_ _ ♛ _\n_ _ _ ♛\n_ ♛ _ _'
    },
    {
      title: 'Starting Small',
      content: 'Begin with 4×4 boards to understand the pattern. There are 2 fundamental solutions for 4 queens.',
      visual: '_ ♛ _ _\n_ _ _ ♛\n♛ _ _ _\n_ _ ♛ _'
    },
    {
      title: 'Backtracking Technique',
      content: 'Systematically place queens and backtrack when conflicts are found. This is the most reliable solving method.',
      visual: '♛ _ _ _ _ _ _ _\n_ _ _ _ ♛ _ _ _\n_ _ _ _ _ _ _ ♛\n_ _ _ _ _ ♛ _ _\n_ _ ♛ _ _ _ _ _\n_ _ _ _ _ _ ♛ _\n_ ♛ _ _ _ _ _ _\n_ _ _ ♛ _ _ _ _'
    },
    {
      title: 'Pattern Recognition',
      content: 'Learn common patterns like the "knight\'s move" arrangement that often appears in solutions.',
      visual: '_ _ ♛ _\n♛ _ _ _\n_ _ _ ♛\n_ ♛ _ _'
    }
  ];

  return (
    <Layout>
      <div className="tutorial-page">
        <section className="tutorial-hero">
          <h1>N-Queens Tutorial</h1>
          <p>Master the art of placing queens on the chessboard without them attacking each other</p>
        </section>

        <section className="video-tutorials">
          <h2>Video Guides</h2>
          <div className="video-grid">
            {videoSources.map((video) => (
              <div key={video.id} className="video-card">
                <div className="video-container">
                  <iframe 
                    src={video.embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen>
                  </iframe>
                </div>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="step-by-step">
          <h2>Step-by-Step Guide</h2>
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.content}</p>
                  <div className="board-visualization">
                    {step.visual.split('\n').map((row, i) => (
                      <div key={i} className="board-row">
                        {row.split('').map((cell, j) => (
                          <div key={j} className={`board-cell ${cell === '♛' ? 'has-queen' : ''}`}>
                            {cell === '♛' ? '♛' : ''}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="practice-cta">
          <h2>Ready to Practice?</h2>
          <p>Now that you've learned the basics, put your skills to the test!</p>
          <div className="cta-buttons">
            <Link to="/game/classic" className="cta-btn primary">Start Classic Mode</Link>
            <Link to="/game/4x4" className="cta-btn secondary">Try 4×4 Challenge</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Tutorial;