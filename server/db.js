const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, balance INTEGER)');
    db.run('CREATE TABLE bets (id INTEGER PRIMARY KEY, user_id INTEGER, competitors TEXT, amount INTEGER)');
    db.run('INSERT INTO users (balance) VALUES (100)');
});

const getUser = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const placeBet = (userId, competitors, amount) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO bets (user_id, competitors, amount) VALUES (?, ?, ?)', [userId, competitors.join(','), amount], function(err) {
            if (err) {
                reject(err);
            } else {
                db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

module.exports = { getUser, placeBet };
