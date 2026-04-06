import db from '../utils/db.js'

class SiteSetting {
  static ensureTable() {
    const sql = `CREATE TABLE IF NOT EXISTS site_settings (
      setting_id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(255) NOT NULL UNIQUE,
      setting_value JSON NOT NULL,
      date_added DATETIME,
      date_modified DATETIME
    )`

    return db.execute(sql)
  }

  static getAll() {
    const sql = `SELECT * FROM site_settings;`

    return db.execute(sql)
  }

  static getByKey(settingKey) {
    const sql = `SELECT * FROM site_settings WHERE setting_key = ? LIMIT 1;`

    return db.execute(sql, [settingKey])
  }

  static save(settingKey, settingValue) {
    const sql = `INSERT INTO site_settings (
      setting_key,
      setting_value,
      date_added,
      date_modified
    )
    VALUES(?, CAST(? AS JSON), NOW(), NOW())
    ON DUPLICATE KEY UPDATE
      setting_value = VALUES(setting_value),
      date_modified = NOW();`

    return db.execute(sql, [settingKey, JSON.stringify(settingValue)])
  }
}

export default SiteSetting
