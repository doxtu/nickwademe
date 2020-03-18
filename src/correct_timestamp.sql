UPDATE messages SET timestamp = 
   CAST(SUBSTR(messageid,5,2)+1 AS TEXT) || '/' ||
   CAST(SUBSTR(messageid,7,2)+0 AS TEXT) || '/' ||
   CAST(SUBSTR(messageid,1,4)+0 AS TEXT) || ' ' ||
   SUBSTR(messageid,9,2) || ':' ||
   SUBSTR(messageid,11,2) || ':' ||
   SUBSTR(messageid,13,2)
;