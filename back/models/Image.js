import db from "../utils/db.js";


class Image{

  constructor({interior_id, link}) {
    this.interior_id = interior_id;
    this.link = link;
  }

  save() {

    let sql = `INSERT INTO image(
      interior_id,
      link
    )
    VALUES(
      '${this.interior_id}',
       '${this.link}'
    );`;

    return db.execute(sql);
  }

  static getImages(interior_id, start, limit){
    let sql = `SELECT * FROM image WHERE interior_id = '${interior_id}' LIMIT ${start}, ${limit};`;

    return db.execute(sql);
  }

  static getTotalImages(interior_id){
    let sql = `SELECT COUNT(*) as total FROM image WHERE interior_id = '${interior_id}';`;

    return db.execute(sql);
  }

  static remove(image_id){
    let sql = `DELETE FROM image WHERE image_id = '${image_id}';`;

    return db.execute(sql);
  }

}

export default Image;