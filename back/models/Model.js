import db from "../utils/db.js";


class Model{

  constructor({name, image, sort, user_id, model_id}) {
    this.name = name;
    this.image = image;
    this.sort = Number(sort);
    this.user_id = user_id;
    this.model_id = model_id;
  }

  save() {

    const sql = `INSERT INTO model(
      name,
       image,
        sort,
         user_id,
          date_added
    )
    VALUES(?, ?, ?, ?, NOW());`;

    return db.execute(sql, [
      this.name,
      this.image,
      this.sort,
      this.user_id,
    ]);
  }

  update() {

    const sql = `UPDATE model SET 
      name=?,
       image=?,
        sort=?,
         user_id=?,
          date_modified = NOW()
            WHERE model_id = ?;`;

    return db.execute(sql, [
      this.name,
      this.image,
      this.sort,
      this.user_id,
      this.model_id,
    ]);
  }

  static remove(model_id){
    const sql = `DELETE FROM model WHERE model_id = ?;`;

    return db.execute(sql, [model_id]);
  }

  static getOne(model_id) {
    const sql = `SELECT i.*, m.name as model_name FROM model m LEFT JOIN interior i ON (m.model_id = i.model_id) WHERE i.model_id = ?;`;

    return db.execute(sql, [model_id]);
  }

  static getModelInfo(model_id) {
    const sql = `SELECT * FROM model WHERE model_id = ?;`;

    return db.execute(sql, [model_id]);
  }

  static getAll() {
    let sql = `SELECT * FROM model WHERE 1;`;

    return db.execute(sql);
  }

}

export default Model;
