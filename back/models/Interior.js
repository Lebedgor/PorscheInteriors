import db from "../utils/db.js";


class Interior{

  constructor({name, description, image, sort, model_id, user_id, interior_id}) {
    this.name = name;
    this.description = description;
    this.image = image;
    this.sort = Number(sort);
    this.model_id = model_id;
    this.user_id = user_id;
    this.interior_id = interior_id;
  }

  save() {

    let sql = `INSERT INTO interior(
      name,
       description,
        image,
         sort,
          user_id,
           model_id,
            date_added
    )
    VALUES(
      '${this.name}',
       '${this.description}',
        '${this.image}',
         '${this.sort}',
          '${this.user_id}',
           '${this.model_id}',
             NOW()
    );`;

    return db.execute(sql);
  }

  update() {

    let sql = `UPDATE interior SET 
      name = '${this.name}',
       description = '${this.description}',
        image = '${this.image}',
         sort = '${this.sort}',
          user_id = '${this.user_id}',
           date_modified = NOW()
            WHERE interior_id = '${this.interior_id}';`;

    return db.execute(sql);
  }

  static remove(interior_id){
    let sql = `DELETE FROM interior WHERE interior_id = '${interior_id}';`;

    return db.execute(sql);
  }

  static getOne(interior_id) {
    let sql = `SELECT * FROM interior WHERE interior_id = '${interior_id}';`;

    return db.execute(sql);
  }

  static getAll(model_id) {
    let sql = `SELECT i.*, m.name FROM interior i LEFT JOIN model m ON (i.model_id = m.model_id) WHERE i.model_id='${model_id}';`;

    return db.execute(sql);
  }

}

export default Interior;