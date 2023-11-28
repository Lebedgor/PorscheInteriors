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

    let sql = `INSERT INTO model(
      name,
       image,
        sort,
         user_id,
          date_added
    )
    VALUES(
      '${this.name}',
       '${this.image}',
        '${this.sort}',
         '${this.user_id}',
            NOW()
    );`;

    return db.execute(sql);
  }

  update() {

    let sql = `UPDATE model SET 
      name='${this.name}',
       image='${this.image}',
        sort='${this.sort}',
         user_id='${this.user_id}',
          date_modified = NOW()
            WHERE model_id = '${this.model_id}';`;

    return db.execute(sql);
  }

  static remove(model_id){
    let sql = `DELETE FROM model WHERE model_id = '${model_id}';`;

    return db.execute(sql);
  }

  static getOne(model_id) {
    let sql = `SELECT i.*, m.name as model_name FROM model m LEFT JOIN interior i ON (m.model_id = i.model_id) WHERE i.model_id = '${model_id}';`;

    return db.execute(sql);
  }

  static getModelInfo(model_id) {
    let sql = `SELECT * FROM model WHERE model_id = '${model_id}';`;

    return db.execute(sql);
  }

  static getAll() {
    let sql = `SELECT * FROM model WHERE 1;`;

    return db.execute(sql);
  }

}

export default Model;