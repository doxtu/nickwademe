const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('../data/platychat.db')

;(async function () {
  await new Promise(function (s, f) {
    db.all(
      `
         CREATE VIEW dual AS SELECT 'x' AS dummy
      `,
      function (err, results) {
        if (err) f(err)
        else s()
      }
    )
  })

  await new Promise(function (s, f) {
    db.all(
      `
         CREATE TABLE sessions(
            userid      TEXT
            jwt         TEXT
         )
      `,
      function (err, results) {
        if (err) f()
        s()
      }
    )
  })

  await new Promise(function (s, f) {
    db.all(
      `
         CREATE TABLE users(
            userid      TEXT,
            alias       TEXT,
            color       TEXT
         )
      `,
      function (err, results) {
        if (err) f()
        s()
      }
    )
  })

  await new Promise(function (s, f) {
    db.all(
      `
         CREATE TABLE convos(
            convoid       TEXT,
            convoname     TEXT,
            participants  TEXT
         )
      `,
      function (err, results) {
        if (err) f()
        s()
      }
    )
  })

  await new Promise(function (s, f) {
    db.all(
      `
         CREATE TABLE messages(
            messageid   TEXT,
            convoid     TEXT,
            userid      TEXT,
            readby      TEXT,
            timestamp   TEXT,
            rawtext     TEXT
         )
      `,
      function (err, results) {
        if (err) f()
        s()
      }
    )
  })

  await new Promise(function (s, f) {
    db.all(
      `
         CREATE TABLE settings(
            userid      TEXT,
            darkmode    TEXT
         )
      `,
      function (err, results) {
        if (err) f()
        s()
      }
    )
  })

  await new Promise(function (s, f) {
    db.all(
      `
         CREATE TABLE tags(
            tagid       TEXT,
            messageid   TEXT,
            userid      TEXT,
            tagname     TEXT
         )
      `,
      function (err, results) {
        if (err) f()
        s()
      }
    )
  })
})()
