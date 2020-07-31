Esto es un ejemplo utlizando MySQL entre un cliente y una cuenta bancaria que realiza las siguientes operaciones:
•	Insercion de registros
•	Lectura de registros
•	Eliminancion de registros
•	Actualizacion de registros

Scripts para las tablas:
CREATE TABLE IF NOT EXISTS clientes.usuario(dni Varchar(30) primary key not null, nombre Varchar(30), primerApellido Varchar(30), segundoApellido Varchar(30));
CREATE TABLE IF NOT EXISTS clientes.cuentaBancaria(id Varchar(30) primary key not null, saldo int, FOREIGN KEY (id) REFERENCES usuario(dni)) ;
DROP TABLE IF EXISTS clientes.cuentaBancaria;
DROP TABLE IF EXISTS clientes.usuario;