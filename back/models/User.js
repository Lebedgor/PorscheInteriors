import db from "../utils/db.js"

class User {

constructor({name, email, passwordHash, avatar, user_id}) {
  this.name = name;
  this.email = email;
  this.passwordHash = passwordHash;
  this.avatar = avatar;
  this.user_id = user_id;
}

save() {

  const sql = `INSERT INTO user(
    name,
    email,
    passwordHash,
    avatar,
    activate,
    date_added
  )
  VALUES(?, ?, ?, ?, ?, NOW());`;

  return db.execute(sql, [
    this.name,
    this.email,
    this.passwordHash,
    this.avatar,
    0,
  ]);
}

update() {

  const sql = `UPDATE user SET
    passwordHash = ?,
    date_modified = NOW()
    WHERE user_id = ?;`;

  return db.execute(sql, [this.passwordHash, this.user_id]);
}

remove() {

  const sql = `DELETE FROM user WHERE user_id = ?;`;

  return db.execute(sql, [this.user_id]);
}


static login(email) {
  const sql = `SELECT * FROM user WHERE email = ?;`;

  return db.execute(sql, [email.toLowerCase()]);
}

static auth(user_id) {
  const sql = `SELECT * FROM user WHERE user_id = ?;`;

  return db.execute(sql, [user_id]);
}

static activate(data){
  const sql = `UPDATE user SET activate = ? WHERE user_id = ?;`;

  return db.execute(sql, [data.activate, data.user_id]);
}

static getAllUsers() {
  let sql = `SELECT user_id, name, email, activate FROM user WHERE 1;`;

  return db.execute(sql);
}

static getUser(user_id) {
  const sql = `SELECT * FROM user WHERE user_id = ?;`;

  return db.execute(sql, [user_id]);
}

static findByEmail(email) {
  const sql = `SELECT * FROM user WHERE email = ? LIMIT 1;`;

  return db.execute(sql, [email.toLowerCase()]);
}


}

export default User
