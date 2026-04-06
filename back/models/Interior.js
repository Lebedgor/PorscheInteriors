import db from "../utils/db.js";


class Interior{

  constructor({name, description, image, sort, model_id, user_id, interior_id, parent_id}) {
    this.name = name;
    this.description = description;
    this.image = image;
    this.sort = Number(sort);
    this.parent_id = parent_id;
    this.model_id = model_id;
    this.user_id = user_id;
    this.interior_id = interior_id;
  }

  save() {

    const sql = `INSERT INTO interior(
      name,
       description,
        image,
         sort,
          user_id,
           model_id,
            date_added
    )
    VALUES(?, ?, ?, ?, ?, ?, NOW());`;

    return db.execute(sql, [
      this.name,
      this.description,
      this.image,
      this.sort,
      this.user_id,
      this.model_id,
    ]);
  }

  update() {

    const sql = `UPDATE interior SET 
      name = ?,
       description = ?,
        image = ?,
         sort = ?,
          user_id = ?,
           date_modified = NOW()
            WHERE interior_id = ?;`;

    return db.execute(sql, [
      this.name,
      this.description,
      this.image,
      this.sort,
      this.user_id,
      this.interior_id,
    ]);
  }

  static remove(interior_id){
    const sql = `DELETE FROM interior WHERE interior_id = ?;`;

    return db.execute(sql, [interior_id]);
  }

  static getOne(interior_id) {
    const sql = `SELECT * FROM interior WHERE interior_id = ?;`;

    return db.execute(sql, [interior_id]);
  }

  static getAll(model_id) {
    const sql = `SELECT i.*, m.name FROM interior i LEFT JOIN model m ON (i.model_id = m.model_id) WHERE i.model_id = ?;`;

    return db.execute(sql, [model_id]);
  }

  static getAllForCache() {
    const sql = `SELECT interior_id, image FROM interior WHERE 1;`;

    return db.execute(sql);
  }

}

export default Interior;
