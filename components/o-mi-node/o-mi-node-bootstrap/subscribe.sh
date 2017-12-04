
for f in `ls *sub*.xml`; do
  echo $f
  curl -X POST http://o-mi-node:8080 --data @$f -H 'Content-Type:text/xml'
done
