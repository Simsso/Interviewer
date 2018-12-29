Start the database container with
```
docker run -p 3306:3306 -p 4306:4306 --name mysql-interviewer -e MYSQL_ROOT_PASSWORD=1234 -d mysql:5.7
```
where 1234 is your password.
