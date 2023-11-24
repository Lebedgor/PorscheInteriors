import db from "../utils/db.js"

class User {

constructor({name, email, passwordHash, avatar}) {
  this.name = name;
  this.email = email;
  this.passwordHash = passwordHash;
  this.avatar = avatar;
}

save() {

  let sql = `INSERT INTO user(
    name,
    email,
    passwordHash,
    avatar,
    activate,
    date_added
  )
  VALUES(
    '${this.name}',
    '${this.email}',
    '${this.passwordHash}',
    '${this.avatar}',
    '0',
    NOW()
  )
  ;`;

  return db.execute(sql);
}

update() {

  let sql = `UPDATE user SET
    passwordHash = '${this.passwordHash}',
    date_modified = NOW();`;

  return db.execute(sql);
}


static login(email) {
  let sql = `SELECT * FROM user WHERE email = '${email.toLowerCase()}';`;

  return db.execute(sql);
}

static auth(user_id) {
  let sql = `SELECT * FROM user WHERE user_id = '${user_id}';`;

  return db.execute(sql);
}

static activate(data){
  let sql = `UPDATE user SET activate = '${data.activate}' WHERE user_id = '${data.user_id}';`;

  return db.execute(sql);
}

static getAllUsers() {
  let sql = `SELECT user_id, name, email, activate FROM user WHERE 1;`;

  return db.execute(sql);
}

static getUser(user_id) {
  let sql = `SELECT * FROM user WHERE user_id = '${user_id}';`;

  return db.execute(sql);
}


}

export default User