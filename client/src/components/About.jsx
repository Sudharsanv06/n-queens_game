import React from 'react';
import Layout from './Layout';
import './About.css';

const About = () => {
  return (
    <Layout>
      <div className="about-page">
        <div className="hero-section">
          <div className="hero-content">
            <h1>About N-Queens Game</h1>
            <p className="hero-subtitle">Discover the fascinating world of computational chess puzzles</p>
          </div>
        </div>
        
        <div className="about-container">
          
          <section className="about-section">
            <h2>The N-Queens Problem</h2>
            <p>
              The N-Queens puzzle is a classic mathematical problem that asks: 
              "How can N queens be placed on an N×N chessboard so that no two queens threaten each other?"
            </p>
            <p>
              This means no two queens can share the same row, column, or diagonal. 
              The puzzle was first proposed in 1848 by chess player Max Bezzel for the case of 8 queens.
            </p>
          </section>

          <section className="about-section">
            <h2>History & Significance</h2>
            <p>
              The N-Queens problem has fascinated mathematicians and computer scientists for over 170 years. 
              It's not just a chess puzzle—it's a fundamental problem in computer science, 
              artificial intelligence, and algorithm design.
            </p>
            <p>
              The problem has applications in:
            </p>
            <ul>
              <li>Constraint satisfaction problems</li>
              <li>Backtracking algorithms</li>
              <li>Artificial intelligence and machine learning</li>
              <li>VLSI design and circuit layout</li>
              <li>Database query optimization</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Mathematical Properties</h2>
            <p>
              For the classic 8-queens problem, there are exactly 92 distinct solutions. 
              However, when considering rotations and reflections as the same solution, 
              there are only 12 fundamental solutions.
            </p>
            <p>
              The number of solutions grows rapidly with N:
            </p>
            <ul>
              <li>N=1: 1 solution</li>
              <li>N=2: 0 solutions</li>
              <li>N=3: 0 solutions</li>
              <li>N=4: 2 solutions</li>
              <li>N=5: 10 solutions</li>
              <li>N=6: 4 solutions</li>
              <li>N=7: 40 solutions</li>
              <li>N=8: 92 solutions</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Implementation</h2>
            <p>
              Our N-Queens game provides an interactive way to explore this fascinating puzzle. 
              Features include:
            </p>
            <ul>
              <li>Interactive chessboard for visual problem-solving</li>
              <li>Multiple board sizes (N=4 to N=12)</li>
              <li>Real-time validation of queen placements</li>
              <li>Hint system to help when stuck</li>
              <li>Solution reveal for learning</li>
              <li>Progress tracking and achievements</li>
              <li>Leaderboard for competitive play</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Learning Benefits</h2>
            <p>
              Playing the N-Queens game helps develop:
            </p>
            <ul>
              <li>Logical thinking and problem-solving skills</li>
              <li>Spatial reasoning and pattern recognition</li>
              <li>Algorithmic thinking and optimization</li>
              <li>Persistence and strategic planning</li>
              <li>Mathematical intuition</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Technical Implementation</h2>
            <p>
              This game is built using modern web technologies:
            </p>
            <ul>
              <li>React.js for the user interface</li>
              <li>Node.js and Express for the backend</li>
              <li>MongoDB for data storage</li>
              <li>Real-time validation algorithms</li>
              <li>Responsive design for all devices</li>
            </ul>
          </section>
        </div>
        
        <div className="team-section">
          <div className="section-container">
            <h2>Meet Our Team</h2>
            <p className="team-subtitle">The passionate minds behind N-Queens Game</p>
            
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">
                  <div className="avatar-placeholder">👨‍💼</div>
                </div>
                <div className="member-info">
                  <h3>Alex Thompson</h3>
                  <p className="member-role">Chief Executive Officer</p>
                  <p className="member-bio">Visionary leader with 15+ years in tech innovation. Passionate about making complex algorithms accessible through engaging gameplay.</p>
                  <div className="member-skills">
                    <span className="skill-tag">Strategic Planning</span>
                    <span className="skill-tag">Product Vision</span>
                    <span className="skill-tag">Team Leadership</span>
                  </div>
                </div>
              </div>
              
              <div className="team-member">
                <div className="member-avatar">
                  <div className="avatar-placeholder">👩‍💻</div>
                </div>
                <div className="member-info">
                  <h3>Sarah Chen</h3>
                  <p className="member-role">Chief Technology Officer</p>
                  <p className="member-bio">Full-stack architect specializing in scalable web applications and algorithm optimization. MIT Computer Science graduate.</p>
                  <div className="member-skills">
                    <span className="skill-tag">React.js</span>
                    <span className="skill-tag">Node.js</span>
                    <span className="skill-tag">Algorithm Design</span>
                  </div>
                </div>
              </div>
              
              <div className="team-member">
                <div className="member-avatar">
                  <div className="avatar-placeholder">👨‍🎨</div>
                </div>
                <div className="member-info">
                  <h3>Marcus Rodriguez</h3>
                  <p className="member-role">Lead UI/UX Designer</p>
                  <p className="member-bio">Creative designer focused on intuitive user experiences. Expert in modern design systems and user psychology.</p>
                  <div className="member-skills">
                    <span className="skill-tag">UI Design</span>
                    <span className="skill-tag">User Research</span>
                    <span className="skill-tag">Prototyping</span>
                  </div>
                </div>
              </div>
              
              <div className="team-member">
                <div className="member-avatar">
                  <div className="avatar-placeholder">👩‍💼</div>
                </div>
                <div className="member-info">
                  <h3>Emily Watson</h3>
                  <p className="member-role">Head of Human Resources</p>
                  <p className="member-bio">People-first HR leader building inclusive teams. Expert in talent acquisition and organizational development.</p>
                  <div className="member-skills">
                    <span className="skill-tag">Talent Management</span>
                    <span className="skill-tag">Team Building</span>
                    <span className="skill-tag">Culture Development</span>
                  </div>
                </div>
              </div>
              
              <div className="team-member">
                <div className="member-avatar">
                  <div className="avatar-placeholder">👨‍🔬</div>
                </div>
                <div className="member-info">
                  <h3>Dr. James Kumar</h3>
                  <p className="member-role">Algorithm Research Lead</p>
                  <p className="member-bio">PhD in Computer Science with focus on constraint satisfaction problems. Published researcher in algorithmic optimization.</p>
                  <div className="member-skills">
                    <span className="skill-tag">Research</span>
                    <span className="skill-tag">Mathematics</span>
                    <span className="skill-tag">AI/ML</span>
                  </div>
                </div>
              </div>
              
              <div className="team-member">
                <div className="member-avatar">
                  <div className="avatar-placeholder">👩‍💻</div>
                </div>
                <div className="member-info">
                  <h3>Lisa Park</h3>
                  <p className="member-role">Senior Full-Stack Developer</p>
                  <p className="member-bio">Experienced developer specializing in performance optimization and database architecture. Open source contributor.</p>
                  <div className="member-skills">
                    <span className="skill-tag">MongoDB</span>
                    <span className="skill-tag">Performance</span>
                    <span className="skill-tag">DevOps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="company-stats">
          <div className="section-container">
            <h2>Our Impact</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Active Players</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">1M+</div>
                <div className="stat-label">Puzzles Solved</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">95%</div>
                <div className="stat-label">User Satisfaction</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Global Availability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;