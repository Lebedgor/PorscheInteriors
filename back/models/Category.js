import db from "../utils/db.js";


class Category{

  constructor({name, description, image, sort, user_id, parent_id, category_id, seo_title, seo_description, seo_h1}) {
    this.name = name;
    this.description = description;
    this.image = image;
    this.sort = Number.isFinite(Number(sort)) ? Number(sort) : 0;
    this.user_id = user_id;
    this.parent_id = Number.isFinite(Number(parent_id)) ? Number(parent_id) : 0;
    this.category_id = category_id;
    this.seo_title = String(seo_title || '').trim();
    this.seo_description = String(seo_description || '').trim();
    this.seo_h1 = String(seo_h1 || '').trim();
  }

  save() {

    const sql = `INSERT INTO category(
      name,
       description,
        image,
         sort,
          user_id,
           parent_id,
            seo_title,
             seo_description,
              seo_h1,
              date_added
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());`;

    return db.execute(sql, [
      this.name,
      this.description,
      this.image,
      this.sort,
      this.user_id,
      this.parent_id,
      this.seo_title,
      this.seo_description,
      this.seo_h1,
    ]);
  }

  update() {

    const sql = `UPDATE category SET 
      name = ?,
       description = ?,
        image = ?,
         sort = ?,
          user_id = ?,
           parent_id = ?,
            seo_title = ?,
             seo_description = ?,
              seo_h1 = ?,
           date_modified = NOW()
            WHERE category_id = ?;`;

    return db.execute(sql, [
      this.name,
      this.description,
      this.image,
      this.sort,
      this.user_id,
      this.parent_id,
      this.seo_title,
      this.seo_description,
      this.seo_h1,
      this.category_id,
    ]);
  }

  static remove(category_id){
    const sql = `DELETE FROM category WHERE category_id = ?;`;

    return db.execute(sql, [category_id]);
  }

  static getInfo(category_id) {
    const sql = `SELECT * FROM category WHERE category_id = ?;`;

    return db.execute(sql, [category_id]);
  }

  static getInner(category_id) {
    const sql = `SELECT * FROM category WHERE parent_id = ? ORDER BY sort ASC, category_id ASC;`;

    return db.execute(sql, [category_id]);
  }

  static getAllForCache() {
    const sql = `SELECT category_id, parent_id, image FROM category WHERE 1;`;

    return db.execute(sql);
  }

  static ensureTableStructure() {
    const createSql = `CREATE TABLE IF NOT EXISTS category (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(512),
      description TEXT,
      image VARCHAR(512),
      sort TINYINT,
      user_id INT,
      parent_id INT DEFAULT '0',
      seo_title VARCHAR(512) NOT NULL DEFAULT '',
      seo_description TEXT,
      seo_h1 VARCHAR(512) NOT NULL DEFAULT '',
      date_added DATETIME,
      date_modified DATETIME
    )`

    return db.execute(createSql)
      .then(() => Promise.all([
        db.execute("SHOW COLUMNS FROM category LIKE 'seo_title'"),
        db.execute("SHOW COLUMNS FROM category LIKE 'seo_description'"),
        db.execute("SHOW COLUMNS FROM category LIKE 'seo_h1'")
      ]))
      .then(async ([[seoTitleColumns], [seoDescriptionColumns], [seoH1Columns]]) => {
        if (!seoTitleColumns.length) {
          await db.execute("ALTER TABLE category ADD COLUMN seo_title VARCHAR(512) NOT NULL DEFAULT '' AFTER parent_id")
        }

        if (!seoDescriptionColumns.length) {
          await db.execute("ALTER TABLE category ADD COLUMN seo_description TEXT AFTER seo_title")
        }

        if (!seoH1Columns.length) {
          await db.execute("ALTER TABLE category ADD COLUMN seo_h1 VARCHAR(512) NOT NULL DEFAULT '' AFTER seo_description")
        }
      })
  }

}

export default Category;
