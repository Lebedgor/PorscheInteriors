import db from "../utils/db.js";


class Image{

  constructor({category_id, link, preview_link, sort, title, alt, image_id, media_type}) {
    this.category_id = category_id;
    this.link = link;
    this.preview_link = preview_link || '';
    this.sort = sort === '' || typeof sort === 'undefined' || sort === null ? null : Number(sort);
    this.title = String(title || '').trim();
    this.alt = String(alt || '').trim();
    this.image_id = image_id;
    this.media_type = ['video', 'youtube'].includes(String(media_type || '').trim().toLowerCase()) ? String(media_type || '').trim().toLowerCase() : 'image';
  }

  save() {

    const sql = `INSERT INTO image(
      category_id,
      link,
      preview_link,
      media_type,
      sort,
      title,
      alt,
      date_added,
      date_modified
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, NOW(), NOW());`;

    return db.execute(sql, [this.category_id, this.link, this.preview_link, this.media_type, this.sort, this.title, this.alt]);
  }

  update() {
    const sql = `UPDATE image SET
      link = ?,
      preview_link = ?,
      media_type = ?,
      sort = ?,
      title = ?,
      alt = ?,
      date_modified = NOW()
    WHERE image_id = ?;`;

    return db.execute(sql, [this.link, this.preview_link, this.media_type, this.sort, this.title, this.alt, this.image_id]);
  }

  static getImages(category_id, start, limit){
    const normalizedStart = Math.max(0, Number(start) || 0)
    const normalizedLimit = Math.max(1, Number(limit) || 10)
    const sql = `SELECT * FROM image WHERE category_id = ? ORDER BY COALESCE(sort, 2147483647) ASC, image_id ASC LIMIT ${normalizedStart}, ${normalizedLimit};`;

    return db.execute(sql, [category_id]);
  }

  static getTotalImages(category_id){
    const sql = `SELECT COUNT(*) as total FROM image WHERE category_id = ?;`;

    return db.execute(sql, [category_id]);
  }

  static remove(image_id){
    const sql = `DELETE FROM image WHERE image_id = ?;`;

    return db.execute(sql, [image_id]);
  }

  static getById(image_id) {
    const sql = `SELECT * FROM image WHERE image_id = ? LIMIT 1;`;

    return db.execute(sql, [image_id]);
  }

  static getNextSort(category_id) {
    const sql = `SELECT COALESCE(MAX(sort), 0) + 1 AS nextSort FROM image WHERE category_id = ?;`;

    return db.execute(sql, [category_id]);
  }

  static getAllForCache() {
    const sql = `SELECT category_id, link, preview_link, media_type FROM image WHERE 1;`;

    return db.execute(sql);
  }

  static ensureTableStructure() {
    const createSql = `CREATE TABLE IF NOT EXISTS image (
      image_id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT,
      link VARCHAR(512),
      preview_link VARCHAR(512) NOT NULL DEFAULT '',
      media_type VARCHAR(32) NOT NULL DEFAULT 'image',
      sort INT NULL,
      title VARCHAR(512) NOT NULL DEFAULT '',
      alt VARCHAR(512) NOT NULL DEFAULT '',
      date_added DATETIME NULL,
      date_modified DATETIME NULL
    )`;

    return db.execute(createSql)
      .then(() => Promise.all([
        db.execute("SHOW COLUMNS FROM image LIKE 'media_type'"),
        db.execute("SHOW COLUMNS FROM image LIKE 'preview_link'"),
        db.execute("SHOW COLUMNS FROM image LIKE 'sort'"),
        db.execute("SHOW COLUMNS FROM image LIKE 'title'"),
        db.execute("SHOW COLUMNS FROM image LIKE 'alt'"),
        db.execute("SHOW COLUMNS FROM image LIKE 'date_added'"),
        db.execute("SHOW COLUMNS FROM image LIKE 'date_modified'")
      ]))
      .then(async ([[mediaTypeColumns], [previewLinkColumns], [sortColumns], [titleColumns], [altColumns], [dateAddedColumns], [dateModifiedColumns]]) => {
        if (!previewLinkColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN preview_link VARCHAR(512) NOT NULL DEFAULT '' AFTER link")
        }

        if (!mediaTypeColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN media_type VARCHAR(32) NOT NULL DEFAULT 'image' AFTER preview_link")
        }

        if (!sortColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN sort INT NULL AFTER media_type")
        }

        if (!titleColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN title VARCHAR(512) NOT NULL DEFAULT '' AFTER sort")
        }

        if (!altColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN alt VARCHAR(512) NOT NULL DEFAULT '' AFTER title")
        }

        if (!dateAddedColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN date_added DATETIME NULL AFTER alt")
        }

        if (!dateModifiedColumns.length) {
          await db.execute("ALTER TABLE image ADD COLUMN date_modified DATETIME NULL AFTER date_added")
        }
      })
  }

}

export default Image;
