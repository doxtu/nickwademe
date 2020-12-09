SELECT
  rawtext
FROM
  messages m
WHERE
  m.rawtext LIKE 'images/platychat%'
  AND SUBSTR(m.messageid,1,4) || '-' 
  || CAST(SUBSTR(m.messageid,5,2) + 1 as TEXT) || '-' 
  || SUBSTR(m.messageid,7,2) >= DATE('now', '-30 days')
;

SELECT
  SUBSTR(m.messageid,1,4) || '-' 
  || CAST(SUBSTR(m.messageid,5,2) + 1 as TEXT) || '-' 
  || SUBSTR(m.messageid,7,2)
FROM
  messages m