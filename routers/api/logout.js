const express = require('express');
const router = express.Router();
router.post('/', (req, res) => {
    console.log(req.user);
    req.logout((err) => {
      if (err) {
        return res.status(500).send('Logout failed');
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Session destruction failed');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).send('done');
        console.log('Logout successful');
      });
    });
  });
module.exports = router;    