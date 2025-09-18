import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token provided' })

  jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid or expired token' })
    req.user = decoded
    next()
  })
}
